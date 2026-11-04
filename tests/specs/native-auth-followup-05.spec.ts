import { expect, test } from '@playwright/test';
import { advanceClock, control, inspect } from '../support/api';
import {
  expectAccount,
  latestLink,
  NEW_PASSWORD,
  PASSWORD,
  register,
  registerAndEnroll,
  requestReset,
  signIn,
  totp,
  uniqueEmail,
  verifyEmail,
} from '../support/native-auth';

const FIXED_CLOCK = '2026-11-04T12:00:00Z';

test.describe('Native-auth follow-up 05 browser cases', () => {
  test.beforeEach(async ({ page }) => {
    const reset = await control(page.request, 'reset');
    expect(reset.ok).toBe(true);
  });

  test('[SCN-native-auth-022] Wait for password reset before checking independent sessions', async ({
    page, browser,
  }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    const second = await browser.newContext({ baseURL: new URL(page.url()).origin });
    try {
      const other = await second.newPage();
      await signIn(other, account.email, PASSWORD, totp(account.manualKey));
      await expectAccount(other);

      await requestReset(page, account.email);
      const link = await latestLink(page, account.email, 'reset');
      await page.goto(link);
      await page.getByRole('textbox', { name: 'New password' }).fill(NEW_PASSWORD);
      await page.getByRole('button', { name: 'Change password' }).click();
      await expect(page.getByRole('status')).toHaveText(
        'Password changed. Sign in with your new password.',
      );

      await other.goto('/account');
      await expect(other.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
      await advanceClock(page.request, 30_000);
      await signIn(page, account.email, NEW_PASSWORD, totp(account.manualKey));
      await expectAccount(page);
    } finally {
      await second.close();
    }
  });

  test('[SCN-native-auth-023] Wait for reset before checking incomplete-account authority', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    await verifyEmail(page, email);
    await requestReset(page, email);
    const link = await latestLink(page, email, 'reset');
    await page.goto(link);
    await page.getByRole('textbox', { name: 'New password' }).fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'Change password' }).click();
    await expect(page.getByRole('status')).toHaveText(
      'Password changed. Sign in with your new password.',
    );

    const account = await inspect(page.request, 'account', { email });
    expect(account.scopeId).toBeNull();
    expect(account.mfaState).not.toBe('ENROLLED');
    expect(account.gatewayEntitlement).toBe('ABSENT');
    expect((await page.request.get('/api/v1/account')).status()).toBe(401);
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
  });

  test('[SCN-native-auth-031] Provide password and fixed server time for the previous TOTP step', async ({
    page,
  }) => {
    expect((await control(page.request, 'clock', { now: FIXED_CLOCK })).ok).toBe(true);
    const email = uniqueEmail();
    await register(page, email);
    await verifyEmail(page, email);
    await page.getByRole('link', { name: 'Continue to setup' }).click();
    const key = (await page.getByLabel('Manual key').innerText()).trim();

    await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
    await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(key, -1));
    await page.getByRole('checkbox', { name: 'I have saved my recovery codes' }).check();
    const completion = page.waitForResponse((response) =>
      response.url().includes('/api/v1/auth/enrollment/complete'),
    );
    await page.getByRole('button', { name: 'Complete setup' }).click();
    expect((await completion).status()).toBe(200);
    await expectAccount(page);
  });

  test('[SCN-native-auth-036] Provide password at the final second before setup expiry', async ({
    page,
  }) => {
    expect((await control(page.request, 'clock', { now: FIXED_CLOCK })).ok).toBe(true);
    const email = uniqueEmail();
    await register(page, email);
    await verifyEmail(page, email);
    await page.getByRole('link', { name: 'Continue to setup' }).click();
    const key = (await page.getByLabel('Manual key').innerText()).trim();
    await advanceClock(page.request, (24 * 60 * 60 - 1) * 1000);

    await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
    await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(key));
    await page.getByRole('checkbox', { name: 'I have saved my recovery codes' }).check();
    const completion = page.waitForResponse((response) =>
      response.url().includes('/api/v1/auth/enrollment/complete'),
    );
    await page.getByRole('button', { name: 'Complete setup' }).click();
    expect((await completion).status()).toBe(200);
    await expectAccount(page);
  });

  test('[SCN-native-auth-063] Wait for replacement before checking the private scope', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    const before = await inspect(page.request, 'account', { email: account.email });
    expect(before.scopeId).toBeTruthy();

    await page.getByRole('link', { name: 'Replace authenticator' }).click();
    await page.getByRole('button', { name: 'Start replacement' }).click();
    const newKey = (await page.getByLabel('Manual key').innerText()).trim();
    await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(newKey));
    await page.getByRole('checkbox', { name: 'I have saved my recovery codes' }).check();
    const completion = page.waitForResponse((response) =>
      response.request().method() === 'POST'
      && response.url().includes('/api/v1/account/authenticator-replacements/')
      && response.url().endsWith('/complete'),
    );
    await page.getByRole('button', { name: 'Complete replacement' }).click();
    expect((await completion).status()).toBe(200);

    const after = await inspect(page.request, 'account', { email: account.email });
    expect(after.scopeId).toBe(before.scopeId);
  });
});
