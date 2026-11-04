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
