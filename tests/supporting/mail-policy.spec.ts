import { expect, test, type APIRequestContext } from '@playwright/test';
import { control } from '../support/api';
import { PASSWORD } from '../support/native-auth';

/**
 * Focused evidence for the approved default mail-identity policy.
 *
 * The normal `test` profile deliberately relaxes the limits to 100/minute and
 * 1,000/hour so setup-heavy suites are not throttled. This file runs only under
 * `tests/playwright.mail-policy.config.ts`, which starts the backend with the
 * approved defaults: 1/minute and 5/hour. It is supporting evidence, not a
 * locked acceptance SCN.
 */

const EMAIL = 'mail-policy@example.test';
const OTHER = 'mail-policy-other@example.test';

async function register(request: APIRequestContext, email: string) {
  return request.post('/api/v1/auth/registrations', {
    data: { email, password: PASSWORD },
  });
}

test('approved default mail-identity policy is 1 per minute and 5 per hour', async ({ request }) => {
  await control(request, 'clock', { now: '2026-11-02T00:00:00Z' });

  // First issuance for this identity is admitted.
  expect((await register(request, EMAIL)).status()).toBe(202);

  // A second issuance in the same minute must be refused; a relaxed 100/minute
  // profile would admit it.
  expect((await register(request, EMAIL)).status()).toBe(429);

  // One issuance per minute: five total in the hour are admitted.
  for (let index = 2; index <= 5; index += 1) {
    await control(request, 'clock/advance', { milliseconds: 61_000 });
    expect((await register(request, EMAIL)).status()).toBe(202);
  }

  // A sixth issuance inside the rolling hour must be refused; a relaxed
  // 1,000/hour profile would admit it.
  await control(request, 'clock/advance', { milliseconds: 61_000 });
  expect((await register(request, EMAIL)).status()).toBe(429);

  // The limit is per normalized identity, not global.
  expect((await register(request, OTHER)).status()).toBe(202);
  expect((await register(request, `  ${EMAIL.toUpperCase()}  `)).status()).toBe(429);
});
