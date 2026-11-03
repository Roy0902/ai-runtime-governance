import { expect, test } from '@playwright/test';
import { control } from '../support/api';

const POLICY_ID = 'guard-core-fixture-policy';
const POLICY_VERSION = 'fixtures-v1';

const RULES = [
  { id: 'FX-EMAIL', enabled: true, effect: 'REDACT', priority: 10, marker: '[REDACTED_EMAIL]' },
  { id: 'FX-PHONE', enabled: true, effect: 'REDACT', priority: 10, marker: '[REDACTED_PHONE]' },
  { id: 'FX-CREDENTIAL', enabled: true, effect: 'REDACT', priority: 30, marker: '[REDACTED_CREDENTIAL]' },
  { id: 'FX-API-TOKEN', enabled: true, effect: 'REDACT', priority: 30, marker: '[REDACTED_API_TOKEN]' },
  { id: 'FX-CARD', enabled: true, effect: 'REDACT', priority: 20, marker: '[REDACTED_PAYMENT_CARD]' },
  { id: 'FX-FINANCIAL', enabled: true, effect: 'REDACT', priority: 20, marker: '[REDACTED_FINANCIAL_ID]' },
  { id: 'FX-DENY', enabled: true, effect: 'DENY' },
  { id: 'FX-APPROVAL', enabled: true, effect: 'REQUIRE_APPROVAL' },
];

interface Finding {
  ruleId: string;
  start?: number;
  end?: number;
}

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

async function evaluate(
  request: Parameters<typeof control>[0],
  message: string,
  findings: Finding[],
  options: { rules?: unknown[]; policyId?: string; policyVersion?: string } = {},
): Promise<{ status: number; body: Decision | Failure }> {
  const response = await control(request, 'guard/evaluate', {
    policyId: options.policyId ?? POLICY_ID,
    policyVersion: options.policyVersion ?? POLICY_VERSION,
    message,
    rules: options.rules ?? RULES,
    findings,
  });
  const body = (await response.json()) as Decision | Failure;
  return { status: response.status, body };
}

function spanOf(message: string, text: string): { start: number; end: number } {
  const start = message.indexOf(text);
  if (start < 0) {
    throw new Error(`missing fixture text ${text}`);
  }
  return { start, end: start + text.length };
}

