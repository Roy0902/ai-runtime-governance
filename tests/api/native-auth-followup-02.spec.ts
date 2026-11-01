import { expect, test } from '@playwright/test';
import {
  advanceClock,
  consumeVerification,
  enrollApi,
  host,
  mailToken,
  newSession,
  registerApi,
  signInApi,
  uuid,
} from '../support/api';
import { NEW_PASSWORD, PASSWORD, totp, uniqueEmail } from '../support/native-auth';

test.describe('Native-auth test-oracle follow-up 02', () => {
  test('[SCN-native-auth-037] Exact pending expiry rejects activation', async ({ request }) => {
    const email = uniqueEmail();
    await registerApi(request, email);
    const token = await mailToken(request, email, 'verify');
    expect((await consumeVerification(request, token)).status()).toBe(200);
    const operationId = uuid();
    const started = await request.post('/api/v1/auth/enrollment', { data: { operationId } });
    expect(started.status()).toBe(201);
    const secrets = (await started.json()) as { manualKey: string };
    await advanceClock(request, 24 * 60 * 60 * 1000);
    const completed = await request.post('/api/v1/auth/enrollment/complete', {
      data: {
        operationId,
        password: PASSWORD,
        authenticatorCode: totp(secrets.manualKey),
        recoveryCodesSaved: true,
      },
    });
    expect(completed.status()).toBe(410);
  });

  test('[SCN-native-auth-073] Host budget authority is not private human authority', async ({
    request,
    playwright,
  }) => {
    const account = await enrollApi(request);
    expect(
      host(['gateway', 'grant', '--account', account.email, '--reason', 'grant', '--confirm', account.email]).status,
    ).toBe(0);
    const fresh = await newSession(playwright);
    expect((await fresh.get('/api/v1/account')).status()).toBe(401);
    await fresh.dispose();
  });

  test('[SCN-native-auth-092] Rehash cannot overwrite a concurrent password reset', async ({ request }) => {
    const account = await enrollApi(request);
    await request.post('/api/v1/auth/sign-out');
    const requested = await request.post('/api/v1/auth/password-resets', { data: { email: account.email } });
    expect(requested.status()).toBe(202);
    const token = await mailToken(request, account.email, 'reset');
    const reset = await request.post('/api/v1/auth/password-resets/consume', {
      data: { token, newPassword: NEW_PASSWORD },
    });
    expect(reset.status()).toBe(204);
    const oldSignIn = await signInApi(request, account.email, account.password, {
      kind: 'TOTP',
      code: totp(account.manualKey),
    });
    expect(oldSignIn.status()).toBe(401);
    const newSignIn = await signInApi(request, account.email, NEW_PASSWORD, {
      kind: 'TOTP',
      code: totp(account.manualKey),
    });
    expect(newSignIn.status()).toBe(200);
  });
});
