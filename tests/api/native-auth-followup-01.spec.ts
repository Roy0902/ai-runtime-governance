import { expect, test } from '@playwright/test';
import {
  advanceClock,
  enrollApi,
  newSession,
  signInApi,
} from '../support/api';
import { NEW_PASSWORD, totp } from '../support/native-auth';

test.describe('Native-auth TOTP pacing follow-up 01', () => {
  test('[SCN-native-auth-033] Concurrent TOTP acceptance has at most one winner after a clock step', async ({
    request,
    playwright,
  }) => {
    const account = await enrollApi(request);
    await advanceClock(request, 30_000);
    const second = await newSession(playwright);
    const code = totp(account.manualKey);
    const [a, b] = await Promise.all([
      signInApi(request, account.email, account.password, { kind: 'TOTP', code }),
      signInApi(second, account.email, account.password, { kind: 'TOTP', code }),
    ]);
    expect([a.status(), b.status()].sort()).toEqual([200, 401]);
    await second.dispose();
  });

  test('[SCN-native-auth-057] Recent confirmation belongs only to its current account and session', async ({
    request,
    playwright,
  }) => {
    const account = await enrollApi(request);
    await advanceClock(request, 30_000);
    const second = await newSession(playwright);
    expect(
      (await signInApi(second, account.email, account.password, {
        kind: 'TOTP',
        code: totp(account.manualKey),
      })).status(),
    ).toBe(200);
    await advanceClock(request, 11 * 60 * 1000);
    expect(
      (await request.post('/api/v1/auth/reauthentication', {
        data: {
          password: account.password,
          secondFactor: { kind: 'TOTP', code: totp(account.manualKey) },
        },
      })).status(),
    ).toBe(200);
    const otherChange = await second.post('/api/v1/account/password', {
      data: { newPassword: NEW_PASSWORD },
    });
    expect(otherChange.status()).toBe(403);
    await second.dispose();
  });

  test('[SCN-native-auth-089] Hash admission cannot exceed its bounded work after a clock step', async ({
    request,
    playwright,
  }) => {
    const account = await enrollApi(request);
    await advanceClock(request, 30_000);
    const contexts = await Promise.all(Array.from({ length: 5 }, () => newSession(playwright)));
    const code = totp(account.manualKey);
    const results = await Promise.all(
      [request, ...contexts].map((context) =>
        signInApi(context, account.email, account.password, { kind: 'TOTP', code }),
      ),
    );
    expect(results.some((response) => response.status() === 503)).toBe(true);
    await Promise.all(contexts.map((context) => context.dispose()));
  });
});
