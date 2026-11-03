# Activity timeline ingestion authority — frozen plan

Feature: `activity-timeline-ingestion`. Frozen: 2026-11-03.
Fourth slice. It adds the trusted metadata ingestion path behind the test-only
boundary: allowlist validation, producer authority, idempotent duplicates and
conflict rejection. No production ingestion endpoint, approval action or payload
archive is added.

## Scope

Included: whole-event rejection of unsupported/content-bearing fields, trusted
producer classification, identical scoped duplicates, conflicting duplicate
rejection, and rejection of forged authoritative approval/guard facts.

Deferred: public ingestion, credential issuance, real agent producers, duplicate
handling across trace IDs, and production event transport.

## Ingestion contract

`POST /__test/timeline/ingest` (test profile only, loopback, `X-Test-Token`):

```json
{
  "accountEmail": "a@example.test",
  "traceId": "uuid",
  "producer": "agent_reporter | guard_service | approval_service | test_fixture",
  "event": { "eventId": "uuid", "kind": "prompt|guard|approval|agent|model|tool",
             "parentEventId": "uuid|null", "sourceAt": "RFC3339|null",
             "durationMs": 0, "identity": "string|null", "label": "string|null",
             "guardOutcome": "allow|deny|redact|require_approval|null",
             "policyId": "string|null", "policyVersion": "string|null",
             "ruleIds": ["..."], "approvalId": "uuid|null",
             "approvalState": "requested|approved|rejected|canceled|expired|null",
             "observedStatus": "running|completed|failed|canceled|unknown|null" }
}
```

- The server assigns receipt time; the producer supplies source time only.
- Unknown or content-bearing fields (`body`, `prompt`, `reasoning`, credentials,
  arbitrary attributes) reject the whole request with `400 REQUEST_INVALID`, no
  value echo and no persistence.
- Authority: `agent_reporter` may report prompt/agent/model/tool observation
  metadata only and must not set guard or approval fields. `guard_service` may
  report guard events and guard outcomes only. `approval_service` may report
  approval events and approval state only. `test_fixture` may report any allowed
  kind for isolated fixtures. Unauthorized facts return `403 FORBIDDEN` and
  persist nothing.
- Identical duplicate `(scope, eventId)` with identical validated content is
  idempotent: `200`, no second row, the original receipt time is preserved.
- A duplicate `(scope, eventId)` with different content is rejected with
  `409 EVENT_CONFLICT` and does not overwrite the accepted event.

## Scenarios

### SCN-activity-timeline-019 — Payload fields are rejected

Given an attempted report contains synthetic prompt, model, tool, reasoning and
credential body fields
When the metadata boundary evaluates it
Then the whole report is rejected with `400 REQUEST_INVALID`
And none of those values is retained, returned or echoed in error details.

### SCN-activity-timeline-020 — Identical scoped duplicates are idempotent

Given Scope A reports E1 twice with identical validated content
When A inspects the trace
Then E1 occurs exactly once with its accepted metadata and original receipt time.

### SCN-activity-timeline-021 — Conflicting duplicate is rejected

Given E1 is accepted in Scope A with source time `2026-10-29T10:00:00Z`
When a second report reuses E1 with source time `2026-10-29T10:01:00Z`
Then the second report is rejected with `409 EVENT_CONFLICT`
And E1 still reports `2026-10-29T10:00:00Z`.

### SCN-activity-timeline-022 — Reporter cannot forge approval authority

Given an `agent_reporter` attempts to report an authoritative approved outcome
When the report is evaluated and A inspects Approval History
Then the forged outcome is rejected with `403 FORBIDDEN`
And no approved history entry exists for that attempted event.

## Acceptance mapping

API project: all four scenarios in
`tests/api/activity-timeline-ingestion.spec.ts`, each tagged with the exact
`[SCN-activity-timeline-NNN]` id. Tests are locked after the red authoring run.
