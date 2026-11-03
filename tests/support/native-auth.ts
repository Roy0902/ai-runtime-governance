import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';
import './reset-hook';

export const PASSWORD = 'Correct horse battery staple';
export const NEW_PASSWORD = 'Another correct horse staple';
export const ELEVEN = 'short-pass1';
export const TWELVE = 'twelve-chars';
export const MAX_PASSWORD = 'x'.repeat(128);

let counter = 0;
let clockOffsetMs = 0;

export function setClockOffset(milliseconds: number): void {
  clockOffsetMs = milliseconds;
}

export function advanceClockOffset(milliseconds: number): void {
  clockOffsetMs += milliseconds;
}

export function uniqueEmail(prefix = 'user'): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}@example.test`;
}

export function tag(id: string, title: string): string {
  return `[SCN-native-auth-${id}] ${title}`;
}

export async function register(page: Page, email: string, password = PASSWORD): Promise<void> {
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Create account', level: 1 })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'New password' }).fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('status')).toContainText(
    "If this request is eligible, we'll send an email with the next steps.",
  );
}

export async function signIn(
  page: Page,
  email: string,
  password = PASSWORD,
  factor?: string,
): Promise<void> {
  await page.goto('/sign-in');
  await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  if (factor) {
    await page.getByRole('textbox', { name: 'Authenticator or recovery code' }).fill(factor);
  }
  await page.getByRole('button', { name: 'Sign in' }).click();
}

export async function expectAccount(page: Page): Promise<void> {
  // Enrollment now lands on /activity after the frontend reorganization; wait
  // for that transition to finish before opening the account oracle.
  await page.waitForURL(/\/(activity|account)$/, { timeout: 10_000 }).catch(() => {});
  if (!new URL(page.url()).pathname.startsWith('/account')) {
    await page.goto('/account');
  }
  await expect(page.getByRole('heading', { name: 'Account', level: 1 })).toBeVisible();
}

export async function requestReset(page: Page, email: string): Promise<void> {
  await page.goto('/forgot-password');
  await expect(page.getByRole('heading', { name: 'Reset password', level: 1 })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('button', { name: 'Send reset email' }).click();
  await expect(page.getByRole('status')).toContainText(
    "If this request is eligible, we'll send an email with the next steps.",
  );
}

export async function latestLink(
  page: Page,
  email: string,
  kind: 'verify' | 'reset',
  excludeLink?: string,
): Promise<string> {
  const base = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';
  const path = kind === 'verify' ? 'verify' : 'reset-password';
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
      const found = text.match(new RegExp(`https?://[^\\s"'<>]+/${path}\\?token=[A-Za-z0-9_-]+`));
      if (found && found[0] !== excludeLink) return found[0];
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`no ${kind} mail for ${email}`);
}

export async function verifyEmail(page: Page, email: string): Promise<void> {
  const link = await latestLink(page, email, 'verify');
  await page.goto(link);
  await expect(page.getByRole('heading', { name: 'Verify email', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Verify email' }).click();
  await expect(page.getByRole('status')).toContainText('Email verified.');
}

export async function completeEnrollment(
  page: Page,
  email: string,
  password = PASSWORD,
): Promise<{ manualKey: string; recoveryCodes: string[] }> {
  await verifyEmail(page, email);
  await page.getByRole('link', { name: 'Continue to setup' }).click();
  await expect(page.getByRole('heading', { name: 'Set up your authenticator', level: 1 })).toBeVisible();
  const manualKey = (await page.getByLabel('Manual key').innerText()).trim();
  const recoveryCodes = await page
    .getByRole('list', { name: 'Recovery codes' })
    .getByRole('listitem')
    .allTextContents();
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('textbox', { name: 'Six-digit code' }).fill(totp(manualKey));
  await page.getByRole('checkbox', { name: 'I have saved my recovery codes' }).check();
  const completion = page.waitForResponse(
    (response) => response.url().includes('/api/v1/auth/enrollment/complete'),
  );
  await page.getByRole('button', { name: 'Complete setup' }).click();
  expect((await completion).ok()).toBeTruthy();
  await expectAccount(page);
  const control = process.env.TEST_CLOCK_URL ?? 'http://127.0.0.1:8080/__test';
  const token = process.env.TEST_CLOCK_TOKEN ?? 'test-token';
  await page.request.post(`${control}/clock/advance`, {
    data: { milliseconds: 30_000 },
    headers: { 'X-Test-Token': token },
  });
  advanceClockOffset(30_000);
  return { manualKey, recoveryCodes: recoveryCodes.map((code) => code.trim()) };
}

export async function registerAndEnroll(
  page: Page,
  email = uniqueEmail(),
  password = PASSWORD,
): Promise<{ email: string; manualKey: string; recoveryCodes: string[] }> {
  await register(page, email, password);
  const enrollment = await completeEnrollment(page, email, password);
  return { email, ...enrollment };
}

export function totp(secret: string, offset = 0): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = secret.replace(/[\s-]/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const index = alphabet.indexOf(char);
    if (index < 0) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  const key = Buffer.from(bytes);
  const controlledTime = process.env.TEST_CLOCK_FILE
    ? Date.parse(readFileSync(process.env.TEST_CLOCK_FILE, 'utf8').trim())
    : Date.now() + clockOffsetMs;
  if (!Number.isFinite(controlledTime)) {
    throw new Error('Controlled TOTP clock snapshot is invalid');
  }
  const counter = Math.floor(controlledTime / 30_000) + offset;
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', key).update(buffer).digest();
  const start = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[start] & 0x7f) << 24) |
    ((digest[start + 1] & 0xff) << 16) |
    ((digest[start + 2] & 0xff) << 8) |
    (digest[start + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, '0');
}

// Re-evaluate this module for every test file so the reset hook and clock state
// are not frozen to the first file in a Playwright worker. See reset-hook.ts.
declare const __filename: string;
declare const require: { cache: Record<string, unknown> };

if (typeof __filename !== 'undefined' && typeof require !== 'undefined') {
  const self = __filename;
  process.nextTick(() => {
    delete require.cache[self];
  });
}
