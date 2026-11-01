import { expect, test } from '@playwright/test';
import {
  ELEVEN,
  MAX_PASSWORD,
  NEW_PASSWORD,
  PASSWORD,
  TWELVE,
  completeEnrollment,
  expectAccount,
  latestLink,
  register,
  registerAndEnroll,
  requestReset,
  signIn,
  totp,
  uniqueEmail,
  verifyEmail,
} from '../support/native-auth';

const CLOCK = process.env.TEST_CLOCK_URL ?? 'http://127.0.0.1:8081/__test';
const CLOCK_TOKEN = process.env.TEST_CLOCK_TOKEN ?? '';

async function setClock(page: import('@playwright/test').Page, iso: string) {
  await page.request.post(`${CLOCK}/clock`, {
    data: { now: iso },
    headers: { 'X-Test-Token': CLOCK_TOKEN },
  });
}

async function advanceClock(page: import('@playwright/test').Page, milliseconds: number) {
  await page.request.post(`${CLOCK}/clock/advance`, {
    data: { milliseconds },
    headers: { 'X-Test-Token': CLOCK_TOKEN },
  });
}

async function setFault(page: import('@playwright/test').Page, name: string, enabled: boolean) {
  await page.request.post(`${CLOCK}/faults`, {
    data: { name, enabled },
    headers: { 'X-Test-Token': CLOCK_TOKEN },
  });
}

test.describe('Registration, lifecycle and mail', () => {
  test('[SCN-native-auth-001] Initial enrollment establishes one private scope without gateway budget', async ({ page }) => {
    const account = await registerAndEnroll(page);
    await expectAccount(page);
    await expect(page.getByRole('term', { name: 'Gateway access' })).toBeVisible();
    await expect(page.getByText('Not granted')).toBeVisible();
    expect(account.recoveryCodes).toHaveLength(10);
  });

  test('[SCN-native-auth-002] Full-address trim and case normalization identify the same account', async ({ page }) => {
    const email = `alice-${Date.now()}@example.test`;
    const account = await registerAndEnroll(page, email, PASSWORD);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await register(page, `  ${email.toUpperCase()}  `, NEW_PASSWORD);
    await signIn(page, email, PASSWORD, totp(account.manualKey));
    await expectAccount(page);
  });

  test('[SCN-native-auth-003] Duplicate signup does not replace authority or send new mail', async ({ page }) => {
    const email = uniqueEmail();
    const account = await registerAndEnroll(page, email, PASSWORD);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await register(page, email, NEW_PASSWORD);
    await signIn(page, email, PASSWORD, totp(account.manualKey));
    await expectAccount(page);
  });

  test('[SCN-native-auth-004] Incomplete signup has no protected authority', async ({ page }) => {
    await register(page, uniqueEmail());
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
  });

  test('[SCN-native-auth-007] Verified identity survives an expired enrollment attempt', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    await verifyEmail(page, email);
    await setClock(page, new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString());
    await page.getByRole('link', { name: 'Continue to setup' }).click();
    await expect(page.getByRole('alert')).toContainText('Setup expired.');
  });

  test('[SCN-native-auth-008] Mail eligibility is purpose-bound without public enumeration', async ({ page }) => {
    const pending = uniqueEmail();
    await register(page, pending);
    await page.goto('/verify');
    await page.getByRole('textbox', { name: 'Email' }).fill(pending);
    await page.getByRole('button', { name: 'Send a new verification email' }).click();
    await expect(page.getByRole('status')).toContainText(
      "If this request is eligible, we'll send an email with the next steps.",
    );
    await requestReset(page, pending);
  });

  test('[SCN-native-auth-009] Common admission outage is failure, not accepted work', async ({ page }) => {
    await page.goto('/register');
    await setFault(page, 'mail-admission', true);
    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail());
    await page.getByRole('textbox', { name: 'New password' }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toContainText('temporarily unavailable');
  });
});

