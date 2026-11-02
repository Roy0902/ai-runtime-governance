import { test } from '@playwright/test';

/**
 * Awaited per-test reset.
 *
 * Playwright reporter callbacks are fire-and-forget, so a reporter cannot act as
 * a fixture barrier. This hook is a real `beforeEach`, which the runner awaits
 * before the test body. It runs before every test in every project, including
 * the locked original suites that cannot be edited.
 *
 * The reset endpoint is destructive: it clears test-owned accounts, rate
 * buckets, faults and dispatch state, then resets the controlled clock. It must
 * never run during a scenario action; running here keeps it strictly before the
 * test body. Failure is explicit so a dirty fixture cannot masquerade as a pass.
 */

const CONTROL_URL = process.env.TEST_CONTROL_URL
  ?? `http://127.0.0.1:${process.env.GOVERNANCE_PORT ?? '8080'}/__test`;
const CONTROL_TOKEN = process.env.TEST_CLOCK_TOKEN ?? '';

test.beforeEach(async ({ request }) => {
  const response = await request.post(`${CONTROL_URL}/reset`, {
    data: {},
    headers: { 'X-Test-Token': CONTROL_TOKEN },
  });
  if (!response.ok()) {
    throw new Error(
      `test reset failed: HTTP ${response.status()} ${await response.text()}`,
    );
  }
});

// Playwright compiles test helpers to CommonJS and caches imported modules
// across test files inside one worker. Without dropping this module from the
// cache, only the first file would register the hook. Re-evaluating it per file
// makes the hook apply to every suite without editing any locked test.
declare const __filename: string;
declare const require: { cache: Record<string, unknown> };

if (typeof __filename !== 'undefined' && typeof require !== 'undefined') {
  const self = __filename;
  process.nextTick(() => {
    delete require.cache[self];
  });
}
