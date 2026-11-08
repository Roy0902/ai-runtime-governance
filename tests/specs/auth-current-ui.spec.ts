import { expect, test, type Page } from '@playwright/test';

const PASSWORD = 'Correct horse battery staple';

function uniqueEmail(prefix = 'auth-ui'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}@example.test`;
}

async function register(page: Page, email: string, password = PASSWORD): Promise<void> {
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'New password' }).fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
}

async function latestVerificationLink(page: Page, email: string): Promise<string> {
  const base = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const list = await page.request.get(`${base}/api/v1/messages?limit=100`);
    const body = (await list.json()) as {
      messages?: { ID: string; To?: { Address?: string }[] }[];
    };
    const matches = body.messages?.filter((message) =>
      message.To?.some((to) => to.Address?.toLowerCase() === email.toLowerCase()),
    ) ?? [];
    for (const match of matches) {
      const detailResponse = await page.request.get(`${base}/api/v1/message/${match.ID}`);
      const detail = (await detailResponse.json()) as { Text?: string; HTML?: string };
      const text = `${detail.Text ?? ''}\n${detail.HTML ?? ''}`;
      const found = text.match(/https?:\/\/[^\s"'<>]+\/verify\?token=[A-Za-z0-9_-]+/);
      if (found) return found[0];
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`No verification mail for ${email}`);
}

test.describe('Current authentication UI', () => {
  test('sign-up page exposes the account form and immediate validation', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'New password' })).toBeVisible();
    await expect(page.getByText('Use at least 12 characters.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create a Keycloak account' })).toBeVisible();

    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toContainText('Enter a valid email address.');

    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail());
    await page.getByRole('textbox', { name: 'New password' }).fill('short-pass1');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toContainText('Use at least 12 characters.');
  });

  test('successful sign-up shows the verification confirmation panel', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);

    await expect(page.getByRole('status')).toContainText(
      'Account created. Check your email to verify your address.',
    );
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Back to sign in' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Resend verification email' })).toBeVisible();
  });

  test('duplicate sign-up returns an immediate email error', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);

    await page.goto('/register');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'New password' }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toContainText(
      'An account with this email already exists. Sign in or reset your password.',
    );
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  });

  test('verified email returns the user to sign-in with a confirmation', async ({ page }) => {
    const email = uniqueEmail();
    await register(page, email);
    const link = await latestVerificationLink(page, email);
    await page.goto(link);
    await page.getByRole('button', { name: 'Verify email' }).click();
    await expect(page.getByRole('status')).toContainText('Email verified. Sign in to continue.');
  });

  test('sign-in page exposes the current copy and fields', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Keycloak SSO' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create an account' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create a Keycloak account' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail());
    await page.getByRole('textbox', { name: 'Password' }).fill('wrong password 12');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert')).toContainText('Sign-in failed.');
  });

  test('Keycloak sign-up page exposes its fields and validation', async ({ page }) => {
    await page.goto('/register/keycloak');
    await expect(page.getByRole('heading', { name: 'Create Keycloak account' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'First name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Last name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'New password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Confirm password' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create an account' })).toBeVisible();

    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toContainText('Enter a valid email address.');

    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail());
    await page.getByRole('textbox', { name: 'New password' }).fill('short-pass1');
    await page.getByRole('textbox', { name: 'Confirm password' }).fill('short-pass1');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toContainText('Use at least 12 characters.');

    await page.getByRole('textbox', { name: 'New password' }).fill(PASSWORD);
    await page.getByRole('textbox', { name: 'Confirm password' }).fill('Different horse battery staple');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toContainText('Passwords do not match.');
  });
});
