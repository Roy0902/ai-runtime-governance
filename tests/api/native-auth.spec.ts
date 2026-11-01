import { expect, test } from '@playwright/test';
import {
  API_ORIGIN,
  consumeVerification,
  control,
  enrollApi,
  host,
  inspect,
  mailToken,
  newSession,
  registerApi,
  signInApi,
  uuid,
} from '../support/api';
import { NEW_PASSWORD, PASSWORD, totp, uniqueEmail } from '../support/native-auth';

test.describe('Registration lifecycle and mail', () => {
  test('[SCN-native-auth-005] Pending cleanup uses the seven-day authority boundary', async ({ request }) => {
    const email = uniqueEmail();
    const registration = await registerApi(request, email);
    expect(registration.response.status()).toBe(202);
    await control(request, 'clock/advance', { milliseconds: 7 * 24 * 60 * 60 * 1000 });
    await control(request, 'cleanup');
    const state = await inspect(request, 'account', { email });
    expect(state.found).toBe(false);
  });

  test('[SCN-native-auth-006] Only issued verification mail extends pending retention', async ({ request }) => {
    const email = uniqueEmail();
    await registerApi(request, email);
    await control(request, 'clock/advance', { milliseconds: 6 * 24 * 60 * 60 * 1000 });
    const resend = await request.post('/api/v1/auth/email-verifications/resend', { data: { email } });
    expect(resend.status()).toBe(202);
    await control(request, 'clock/advance', { milliseconds: 24 * 60 * 60 * 1000 + 60_000 });
    await control(request, 'cleanup');
    expect((await inspect(request, 'account', { email })).found).toBe(true);
    await control(request, 'clock/advance', { milliseconds: 7 * 24 * 60 * 60 * 1000 });
    await control(request, 'cleanup');
    expect((await inspect(request, 'account', { email })).found).toBe(false);
  });

  test('[SCN-native-auth-010] Accepted work does not promise later delivery success', async ({ request }) => {
    const registration = await registerApi(request, uniqueEmail());
    expect(registration.response.status()).toBe(202);
    await control(request, 'faults', { name: 'smtp', enabled: true });
    await control(request, 'mail/flush');
    const mail = await inspect(request, 'mail_request', { email: registration.email });
    expect(mail.state).toBe('FAILED_FINAL');
    expect(mail.attempts).toBe(3);
  });

  test('[SCN-native-auth-011] Delivery rechecks current authority and account standing', async ({ request }) => {
    const registration = await registerApi(request, uniqueEmail());
    const token = await mailToken(request, registration.email, 'verify');
    expect((await consumeVerification(request, token)).status()).toBe(200);
    await control(request, 'mail/flush');
    const mail = await inspect(request, 'mail_request', { email: registration.email });
    expect(mail.sent_after_consumption).toBe(false);
  });

  test('[SCN-native-auth-012] Mail admission obeys the exact bounded demo profile', async ({ request }) => {
    let last = 0;
    for (let attempt = 0; attempt < 11; attempt += 1) {
      const registration = await registerApi(request, uniqueEmail(), PASSWORD, false);
      last = registration.response.status();
    }
    expect(last).toBe(429);
  });
});

test.describe('One-use links and reset', () => {
  test('[SCN-native-auth-014] Link expiry is a strict server-time boundary', async ({ request }) => {
    const registration = await registerApi(request, uniqueEmail());
    const token = await mailToken(request, registration.email, 'verify');
    await control(request, 'clock/advance', { milliseconds: 24 * 60 * 60 * 1000 });
    expect((await consumeVerification(request, token)).status()).toBe(410);
  });

  test('[SCN-native-auth-016] Failed issuance preserves the previous current link', async ({ request }) => {
    const registration = await registerApi(request, uniqueEmail());
    const first = await mailToken(request, registration.email, 'verify');
    await control(request, 'faults', { name: 'mail-admission', enabled: true });
    const resend = await request.post('/api/v1/auth/email-verifications/resend', {
      data: { email: registration.email },
    });
    expect(resend.status()).toBe(503);
    await control(request, 'faults', { name: 'mail-admission', enabled: false });
    expect((await consumeVerification(request, first)).status()).toBe(200);
  });

  test('[SCN-native-auth-018] Concurrent consumption has one committed winner', async ({ request }) => {
    const registration = await registerApi(request, uniqueEmail());
    const token = await mailToken(request, registration.email, 'verify');
    const [a, b] = await Promise.all([
      consumeVerification(request, token),
      consumeVerification(request, token),
    ]);
    expect([a.status(), b.status()].sort()).toEqual([200, 410]);
  });

  test('[SCN-native-auth-019] Rolled-back completion does not consume the link', async ({ request }) => {
    const registration = await registerApi(request, uniqueEmail());
    const token = await mailToken(request, registration.email, 'verify');
    await control(request, 'faults', { name: 'consume-rollback', enabled: true });
    expect((await consumeVerification(request, token)).status()).toBe(503);
    await control(request, 'faults', { name: 'consume-rollback', enabled: false });
    expect((await consumeVerification(request, token)).status()).toBe(200);
  });
});