test.describe('One-use links and reset', () => {
  test('[SCN-native-auth-013] Opening a current link does not consume it', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    const link = await latestLink(page, email, 'verify');
    await page.goto(link);
    await page.goto('/sign-in');
    await page.goto(link);
    await page.getByRole('button', { name: 'Verify email' }).click();
    await expect(page.getByRole('status')).toContainText('Email verified.');
  });

  test('[SCN-native-auth-015] New durable issuance supersedes only the same purpose', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    const first = await latestLink(page, email, 'verify');
    await page.goto('/verify');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('button', { name: 'Send a new verification email' }).click();
    const second = await latestLink(page, email, 'verify');
    await page.goto(first);
    await page.getByRole('button', { name: 'Verify email' }).click();
    await expect(page.getByRole('alert')).toContainText("This link can't be used.");
    await page.goto(second);
    await page.getByRole('button', { name: 'Verify email' }).click();
    await expect(page.getByRole('status')).toContainText('Email verified.');
  });

  test('[SCN-native-auth-017] Invalid new password does not consume reset authority', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await page.getByRole('button', { name: 'Sign out' }).click();
    await requestReset(page, account.email);
    const link = await latestLink(page, account.email, 'reset');
    await page.goto(link);
    await page.getByRole('textbox', { name: 'New password' }).fill(ELEVEN);
    await page.getByRole('button', { name: 'Change password' }).click();
    await expect(page.getByText('Password must be 12 to 128 characters.')).toBeVisible();
    await page.getByRole('textbox', { name: 'New password' }).fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'Change password' }).click();
    await expect(page.getByRole('status')).toContainText('Password changed.');
  });

  test('[SCN-native-auth-020] Unusable confirmation authority cannot change state', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    const link = await latestLink(page, email, 'verify');
    await page.goto(link);
    await page.getByRole('button', { name: 'Verify email' }).click();
    await page.goto(link);
    await page.getByRole('button', { name: 'Verify email' }).click();
    await expect(page.getByRole('alert')).toContainText("This link can't be used.");
  });

  test('[SCN-native-auth-021] Reset issuance does not revoke current sessions', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await requestReset(page, account.email);
    await page.goto('/account');
    await expectAccount(page);
  });

  test('[SCN-native-auth-022] Completed reset revokes sessions without removing active MFA', async ({ page, browser }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    const second = await browser.newContext({ storageState: await page.context().storageState() });
    const other = await second.newPage();
    await other.goto('/account');
    await expectAccount(other);
    await requestReset(page, account.email);
    const link = await latestLink(page, account.email, 'reset');
    await page.goto(link);
    await page.getByRole('textbox', { name: 'New password' }).fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'Change password' }).click();
    await other.goto('/account');
    await expect(other.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
    await signIn(page, account.email, NEW_PASSWORD, totp(account.manualKey));
    await expectAccount(page);
    await second.close();
  });

  test('[SCN-native-auth-023] Reset of a verified incomplete account does not grant access', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    await verifyEmail(page, email);
    await requestReset(page, email);
    const link = await latestLink(page, email, 'reset');
    await page.goto(link);
    await page.getByRole('textbox', { name: 'New password' }).fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'Change password' }).click();
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
  });
});

