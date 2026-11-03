# Guard decision core — frozen plan

Feature: `guard-decision-core`. Frozen: 2026-11-03.
First component slice of the client-independent guard decision core approved by
DR-012/DR-013. It composes trusted findings against a trusted catalog revision;
it does not detect secrets, identify clients, grant approval, persist or dispatch.

## Scope

Included: no-finding allow, six typed markers, connected overlap/union redaction,
priority ties, deny, deny/approval/redaction composition, unknown rules, and the
finding-count boundary.

Deferred: detector patterns, rule catalog contents and priorities, HTTP gateway
forwarding, human approval delivery, persistence, and client integration.

## Core contract

Input: one submitted message, trusted policy ID/version, trusted rules and
findings. Output: a valid decision or an explicit evaluation failure.

- Decision: `ALLOW | REDACT | DENY | REQUIRE_APPROVAL`, transformed message,
  policy ID/version, matched-rule attribution. No approval or dispatch flag.
- Failure: one or more machine-readable reasons, no decision or transformed
  message. Reasons include `INVALID_POLICY`, `INVALID_FINDING`, `INVALID_TEXT`,
  `MESSAGE_LIMIT_EXCEEDED`, `FINDING_LIMIT_EXCEEDED`, `OVERLAP_PRIORITY_TIE`.
- Spans are zero-based Unicode code-point offsets, start inclusive, end exclusive.
- Redaction intervals that intersect transitively form one connected group.
  Adjacent non-intersecting spans remain separate. Each group's union is replaced
  by the highest-priority finding's catalog marker.
- More than one finding tied at a connected group's highest priority fails.
- Composition: apply redactions; any deny wins; otherwise any approval requires
  approval; otherwise a transformed message is redact; otherwise allow.
- Limits: at most 65,536 UTF-8 message bytes and 1,024 findings; unpaired UTF-16
  surrogates are invalid text.

Test-only harness: `POST /__test/guard/evaluate` with
`{policyId, policyVersion, message, rules, findings}`. Success returns the
decision; failure returns `422` with `code: GUARD_EVALUATION_FAILED` and reasons.

## Rule fixtures

| Rule | Effect | Priority | Marker |
|---|---|---|---|
| FX-EMAIL | REDACT | 10 | `[REDACTED_EMAIL]` |
| FX-PHONE | REDACT | 10 | `[REDACTED_PHONE]` |
| FX-CREDENTIAL | REDACT | 30 | `[REDACTED_CREDENTIAL]` |
| FX-API-TOKEN | REDACT | 30 | `[REDACTED_API_TOKEN]` |
| FX-CARD | REDACT | 20 | `[REDACTED_PAYMENT_CARD]` |
| FX-FINANCIAL | REDACT | 20 | `[REDACTED_FINANCIAL_ID]` |
| FX-DENY | DENY | — | — |
| FX-APPROVAL | REQUIRE_APPROVAL | — | — |

## Scenarios

### SCN-guard-core-001 — No findings allows the message

Given the submitted message is "Hello." and there are zero findings
When the evaluation composes them
Then the state is allowed with the unchanged message, policy
`guard-core-fixture-policy` version `fixtures-v1`, and empty attribution.

### SCN-guard-core-002 — Each category uses its exact marker

Given the message "left AA right" and one finding covering "AA"
When the evaluation composes it
Then the state is redacted with the rule's exact marker and attribution.

### SCN-guard-core-005 — Higher-priority nested finding replaces the union

Given "ABCDE" with FX-EMAIL covering "ABCDE" and FX-CREDENTIAL covering "BCD"
Then the state is redacted and the message is exactly
`[REDACTED_CREDENTIAL]`, with no original "A"/"E" left outside.

### SCN-guard-core-007 — Transitive intersections form one group

Given "ABCDEFG" with FX-EMAIL "BC", FX-PHONE "CD" and FX-CREDENTIAL "DE"
Then the message is exactly `A[REDACTED_CREDENTIAL]FG`.

### SCN-guard-core-008 — Direct top-priority tie fails

Given "ABCDE" with FX-CREDENTIAL "BCD" and FX-API-TOKEN "CDE"
Then the state is an evaluation failure because the connected group's top
priority is tied, and no permitting decision is produced.

### SCN-guard-core-011 — Deny produces a deny decision

Given "AA" and FX-DENY is the only finding
Then the state is denied with attribution to FX-DENY.

### SCN-guard-core-014 — Deny dominates approval without losing redaction

Given "AA" with FX-EMAIL "AA", FX-DENY and FX-APPROVAL
Then the state is denied, the transformed message is `[REDACTED_EMAIL]`, and
attribution includes FX-EMAIL, FX-DENY and FX-APPROVAL.

### SCN-guard-core-017 — Unknown rule cannot supply an effect

Given "AA" and a finding for FX-UNKNOWN absent from the catalog
Then the evaluation fails because the rule is unknown and no permitting
decision is produced.

### SCN-guard-core-024 — Finding-count boundary does not drop redactions

Given `repeat("A", count)` with one distinct FX-EMAIL span per character
Then 0–1024 findings are allowed (0 allows, 1–1024 redact that many adjacent
markers) and 1025 findings fail explicitly with no partial success.

## Acceptance mapping

API project: all nine scenario IDs in `tests/api/guard-core.spec.ts`, each tagged
with the exact `[SCN-guard-core-NNN]` id. The test-only harness exercises the real
Java core; no subprocess bridge is introduced. Tests are locked after the red run.
