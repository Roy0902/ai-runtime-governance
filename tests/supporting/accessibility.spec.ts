import { expect, test } from '@playwright/test';
import { advanceClock } from '../support/api';
import {
  openAuthenticatorSettings,
  openEnrollment,
  PASSWORD,
  register,
  registerAndEnroll,
  uniqueEmail,
} from '../support/native-auth';

/**
 * Phase 11 accessibility checks against the real running frontend.
 *
 * These are supporting checks, not locked acceptance SCNs. They exercise the
 * approved role/name contract, keyboard order, and live error/status regions.
 */

test('register page exposes headings, named controls and live regions', async ({ page }) => {
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'New password' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail());
  await page.getByRole('textbox', { name: 'New password' }).fill('short-pass1');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('alert')).toContainText('Use at least 12 characters.');

  await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail());
  await page.getByRole('textbox', { name: 'New password' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Account created. Check your email to verify your address.',
  );
});

test('sign-in page has a linear keyboard order and announces failure', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Email' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused();

  await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail());
  await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toContainText('Sign-in failed.');
});

test('enrollment page exposes the setup contract to assistive technology', async ({ page }) => {
  const email = uniqueEmail();
  await register(page, email);
  await openEnrollment(page, email);

  await expect(page.getByRole('heading', { name: 'Set up your authenticator' })).toBeVisible();
  const qr = page.getByRole('img', { name: 'Authenticator QR code' });
  await expect(qr).toBeVisible();
  await expect(qr.locator('svg')).toHaveCount(1);
  expect(await qr.locator('path').count()).toBeGreaterThan(0);
  await expect(page.getByLabel('Manual key')).toBeVisible();
  await expect(page.getByRole('list', { name: 'Recovery codes' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'I have saved my recovery codes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Complete setup' })).toBeVisible();
});

test('step-up dialog traps focus and closes with Escape', async ({ page }) => {
  const account = await registerAndEnroll(page, uniqueEmail());
  await advanceClock(page.request, 11 * 60 * 1000);

  await openAuthenticatorSettings(page);
  await page.getByRole('button', { name: 'Start replacement' }).click();

  const dialog = page.getByRole('dialog', { name: 'Confirm your identity' });
  await expect(dialog).toBeVisible();
  const password = page.getByRole('textbox', { name: 'Password', exact: true });
  await expect(password).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  // The page behind the dialog is usable again after cancellation.
  await expect(page.getByRole('button', { name: 'Start replacement' })).toBeVisible();
  expect(account.email).toContain('@example.test');
});
