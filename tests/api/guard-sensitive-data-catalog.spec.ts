import { expect, test } from '@playwright/test';
import { control } from '../support/api';

const POLICY_ID = 'sensitive-data-test-policy';
const POLICY_VERSION = 'builtin-v1';

interface Decision {
  outcome: string;
  message: string;
  policyId: string;
  policyVersion: string;
  matchedRuleIds: string[];
}

interface Failure {
  code: string;
  reasons: string[];
}

async function detect(
  request: Parameters<typeof control>[0],
  message: string,
): Promise<{ status: number; body: Decision | Failure }> {
  const response = await control(request, 'guard/detect', {
    policyId: POLICY_ID,
    policyVersion: POLICY_VERSION,
    message,
  });
  return {
    status: response.status,
    body: (await response.json()) as Decision | Failure,
  };
}

test.describe('Guard sensitive-data detector catalog', () => {
  test('[SCN-guard-detectors-001] Supported sensitive values use typed markers', async ({ request }) => {
    const message = [
      'Email alice@example.com',
      'phone +12025550123',
      'password=correct-horse-battery',
      'token sk-proj-abcdefghijklmnopqrstuvwxyz123456',
      'card 4111 1111 1111 1111',
      'IBAN GB82 WEST 1234 5698 7654 32',
    ].join('; ');
    const result = await detect(request, message);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      outcome: 'REDACT',
      message: [
        'Email [REDACTED_EMAIL]',
        'phone [REDACTED_PHONE]',
        'password=[REDACTED_CREDENTIAL]',
        'token [REDACTED_API_TOKEN]',
        'card [REDACTED_PAYMENT_CARD]',
        'IBAN [REDACTED_FINANCIAL_ID]',
      ].join('; '),
      policyId: POLICY_ID,
      policyVersion: POLICY_VERSION,
      matchedRuleIds: [
        'FX-API-TOKEN',
        'FX-CARD',
        'FX-CREDENTIAL',
        'FX-EMAIL',
        'FX-FINANCIAL',
        'FX-PHONE',
      ],
    } satisfies Decision);
  });

  test('[SCN-guard-detectors-002] Lookalikes and failed Luhn checks are allowed unchanged', async ({ request }) => {
    const message = 'alice at example dot com; local 202-555-0123; card 4111 1111 1111 1112; token sk-short';
    const result = await detect(request, message);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      outcome: 'ALLOW',
      message,
      policyId: POLICY_ID,
      policyVersion: POLICY_VERSION,
      matchedRuleIds: [],
    } satisfies Decision);
  });

  test('[SCN-guard-detectors-003] Unicode before a match preserves code-point spans', async ({ request }) => {
    const result = await detect(request, '🙂 Contact alice@example.com');

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      outcome: 'REDACT',
      message: '🙂 Contact [REDACTED_EMAIL]',
      matchedRuleIds: ['FX-EMAIL'],
    });
  });

  test('[SCN-guard-detectors-004] Oversized input fails without an allow decision', async ({ request }) => {
    const result = await detect(request, 'a'.repeat(65_537));

    expect(result.status).toBe(422);
    expect(result.body).toEqual({
      code: 'GUARD_EVALUATION_FAILED',
      reasons: ['MESSAGE_LIMIT_EXCEEDED'],
    } satisfies Failure);
  });
});
