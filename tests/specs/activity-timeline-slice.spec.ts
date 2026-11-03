import { expect, test } from '@playwright/test';
import { enrollApi } from '../support/api';
import { at, event, resetTimeline, seedTimeline, trace } from '../support/activity-timeline';

const BASE = Date.parse('2026-11-03T11:00:00.000Z');

test.describe('Activity timeline browser slice', () => {
  test('[SCN-activity-timeline-004] Hierarchy and receipt order are visible', async ({ page }) => {
    const account = await enrollApi(page.request);
    const email = account.email;
    await resetTimeline(page.request);

    const ta = crypto.randomUUID();
    const root = crypto.randomUUID();
    const child = crypto.randomUUID();
    const sibling = crypto.randomUUID();
    await seedTimeline(page.request, email, [
      trace({
        traceId: ta,
        receivedAt: at(BASE, 0),
        events: [
          event({ eventId: root, kind: 'agent', receivedAt: at(BASE, 0), label: 'agent root' }),
          event({
            eventId: child,
            kind: 'model',
            parentEventId: root,
            receivedAt: at(BASE, 2_000),
            sourceAt: at(BASE, -5_000),
            label: 'model call',
          }),
          event({ eventId: sibling, kind: 'tool', receivedAt: at(BASE, 4_000), label: 'search tool' }),
        ],
      }),
    ]);

    await page.goto(`/activity/${ta}`);
    await expect(page.getByRole('heading', { name: 'Timeline', level: 2 })).toBeVisible();

    const events = page.getByRole('list', { name: 'Activity events' });
    const rootItem = events.getByRole('listitem').filter({ hasText: 'agent root' }).first();
    await expect(rootItem.getByRole('listitem').filter({ hasText: 'model call' })).toBeVisible();

    const texts = await events.getByRole('listitem').allTextContents();
    const rootIndex = texts.findIndex((text) => text.includes('agent root'));
    const siblingIndex = texts.findIndex((text) => text.includes('search tool'));
    expect(rootIndex).toBeGreaterThanOrEqual(0);
    expect(siblingIndex).toBeGreaterThan(rootIndex);

    await page.getByRole('button', { name: `Expand event ${child}` }).click();
    await expect(page.getByText('Source time (UTC)').first()).toBeVisible();
  });

  test('[SCN-activity-timeline-030] Loaded parent and unresolved parent stay distinct', async ({ page }) => {
    const account = await enrollApi(page.request);
    const email = account.email;
    await resetTimeline(page.request);

    const ta = crypto.randomUUID();
    const earliest = crypto.randomUUID();
    const missingParent = crypto.randomUUID();
    const lateParent = crypto.randomUUID();
    const seeded = [
      event({ eventId: earliest, kind: 'agent', receivedAt: at(BASE, 0), parentEventId: lateParent, label: 'early child' }),
      event({ eventId: missingParent, kind: 'model', receivedAt: at(BASE, 1), parentEventId: crypto.randomUUID(), label: 'missing parent' }),
    ];
    for (let index = 2; index < 200; index += 1) {
      seeded.push(event({ eventId: crypto.randomUUID(), kind: 'tool', receivedAt: at(BASE, index * 1_000), label: `tool ${index}` }));
    }
    seeded.push(event({ eventId: lateParent, kind: 'agent', receivedAt: at(BASE, 999_000), label: 'late parent' }));

    await seedTimeline(page.request, email, [trace({ traceId: ta, receivedAt: at(BASE, 0), events: seeded })]);

    await page.goto(`/activity/${ta}`);
    await expect(page.getByRole('heading', { name: 'Timeline', level: 2 })).toBeVisible();
    await expect(page.getByText('Parent event is not loaded in this page.').first()).toBeVisible();
    await expect(page.getByText('Unlinked activity.').first()).toBeVisible();
  });
});
