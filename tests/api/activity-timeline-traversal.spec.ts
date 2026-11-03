import { expect, test } from '@playwright/test';
import { control, enrollApi, newSession, uuid } from '../support/api';
import { at, event, resetTimeline, seedTimeline, trace } from '../support/activity-timeline';

const BASE = Date.parse('2026-11-03T13:00:00.000Z');

interface EventPage {
  items: Record<string, unknown>[];
  nextCursor: string | null;
}

interface TracePage {
  items: Record<string, unknown>[];
  nextCursor: string | null;
}

async function bulkTraces(
  request: Parameters<typeof control>[0],
  accountEmail: string,
  count: number,
): Promise<void> {
  const response = await control(request, 'timeline/bulk-traces', { accountEmail, count });
  expect(response.status, await response.text()).toBe(200);
}

async function bulkEvents(
  request: Parameters<typeof control>[0],
  accountEmail: string,
  traceId: string,
  count: number,
): Promise<void> {
  const response = await control(request, 'timeline/bulk-events', { accountEmail, traceId, count });
  expect(response.status, await response.text()).toBe(200);
}

async function seedEvents(
  request: Parameters<typeof control>[0],
  accountEmail: string,
  traceId: string,
  events: unknown[],
): Promise<void> {
  const response = await control(request, 'timeline/seed-events', { accountEmail, traceId, events });
  expect(response.status, await response.text()).toBe(200);
}

function eventsFor(count: number): ReturnType<typeof event>[] {
  return Array.from({ length: count }, (_, index) =>
    event({
      eventId: uuid(),
      kind: 'tool',
      receivedAt: at(BASE, index * 1_000),
      label: `event ${index}`,
    }),
  );
}

async function firstEventPage(
  request: Parameters<typeof control>[0],
  traceId: string,
): Promise<EventPage> {
  const response = await request.get(`/api/v1/traces/${traceId}/events`);
  expect(response.status()).toBe(200);
  return (await response.json()) as EventPage;
}

