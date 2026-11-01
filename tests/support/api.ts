import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { expect, type APIRequestContext, type Playwright } from '@playwright/test';
import { PASSWORD, advanceClockOffset, setClockOffset, totp, uniqueEmail } from './native-auth';

export const API_ORIGIN = 'http://127.0.0.1:8080';
export const CONTROL = process.env.TEST_CONTROL_URL ?? 'http://127.0.0.1:8081/__test';
const CONTROL_TOKEN = process.env.TEST_CLOCK_TOKEN ?? '';

export function uuid(): string {
  return crypto.randomUUID();
}

export async function control(
  request: APIRequestContext,
  path: string,
  data?: unknown,
): Promise<{ status: number; ok: boolean; json: () => Promise<unknown>; text: () => Promise<string> }> {
  const response = await request.post(`${CONTROL}/${path}`, {
    data: data ?? {},
    headers: { 'X-Test-Token': CONTROL_TOKEN },
  });
  if (path === 'clock/advance' && data && typeof (data as { milliseconds?: unknown }).milliseconds === 'number') {
    advanceClockOffset((data as { milliseconds: number }).milliseconds);
  }
  if (path === 'clock' && data && typeof (data as { now?: unknown }).now === 'string') {
    setClockOffset(Date.parse((data as { now: string }).now) - Date.now());
  }
  if (path === 'reset') {
    setClockOffset(0);
  }
  return {
    status: response.status(),
    ok: response.ok(),
    json: () => response.json(),
    text: () => response.text(),
  };
}

export async function advanceClock(request: APIRequestContext, milliseconds: number): Promise<void> {
  await control(request, 'clock/advance', { milliseconds });
}

export async function inspect(
  request: APIRequestContext,
  what: string,
  params: Record<string, string> = {},
): Promise<Record<string, unknown>> {
  const query = new URLSearchParams({ what, ...params });
  const response = await request.get(`${CONTROL}/inspect?${query.toString()}`, {
    headers: { 'X-Test-Token': CONTROL_TOKEN },
  });
  expect(response.status()).toBe(200);
  return (await response.json()) as Record<string, unknown>;
}

export async function registerApi(
  request: APIRequestContext,
  email = uniqueEmail(),
  password = PASSWORD,
  expectAccepted = true,
): Promise<{ email: string; password: string; response: import('@playwright/test').APIResponse }> {
  const aligned = Math.floor(Date.now() / 30_000) * 30_000;
  await control(request, 'clock', { now: new Date(aligned).toISOString() });
  const response = await request.post('/api/v1/auth/registrations', { data: { email, password } });
  if (expectAccepted) expect(response.status()).toBe(202);
  return { email, password, response };
}

export async function mailToken(
  request: APIRequestContext,
  email: string,
  kind: 'verify' | 'reset',
): Promise<string> {
  const base = process.env.MAILPIT_URL ?? 'http://127.0.0.1:8025';
  const path = kind === 'verify' ? 'verify' : 'reset-password';
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const list = await request.get(`${base}/api/v1/messages?limit=100`);
    const body = (await list.json()) as {
      messages?: { ID: string; To?: { Address?: string }[] }[];
    };
    const match = body.messages?.find((message) =>
      message.To?.some((to) => to.Address?.toLowerCase() === email.toLowerCase()),
    );
    if (match) {
      const detailResponse = await request.get(`${base}/api/v1/message/${match.ID}`);
      const detail = (await detailResponse.json()) as { Text?: string; HTML?: string };
      const text = `${detail.Text ?? ''}\n${detail.HTML ?? ''}`;
      const found = text.match(new RegExp(`/[a-z-]*${path}\\?token=[A-Za-z0-9_-]+`));
      if (found) return found[0].split('token=')[1];
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`no ${kind} mail for ${email}`);
}

export async function consumeVerification(
  request: APIRequestContext,
  token: string,
): Promise<import('@playwright/test').APIResponse> {
  return request.post('/api/v1/auth/email-verifications/consume', { data: { token } });
}

export async function enrollApi(
  request: APIRequestContext,
  email = uniqueEmail(),
  password = PASSWORD,
): Promise<{
  email: string;
  password: string;
  manualKey: string;
  recoveryCodes: string[];
  operationId: string;
}> {
  await control(request, 'reset');
  setClockOffset(0);
  const registration = await registerApi(request, email, password);
  expect(registration.response.status()).toBe(202);
  const token = await mailToken(request, email, 'verify');
  const verified = await consumeVerification(request, token);
  expect(verified.status()).toBe(200);
  const operationId = uuid();
  const started = await request.post('/api/v1/auth/enrollment', { data: { operationId } });
  expect(started.status()).toBe(201);
  const secrets = (await started.json()) as { manualKey: string; recoveryCodes: string[] };
  const completed = await request.post('/api/v1/auth/enrollment/complete', {
    data: {
      operationId,
      password,
      authenticatorCode: totp(secrets.manualKey),
      recoveryCodesSaved: true,
    },
  });
  expect(completed.status()).toBe(200);
  await advanceClock(request, 30_000);
  return { email, password, manualKey: secrets.manualKey, recoveryCodes: secrets.recoveryCodes, operationId };
}

export async function signInApi(
  request: APIRequestContext,
  email: string,
  password = PASSWORD,
  factor?: { kind: 'TOTP' | 'RECOVERY'; code: string },
): Promise<import('@playwright/test').APIResponse> {
  return request.post('/api/v1/auth/sign-in', {
    data: { email, password, ...(factor ? { secondFactor: factor } : {}) },
  });
}

export async function newSession(
  playwright: Playwright,
): Promise<APIRequestContext> {
  return playwright.request.newContext({ baseURL: API_ORIGIN });
}

export function host(args: string[], operatorUser?: string): {
  status: number | null;
  stdout: string;
  stderr: string;
} {
  const launcher = process.env.ARG_ADMIN ?? join(process.cwd(), 'local-env', 'bin', 'arg-admin.cmd');
  const env = { ...process.env, ...(operatorUser ? { ARG_OPERATOR_USER: operatorUser } : {}) };
  env.GOVERNANCE_TEST_FAULTS_FILE = env.GOVERNANCE_TEST_FAULTS_FILE
    ?? join(process.cwd(), '.local-cache', 'test-faults.properties');
  env.GOVERNANCE_DISPATCH_FILE = env.GOVERNANCE_DISPATCH_FILE
    ?? join(process.cwd(), '.local-cache', 'dispatch.properties');
  const result = spawnSync('cmd.exe', ['/c', launcher, ...args], {
    cwd: process.cwd(),
    env,
    encoding: 'utf8',
  });
  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}
