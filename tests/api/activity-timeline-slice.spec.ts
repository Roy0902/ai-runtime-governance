import { expect, test } from '@playwright/test';
import { enrollApi, newSession, uuid } from '../support/api';
import { at, event, resetTimeline, seedTimeline, trace } from '../support/activity-timeline';

const BASE = Date.parse('2026-11-03T10:00:00.000Z');

interface TraceItem {
  traceId: string;
  receivedAt: string;
  executionStatus: string;
  telemetryStatus: string;
  guardOutcome: string | null;
}

interface TracePage {
  items: TraceItem[];
  nextCursor: string | null;
}

interface EventItem {
  eventId: string;
  traceId: string;
  parentEventId: string | null;
  relationship: string;
  kind: string;
  receivedAt: string;
  sourceAt: string | null;
  durationMs: number | null;
  identity: string | null;
  metadata: Record<string, unknown>;
}

interface EventPage {
  items: EventItem[];
  nextCursor: string | null;
}

test.describe('Activity timeline vertical slice', () => {
  test('[SCN-activity-timeline-001] A human reads their own retained trace', async ({ request }) => {
    const a = await enrollApi(request);
    await resetTimeline(request);
    const ta = uuid();
    const e1 = uuid();
    const e2 = uuid();
    await seedTimeline(request, a.email, [
      trace({
        traceId: ta,
        receivedAt: at(BASE, 0),
        events: [
          event({ eventId: e1, kind: 'agent', receivedAt: at(BASE, 0), label: 'agent root' }),
          event({
            eventId: e2,
            kind: 'model',
            parentEventId: e1,
            receivedAt: at(BASE, 1_000),
            label: 'model call',
          }),
        ],
      }),
    ]);

    const listResponse = await request.get('/api/v1/traces');
    expect(listResponse.status()).toBe(200);
    const list = (await listResponse.json()) as TracePage;
    expect(list.items.map((item) => item.traceId)).toContain(ta);

    const detailResponse = await request.get(`/api/v1/traces/${ta}`);
    expect(detailResponse.status()).toBe(200);
    const detail = (await detailResponse.json()) as TraceItem & { identity: string | null };
    expect(detail.executionStatus).toBe('completed');
    expect(detail.telemetryStatus).toBe('complete');
    expect(detail.identity).toBe('agent-a');

    const eventsResponse = await request.get(`/api/v1/traces/${ta}/events`);
    expect(eventsResponse.status()).toBe(200);
    const events = (await eventsResponse.json()) as EventPage;
    expect(events.items.map((item) => item.eventId)).toEqual([e1, e2]);
    expect(events.items[1]?.relationship).toBe('linked');
  });

  test('[SCN-activity-timeline-002] No session cannot read activity', async ({ playwright }) => {
    const anonymous = await newSession(playwright);
    const response = await anonymous.get('/api/v1/traces');
    expect(response.status()).toBe(401);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe('SIGN_IN_REQUIRED');
    expect(JSON.stringify(body)).not.toContain('traceId');
    await anonymous.dispose();
  });

  test('[SCN-activity-timeline-003] Cross-account read is denied', async ({ request, playwright }) => {
    const a = await enrollApi(request);
    const bRequest = await newSession(playwright);
    const b = await enrollApi(bRequest);
    await resetTimeline(request);

    const tb = uuid();
    await seedTimeline(bRequest, b.email, [
      trace({ traceId: tb, receivedAt: at(BASE, 0), identity: 'agent-b' }),
    ]);
    await seedTimeline(request, a.email, [
      trace({ traceId: uuid(), receivedAt: at(BASE, 1_000), identity: 'agent-a' }),
    ]);

    const denied = await request.get(`/api/v1/traces/${tb}`);
    expect(denied.status()).toBe(404);
    const deniedBody = (await denied.json()) as { code: string };
    expect(deniedBody.code).toBe('NOT_FOUND');
    expect(JSON.stringify(deniedBody)).not.toContain(tb);

    const listResponse = await request.get('/api/v1/traces');
    const list = (await listResponse.json()) as TracePage;
    expect(list.items.map((item) => item.traceId)).not.toContain(tb);
    await bRequest.dispose();
  });

  test('[SCN-activity-timeline-005] Only metadata is returned', async ({ request }) => {
    const a = await enrollApi(request);
    await resetTimeline(request);
    const ta = uuid();
    const seeded = [
      event({ eventId: uuid(), kind: 'prompt', receivedAt: at(BASE, 0), guardOutcome: 'redact', ruleIds: ['EMAIL_ADDRESS'] }),
      event({ eventId: uuid(), kind: 'guard', receivedAt: at(BASE, 1_000), guardOutcome: 'redact', policyId: 'p-1', policyVersion: '3', ruleIds: ['EMAIL_ADDRESS'] }),
      event({ eventId: uuid(), kind: 'approval', receivedAt: at(BASE, 2_000), approvalId: uuid(), approvalState: 'approved' }),
      event({ eventId: uuid(), kind: 'model', receivedAt: at(BASE, 3_000), label: 'model call', observedStatus: 'completed' }),
      event({ eventId: uuid(), kind: 'tool', receivedAt: at(BASE, 4_000), label: 'search tool', observedStatus: 'completed' }),
    ];
    const withBody = {
      ...seeded[3],
      body: 'SECRET-BODY',
      prompt: 'SECRET-PROMPT',
      reasoning: 'SECRET-REASONING',
    } as typeof seeded[number];
    await seedTimeline(request, a.email, [
      trace({ traceId: ta, receivedAt: at(BASE, 0), events: [...seeded.slice(0, 3), withBody, seeded[4]] }),
    ]);

    const response = await request.get(`/api/v1/traces/${ta}/events`);
    expect(response.status()).toBe(200);
    const page = (await response.json()) as EventPage;
    const itemKeys = new Set(['eventId', 'traceId', 'parentEventId', 'relationship', 'kind', 'receivedAt', 'sourceAt', 'durationMs', 'identity', 'metadata']);
    const metadataKeys = new Set(['guardOutcome', 'outcome', 'ruleIds', 'policyId', 'policyVersion', 'approvalId', 'state', 'name', 'status']);
    for (const item of page.items) {
      for (const key of Object.keys(item)) expect(itemKeys.has(key), `unexpected event field ${key}`).toBe(true);
      for (const key of Object.keys(item.metadata)) expect(metadataKeys.has(key), `unexpected metadata field ${key}`).toBe(true);
    }
    const serialized = JSON.stringify(page);
    for (const forbidden of ['SECRET-BODY', 'SECRET-PROMPT', 'SECRET-REASONING', 'reasoning', 'promptBody']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  test('[SCN-activity-timeline-012] Missing values stay missing', async ({ request }) => {
    const a = await enrollApi(request);
    await resetTimeline(request);
    const ta = uuid();
    const e3 = uuid();
    await seedTimeline(request, a.email, [
      trace({
        traceId: ta,
        receivedAt: at(BASE, 0),
        events: [event({ eventId: e3, kind: 'model', receivedAt: at(BASE, 0), sourceAt: null, durationMs: null })],
      }),
    ]);

    const response = await request.get(`/api/v1/traces/${ta}/events`);
    const page = (await response.json()) as EventPage;
    const item = page.items.find((candidate) => candidate.eventId === e3);
    expect(item).toBeTruthy();
    expect(item?.durationMs).toBeNull();
    expect(item?.sourceAt).toBeNull();
    expect(item?.receivedAt).toBe(at(BASE, 0));
  });

  test('[SCN-activity-timeline-023] Trace continuation is bounded and lossless', async ({ request }) => {
    const a = await enrollApi(request);
    await resetTimeline(request);
    const traces = Array.from({ length: 51 }, (_, index) =>
      trace({ traceId: uuid(), receivedAt: at(BASE, index * 1_000) }),
    );
    await seedTimeline(request, a.email, traces);

    const firstResponse = await request.get('/api/v1/traces');
    const first = (await firstResponse.json()) as TracePage;
    expect(first.items).toHaveLength(50);
    expect(first.nextCursor).toBeTruthy();

    const secondResponse = await request.get(
      `/api/v1/traces?cursor=${encodeURIComponent(first.nextCursor ?? '')}`,
    );
    const second = (await secondResponse.json()) as TracePage;
    expect(second.items).toHaveLength(1);
    expect(second.nextCursor).toBeNull();

    const ids = [...first.items, ...second.items].map((item) => item.traceId);
    expect(new Set(ids).size).toBe(51);
  });

  test('[SCN-activity-timeline-025] Manual refresh starts a new read', async ({ request }) => {
    const a = await enrollApi(request);
    await resetTimeline(request);
    const traces = Array.from({ length: 51 }, (_, index) =>
      trace({ traceId: uuid(), receivedAt: at(BASE, index * 1_000) }),
    );
    await seedTimeline(request, a.email, traces);

    const firstResponse = await request.get('/api/v1/traces');
    const first = (await firstResponse.json()) as TracePage;
    const cursor = first.nextCursor;
    expect(cursor).toBeTruthy();

    const newer = uuid();
    await seedTimeline(request, a.email, [
      trace({ traceId: newer, receivedAt: at(BASE, 10_000_000) }),
    ]);

    const continuationResponse = await request.get(
      `/api/v1/traces?cursor=${encodeURIComponent(cursor ?? '')}`,
    );
    const continuation = (await continuationResponse.json()) as TracePage;
    expect(continuation.items.map((item) => item.traceId)).not.toContain(newer);

    const refreshedResponse = await request.get('/api/v1/traces');
    const refreshed = (await refreshedResponse.json()) as TracePage;
    expect(refreshed.items.map((item) => item.traceId)).toContain(newer);
  });

  test('[SCN-activity-timeline-030] Retained parent is linked before it is loaded', async ({ request }) => {
    const a = await enrollApi(request);
    await resetTimeline(request);
    const ta = uuid();
    const earliest = uuid();
    const missingParent = uuid();
    const lateParent = uuid();
    const seeded = [
      event({ eventId: earliest, kind: 'agent', receivedAt: at(BASE, 0), parentEventId: lateParent, label: 'early child' }),
      event({ eventId: missingParent, kind: 'model', receivedAt: at(BASE, 1), parentEventId: uuid(), label: 'missing parent' }),
    ];
    for (let index = 2; index < 200; index += 1) {
      seeded.push(event({ eventId: uuid(), kind: 'tool', receivedAt: at(BASE, index * 1_000), label: `tool ${index}` }));
    }
    seeded.push(event({ eventId: lateParent, kind: 'agent', receivedAt: at(BASE, 999_000), label: 'late parent' }));

    await seedTimeline(request, a.email, [trace({ traceId: ta, receivedAt: at(BASE, 0), events: seeded })]);

    const response = await request.get(`/api/v1/traces/${ta}/events`);
    expect(response.status()).toBe(200);
    const page = (await response.json()) as EventPage;
    expect(page.items).toHaveLength(200);
    expect(page.items.some((item) => item.eventId === lateParent)).toBe(false);
    expect(page.items.find((item) => item.eventId === earliest)?.relationship).toBe('linked');
    expect(page.items.find((item) => item.eventId === missingParent)?.relationship).toBe('unresolved');
  });
});
