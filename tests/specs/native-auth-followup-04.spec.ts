import { expect, test } from '@playwright/test';
import { control, inspect } from '../support/api';
import {
  expectAccount,
  PASSWORD,
  register,
  totp,
  uniqueEmail,
  verifyEmail,
} from '../support/native-auth';

test.describe('Native-auth follow-up 04 browser cases', () => {
  test.beforeEach(async ({ page }) => {
    const reset = await control(page.request, 'reset');
    expect(reset.ok).toBe(true);
  });

  test('[SCN-native-auth-034] Password proof isolates the saved-code acknowledgement oracle', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    await verifyEmail(page, email);
    await page.getByRole('link', { name: 'Continue to setup' }).click();
    await expect(page.getByRole('heading', { name: 'Set up your authenticator', level: 1 })).toBeVisible();

    const key = (await page.getByLabel('Manual key').innerText()).trim();
    await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
    await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(key));
    const acknowledgement = page.getByRole('checkbox', { name: 'I have saved my recovery codes' });
    await expect(acknowledgement).not.toBeChecked();

    const rejectedCompletion = page.waitForResponse((response) =>
      response.url().includes('/api/v1/auth/enrollment/complete'),
    );
    await page.getByRole('button', { name: 'Complete setup' }).click();
    expect((await rejectedCompletion).status()).toBe(400);
    await expect(page.getByRole('alert')).toHaveText('Confirm that you saved your recovery codes.');

    const incomplete = await inspect(page.request, 'account', { email });
    expect(incomplete.scopeId).toBeNull();
    expect(incomplete.mfaState).not.toBe('ENROLLED');

    await acknowledgement.check();
    const completed = page.waitForResponse((response) =>
      response.url().includes('/api/v1/auth/enrollment/complete'),
    );
    await page.getByRole('button', { name: 'Complete setup' }).click();
    expect((await completed).status()).toBe(200);
    await expectAccount(page);

    const enrolled = await inspect(page.request, 'account', { email });
    expect(enrolled.mfaState).toBe('ENROLLED');
    expect(enrolled.scopeId).toBeTruthy();
  });
});
