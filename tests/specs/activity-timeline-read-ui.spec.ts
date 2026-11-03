import { expect, test } from '@playwright/test';
import { control, enrollApi, uuid } from '../support/api';
import { at, event, resetTimeline, seedTimeline, trace } from '../support/activity-timeline';

const BASE = Date.parse('2026-11-03T12:00:00.000Z');

async function setReadFault(
  request: Parameters<typeof control>[0],
  enabled: boolean,
): Promise<void> {
  const response = await control(request, 'faults', { name: 'timeline-read', enabled });
  expect(response.status).toBe(200);
}

test.describe('Activity timeline read UI', () => {
  test('[SCN-activity-timeline-006] Approval history is inspectable without actions', async ({ page }) => {
    const account = await enrollApi(page.request);
    await resetTimeline(page.request);
    const ta = uuid();
    const states = ['requested', 'approved', 'rejected', 'canceled', 'expired'] as const;
    await seedTimeline(page.request, account.email, [
      trace({
        traceId: ta,
        receivedAt: at(BASE, 0),
        events: states.map((state, index) =>
          event({
            eventId: uuid(),
            kind: 'approval',
            receivedAt: at(BASE, index * 1_000),
            approvalId: uuid(),
            approvalState: state,
            label: `approval ${state}`,
          }),
        ),
      }),
    ]);

    await page.goto(`/activity/${ta}`);
    const history = page.getByRole('region', { name: 'Approval history' });
    await expect(history).toBeVisible();
    for (const state of states) {
      await expect(history.getByText(state, { exact: true })).toBeVisible();
    }
    await expect(history.getByRole('button', { name: /approve|reject/i })).toHaveCount(0);
  });

  test('[SCN-activity-timeline-016] Known loss extent is preserved', async ({ page }) => {
    const account = await enrollApi(page.request);
    await resetTimeline(page.request);
    const ta = uuid();
    await seedTimeline(page.request, account.email, [
      trace({
        traceId: ta,
        receivedAt: at(BASE, 0),
        telemetryStatus: 'incomplete',
        lossCauseCode: 'fixture-collector-outage',
        lossMissingCount: 3,
        lossFrom: '2026-10-29T10:00:00.000Z',
        lossTo: '2026-10-29T10:01:00.000Z',
      }),
    ]);

    await page.goto(`/activity/${ta}`);
    const loss = page.getByRole('region', { name: 'Loss extent' });
    await expect(loss).toBeVisible();
    await expect(loss).toContainText('fixture-collector-outage');
    await expect(loss).toContainText('3');
    await expect(loss).toContainText('2026');
  });

  test('[SCN-activity-timeline-018] Coverage dimensions stay independent', async ({ page }) => {
    const account = await enrollApi(page.request);
    await resetTimeline(page.request);
    const ta = uuid();
    await seedTimeline(page.request, account.email, [
      trace({
        traceId: ta,
        receivedAt: at(BASE, 0),
        inputCoverage: 'bypassed',
        responseCoverage: 'unknown',
        toolsCoverage: 'degraded',
      }),
    ]);

    await page.goto(`/activity/${ta}`);
    const coverage = page.getByRole('region', { name: 'Reported integration coverage' });
    await expect(coverage).toBeVisible();
    await expect(coverage).toContainText('bypassed');
    await expect(coverage).toContainText('unknown');
    await expect(coverage).toContainText('degraded');
    await expect(coverage).not.toContainText('guarded');
    await expect(coverage).not.toContainText('observed');
  });

  test('[SCN-activity-timeline-026] Read failure is explicit', async ({ page }) => {
    const account = await enrollApi(page.request);
    await resetTimeline(page.request);
    const ta = uuid();
    await seedTimeline(page.request, account.email, [
      trace({ traceId: ta, receivedAt: at(BASE, 0) }),
    ]);

    await setReadFault(page.request, true);
    await page.goto(`/activity/${ta}`);
    await expect(page.getByRole('alert')).toContainText('Activity could not be loaded.');
    await expect(page.getByRole('heading', { name: 'Timeline', level: 2 })).toHaveCount(0);

    await setReadFault(page.request, false);
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('heading', { name: 'Timeline', level: 2 })).toBeVisible();
  });

  test('[SCN-activity-timeline-035] Failed refresh keeps stale data', async ({ page }) => {
    const account = await enrollApi(page.request);
    await resetTimeline(page.request);
    const ta = uuid();
    await seedTimeline(page.request, account.email, [
      trace({
        traceId: ta,
        receivedAt: at(BASE, 0),
        events: [
          event({ eventId: uuid(), kind: 'model', receivedAt: at(BASE, 0), label: 'E1 activity' }),
        ],
      }),
    ]);

    await page.goto(`/activity/${ta}`);
    await expect(page.getByText('E1 activity')).toBeVisible();

    await setReadFault(page.request, true);
    await page.getByRole('button', { name: 'Refresh' }).click();
    await expect(page.getByRole('alert')).toContainText('Activity could not be loaded.');
    await expect(page.getByText('E1 activity')).toBeVisible();
    await expect(page.getByText('Showing the last loaded activity', { exact: false })).toBeVisible();

    await setReadFault(page.request, false);
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByText('E1 activity')).toHaveCount(1);
    await expect(page.getByText('Showing the last loaded activity', { exact: false })).toHaveCount(0);
  });

  test('[SCN-activity-timeline-036] Late response cannot replace the selected trace', async ({ page }) => {
    const account = await enrollApi(page.request);
    await resetTimeline(page.request);
    const ta = uuid();
    const tb = uuid();
    await seedTimeline(page.request, account.email, [
      trace({
        traceId: ta,
        receivedAt: at(BASE, 0),
        events: [event({ eventId: uuid(), kind: 'model', receivedAt: at(BASE, 0), label: 'A activity' })],
      }),
      trace({
        traceId: tb,
        receivedAt: at(BASE, 1_000),
        events: [event({ eventId: uuid(), kind: 'model', receivedAt: at(BASE, 1_000), label: 'B activity' })],
      }),
    ]);

    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    await page.route(`**/api/v1/traces/${ta}/events*`, async (route) => {
      await gate;
      await route.continue();
    });

    await page.goto(`/activity/${ta}`);
    await page.waitForTimeout(250);
    await page.getByRole('link', { name: 'Back to traces' }).click();
    await page.getByRole('link', { name: `Open trace ${tb}` }).click();
    await expect(page.getByText('B activity')).toBeVisible();

    release();
    await page.waitForTimeout(500);
    await expect(page.getByText('B activity')).toBeVisible();
    await expect(page.getByText('A activity')).toHaveCount(0);
  });

  test('[SCN-activity-timeline-037] Pending continuation is single', async ({ page }) => {
    const account = await enrollApi(page.request);
    await resetTimeline(page.request);
    const ta = uuid();
    const seeded = Array.from({ length: 201 }, (_, index) =>
      event({
        eventId: uuid(),
        kind: 'tool',
        receivedAt: at(BASE, index * 1_000),
        label: `event ${index}`,
      }),
    );
    await seedTimeline(page.request, account.email, [
      trace({ traceId: ta, receivedAt: at(BASE, 0), events: seeded }),
    ]);

    await page.goto(`/activity/${ta}`);
    await expect(page.getByRole('heading', { name: 'event 0', exact: true })).toBeVisible();

    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    let continuationRequests = 0;
    await page.route(`**/api/v1/traces/${ta}/events?cursor=*`, async (route) => {
      continuationRequests += 1;
      await gate;
      await route.continue();
    });

    const button = page.getByRole('button', { name: /Load more events|Loading more activity|All events loaded/ });
    await button.click();
    await expect(button).toBeDisabled();
    await expect(page.getByRole('status')).toContainText('Loading more activity…');
    await button.click({ force: true }).catch(() => {});
    expect(continuationRequests).toBe(1);

    release();
    await expect(page.getByRole('status')).toContainText(/Loaded 1 more event/);
    await expect(button).toBeFocused();
    await expect(page.getByText('event 200')).toBeVisible();
  });

  test('[SCN-activity-timeline-038] Keyboard operation and announcements', async ({ page }) => {
    const account = await enrollApi(page.request);
    await resetTimeline(page.request);
    const ta = uuid();
    const first = uuid();
    const seeded = [
      event({ eventId: first, kind: 'model', receivedAt: at(BASE, 0), label: 'first activity' }),
    ];
    for (let index = 1; index < 201; index += 1) {
      seeded.push(event({
        eventId: uuid(),
        kind: 'tool',
        receivedAt: at(BASE, index * 1_000),
        label: `event ${index}`,
      }));
    }
    await seedTimeline(page.request, account.email, [
      trace({ traceId: ta, receivedAt: at(BASE, 0), events: seeded }),
    ]);

    await page.goto(`/activity/${ta}`);
    const toggle = page.getByRole('button', { name: new RegExp(`(Expand|Collapse) event ${first}`) });
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toBeFocused();

    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    await page.route(`**/api/v1/traces/${ta}/events?cursor=*`, async (route) => {
      await gate;
      await route.continue();
    });

    const button = page.getByRole('button', { name: /Load more events|Loading more activity|All events loaded/ });
    await button.click();
    await expect(page.getByRole('status')).toContainText('Loading more activity…');
    release();
    await expect(page.getByRole('status')).toContainText(/Loaded 1 more event/);
    await expect(button).toBeInViewport();
  });
});
