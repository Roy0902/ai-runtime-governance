# Guard literal prompt-injection indicators

Feature: `guard-injection-literals`

## Scope

This slice recognizes only these case-insensitive literal indicators, bounded
by non-word characters or message boundaries:

- `ignore previous instructions`
- `ignore all previous instructions`
- `ignore prior instructions`
- `ignore all prior instructions`
- `reveal system instructions`
- `reveal developer instructions`

A match emits the built-in `FX-INJECTION` rule with effect
`REQUIRE_APPROVAL`. It does not redact the phrase. Existing sensitive-data
redactions are still applied before the approval-required outcome is returned.
This is a small indicator set, not semantic analysis or comprehensive
prompt-injection detection.

No regex, model/ML detector, unsafe-content category, or invalid/weak-prompt rule
is included in this feature.

## Scenarios

### SCN-guard-injection-001 — Literal indicators require approval

Given a message contains one approved indicator, regardless of case
When the built-in catalog evaluates it
Then the outcome is `REQUIRE_APPROVAL`, the message is unchanged, and
`FX-INJECTION` is attributed.

### SCN-guard-injection-002 — Sensitive data is redacted before approval

Given a message contains an approved indicator and an email address
When the built-in catalog evaluates it
Then the email is replaced with `[REDACTED_EMAIL]` and the outcome is
`REQUIRE_APPROVAL`.

### SCN-guard-injection-003 — Near-matches do not require approval

Given indicator-like text is embedded in a larger word or differs from the
approved literal
When the built-in catalog evaluates it
Then the message is allowed unchanged with no matched rules.

## Test surface

Acceptance uses the token-protected, test-profile-only
`POST /__test/guard/detect` endpoint. No production forwarding path is added.
