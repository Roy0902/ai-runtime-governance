import { expect, test } from '@playwright/test';
import {
  advanceClock,
  consumeVerification,
  control,
  enrollApi,
  mailToken,
  registerApi,
  uuid,
} from '../support/api';
import { totp } from '../support/native-auth';

test('enrollment rejects missing credentials and malformed authenticator codes', async ({ request }) => {
  await control(request, 'reset');
  const registration = await registerApi(request);
  expect(registration.response.status()).toBe(202);
  const token = await mailToken(request, registration.email, 'verify');
  expect((await consumeVerification(request, token)).status()).toBe(200);

  const operationId = uuid();
  const started = await request.post('/api/v1/auth/enrollment', { data: { operationId } });
  expect(started.status()).toBe(201);
  const secrets = await started.json() as { manualKey: string };

  const missingPassword = await request.post('/api/v1/auth/enrollment/complete', {
    data: { operationId, authenticatorCode: totp(secrets.manualKey), recoveryCodesSaved: true },
  });
  expect(missingPassword.status()).toBe(400);
  expect((await missingPassword.json()).code).toBe('REQUEST_INVALID');

  const malformedCode = await request.post('/api/v1/auth/enrollment/complete', {
    data: {
      operationId,
      password: registration.password,
      authenticatorCode: '12x456',
      recoveryCodesSaved: true,
    },
  });
  expect(malformedCode.status()).toBe(400);
  expect((await malformedCode.json()).code).toBe('REQUEST_INVALID');

  const completed = await request.post('/api/v1/auth/enrollment/complete', {
    data: {
      operationId,
      password: registration.password,
      authenticatorCode: totp(secrets.manualKey),
      recoveryCodesSaved: true,
    },
  });
  expect(completed.status()).toBe(200);
});

test('duplicate operation IDs return a conflict without superseding the current operation', async ({ request }) => {
  const account = await enrollApi(request);
  const reauthenticated = await request.post('/api/v1/auth/reauthentication', {
    data: {
      password: account.password,
      secondFactor: { kind: 'TOTP', code: totp(account.manualKey) },
    },
  });
  expect(reauthenticated.status()).toBe(200);
  await advanceClock(request, 30_000);

  const operationId = uuid();
  const replacement = await request.post('/api/v1/account/authenticator-replacements', {
    data: { operationId },
  });
  expect(replacement.status()).toBe(201);

  const duplicateReplacement = await request.post('/api/v1/account/authenticator-replacements', {
    data: { operationId },
  });
  expect(duplicateReplacement.status()).toBe(409);
  expect((await duplicateReplacement.json()).code).toBe('STALE_OPERATION');

  const duplicateGeneration = await request.post('/api/v1/account/recovery-code-generations', {
    data: { operationId },
  });
  expect(duplicateGeneration.status()).toBe(409);
  expect((await duplicateGeneration.json()).code).toBe('STALE_OPERATION');

  const current = await request.get(`/api/v1/account/security/operations/${operationId}`);
  expect(current.status()).toBe(200);
  expect((await current.json()).state).toBe('PENDING');
});
