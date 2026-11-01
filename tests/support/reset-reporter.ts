import type { Reporter } from '@playwright/test/reporter';

/**
 * Resets test-only rate/failure state and the clock before each test. This keeps
 * the locked acceptance suite isolated without editing the tests themselves.
 */
export default class ResetReporter implements Reporter {
  async onTestBegin(): Promise<void> {
    const url = process.env.TEST_CONTROL_URL ?? 'http://127.0.0.1:8080/__test';
    const token = process.env.TEST_CLOCK_TOKEN ?? 'test-token';
    try {
      const response = await fetch(`${url}/reset`, {
        method: 'POST',
        headers: { 'X-Test-Token': token, 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!response.ok) {
        console.warn(`test reset returned ${response.status}`);
      }
    } catch (error) {
      console.warn(`test reset failed: ${String(error)}`);
    }
  }
}
