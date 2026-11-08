import { expect, test } from '@playwright/test';
import {
  advanceClock,
  control,
  newSession,
  signInApi,
} from '../support/api';
import {
  expectAccount,
  expectSignInPage,
  latestLink,
  NEW_PASSWORD,
  openAuthenticatorSettings,
  PASSWORD,
  registerAndEnroll,
  register,
  signIn,
  signOut,
  totp,
  uniqueEmail,
} from '../support/native-auth';

test.describe('Native-auth follow-up 03 browser cases', () => {
  test.beforeEach(async ({ page }) => {
    await control(page.request, 'reset');
  });

  test('[SCN-native-auth-001] Locate the gateway term without changing the account oracle', async ({ page }) => {
    await registerAndEnroll(page, uniqueEmail());
    await expect(page.getByRole('heading', { name: 'Account', level: 1 })).toBeVisible();
    await expect(
      page.getByRole('term').filter({ hasText: /^Gateway access$/ }),
    ).toBeVisible();
    await expect(page.getByText('Not granted')).toBeVisible();
  });

  test('[SCN-native-auth-015] Any unexpired link remains usable and the rest are superseded after success', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    const first = await latestLink(page, email, 'verify');
    await advanceClock(page.request, 60_000);
    await page.goto('/verify');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('button', { name: 'Send a new verification email' }).click();
    await expect(page.getByRole('status')).toContainText(
      'Verification email sent. Check your inbox.',
    );
    const second = await latestLink(page, email, 'verify', first);
    expect(second).not.toBe(first);

    await page.goto(first);
    await page.getByRole('button', { name: 'Verify email' }).click();
    await expect(page.getByRole('status')).toContainText('Email verified.');
    await page.goto(second);
    await page.getByRole('button', { name: 'Verify email' }).click();
    await expect(page.getByRole('alert')).toContainText("This link can't be used.");
  });

  test('[SCN-native-auth-039] A replacement sign-in uses a fresh TOTP step', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await openAuthenticatorSettings(page);
    await page.getByRole('button', { name: 'Start replacement' }).click();
    const newKey = (await page.getByLabel('Manual key').innerText()).trim();
    await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(newKey));
    await page.getByText('I have saved my recovery codes').click();
    const replacement = page.waitForResponse((response) =>
      response.request().method() === 'POST'
      && response.url().includes('/api/v1/account/authenticator-replacements/')
      && response.url().endsWith('/complete'),
    );
    await page.getByRole('button', { name: 'Complete replacement' }).click();
    expect((await replacement).ok()).toBeTruthy();
    await page.goto('/account');
    const accountHeading = page.getByRole('heading', { name: 'Account', level: 1 });
    await accountHeading.waitFor({ state: 'visible', timeout: 3_000 }).catch(() => {});
    if (await accountHeading.isVisible().catch(() => false)) {
      await signOut(page);
    }
    await expectSignInPage(page);

    await advanceClock(page.request, 30_000);
    await signIn(page, account.email, PASSWORD, totp(account.manualKey));
    await expect(page.getByRole('alert')).toContainText('Sign-in failed.');
    await signIn(page, account.email, PASSWORD, totp(newKey));
    await expectAccount(page);
  });

  test('[SCN-native-auth-041] Step-up uses the current controlled TOTP step', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await advanceClock(page.request, 11 * 60 * 1000);
    await openAuthenticatorSettings(page);
    await page.getByRole('button', { name: 'Start replacement' }).click();
    await expect(page.getByRole('dialog', { name: 'Confirm your identity' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(PASSWORD);
    await page.getByRole('textbox', { name: 'Authenticator or recovery code' }).fill(totp(account.manualKey));
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByLabel('Manual key')).toBeVisible();
  });

  test('[SCN-native-auth-054] Invalid password does not renew idle after required step-up', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await advanceClock(page.request, 6 * 24 * 60 * 60 * 1000);
    await page.goto('/account/password');
    await page.getByRole('textbox', { name: 'New password' }).fill('short-pass1');
    await page.getByRole('button', { name: 'Change password' }).click();
    await expect(page.getByRole('dialog', { name: 'Confirm your identity' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(PASSWORD);
    await page.getByRole('textbox', { name: 'Authenticator or recovery code' }).fill(totp(account.manualKey));
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Password must be 12 to 128 characters.')).toBeVisible();
    await advanceClock(page.request, 2 * 24 * 60 * 60 * 1000);
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('[SCN-native-auth-058] An independent session is revoked while the current deadline is retained', async ({
    page, playwright,
  }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    const beforeResponse = await page.request.get('/api/v1/account');
    expect(beforeResponse.status()).toBe(200);
    const before = (await beforeResponse.json()).session as {
      createdAt: string; absoluteExpiresAt: string; recentAuthExpiresAt: string | null;
    };

    const second = await newSession(playwright);
    try {
      expect((await signInApi(second, account.email, PASSWORD, {
        kind: 'TOTP', code: totp(account.manualKey),
      })).status()).toBe(200);

      await advanceClock(page.request, 5 * 60 * 1000);
      await page.goto('/account/password');
      await page.getByRole('textbox', { name: 'New password' }).fill(NEW_PASSWORD);
      await page.getByRole('button', { name: 'Change password' }).click();
      await expect(page.getByRole('status')).toContainText('Password changed.');

      const afterResponse = await page.request.get('/api/v1/account');
      expect(afterResponse.status()).toBe(200);
      const after = (await afterResponse.json()).session as typeof before;
      expect(after.createdAt).toBe(before.createdAt);
      expect(after.absoluteExpiresAt).toBe(before.absoluteExpiresAt);
      expect(after.recentAuthExpiresAt).toBe(before.recentAuthExpiresAt);
      expect((await second.get('/api/v1/account')).status()).toBe(401);
    } finally {
      await second.dispose();
    }
  });
});
