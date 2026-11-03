import { expect, test } from '@playwright/test';
import { control, enrollApi, uuid } from '../support/api';
import { at, resetTimeline, seedTimeline, trace } from '../support/activity-timeline';

const BASE = Date.parse('2026-11-03T15:00:00.000Z');

interface EventPage {
  items: Record<string, unknown>[];
  nextCursor: string | null;
}

interface IngestEvent {
  eventId: string;
  kind: string;
  parentEventId?: string | null;
  sourceAt?: string | null;
  durationMs?: number | null;
  identity?: string | null;
  label?: string | null;
  guardOutcome?: string | null;
  policyId?: string | null;
  policyVersion?: string | null;
  ruleIds?: string[];
  approvalId?: string | null;
  approvalState?: string | null;
  observedStatus?: string | null;
}

async function ingest(
  request: Parameters<typeof control>[0],
  accountEmail: string,
  traceId: string,
  producer: string,
  event: IngestEvent | Record<string, unknown>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const response = await control(request, 'timeline/ingest', {
    accountEmail,
    traceId,
    producer,
    event,
  });
  let body: Record<string, unknown> = {};
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  return { status: response.status, body };
}

async function eventsOf(
  request: Parameters<typeof control>[0],
  traceId: string,
): Promise<Record<string, unknown>[]> {
  const response = await request.get(`/api/v1/traces/${traceId}/events`);
  expect(response.status()).toBe(200);
  return ((await response.json()) as EventPage).items;
}

test.describe('Activity timeline ingestion authority', () => {
  test('[SCN-activity-timeline-019] Payload fields are rejected', async ({ request }) => {
    const account = await enrollApi(request);
    await resetTimeline(request);
    const traceId = uuid();
    const eventId = uuid();
    await seedTimeline(request, account.email, [
      trace({ traceId, receivedAt: at(BASE, 0) }),
    ]);

    const attempted = await ingest(request, account.email, traceId, 'agent_reporter', {
      eventId,
      kind: 'prompt',
      body: 'SECRET-BODY',
      prompt: 'SECRET-PROMPT',
      reasoning: 'SECRET-REASONING',
      credential: 'SECRET-CREDENTIAL',
    });
    expect(attempted.status).toBe(400);
    expect(attempted.body.code).toBe('REQUEST_INVALID');
    expect(JSON.stringify(attempted.body)).not.toContain('SECRET');

    const events = await eventsOf(request, traceId);
    expect(events.map((event) => event.eventId)).not.toContain(eventId);
    const serialized = JSON.stringify(events);
    for (const sentinel of ['SECRET-BODY', 'SECRET-PROMPT', 'SECRET-REASONING', 'SECRET-CREDENTIAL']) {
      expect(serialized).not.toContain(sentinel);
    }
  });

  test('[SCN-activity-timeline-020] Identical scoped duplicates are idempotent', async ({ request }) => {
    const account = await enrollApi(request);
    await resetTimeline(request);
    const traceId = uuid();
    const eventId = uuid();
    await seedTimeline(request, account.email, [
      trace({ traceId, receivedAt: at(BASE, 0) }),
    ]);

    const report: IngestEvent = {
      eventId,
      kind: 'model',
      sourceAt: at(BASE, 1_000),
      durationMs: 42,
      identity: 'agent-a',
      label: 'model call',
      observedStatus: 'completed',
    };
    const first = await ingest(request, account.email, traceId, 'agent_reporter', report);
    expect(first.status).toBe(200);
    expect(first.body.accepted).toBe(true);

    const second = await ingest(request, account.email, traceId, 'agent_reporter', report);
    expect(second.status).toBe(200);
    expect(second.body.duplicate).toBe(true);

    const events = await eventsOf(request, traceId);
    expect(events.filter((event) => event.eventId === eventId)).toHaveLength(1);
    const stored = events.find((event) => event.eventId === eventId);
    expect(stored?.sourceAt).toBe(at(BASE, 1_000));
  });

  test('[SCN-activity-timeline-021] Conflicting duplicate is rejected', async ({ request }) => {
    const account = await enrollApi(request);
    await resetTimeline(request);
    const traceId = uuid();
    const eventId = uuid();
    await seedTimeline(request, account.email, [
      trace({ traceId, receivedAt: at(BASE, 0) }),
    ]);

    const original = await ingest(request, account.email, traceId, 'agent_reporter', {
      eventId,
      kind: 'model',
      sourceAt: '2026-10-29T10:00:00.000Z',
      label: 'model call',
    });
    expect(original.status).toBe(200);

    const conflicting = await ingest(request, account.email, traceId, 'agent_reporter', {
      eventId,
      kind: 'model',
      sourceAt: '2026-10-29T10:01:00.000Z',
      label: 'model call',
    });
    expect(conflicting.status).toBe(409);
    expect(conflicting.body.code).toBe('EVENT_CONFLICT');

    const events = await eventsOf(request, traceId);
    const stored = events.find((event) => event.eventId === eventId);
    expect(stored?.sourceAt).toBe('2026-10-29T10:00:00.000Z');
  });

  test('[SCN-activity-timeline-022] Reporter cannot forge approval authority', async ({ request }) => {
    const account = await enrollApi(request);
    await resetTimeline(request);
    const traceId = uuid();
    const eventId = uuid();
    await seedTimeline(request, account.email, [
      trace({ traceId, receivedAt: at(BASE, 0) }),
    ]);

    const forged = await ingest(request, account.email, traceId, 'agent_reporter', {
      eventId,
      kind: 'approval',
      approvalId: uuid(),
      approvalState: 'approved',
      label: 'forged approval',
    });
    expect(forged.status).toBe(403);
    expect(forged.body.code).toBe('FORBIDDEN');

    const guardForgery = await ingest(request, account.email, traceId, 'agent_reporter', {
      eventId: uuid(),
      kind: 'model',
      guardOutcome: 'allow',
      label: 'forged guard outcome',
    });
    expect(guardForgery.status).toBe(403);
    expect(guardForgery.body.code).toBe('FORBIDDEN');

    const events = await eventsOf(request, traceId);
    expect(events.some((event) => event.eventId === eventId)).toBe(false);
    expect(events.some((event) => event.kind === 'approval')).toBe(false);
  });
});