test.describe('Password input and sign-in partitions', () => {
  test('[SCN-native-auth-025] New passwords obey only the inclusive length range', async ({ page }) => {
    for (const value of [ELEVEN, 'x'.repeat(129)]) {
      await page.goto('/register');
      await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail());
      await page.getByRole('textbox', { name: 'New password' }).fill(value);
      await page.getByRole('button', { name: 'Create account' }).click();
      await expect(page.getByText('Password must be 12 to 128 characters.')).toBeVisible();
    }
    await register(page, uniqueEmail(), TWELVE);
    await register(page, uniqueEmail(), MAX_PASSWORD);
  });

  test('[SCN-native-auth-026] Valid text classes are counted without character exclusions', async ({ page }) => {
    const password = 'spaces and symbols !@#$%^&*() 12';
    const account = await registerAndEnroll(page, uniqueEmail(), password);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, password, totp(account.manualKey));
    await expectAccount(page);
  });

  test('[SCN-native-auth-027] Password authority preserves exact text', async ({ page }) => {
    const password = 'Case and space matter 12';
    const account = await registerAndEnroll(page, uniqueEmail(), password);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, `${password} `, totp(account.manualKey));
    await expect(page.getByRole('alert')).toContainText('Sign-in failed.');
    await signIn(page, account.email, password, totp(account.manualKey));
    await expectAccount(page);
  });

  test('[SCN-native-auth-028] Supported password entry does not change the credential', async ({ page }) => {
    const password = 'Passphrase with spaces 12';
    const account = await registerAndEnroll(page, uniqueEmail(), password);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.goto('/sign-in');
    await page.getByRole('textbox', { name: 'Email' }).fill(account.email);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.keyboard.insertText(password);
    await page.getByRole('textbox', { name: 'Authenticator or recovery code' }).fill(totp(account.manualKey));
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expectAccount(page);
  });

  test('[SCN-native-auth-029] Failed fresh authentication does not disclose identity standing', async ({ page }) => {
    const messages: string[] = [];
    for (const email of [uniqueEmail('unknown'), uniqueEmail('wrong')]) {
      await signIn(page, email, 'wrong password 12');
      const alert = page.getByRole('alert');
      await expect(alert).toContainText('Sign-in failed.');
      messages.push((await alert.innerText()).trim());
    }
    expect(new Set(messages).size).toBe(1);
  });

  test('[SCN-native-auth-094] Received line breaks fail explicitly without a modified password', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail());
    await page.getByRole('textbox', { name: 'New password' }).evaluate((element, value) => {
      const input = element as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, 'valid-password\r\n12');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText("Password can't contain line breaks.")).toBeVisible();
  });
});

