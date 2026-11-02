import { expect, test } from '@playwright/test';
import { enrollApi, newSession } from '../support/api';

test('a second account enrollment does not reset or replace the first account', async ({
  playwright,
  request,
}) => {
  const first = await enrollApi(request);
  const secondSession = await newSession(playwright);
  try {
    const second = await enrollApi(secondSession);
    expect(second.accountId).not.toBe(first.accountId);

    const firstAccount = await request.get('/api/v1/account');
    expect(firstAccount.status()).toBe(200);
    const firstBody = await firstAccount.json() as { accountId: string; scopeId: string };
    expect(firstBody.accountId).toBe(first.accountId);
    expect(firstBody.scopeId).toBe(first.scopeId);

    const crossAccountOperation = await request.get(
      `/api/v1/account/security/operations/${second.operationId}`,
    );
    expect(crossAccountOperation.status()).toBe(404);
    expect((await crossAccountOperation.json()).code).toBe('NOT_FOUND');
  } finally {
    await secondSession.dispose();
  }
});
