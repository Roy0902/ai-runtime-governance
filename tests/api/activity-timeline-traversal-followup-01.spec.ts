import { expect, test } from '@playwright/test';
import { enrollApi, uuid } from '../support/api';
import { at, event, resetTimeline, seedTimeline, trace } from '../support/activity-timeline';

const BASE = Date.parse('2026-11-03T14:00:00.000Z');

interface EventPage {
  items: Record<string, unknown>[];
  nextCursor: string | null;
}

async function pageOf(
  request: Parameters<typeof enrollApi>[0],
  traceId: string,
  cursor?: string | null,
): Promise<EventPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  const response = await request.get(`/api/v1/traces/${traceId}/events${query}`);
  expect(response.status()).toBe(200);
  return (await response.json()) as EventPage;
}

test('[SCN-activity-timeline-031] Refreshed traversal includes the late event', async ({ request }) => {
  const account = await enrollApi(request);
  await resetTimeline(request);
  const traceId = uuid();
  const seeded = Array.from({ length: 201 }, (_, index) =>
    event({
      eventId: uuid(),
      kind: 'tool',
      receivedAt: at(BASE, index * 1_000),
      label: `event ${index}`,
    }),
  );
  await seedTimeline(request, account.email, [
    trace({ traceId, receivedAt: at(BASE, 0), events: seeded }),
  ]);

  const first = await pageOf(request, traceId);
  expect(first.items).toHaveLength(200);
  expect(first.nextCursor).toBeTruthy();

  const elate = uuid();
  const seedResponse = await request.post(
    '/__test/timeline/seed-events',
    {
      data: {
        accountEmail: account.email,
        traceId,
        events: [event({ eventId: elate, kind: 'tool', receivedAt: at(BASE, 199_500), label: 'ELATE' })],
      },
      headers: { 'X-Test-Token': process.env.TEST_CLOCK_TOKEN ?? '' },
    },
  );
  expect(seedResponse.status()).toBe(200);

  const originalSecond = await pageOf(request, traceId, first.nextCursor);
  expect(originalSecond.items).toHaveLength(1);
  expect(originalSecond.items.map((item) => item.eventId)).not.toContain(elate);

  const seen: unknown[] = [];
  let page = await pageOf(request, traceId);
  seen.push(...page.items.map((item) => item.eventId));
  let cursor = page.nextCursor;
  let pages = 1;
  while (cursor && pages < 5) {
    page = await pageOf(request, traceId, cursor);
    seen.push(...page.items.map((item) => item.eventId));
    cursor = page.nextCursor;
    pages += 1;
  }

  expect(seen).toContain(elate);
  expect(new Set(seen).size).toBe(202);
  expect(seen.filter((id) => id === elate)).toHaveLength(1);
});
