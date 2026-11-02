import { expect, test } from '@playwright/test';
import { advanceClock, enrollApi, newSession, signInApi, uuid } from '../support/api';
import { NEW_PASSWORD, totp } from '../support/native-auth';

type SessionMetadata = {
  createdAt: string;
  absoluteExpiresAt: string;
  idleExpiresAt: string;
  recentAuthExpiresAt: string | null;
};

type HumanContext = {
  state: 'HUMAN';
  account: { session: SessionMetadata };
};

for (const action of ['password change', 'authenticator replacement', 'recovery regeneration'] as const) {
  test(`supporting: ${action} retains the original lifetime and revokes an independent session`, async ({
    request, playwright,
  }) => {
    const account = await enrollApi(request);
    const beforeResponse = await request.get('/api/v1/auth/context');
    expect(beforeResponse.status()).toBe(200);
    const before = (await beforeResponse.json()) as HumanContext;
    expect(before.state).toBe('HUMAN');

    const second = await newSession(playwright);
    try {
      const signedIn = await signInApi(second, account.email, account.password, {
        kind: 'TOTP', code: totp(account.manualKey),
      });
      expect(signedIn.status()).toBe(200);
      await advanceClock(request, 300_000);

      let completed;
      if (action === 'password change') {
        completed = await request.post('/api/v1/account/password', {
          data: { newPassword: NEW_PASSWORD },
        });
      } else if (action === 'authenticator replacement') {
        const operationId = uuid();
        const started = await request.post('/api/v1/account/authenticator-replacements', {
          data: { operationId },
        });
        expect(started.status()).toBe(201);
        const secrets = (await started.json()) as { manualKey: string };
        completed = await request.post(
          `/api/v1/account/authenticator-replacements/${operationId}/complete`,
          { data: { authenticatorCode: totp(secrets.manualKey), recoveryCodesSaved: true } },
        );
      } else {
        const operationId = uuid();
        const started = await request.post('/api/v1/account/recovery-code-generations', {
          data: { operationId },
        });
        expect(started.status()).toBe(201);
        completed = await request.post(
          `/api/v1/account/recovery-code-generations/${operationId}/complete`,
          { data: { recoveryCodesSaved: true } },
        );
      }

      expect(completed.status()).toBe(200);
      const after = (await completed.json()) as HumanContext;
      expect(after.account.session.createdAt).toBe(before.account.session.createdAt);
      expect(after.account.session.absoluteExpiresAt).toBe(before.account.session.absoluteExpiresAt);
      expect(after.account.session.recentAuthExpiresAt).toBe(before.account.session.recentAuthExpiresAt);
      expect(Date.parse(after.account.session.idleExpiresAt))
        .toBeLessThanOrEqual(Date.parse(after.account.session.absoluteExpiresAt));
      expect((await second.get('/api/v1/account')).status()).toBe(401);
      expect((await request.get('/api/v1/account')).status()).toBe(200);
    } finally {
      await second.dispose();
    }
  });
}