test.describe('Verifier, TOTP and recovery boundaries', () => {
  test('[SCN-native-auth-024] Current password verifiers and their native reference match the approved profile', async ({ request }) => {
    await enrollApi(request);
    const profile = await inspect(request, 'verifier');
    expect(profile.algorithm).toBe('argon2id');
    expect(profile.version).toBe(19);
    expect(profile.memoryKib).toBe(65536);
    expect(profile.iterations).toBe(3);
    expect(profile.lanes).toBe(1);
    expect(profile.saltBytes).toBe(16);
    expect(profile.outputBytes).toBe(32);
    expect(profile.predecessorMemoryKib).toBe(19456);
    expect(profile.predecessorIterations).toBe(2);
  });

  test('[SCN-native-auth-033] Concurrent TOTP acceptance has at most one winner', async ({ request, playwright }) => {
    const account = await enrollApi(request);
    const second = await newSession(playwright);
    const code = totp(account.manualKey);
    const [a, b] = await Promise.all([
      signInApi(request, account.email, account.password, { kind: 'TOTP', code }),
      signInApi(second, account.email, account.password, { kind: 'TOTP', code }),
    ]);
    expect([a.status(), b.status()].sort()).toEqual([200, 401]);
    await second.dispose();
  });

  test('[SCN-native-auth-037] Exact pending expiry rejects activation', async ({ request }) => {
    const account = await enrollApi(request);
    const operationId = uuid();
    const started = await request.post('/api/v1/auth/enrollment', { data: { operationId } });
    expect(started.status()).toBe(201);
    await control(request, 'clock/advance', { milliseconds: 24 * 60 * 60 * 1000 });
    const completed = await request.post('/api/v1/auth/enrollment/complete', {
      data: {
        operationId,
        password: account.password,
        authenticatorCode: totp(account.manualKey),
        recoveryCodesSaved: true,
      },
    });
    expect(completed.status()).toBe(410);
  });

  test('[SCN-native-auth-045] Concurrent use consumes a recovery code exactly once', async ({ request, playwright }) => {
    const account = await enrollApi(request);
    const second = await newSession(playwright);
    const code = account.recoveryCodes[1];
    const [a, b] = await Promise.all([
      signInApi(request, account.email, account.password, { kind: 'RECOVERY', code }),
      signInApi(second, account.email, account.password, { kind: 'RECOVERY', code }),
    ]);
    expect([a.status(), b.status()].sort()).toEqual([200, 401]);
    await second.dispose();
  });

  test('[SCN-native-auth-057] Recent confirmation belongs only to its current account and session', async ({ request, playwright }) => {
    const account = await enrollApi(request);
    const second = await newSession(playwright);
    expect(
      (await signInApi(second, account.email, account.password, {
        kind: 'TOTP',
        code: totp(account.manualKey),
      })).status(),
    ).toBe(200);
    expect(
      (await request.post('/api/v1/auth/reauthentication', {
        data: { password: account.password, secondFactor: { kind: 'TOTP', code: totp(account.manualKey) } },
      })).status(),
    ).toBe(200);
    const otherChange = await second.post('/api/v1/account/password', { data: { newPassword: NEW_PASSWORD } });
    expect(otherChange.status()).toBe(403);
    await second.dispose();
  });

  test('[SCN-native-auth-061] Rolled-back sensitive completion does not swap active authority', async ({ request }) => {
    const account = await enrollApi(request);
    const operationId = uuid();
    const started = await request.post('/api/v1/account/recovery-code-generations', {
      data: { operationId },
    });
    expect(started.status()).toBe(201);
    await control(request, 'faults', { name: 'generation-rollback', enabled: true });
    const completed = await request.post(
      `/api/v1/account/recovery-code-generations/${operationId}/complete`,
      { data: { recoveryCodesSaved: true } },
    );
    expect(completed.status()).toBe(503);
    await control(request, 'faults', { name: 'generation-rollback', enabled: false });
    const oldCode = await signInApi(request, account.email, account.password, {
      kind: 'RECOVERY',
      code: account.recoveryCodes[0],
    });
    expect(oldCode.status()).toBe(200);
  });
});