test.describe('Guard decision core', () => {
  test('[SCN-guard-core-001] No findings allows the unchanged message', async ({ request }) => {
    const result = await evaluate(request, 'Hello.', []);
    expect(result.status).toBe(200);
    const decision = result.body as Decision;
    expect(decision.outcome).toBe('ALLOW');
    expect(decision.message).toBe('Hello.');
    expect(decision.policyId).toBe(POLICY_ID);
    expect(decision.policyVersion).toBe(POLICY_VERSION);
    expect(decision.matchedRuleIds).toEqual([]);
  });

  test('[SCN-guard-core-002] Each category uses its exact marker', async ({ request }) => {
    const message = 'left AA right';
    const span = spanOf(message, 'AA');
    const cases = [
      ['FX-EMAIL', '[REDACTED_EMAIL]'],
      ['FX-CREDENTIAL', '[REDACTED_CREDENTIAL]'],
      ['FX-API-TOKEN', '[REDACTED_API_TOKEN]'],
      ['FX-PHONE', '[REDACTED_PHONE]'],
      ['FX-CARD', '[REDACTED_PAYMENT_CARD]'],
      ['FX-FINANCIAL', '[REDACTED_FINANCIAL_ID]'],
    ] as const;
    for (const [ruleId, marker] of cases) {
      const result = await evaluate(request, message, [{ ruleId, ...span }]);
      expect(result.status).toBe(200);
      const decision = result.body as Decision;
      expect(decision.outcome).toBe('REDACT');
      expect(decision.message).toBe(`left ${marker} right`);
      expect(decision.matchedRuleIds).toContain(ruleId);
    }
  });

  test('[SCN-guard-core-005] Higher-priority nested finding replaces the union', async ({ request }) => {
    const result = await evaluate(request, 'ABCDE', [
      { ruleId: 'FX-EMAIL', start: 0, end: 5 },
      { ruleId: 'FX-CREDENTIAL', start: 1, end: 4 },
    ]);
    expect(result.status).toBe(200);
    const decision = result.body as Decision;
    expect(decision.outcome).toBe('REDACT');
    expect(decision.message).toBe('[REDACTED_CREDENTIAL]');
  });

  test('[SCN-guard-core-007] Transitive intersections form one group', async ({ request }) => {
    const result = await evaluate(request, 'ABCDEFG', [
      { ruleId: 'FX-EMAIL', start: 1, end: 3 },
      { ruleId: 'FX-PHONE', start: 2, end: 4 },
      { ruleId: 'FX-CREDENTIAL', start: 3, end: 5 },
    ]);
    expect(result.status).toBe(200);
    const decision = result.body as Decision;
    expect(decision.outcome).toBe('REDACT');
    expect(decision.message).toBe('A[REDACTED_CREDENTIAL]FG');
  });

  test('[SCN-guard-core-008] Direct top-priority tie fails', async ({ request }) => {
    const result = await evaluate(request, 'ABCDE', [
      { ruleId: 'FX-CREDENTIAL', start: 1, end: 4 },
      { ruleId: 'FX-API-TOKEN', start: 2, end: 5 },
    ]);
    expect(result.status).toBe(422);
    const failure = result.body as Failure;
    expect(failure.code).toBe('GUARD_EVALUATION_FAILED');
    expect(failure.reasons).toContain('OVERLAP_PRIORITY_TIE');
  });

  test('[SCN-guard-core-011] Deny produces a deny decision', async ({ request }) => {
    const result = await evaluate(request, 'AA', [{ ruleId: 'FX-DENY' }]);
    expect(result.status).toBe(200);
    const decision = result.body as Decision;
    expect(decision.outcome).toBe('DENY');
    expect(decision.matchedRuleIds).toContain('FX-DENY');
  });

  test('[SCN-guard-core-014] Deny dominates approval without losing redaction', async ({ request }) => {
    const message = 'AA';
    const span = spanOf(message, 'AA');
    const result = await evaluate(request, message, [
      { ruleId: 'FX-EMAIL', ...span },
      { ruleId: 'FX-DENY' },
      { ruleId: 'FX-APPROVAL' },
    ]);
    expect(result.status).toBe(200);
    const decision = result.body as Decision;
    expect(decision.outcome).toBe('DENY');
    expect(decision.message).toBe('[REDACTED_EMAIL]');
    expect(decision.matchedRuleIds).toEqual(
      expect.arrayContaining(['FX-EMAIL', 'FX-DENY', 'FX-APPROVAL']),
    );
  });

  test('[SCN-guard-core-017] Unknown rule cannot supply an effect', async ({ request }) => {
    const result = await evaluate(request, 'AA', [{ ruleId: 'FX-UNKNOWN', start: 0, end: 2 }]);
    expect(result.status).toBe(422);
    const failure = result.body as Failure;
    expect(failure.code).toBe('GUARD_EVALUATION_FAILED');
    expect(failure.reasons).toContain('UNKNOWN_RULE');
  });

  test('[SCN-guard-core-024] Finding-count boundary does not drop redactions', async ({ request }) => {
    for (const count of [0, 1, 2, 1023, 1024]) {
      const message = 'A'.repeat(count);
      const findings = Array.from({ length: count }, (_, index) => ({
        ruleId: 'FX-EMAIL',
        start: index,
        end: index + 1,
      }));
      const result = await evaluate(request, message, findings);
      expect(result.status).toBe(200);
      const decision = result.body as Decision;
      expect(decision.outcome).toBe(count === 0 ? 'ALLOW' : 'REDACT');
      expect(decision.message).toBe('[REDACTED_EMAIL]'.repeat(count));
    }

    const over = 'A'.repeat(1025);
    const findings = Array.from({ length: 1025 }, (_, index) => ({
      ruleId: 'FX-EMAIL',
      start: index,
      end: index + 1,
    }));
    const result = await evaluate(request, over, findings);
    expect(result.status).toBe(422);
    const failure = result.body as Failure;
    expect(failure.reasons).toContain('FINDING_LIMIT_EXCEEDED');
  });
});
