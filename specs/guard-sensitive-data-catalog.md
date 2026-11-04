# Guard sensitive-data detector catalog — first vertical slice

Feature: `guard-sensitive-data-catalog`

## Scope

This slice adds deterministic, built-in detectors for common sensitive values.
It feeds trusted code-point findings and fixed catalog rules into the frozen
guard decision core. It does not expose a production route, dispatch a prompt,
or claim complete detection.

| Rule | Supported pattern | Effect | Priority | Marker |
|---|---|---|---:|---|
| `FX-EMAIL` | Bounded ASCII email address with valid local/domain boundaries | `REDACT` | 10 | `[REDACTED_EMAIL]` |
| `FX-PHONE` | International `+` number with 8–15 digits and optional spaces/hyphens | `REDACT` | 10 | `[REDACTED_PHONE]` |
| `FX-CREDENTIAL` | Value after a built-in password/secret/key assignment label | `REDACT` | 30 | `[REDACTED_CREDENTIAL]` |
| `FX-API-TOKEN` | Recognized AWS, GitHub, Slack, and `sk-` token prefixes | `REDACT` | 30 | `[REDACTED_API_TOKEN]` |
| `FX-CARD` | 13–19 digit card candidate passing Luhn validation | `REDACT` | 20 | `[REDACTED_PAYMENT_CARD]` |
| `FX-FINANCIAL` | IBAN candidate passing MOD-97 validation | `REDACT` | 20 | `[REDACTED_FINANCIAL_ID]` |

All rules are enabled by default and have fixed actions, priorities, and markers.
Patterns are static built-ins with explicit finite bounds; callers cannot supply
patterns or regex options. Messages are limited by the core to 65,536 UTF-8
bytes and findings to 1,024. Matches use zero-based Unicode code-point offsets.
The catalog fails closed on invalid or oversized input.

Injection/safety indicators and invalid/weak-prompt rules are deferred. User-
configurable rule enablement is not exposed by this test-only slice. Supported
formats are intentionally narrow and do not imply comprehensive coverage.

## Scenarios

### SCN-guard-detectors-001 — Supported sensitive values use typed markers

Given a message contains one valid value for each supported category
When the built-in detector evaluates the message through the decision core
Then each value is replaced by its category marker and the matching rule IDs
are attributed.

### SCN-guard-detectors-002 — Lookalikes and invalid checksums are not findings

Given a message contains non-address text, a local phone format, a card number
that fails Luhn, and a short token-like string
When the built-in detector evaluates the message
Then the message is allowed unchanged with no matched rules.

### SCN-guard-detectors-003 — Unicode before a match preserves code-point spans

Given a message begins with a supplementary Unicode character before an email
When the built-in detector evaluates the message
Then only the email is replaced and the surrounding text is unchanged.

### SCN-guard-detectors-004 — Oversized input fails closed

Given a message exceeds 65,536 UTF-8 bytes
When the built-in detector evaluates the message
Then it returns `GUARD_EVALUATION_FAILED` with `MESSAGE_LIMIT_EXCEEDED` and no
decision.

## Test surface

Acceptance uses the token-protected, test-profile-only
`POST /__test/guard/detect` endpoint. No public detector endpoint or forwarding
path is added.
