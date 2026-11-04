import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { PASSWORD, registerAndEnroll, totp } from '../support/native-auth';

const root = resolve(__dirname, '..', '..');
const admin = resolve(root, 'local-env', 'bin', 'arg-admin.cmd');

function grantGateway(email: string): void {
  try {
    execFileSync(
      'cmd.exe',
      [
        '/c',
        admin,
        'gateway',
        'grant',
        '--account',
        email,
        '--reason',
        'acceptance gateway access',
        '--confirm',
        email,
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          GOVERNANCE_DB_URL:
            process.env.GOVERNANCE_DB_URL ?? 'jdbc:postgresql://127.0.0.1:55434/governance',
          GOVERNANCE_DB_USER: process.env.GOVERNANCE_DB_USER ?? 'postgres',
          GOVERNANCE_DB_PASSWORD: process.env.GOVERNANCE_DB_PASSWORD ?? '',
          GOVERNANCE_SEED_KEY_DIRECTORY:
            process.env.GOVERNANCE_SEED_KEY_DIRECTORY ??
            resolve(root, 'local-env', 'runtime', 'acceptance', 'seed-keys'),
        },
        stdio: 'pipe',
        timeout: 60_000,
      },
    );
  } catch (error) {
    const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? String(error);
    throw new Error(`gateway grant failed: ${stderr}`);
  }
}

async function confirmStepUpIfVisible(
  page: Page,
  dialog: Locator,
  manualKey: string,
): Promise<void> {
  if (!(await dialog.isVisible().catch(() => false))) {
    return;
  }
  await dialog.getByLabel('Password').fill(PASSWORD);
  await dialog.getByLabel('Authenticator or recovery code').fill(totp(manualKey));
  await dialog.getByRole('button', { name: 'Confirm' }).click();
  await expect(dialog).toHaveCount(0);
}

test.describe('Gateway keys', () => {
  test('creates, authenticates, and revokes a gateway key', async ({ page }) => {
    const { email, manualKey } = await registerAndEnroll(page);
    grantGateway(email);

    await page.goto('/account/gateway-keys');
    await expect(page.getByRole('heading', { name: 'Gateway keys', level: 1 })).toBeVisible();
    await expect(page.getByText('Gateway access is not granted for this account.')).toHaveCount(0);

    const createButton = page.getByRole('button', { name: 'Create key' });
    await expect(createButton).toBeEnabled();
    await page.getByRole('textbox', { name: 'Key name' }).fill('acceptance');
    await createButton.click();

    const newKeyHeading = page.getByRole('heading', { name: 'New key: acceptance', level: 2 });
    const dialog = page.getByRole('dialog', { name: 'Confirm your identity' });
    await expect(newKeyHeading.or(dialog)).toBeVisible();
    await confirmStepUpIfVisible(page, dialog, manualKey);
    await expect(newKeyHeading).toBeVisible();

    const token = (await page.locator('output[aria-label="Gateway key"]').innerText()).trim();
    expect(token).toMatch(/^arg_gw_/);
    await expect(page.getByRole('heading', { name: 'OpenCode', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'VS Code Copilot BYOK', level: 3 })).toBeVisible();

    const backend = process.env.API_BASE_URL ?? 'http://127.0.0.1:8080';
    const active = await page.request.get(`${backend}/v1/models`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(active.status()).toBe(200);

    await page.getByRole('button', { name: 'Hide' }).click();
    await expect(page.locator('output[aria-label="Gateway key"]')).toHaveCount(0);

    const chat = await page.request.post(`${backend}/v1/chat/completions`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'email person@example.test' }],
      },
    });
    expect(chat.status()).toBe(200);

    const upstream = process.env.FAKE_UPSTREAM_URL ?? 'http://127.0.0.1:19090';
    const forwarded = await page.request.get(`${upstream}/__last`);
    const forwardedBody = JSON.stringify(await forwarded.json());
    expect(forwardedBody).toContain('[REDACTED_EMAIL]');
    expect(forwardedBody).not.toContain('person@example.test');

    const summary = await page.request.get(`${backend}/api/v1/usage/summary`);
    expect(summary.status()).toBe(200);
    const summaryBody = await summary.json();
    expect(summaryBody.calls).toBeGreaterThanOrEqual(1);
    expect(summaryBody.inputTokens).toBe(100);
    expect(summaryBody.outputTokens).toBe(20);
    expect(summaryBody.totalTokens).toBe(120);

    const traces = await page.request.get(`${backend}/api/v1/traces`);
    expect(traces.status()).toBe(200);
    const traceBody = await traces.json();
    const traceId = traceBody.items[0].traceId as string;
    const usage = await page.request.get(`${backend}/api/v1/usage/traces/${traceId}`);
    expect(usage.status()).toBe(200);
    const usageBody = await usage.json();
    expect(usageBody[0].requestedModel).toBe('gpt-4o');
    expect(usageBody[0].inputTokens).toBe(100);
    expect(usageBody[0].outputTokens).toBe(20);
    expect(usageBody[0].cachedInputTokens).toBe(40);
    expect(usageBody[0].reasoningOutputTokens).toBe(5);
    expect(usageBody[0].totalTokens).toBe(120);

    await page.goto(`/activity/${traceId}`);
    const usagePanel = page.getByRole('region', { name: 'Model usage' });
    await expect(usagePanel).toBeVisible();
    const usageRow = usagePanel.getByRole('row', { name: /gpt-4o/ });
    await expect(usageRow).toContainText('100');
    await expect(usageRow).toContainText('20');
    await expect(usageRow).toContainText('40');
    await expect(usageRow).toContainText('5');
    await expect(usageRow).toContainText('Not priced');

    await page.goto('/account/gateway-keys');
    await page.getByRole('button', { name: 'Revoke' }).first().click();
    await page.getByRole('button', { name: 'Confirm revoke' }).click();
    await expect(page.getByText('Revoked acceptance.').or(dialog)).toBeVisible();
    await confirmStepUpIfVisible(page, dialog, manualKey);
    await expect(page.getByText('Revoked acceptance.')).toBeVisible();
    await expect(page.getByRole('row', { name: /acceptance/ })).toContainText('Revoked');

    const revoked = await page.request.get(`${backend}/v1/models`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(revoked.status()).toBe(401);
    expect((await revoked.json()).error.code).toBe('GATEWAY_CREDENTIAL_INVALID');
  });

  test('does not allow key creation without gateway entitlement', async ({ page }) => {
    await registerAndEnroll(page);

    await page.goto('/account/gateway-keys');
    await expect(page.getByRole('heading', { name: 'Gateway keys', level: 1 })).toBeVisible();
    await expect(page.getByText('Gateway access is not granted for this account.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create key' })).toBeDisabled();
  });
});