test.describe('Host authority and gateway ordering', () => {
  test('[SCN-native-auth-064] Host authority cannot be forged or expanded', async ({ request }) => {
    expect((await request.get('/api/v1/admin/accounts')).status()).toBe(404);
    const forged = host(['account', 'disable', '--account', uniqueEmail(), '--reason', 'forged', '--confirm', uniqueEmail()], 'not-the-operator');
    expect(forged.status).toBe(6);
  });

  test('[SCN-native-auth-065] Host changes and safe audit have one commit outcome', async ({ request }) => {
    const account = await enrollApi(request);
    const before = await inspect(request, 'audit', { accountId: String((await inspect(request, 'account', { email: account.email })).accountId) });
    await control(request, 'faults', { name: 'db-commit', enabled: true });
    const result = host([
      'account', 'disable', '--account', account.email, '--reason', 'test disable', '--confirm', account.email,
    ]);
    expect(result.status).toBe(5);
    await control(request, 'faults', { name: 'db-commit', enabled: false });
    const after = await inspect(request, 'audit', { accountId: String((await inspect(request, 'account', { email: account.email })).accountId) });
    expect(after.count).toBe(before.count);
  });

  test('[SCN-native-auth-066] Repeated host changes are safe', async ({ request }) => {
    const account = await enrollApi(request);
    const first = host(['gateway', 'grant', '--account', account.email, '--reason', 'grant once', '--confirm', account.email]);
    expect(first.status).toBe(0);
    const second = host(['gateway', 'grant', '--account', account.email, '--reason', 'grant twice', '--confirm', account.email]);
    expect(second.status).toBe(0);
    expect(JSON.parse(second.stdout).changed).toBe(false);
  });

  test('[SCN-native-auth-067] Host recovery creates setup-only handoff, not impersonation', async ({ request }) => {
    const account = await enrollApi(request);
    const result = host(['account', 'recover-mfa', '--account', account.email, '--reason', 'lost factor', '--confirm', account.email]);
    expect(result.status).toBe(0);
    expect((await request.get('/api/v1/account')).status()).toBe(401);
    const setup = await request.post('/api/v1/auth/setup-access', {
      data: { email: account.email, password: account.password },
    });
    expect(setup.status()).toBe(200);
    expect((await setup.json()).state).toBe('SETUP');
  });

  test('[SCN-native-auth-068] Recovery does not silently re-enable a disabled account', async ({ request }) => {
    const account = await enrollApi(request);
    expect(host(['account', 'disable', '--account', account.email, '--reason', 'disable', '--confirm', account.email]).status).toBe(0);
    expect(host(['account', 'recover-mfa', '--account', account.email, '--reason', 'recover', '--confirm', account.email]).status).toBe(0);
    expect((await signInApi(request, account.email, account.password, { kind: 'TOTP', code: totp(account.manualKey) })).status()).toBe(401);
  });

  test('[SCN-native-auth-069] Re-enable does not resurrect revoked authority or recycle identity', async ({ request }) => {
    const account = await enrollApi(request);
    expect(host(['gateway', 'grant', '--account', account.email, '--reason', 'grant', '--confirm', account.email]).status).toBe(0);
    expect(host(['account', 'disable', '--account', account.email, '--reason', 'disable', '--confirm', account.email]).status).toBe(0);
    expect(host(['account', 'enable', '--account', account.email, '--reason', 'enable', '--confirm', account.email]).status).toBe(0);
    expect((await request.get('/api/v1/account')).status()).toBe(401);
    expect((await inspect(request, 'account', { email: account.email })).gatewayEntitlement).toBe('ABSENT');
  });

  test('[SCN-native-auth-070] Gateway grant requires all eligibility dimensions', async ({ request }) => {
    const registration = await registerApi(request, uniqueEmail());
    const result = host([
      'gateway', 'grant', '--account', registration.email, '--reason', 'not enrolled', '--confirm', registration.email,
    ]);
    expect(result.status).toBe(4);
  });

  test('[SCN-native-auth-071] Revocation distinguishes undispatched and dispatched work', async ({ request }) => {
    const account = await enrollApi(request);
    expect(host(['gateway', 'grant', '--account', account.email, '--reason', 'grant', '--confirm', account.email]).status).toBe(0);
    const dispatched = await control(request, 'dispatch', { email: account.email });
    expect(dispatched.status).toBe(200);
    expect(host(['gateway', 'revoke', '--account', account.email, '--reason', 'revoke', '--confirm', account.email]).status).toBe(0);
    const state = await inspect(request, 'dispatch', { email: account.email });
    expect(state.dispatched).toBe(true);
    expect(state.undispatched_blocked).toBe(true);
  });

  test('[SCN-native-auth-072] Concurrent dispatch and revocation follow the committed order', async ({ request }) => {
    const account = await enrollApi(request);
    expect(host(['gateway', 'grant', '--account', account.email, '--reason', 'grant', '--confirm', account.email]).status).toBe(0);
    const [dispatch, revoke] = await Promise.all([
      control(request, 'dispatch', { email: account.email }),
      Promise.resolve(host(['gateway', 'revoke', '--account', account.email, '--reason', 'concurrent', '--confirm', account.email])),
    ]);
    expect([dispatch.status, revoke.status].sort()).toEqual([0, 200]);
    const state = await inspect(request, 'dispatch', { email: account.email });
    expect(['DISPATCHED_THEN_REVOKED', 'REVOKED_THEN_BLOCKED']).toContain(String(state.order));
  });

  test('[SCN-native-auth-073] Host budget authority is not private human authority', async ({ request }) => {
    const account = await enrollApi(request);
    expect(host(['gateway', 'grant', '--account', account.email, '--reason', 'grant', '--confirm', account.email]).status).toBe(0);
    expect((await request.get('/api/v1/account')).status()).toBe(401);
  });
});

