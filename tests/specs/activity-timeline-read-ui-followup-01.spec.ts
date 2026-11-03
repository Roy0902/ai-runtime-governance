import { expect, test } from '@playwright/test';
import { enrollApi, uuid } from '../support/api';
import { at, event, resetTimeline, seedTimeline, trace } from '../support/activity-timeline';

const BASE = Date.parse('2026-11-03T16:00:00.000Z');

test('[SCN-activity-timeline-037] Pending continuation is single', async ({ page }) => {
  const account = await enrollApi(page.request);
  await resetTimeline(page.request);
  const traceId = uuid();
  const seeded = Array.from({ length: 201 }, (_, index) =>
    event({
      eventId: uuid(),
      kind: 'tool',
      receivedAt: at(BASE, index * 1_000),
      label: `event ${index}`,
    }),
  );
  await seedTimeline(page.request, account.email, [
    trace({ traceId, receivedAt: at(BASE, 0), events: seeded }),
  ]);

  await page.goto(`/activity/${traceId}`);
  await expect(page.getByRole('heading', { name: 'event 0', exact: true })).toBeVisible();

  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  let continuationRequests = 0;
  await page.route(`**/api/v1/traces/${traceId}/events?cursor=*`, async (route) => {
    continuationRequests += 1;
    await gate;
    await route.continue();
  });

  const control = page.getByRole('button', { name: /Load more events|Loading more activity|All events loaded/ });
  await control.click();
  await expect(control).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('Loading more activity…');
  await control.click({ force: true }).catch(() => {});
  expect(continuationRequests).toBe(1);

  release();
  await expect(page.getByRole('status')).toContainText(/Loaded 1 more event/);
  await expect(control).toBeFocused();
  await expect(page.getByRole('heading', { name: 'event 200', exact: true })).toBeVisible();
});