test.describe('Activity timeline traversal lifecycle', () => {
  test('[SCN-activity-timeline-031] Concurrent commits cannot shift an event traversal', async ({ request }) => {
    const a = await enrollApi(request);
    await resetTimeline(request);
    const ta = uuid();
    const seeded = eventsFor(201);
    await seedTimeline(request, a.email, [
      trace({ traceId: ta, receivedAt: at(BASE, 0), events: seeded }),
    ]);

    const first = await firstEventPage(request, ta);
    expect(first.items).toHaveLength(200);
    expect(first.nextCursor).toBeTruthy();

    const elate = uuid();
    await seedEvents(request, a.email, ta, [
      event({
        eventId: elate,
        kind: 'tool',
        receivedAt: at(BASE, 199_500),
        label: 'ELATE',
      }),
    ]);

    const secondResponse = await request.get(
      `/api/v1/traces/${ta}/events?cursor=${encodeURIComponent(first.nextCursor ?? '')}`,
    );
    expect(secondResponse.status()).toBe(200);
    const second = (await secondResponse.json()) as EventPage;
    expect(second.items).toHaveLength(1);
    expect(second.items[0]?.eventId).toBe(seeded[200]?.eventId);
    const ids = [...first.items, ...second.items].map((item) => item.eventId);
    expect(new Set(ids).size).toBe(201);
    expect(ids).not.toContain(elate);

    const refreshed = await firstEventPage(request, ta);
    expect(refreshed.items.map((item) => item.eventId)).toContain(elate);
  });

  test('[SCN-activity-timeline-032] Expired traversal fails explicitly', async ({ request }) => {
    const a = await enrollApi(request);
    await resetTimeline(request);
    const ta = uuid();
    await seedTimeline(request, a.email, [
      trace({ traceId: ta, receivedAt: at(BASE, 0), events: eventsFor(201) }),
    ]);

    const first = await firstEventPage(request, ta);
    expect(first.nextCursor).toBeTruthy();

    await control(request, 'clock/advance', { milliseconds: 6 * 60 * 1000 });

    const expiredResponse = await request.get(
      `/api/v1/traces/${ta}/events?cursor=${encodeURIComponent(first.nextCursor ?? '')}`,
    );
    expect(expiredResponse.status()).toBe(410);
    const expired = (await expiredResponse.json()) as { code: string; items?: unknown };
    expect(expired.code).toBe('TRAVERSAL_EXPIRED');
    expect(expired.items).toBeUndefined();

    const fresh = await firstEventPage(request, ta);
    expect(fresh.items).toHaveLength(200);
    expect(fresh.nextCursor).toBeTruthy();
  });

  test('[SCN-activity-timeline-033] Active traversal limit is enforced', async ({ request }) => {
    const a = await enrollApi(request);
    await resetTimeline(request);
    const ta = uuid();
    await seedTimeline(request, a.email, [
      trace({ traceId: ta, receivedAt: at(BASE, 0), events: eventsFor(201) }),
    ]);

    for (let index = 0; index < 5; index += 1) {
      const page = await firstEventPage(request, ta);
      expect(page.nextCursor).toBeTruthy();
    }

    const limited = await request.get(`/api/v1/traces/${ta}/events`);
    expect(limited.status()).toBe(429);
    const limitedBody = (await limited.json()) as { code: string; items?: unknown };
    expect(limitedBody.code).toBe('TRAVERSAL_LIMIT');
    expect(limitedBody.items).toBeUndefined();
    expect(Number(limited.headers()['retry-after'])).toBeGreaterThan(0);

    await control(request, 'clock/advance', { milliseconds: 6 * 60 * 1000 });
    const afterExpiry = await firstEventPage(request, ta);
    expect(afterExpiry.items).toHaveLength(200);
  });

  test('[SCN-activity-timeline-034] Oversized snapshot is rejected', async ({ request }) => {
    const a = await enrollApi(request);
    await resetTimeline(request);
    const ta = uuid();
    await seedTimeline(request, a.email, [trace({ traceId: ta, receivedAt: at(BASE, 0) })]);
    await bulkEvents(request, a.email, ta, 10_001);

    const response = await request.get(`/api/v1/traces/${ta}/events`);
    expect(response.status()).toBe(422);
    const body = (await response.json()) as { code: string; items?: unknown };
    expect(body.code).toBe('TRAVERSAL_TOO_LARGE');
    expect(body.items).toBeUndefined();
  });

  test('[SCN-activity-timeline-039] New trace cannot shift a trace-list traversal', async ({ request }) => {
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

    const tnew = uuid();
    await seedTimeline(request, a.email, [
      trace({ traceId: tnew, receivedAt: at(BASE, 10_000_000) }),
    ]);

    const secondResponse = await request.get(
      `/api/v1/traces?cursor=${encodeURIComponent(first.nextCursor ?? '')}`,
    );
    const second = (await secondResponse.json()) as TracePage;
    expect(second.items).toHaveLength(1);
    const ids = [...first.items, ...second.items].map((item) => item.traceId);
    expect(new Set(ids).size).toBe(51);
    expect(ids).not.toContain(tnew);

    const refreshedResponse = await request.get('/api/v1/traces');
    const refreshed = (await refreshedResponse.json()) as TracePage;
    expect(refreshed.items.map((item) => item.traceId)).toContain(tnew);
  });

  test('[SCN-activity-timeline-040] Invalid cursors disclose nothing', async ({ request, playwright }) => {
    const a = await enrollApi(request);
    const bRequest = await newSession(playwright);
    const b = await enrollApi(bRequest);
    await resetTimeline(request);

    const ta = uuid();
    const tb = uuid();
    await seedTimeline(request, a.email, [
      trace({ traceId: ta, receivedAt: at(BASE, 0), events: eventsFor(201) }),
    ]);
    await seedTimeline(bRequest, b.email, [
      trace({ traceId: tb, receivedAt: at(BASE, 1_000), events: eventsFor(201) }),
    ]);

    const first = await firstEventPage(request, ta);
    const cursor = first.nextCursor ?? '';
    const tampered = `${cursor.slice(0, -2)}xx`;
    const tamperedResponse = await request.get(
      `/api/v1/traces/${ta}/events?cursor=${encodeURIComponent(tampered)}`,
    );
    expect(tamperedResponse.status()).toBe(400);
    const tamperedBody = (await tamperedResponse.json()) as { code: string; message: string };
    expect(tamperedBody.code).toBe('REQUEST_INVALID');
    expect(JSON.stringify(tamperedBody)).not.toContain(cursor);
    expect(tamperedBody).not.toHaveProperty('items');

    const bFirst = await firstEventPage(bRequest, tb);
    const crossResponse = await request.get(
      `/api/v1/traces/${ta}/events?cursor=${encodeURIComponent(bFirst.nextCursor ?? '')}`,
    );
    expect(crossResponse.status()).toBe(400);
    const crossBody = (await crossResponse.json()) as { code: string; message: string };
    expect(crossBody.code).toBe('REQUEST_INVALID');
    expect(crossBody).not.toHaveProperty('items');
    await bRequest.dispose();
  });

  test('Deleted snapshot members return data-free tombstones', async ({ request }) => {
    const a = await enrollApi(request);
    await resetTimeline(request);
    const ta = uuid();
    const seeded = eventsFor(201);
    await seedTimeline(request, a.email, [
      trace({ traceId: ta, receivedAt: at(BASE, 0), events: seeded }),
    ]);

    const first = await firstEventPage(request, ta);
    const deletedId = seeded[200]?.eventId;
    const deletion = await control(request, 'timeline/delete', { eventId: deletedId });
    expect(deletion.status, await deletion.text()).toBe(200);

    const secondResponse = await request.get(
      `/api/v1/traces/${ta}/events?cursor=${encodeURIComponent(first.nextCursor ?? '')}`,
    );
    expect(secondResponse.status()).toBe(200);
    const second = (await secondResponse.json()) as EventPage;
    expect(second.items).toHaveLength(1);
    const tombstone = second.items[0] as Record<string, unknown>;
    expect(tombstone.tombstone).toBe(true);
    expect(tombstone.eventId).toBe(deletedId);
    expect(tombstone.metadata).toBeNull();
    expect(tombstone.kind).toBeNull();
    expect(tombstone.receivedAt).toBeNull();
  });
});
