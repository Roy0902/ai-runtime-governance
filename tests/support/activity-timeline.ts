import { expect, type APIRequestContext } from '@playwright/test';
import { control } from './api';

export interface SeedEvent {
  eventId: string;
  parentEventId?: string | null;
  kind: 'prompt' | 'guard' | 'approval' | 'agent' | 'model' | 'tool';
  receivedAt: string;
  sourceAt?: string | null;
  durationMs?: number | null;
  identity?: string | null;
  label?: string | null;
  guardOutcome?: string | null;
  policyId?: string | null;
  policyVersion?: string | null;
  ruleIds?: string[];
  approvalId?: string | null;
  approvalState?: string | null;
  observedStatus?: string | null;
}

export interface SeedTrace {
  traceId: string;
  receivedAt: string;
  executionStatus?: string;
  telemetryStatus?: string;
  guardOutcome?: string | null;
  identity?: string | null;
  inputCoverage?: string;
  responseCoverage?: string;
  toolsCoverage?: string;
  lossCauseCode?: string | null;
  lossMissingCount?: number | null;
  lossFrom?: string | null;
  lossTo?: string | null;
  events?: SeedEvent[];
}

export function trace(
  seed: Partial<SeedTrace> & { traceId: string; receivedAt: string },
): SeedTrace {
  return {
    executionStatus: 'completed',
    telemetryStatus: 'complete',
    guardOutcome: 'redact',
    identity: 'agent-a',
    inputCoverage: 'guarded',
    responseCoverage: 'observed',
    toolsCoverage: 'observed',
    events: [],
    ...seed,
  };
}

export function event(
  seed: Partial<SeedEvent> & {
    eventId: string;
    kind: SeedEvent['kind'];
    receivedAt: string;
  },
): SeedEvent {
  return {
    sourceAt: null,
    durationMs: null,
    identity: 'agent-a',
    ruleIds: [],
    ...seed,
  };
}

export async function seedTimeline(
  request: APIRequestContext,
  accountEmail: string,
  traces: SeedTrace[],
): Promise<void> {
  const response = await control(request, 'timeline/seed', { accountEmail, traces });
  expect(response.status, await response.text()).toBe(200);
}

export async function resetTimeline(request: APIRequestContext): Promise<void> {
  const response = await control(request, 'timeline/reset');
  expect(response.status, await response.text()).toBe(200);
}

export function at(baseMs: number, offsetMs: number): string {
  return new Date(baseMs + offsetMs).toISOString();
}