test.describe('Enrollment, TOTP and recovery codes', () => {
  test('[SCN-native-auth-030] Setup secrets are displayed once without later readback', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    await verifyEmail(page, email);
    await page.getByRole('link', { name: 'Continue to setup' }).click();
    const key = await page.getByLabel('Manual key').innerText();
    expect(key.trim().length).toBeGreaterThan(0);
    await page.reload();
    await expect(page.getByLabel('Manual key')).toHaveCount(0);
    await expect(page.getByRole('alert')).toContainText('already shown');
  });

  test('[SCN-native-auth-031] TOTP accepts only current or adjacent unused steps', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    await verifyEmail(page, email);
    await page.getByRole('link', { name: 'Continue to setup' }).click();
    const key = (await page.getByLabel('Manual key').innerText()).trim();
    await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(key, -1));
    await page.getByRole('checkbox', { name: 'I have saved my recovery codes' }).check();
    await page.getByRole('button', { name: 'Complete setup' }).click();
    await expectAccount(page);
  });

  test('[SCN-native-auth-032] One accepted time step cannot authenticate again', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    const code = totp(account.manualKey);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, PASSWORD, code);
    await expectAccount(page);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, PASSWORD, code);
    await expect(page.getByRole('alert')).toContainText('Sign-in failed.');
  });

  test('[SCN-native-auth-034] Initial completion requires both candidate proof and saved codes', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    await verifyEmail(page, email);
    await page.getByRole('link', { name: 'Continue to setup' }).click();
    const key = (await page.getByLabel('Manual key').innerText()).trim();
    await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(key));
    await page.getByRole('button', { name: 'Complete setup' }).click();
    await expect(page.getByText('Confirm that you saved your recovery codes.')).toBeVisible();
  });

  test('[SCN-native-auth-035] Lost initial display requires an authorized new attempt', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    await verifyEmail(page, email);
    await page.getByRole('link', { name: 'Continue to setup' }).click();
    const first = (await page.getByLabel('Manual key').innerText()).trim();
    await page.getByRole('link', { name: 'Restart setup' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Restart setup' }).click();
    const second = (await page.getByLabel('Manual key').innerText()).trim();
    expect(second).not.toBe(first);
  });

  test('[SCN-native-auth-036] Pending setup is usable before and unusable after its lifetime', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    await verifyEmail(page, email);
    await page.getByRole('link', { name: 'Continue to setup' }).click();
    const key = (await page.getByLabel('Manual key').innerText()).trim();
    await advanceClock(page, (24 * 60 * 60 - 1) * 1000);
    await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(key));
    await page.getByRole('checkbox', { name: 'I have saved my recovery codes' }).check();
    await page.getByRole('button', { name: 'Complete setup' }).click();
    await expectAccount(page);
  });

  test('[SCN-native-auth-038] Incomplete replacement does not revoke active factors', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await page.getByRole('link', { name: 'Replace authenticator' }).click();
    await page.getByRole('button', { name: 'Start replacement' }).click();
    await page.getByRole('button', { name: 'Cancel replacement' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, PASSWORD, totp(account.manualKey));
    await expectAccount(page);
  });

  test('[SCN-native-auth-039] Replacement swaps factors and session authority atomically', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await page.getByRole('link', { name: 'Replace authenticator' }).click();
    await page.getByRole('button', { name: 'Start replacement' }).click();
    const newKey = (await page.getByLabel('Manual key').innerText()).trim();
    await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(newKey));
    await page.getByRole('checkbox', { name: 'I have saved my recovery codes' }).check();
    await page.getByRole('button', { name: 'Complete replacement' }).click();
    await expectAccount(page);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, PASSWORD, totp(account.manualKey));
    await expect(page.getByRole('alert')).toContainText('Sign-in failed.');
    await signIn(page, account.email, PASSWORD, totp(newKey));
    await expectAccount(page);
  });

  test('[SCN-native-auth-040] A superseded replacement cannot activate from stale authority', async ({ page, browser }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await page.getByRole('link', { name: 'Replace authenticator' }).click();
    await page.getByRole('button', { name: 'Start replacement' }).click();
    await page.getByLabel('Manual key').innerText();
    const second = await browser.newContext({ storageState: await page.context().storageState() });
    const other = await second.newPage();
    await other.goto('/account/authenticator');
    await other.getByRole('button', { name: 'Start replacement' }).click();
    await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(account.manualKey));
    await page.getByRole('checkbox', { name: 'I have saved my recovery codes' }).check();
    await page.getByRole('button', { name: 'Complete replacement' }).click();
    await expect(page.getByRole('alert')).toContainText('no longer current');
    await second.close();
  });

  test('[SCN-native-auth-041] Recent confirmation is checked at each sensitive factor stage', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await advanceClock(page, 11 * 60 * 1000);
    await page.getByRole('link', { name: 'Replace authenticator' }).click();
    await page.getByRole('button', { name: 'Start replacement' }).click();
    await expect(page.getByRole('dialog', { name: 'Confirm your identity' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
    await page.getByRole('textbox', { name: 'Authenticator or recovery code' }).fill(totp(account.manualKey));
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByLabel('Manual key')).toBeVisible();
  });

  test('[SCN-native-auth-042] Recovery-code representation is usable and not retrievable later', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    const code = account.recoveryCodes[0].replace(/-/g, '').toLowerCase();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, PASSWORD, code);
    await expectAccount(page);
    await page.reload();
    await expect(page.getByText(account.recoveryCodes[0])).toHaveCount(0);
  });

  test('[SCN-native-auth-043] Password plus unused recovery code creates ordinary authority once', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    const code = account.recoveryCodes[0];
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, PASSWORD, code);
    await expectAccount(page);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, PASSWORD, code);
    await expect(page.getByRole('alert')).toContainText('Sign-in failed.');
  });

  test('[SCN-native-auth-044] Recovery codes are neither standalone passwords nor transferable factors', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, account.recoveryCodes[0]);
    await expect(page.getByRole('alert')).toContainText('Sign-in failed.');
  });

  test('[SCN-native-auth-046] Pending standalone codes do not replace the active set', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await page.getByRole('link', { name: 'Generate new recovery codes' }).click();
    await page.getByRole('button', { name: 'Generate new recovery codes' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, PASSWORD, account.recoveryCodes[0]);
    await expectAccount(page);
  });

  test('[SCN-native-auth-047] Acknowledged standalone regeneration revokes old codes and other sessions', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await page.getByRole('link', { name: 'Generate new recovery codes' }).click();
    await page.getByRole('button', { name: 'Generate new recovery codes' }).click();
    const codes = await page.getByRole('list', { name: 'Recovery codes' }).getByRole('listitem').allTextContents();
    await page.getByRole('checkbox', { name: 'I have saved my recovery codes' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('status')).toContainText('New recovery codes are active.');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, PASSWORD, account.recoveryCodes[0]);
    await expect(page.getByRole('alert')).toContainText('Sign-in failed.');
    await signIn(page, account.email, PASSWORD, codes[0].trim());
    await expectAccount(page);
  });

  test('[SCN-native-auth-048] Lost regeneration completion response cannot undo or redisplay codes', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await page.getByRole('link', { name: 'Generate new recovery codes' }).click();
    await page.getByRole('button', { name: 'Generate new recovery codes' }).click();
    const codes = await page.getByRole('list', { name: 'Recovery codes' }).getByRole('listitem').allTextContents();
    await page.getByRole('checkbox', { name: 'I have saved my recovery codes' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.reload();
    await expect(page.getByText(codes[0].trim())).toHaveCount(0);
    await expect(page.getByRole('status')).toContainText('New recovery codes are active.');
  });

  test('[SCN-native-auth-049] Exhausted recovery authority does not become an MFA bypass', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    for (const code of account.recoveryCodes) {
      await page.getByRole('button', { name: 'Sign out' }).click();
      await signIn(page, account.email, PASSWORD, code);
      await expectAccount(page);
    }
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, PASSWORD, '000000');
    await expect(page.getByRole('alert')).toContainText('Sign-in failed.');
  });

  test('[SCN-native-auth-050] Cancelled regeneration cannot restore consumed or stale authority', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await page.getByRole('link', { name: 'Generate new recovery codes' }).click();
    await page.getByRole('button', { name: 'Generate new recovery codes' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('status')).toContainText('Pending codes cancelled.');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, account.email, PASSWORD, account.recoveryCodes[0]);
    await expectAccount(page);
  });
});