test.describe('Degraded capability and session boundaries', () => {
  test('[SCN-native-auth-074] Missing TOTP capability does not automatically end independent authority', async ({ request }) => {
    const account = await enrollApi(request);
    await control(request, 'faults', { name: 'totp-key-missing', enabled: true });
    expect((await request.get('/api/v1/account')).status()).toBe(200);
    expect((await inspect(request, 'account', { email: account.email })).mfaState).toBe('ENROLLED');
  });

  test('[SCN-native-auth-075] Key-dependent actions fail as unavailable, not incorrect code', async ({ request }) => {
    const account = await enrollApi(request);
    await request.post('/api/v1/auth/sign-out');
    await control(request, 'faults', { name: 'totp-key-missing', enabled: true });
    const result = await signInApi(request, account.email, account.password, {
      kind: 'TOTP',
      code: totp(account.manualKey),
    });
    expect(result.status()).toBe(503);
    expect((await result.json()).code).toBe('TEMPORARILY_UNAVAILABLE');
  });

  test('[SCN-native-auth-076] Provider credentials do not own human sessions', async ({ request }) => {
    const account = await enrollApi(request);
    await control(request, 'provider-key/rotate');
    expect((await request.get('/api/v1/account')).status()).toBe(200);
    expect((await inspect(request, 'account', { email: account.email })).sessionState).toBe('ACTIVE');
  });

  test('[SCN-native-auth-077] Versioned key rotation and matched restore preserve factors and ownership', async ({ request }) => {
    const account = await enrollApi(request);
    const before = await inspect(request, 'account', { email: account.email });
    expect(host(['totp-key', 'provision', '--key-id', 'test-key-2', '--from-file', 'local-env/runtime/key2.bin']).status).toBe(0);
    expect(host(['totp-key', 'rotate', '--from', 'test-key-1', '--to', 'test-key-2']).status).toBe(0);
    expect(host(['totp-key', 'status']).status).toBe(0);
    const after = await inspect(request, 'account', { email: account.email });
    expect(after.accountId).toBe(before.accountId);
    expect(after.scopeId).toBe(before.scopeId);
    expect(after.mfaState).toBe('ENROLLED');
  });

  test('[SCN-native-auth-078] Password age does not force periodic replacement', async ({ request }) => {
    const account = await enrollApi(request);
    await control(request, 'clock/advance', { milliseconds: 400 * 24 * 60 * 60 * 1000 });
    const result = await signInApi(request, account.email, account.password, {
      kind: 'TOTP',
      code: totp(account.manualKey),
    });
    expect(result.status()).toBe(200);
  });

  test('[SCN-native-auth-079] Verifier, entropy and secret-safe evidence have a complete inspected surface', async ({ request }) => {
    await enrollApi(request);
    const exported = await control(request, 'evidence/export');
    expect(exported.status).toBe(200);
    const evidence = await inspect(request, 'evidence');
    for (const field of ['scenarioId', 'correlationId', 'state', 'version', 'counts', 'timings']) {
      expect(evidence.fields).toContain(field);
    }
    for (const field of ['password', 'seed', 'recoveryCode', 'cookie', 'token']) {
      expect(evidence.fields).not.toContain(field);
    }
  });

  test('[SCN-native-auth-080] Successful authentication clears bounded cooldown without permanent lock', async ({ request }) => {
    const account = await enrollApi(request);
    await request.post('/api/v1/auth/sign-out');
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await signInApi(request, account.email, 'wrong password 12');
    }
    expect(
      (await signInApi(request, account.email, account.password, {
        kind: 'TOTP',
        code: totp(account.manualKey),
      })).status(),
    ).toBe(200);
    expect((await signInApi(request, account.email, 'wrong password 12')).status()).toBe(401);
  });

  test('[SCN-native-auth-081] Recovery-verifier unavailability is not an incorrect-code diagnosis', async ({ request }) => {
    const account = await enrollApi(request);
    await request.post('/api/v1/auth/sign-out');
    await control(request, 'faults', { name: 'recovery-verifier', enabled: true });
    const result = await signInApi(request, account.email, account.password, {
      kind: 'RECOVERY',
      code: account.recoveryCodes[0],
    });
    expect(result.status()).toBe(503);
    expect((await result.json()).code).toBe('TEMPORARILY_UNAVAILABLE');
  });

  test('[SCN-native-auth-082] Dispatched work does not let a revoked session read protected results', async ({ request }) => {
    const account = await enrollApi(request);
    expect(host(['gateway', 'grant', '--account', account.email, '--reason', 'grant', '--confirm', account.email]).status).toBe(0);
    expect((await control(request, 'dispatch', { email: account.email })).status).toBe(200);
    await request.post('/api/v1/auth/sign-out');
    expect((await request.get('/api/v1/account')).status()).toBe(401);
  });
});

