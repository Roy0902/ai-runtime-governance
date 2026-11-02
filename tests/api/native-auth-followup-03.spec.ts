import { expect, test } from '@playwright/test';
import {
  advanceClock,
  consumeVerification,
  control,
  enrollApi,
  inspect,
  mailToken,
  newSession,
  registerApi,
  seedPredecessorVerifier,
  signInApi,
  uuid,
  waitForTestBarrier,
} from '../support/api';
import { NEW_PASSWORD, PASSWORD, totp, uniqueEmail } from '../support/native-auth';

test.describe('Native-auth follow-up 03 API cases', () => {
  test.beforeEach(async ({ request }) => {
    await control(request, 'reset');
  });

  test('[SCN-native-auth-007] Verified identity can resume setup after attempt expiry', async ({ request }) => {
    const registration = await registerApi(request);
    const token = await mailToken(request, registration.email, 'verify');
    expect((await consumeVerification(request, token)).status()).toBe(200);
    const originalOperationId = uuid();
    const original = await request.post('/api/v1/auth/enrollment', {
      data: { operationId: originalOperationId },
    });
    expect(original.status()).toBe(201);
    await advanceClock(request, 25 * 60 * 60 * 1000);

    const setup = await request.post('/api/v1/auth/setup-access', {
      data: { email: registration.email, password: registration.password },
    });
    expect(setup.status()).toBe(200);
    expect((await setup.json()).state).toBe('SETUP');
    expect((await request.get('/api/v1/account')).status()).toBe(401);
    const beforeCompletion = await inspect(request, 'account', { email: registration.email });
    expect(beforeCompletion.found).toBe(true);
    expect(beforeCompletion.scopeId).toBeNull();

    const restarted = await request.post('/api/v1/auth/enrollment/restart', {
      data: { operationId: uuid(), password: registration.password },
    });
    expect(restarted.status()).toBe(201);
    const secrets = await restarted.json() as { operation: { operationId: string }; manualKey: string };
    expect(secrets.operation.operationId).not.toBe(originalOperationId);
    const completed = await request.post('/api/v1/auth/enrollment/complete', {
      data: {
        operationId: secrets.operation.operationId,
        password: registration.password,
        authenticatorCode: totp(secrets.manualKey),
        recoveryCodesSaved: true,
      },
    });
    expect(completed.status()).toBe(200);
    const after = await inspect(request, 'account', { email: registration.email });
    expect(after.accountId).toBe(beforeCompletion.accountId);
    expect(after.mfaState).toBe('ENROLLED');
    expect(after.scopeId).toBeTruthy();
  });

  test('[SCN-native-auth-036] Pending setup completes one second before expiry', async ({ request }) => {
    const registration = await registerApi(request);
    const token = await mailToken(request, registration.email, 'verify');
    expect((await consumeVerification(request, token)).status()).toBe(200);
    const operationId = uuid();
    const started = await request.post('/api/v1/auth/enrollment', { data: { operationId } });
    expect(started.status()).toBe(201);
    const secrets = await started.json() as { manualKey: string };

    await advanceClock(request, 24 * 60 * 60 * 1000 - 1_000);
    const completed = await request.post('/api/v1/auth/enrollment/complete', {
      data: {
        operationId,
        password: registration.password,
        authenticatorCode: totp(secrets.manualKey),
        recoveryCodesSaved: true,
      },
    });
    expect(completed.status()).toBe(200);
    expect((await completed.json()).state).toBe('HUMAN');
  });

  test('[SCN-native-auth-037] Exact pending expiry rejects activation after setup renewal', async ({ request }) => {
    const registration = await registerApi(request);
    const token = await mailToken(request, registration.email, 'verify');
    expect((await consumeVerification(request, token)).status()).toBe(200);
    const operationId = uuid();
    const started = await request.post('/api/v1/auth/enrollment', { data: { operationId } });
    expect(started.status()).toBe(201);
    const secrets = await started.json() as { manualKey: string };

    await advanceClock(request, 24 * 60 * 60 * 1000 - 1_000);
    const setup = await request.post('/api/v1/auth/setup-access', {
      data: { email: registration.email, password: registration.password },
    });
    expect(setup.status()).toBe(200);
    const current = await request.get('/api/v1/auth/enrollment');
    expect(current.status()).toBe(200);
    expect((await current.json()).operationId).toBe(operationId);
    await advanceClock(request, 1_000);

    const completed = await request.post('/api/v1/auth/enrollment/complete', {
      data: {
        operationId,
        password: registration.password,
        authenticatorCode: totp(secrets.manualKey),
        recoveryCodesSaved: true,
      },
    });
    expect(completed.status()).toBe(410);
    expect((await completed.json()).code).toBe('OPERATION_EXPIRED');
    const account = await inspect(request, 'account', { email: registration.email });
    expect(account.scopeId).toBeNull();
    expect(account.mfaState).not.toBe('ENROLLED');
  });

  test('[SCN-native-auth-062] Foreign account operation identifiers are private', async ({
    playwright, request,
  }) => {
    const first = await enrollApi(request);
    const secondSession = await newSession(playwright);
    try {
      const second = await enrollApi(secondSession, uniqueEmail(), PASSWORD, false);
      expect(second.accountId).not.toBe(first.accountId);
      expect(second.scopeId).not.toBe(first.scopeId);

      const foreign = await request.get(
        `/api/v1/account/security/operations/${second.operationId}`,
      );
      expect(foreign.status()).toBe(404);
      expect((await foreign.json()).code).toBe('NOT_FOUND');
      const own = await request.get('/api/v1/account');
      expect(own.status()).toBe(200);
      const ownAccount = await own.json();
      expect(ownAccount.accountId).toBe(first.accountId);
      expect(ownAccount.scopeId).toBe(first.scopeId);
    } finally {
      await secondSession.dispose();
    }
  });

  test('[SCN-native-auth-092] Stale predecessor rehash cannot override concurrent reset', async ({ request }) => {
    const account = await enrollApi(request);
    await advanceClock(request, 60_001);
    await seedPredecessorVerifier(request, account.email, account.password);
    await control(request, 'faults', {
      name: 'predecessor-rehash-after-derive',
      enabled: true,
    });

    const staleSignIn = signInApi(request, account.email, account.password, {
      kind: 'TOTP',
      code: totp(account.manualKey),
    });
    let resetCompleted = false;
    try {
      await waitForTestBarrier(request, 'predecessor-rehash-after-derive');
      const issued = await request.post('/api/v1/auth/password-resets', {
        data: { email: account.email },
      });
      expect(issued.status()).toBe(202);
      const resetToken = await mailToken(request, account.email, 'reset');
      const reset = await request.post('/api/v1/auth/password-resets/consume', {
        data: { token: resetToken, newPassword: NEW_PASSWORD },
      });
      expect(reset.status()).toBe(204);
      resetCompleted = true;
    } finally {
      await control(request, 'faults', {
        name: 'predecessor-rehash-after-derive',
        enabled: false,
      });
    }

    expect(resetCompleted).toBe(true);
    const stale = await staleSignIn;
    expect(stale.status()).toBe(401);
    expect((await stale.json()).code).toBe('SIGN_IN_FAILED');
    expect((await request.get('/api/v1/account')).status()).toBe(401);

    await advanceClock(request, 30_000);
    const current = await signInApi(request, account.email, NEW_PASSWORD, {
      kind: 'TOTP',
      code: totp(account.manualKey),
    });
    expect(current.status()).toBe(200);
    expect((await request.get('/api/v1/account')).status()).toBe(200);
  });

  test('[SCN-native-auth-094] Raw CR and LF password input is explicitly rejected', async ({ request }) => {
    const email = uniqueEmail();
    const response = await request.post('/api/v1/auth/registrations', {
      data: { email, password: 'valid-password\r\n12' },
    });
    expect(response.status()).toBe(400);
    const failure = await response.json() as {
      code: string;
      fieldErrors: { field: string; message: string }[];
    };
    expect(failure.code).toBe('REQUEST_INVALID');
    expect(failure.fieldErrors).toContainEqual({
      field: 'password',
      message: "Password can't contain line breaks.",
    });
    expect((await inspect(request, 'account', { email })).found).toBe(false);
  });
});