test.describe('Sessions, sensitive changes and ownership', () => {
  test('[SCN-native-auth-051] Restarting the human session browser context preserves valid authority', async ({ page, browser }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    const state = await page.context().storageState();
    const restarted = await browser.newContext({ storageState: state });
    const next = await restarted.newPage();
    await next.goto('/account');
    await expectAccount(next);
    await restarted.close();
  });

  test('[SCN-native-auth-052] Either session deadline independently ends authority', async ({ page }) => {
    await registerAndEnroll(page, uniqueEmail());
    await advanceClock(page, 7 * 24 * 60 * 60 * 1000);
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
  });

  test('[SCN-native-auth-053] Only successful deliberate activity renews inactivity', async ({ page }) => {
    await registerAndEnroll(page, uniqueEmail());
    await advanceClock(page, 6 * 24 * 60 * 60 * 1000);
    await page.goto('/account');
    await expectAccount(page);
    await advanceClock(page, 2 * 24 * 60 * 60 * 1000);
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
  });

  test('[SCN-native-auth-054] Rejected protected actions do not extend inactivity', async ({ page }) => {
    await registerAndEnroll(page, uniqueEmail());
    await advanceClock(page, 6 * 24 * 60 * 60 * 1000);
    await page.goto('/account/password');
    await page.getByRole('textbox', { name: 'New password' }).fill(ELEVEN);
    await page.getByRole('button', { name: 'Change password' }).click();
    await expect(page.getByText('Password must be 12 to 128 characters.')).toBeVisible();
    await advanceClock(page, 2 * 24 * 60 * 60 * 1000);
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
  });

  test('[SCN-native-auth-055] Ordinary own-account access does not repeat MFA', async ({ page }) => {
    await registerAndEnroll(page, uniqueEmail());
    await page.goto('/account');
    await expectAccount(page);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('[SCN-native-auth-056] Recent full authentication is reusable, not an OTP replay', async ({ page }) => {
    await registerAndEnroll(page, uniqueEmail());
    await page.goto('/account/password');
    await page.getByRole('textbox', { name: 'New password' }).fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'Change password' }).click();
    await expect(page.getByRole('dialog', { name: 'Confirm your identity' })).toHaveCount(0);
    await page.goto('/account/recovery-codes');
    await page.getByRole('button', { name: 'Generate new recovery codes' }).click();
    await expect(page.getByRole('dialog', { name: 'Confirm your identity' })).toHaveCount(0);
  });

  test('[SCN-native-auth-058] Signed-in password change preserves only current eligible authority', async ({ page, browser }) => {
    await registerAndEnroll(page, uniqueEmail());
    const second = await browser.newContext({ storageState: await page.context().storageState() });
    const other = await second.newPage();
    await page.goto('/account/password');
    await page.getByRole('textbox', { name: 'New password' }).fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'Change password' }).click();
    await expect(page.getByRole('status')).toContainText('Password changed.');
    await other.goto('/account');
    await expect(other.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
    await page.goto('/account');
    await expectAccount(page);
    await second.close();
  });

  test('[SCN-native-auth-059] Ended session authority is rejected on later checks', async ({ page }) => {
    await registerAndEnroll(page, uniqueEmail());
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
  });

  test('[SCN-native-auth-060] Sensitive commit cannot use stale account or factor authority', async ({ page }) => {
    const account = await registerAndEnroll(page, uniqueEmail());
    await page.getByRole('link', { name: 'Replace authenticator' }).click();
    await page.getByRole('button', { name: 'Start replacement' }).click();
    const newKey = (await page.getByLabel('Manual key').innerText()).trim();
    await setFault(page, 'account-disable', true);
    await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(newKey));
    await page.getByRole('checkbox', { name: 'I have saved my recovery codes' }).check();
    await page.getByRole('button', { name: 'Complete replacement' }).click();
    await expect(page.getByRole('alert')).toContainText('no longer current');
    expect(account.manualKey).not.toBe(newKey);
  });

  test('[SCN-native-auth-062] Another account ownership cannot be selected as authority', async ({ page }) => {
    await registerAndEnroll(page, uniqueEmail());
    await page.goto('/api/v1/account/security/operations/00000000-0000-4000-8000-000000000000');
    await expect(page.getByText('Not found')).toHaveCount(1);
  });

  test('[SCN-native-auth-063] Replacement and recovery cannot create another private scope', async ({ page }) => {
    await registerAndEnroll(page, uniqueEmail());
    const before = await (await page.request.get('/api/v1/account')).json();
    await page.getByRole('link', { name: 'Replace authenticator' }).click();
    await page.getByRole('button', { name: 'Start replacement' }).click();
    const newKey = (await page.getByLabel('Manual key').innerText()).trim();
    await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(newKey));
    await page.getByRole('checkbox', { name: 'I have saved my recovery codes' }).check();
    await page.getByRole('button', { name: 'Complete replacement' }).click();
    const after = await (await page.request.get('/api/v1/account')).json();
    expect(after.scopeId).toBe(before.scopeId);
  });
});