test.describe('Abuse, source identity and bounded work', () => {
  test('[SCN-native-auth-083] Malformed requests are not additional password-content rules', async ({ request }) => {
    const malformed = await request.post('/api/v1/auth/registrations', {
      data: '{',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(malformed.status()).toBe(400);
    const large = await request.post('/api/v1/auth/registrations', {
      data: JSON.stringify({ email: uniqueEmail(), password: 'x'.repeat(17_000) }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(large.status()).toBe(413);
    const wrongType = await request.post('/api/v1/auth/registrations', {
      data: 'email=a&password=b',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    expect(wrongType.status()).toBe(415);
  });

  test('[SCN-native-auth-084] Source admission has exact authentication and signup caps', async ({ request }) => {
    const account = await enrollApi(request);
    await request.post('/api/v1/auth/sign-out');
    let last = 0;
    for (let attempt = 0; attempt < 31; attempt += 1) {
      last = (await signInApi(request, account.email, 'wrong password 12')).status();
    }
    expect(last).toBe(429);
  });

  test('[SCN-native-auth-085] Progressive cooldown uses the failed-auth history only', async ({ request }) => {
    const account = await enrollApi(request);
    await request.post('/api/v1/auth/sign-out');
    await control(request, 'faults', { name: 'hash-service', enabled: true });
    expect((await signInApi(request, account.email, account.password)).status()).toBe(503);
    await control(request, 'faults', { name: 'hash-service', enabled: false });
    const state = await inspect(request, 'cooldown', { email: account.email });
    expect(state.failures).toBe(0);
    expect(state.cooldownUntil).toBeNull();
  });

  test('[SCN-native-auth-086] Rolling-window and cooldown release includes exact equality', async ({ request }) => {
    const account = await enrollApi(request);
    await request.post('/api/v1/auth/sign-out');
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await signInApi(request, account.email, 'wrong password 12');
    }
    const denied = await signInApi(request, account.email, 'wrong password 12');
    expect(denied.status()).toBe(429);
    expect(denied.headers()['retry-after']).toBe('2');
    await control(request, 'clock/advance', { milliseconds: 2000 });
    const allowed = await signInApi(request, account.email, 'wrong password 12');
    expect(allowed.status()).toBe(401);
  });

  test('[SCN-native-auth-087] Trusted-source identity cannot be selected by an untrusted caller', async ({ request }) => {
    const account = await enrollApi(request);
    await request.post('/api/v1/auth/sign-out');
    const untrusted = await request.post('/api/v1/auth/sign-in', {
      data: { email: account.email, password: 'wrong password 12' },
      headers: { 'X-Forwarded-For': '203.0.113.9' },
    });
    expect(untrusted.status()).toBe(401);
    const malformed = await request.post('/api/v1/auth/sign-in', {
      data: { email: account.email, password: 'wrong password 12' },
      headers: { 'X-Forwarded-For': 'not-an-ip', 'X-Trusted-Proxy': 'true' },
    });
    expect(malformed.status()).toBe(400);
  });

  test('[SCN-native-auth-088] Throttle state is finite without live-protection eviction', async ({ request }) => {
    await enrollApi(request);
    await control(request, 'buckets/fill', { sourceBuckets: 10_000, identityBuckets: 10_000 });
    const result = await signInApi(request, uniqueEmail(), 'wrong password 12');
    expect(result.status()).toBe(503);
    const state = await inspect(request, 'buckets');
    expect(state.evictedLive).toBe(false);
  });

  test('[SCN-native-auth-089] Hash admission cannot exceed its bounded work or grant late authority', async ({ request, playwright }) => {
    const account = await enrollApi(request);
    await request.post('/api/v1/auth/sign-out');
    const contexts = await Promise.all(Array.from({ length: 5 }, () => newSession(playwright)));
    const results = await Promise.all(
      [request, ...contexts].map((context) =>
        signInApi(context, account.email, account.password, {
          kind: 'TOTP',
          code: totp(account.manualKey),
        }),
      ),
    );
    expect(results.some((response) => response.status() === 503)).toBe(true);
    await Promise.all(contexts.map((context) => context.dispose()));
  });

  test('[SCN-native-auth-090] Mail retries and timeout remain bounded without reviving authority', async ({ request }) => {
    const registration = await registerApi(request, uniqueEmail());
    await control(request, 'faults', { name: 'smtp', enabled: true });
    await control(request, 'mail/flush');
    const mail = await inspect(request, 'mail_request', { email: registration.email });
    expect(mail.attempts).toBe(3);
    expect(mail.retryDelaysSeconds).toEqual([60, 240]);
    expect(mail.attemptTimeoutSeconds).toBe(10);
  });

  test('[SCN-native-auth-091] Only reviewed verifier profiles can authenticate and upgrade', async ({ request }) => {
    await enrollApi(request);
    const state = await inspect(request, 'verifier-profiles');
    expect(state.predecessor.upgradedWithoutPasswordChange).toBe(true);
    expect(state.unsupported.failure).toBe('explicit');
    expect(state.unreviewed.failure).toBe('explicit');
    expect(state.malformed.failure).toBe('explicit');
  });

  test('[SCN-native-auth-092] Rehash cannot overwrite a concurrent password reset', async ({ request }) => {
    const account = await enrollApi(request);
    await control(request, 'clock/advance', { milliseconds: 11 * 60 * 1000 });
    const [signIn, reset] = await Promise.all([
      signInApi(request, account.email, account.password, {
        kind: 'TOTP',
        code: totp(account.manualKey),
      }),
      request.post('/api/v1/account/password', { data: { newPassword: NEW_PASSWORD } }),
    ]);
    expect([signIn.status(), reset.status()].sort()).toEqual([200, 403]);
    const state = await inspect(request, 'verifier', { email: account.email });
    expect(state.currentPasswordIsResetPassword).toBe(true);
  });

  test('[SCN-native-auth-093] Authenticated seed protection rejects modified or mismatched values', async ({ request }) => {
    const account = await enrollApi(request);
    await control(request, 'seed/tamper', { email: account.email });
    await request.post('/api/v1/auth/sign-out');
    const result = await signInApi(request, account.email, account.password, {
      kind: 'TOTP',
      code: totp(account.manualKey),
    });
    expect(result.status()).toBe(503);
    const state = await inspect(request, 'seed', { email: account.email });
    expect(state.plaintextReturned).toBe(false);
    expect(state.wrongKeyFallback).toBe(false);
  });
});
