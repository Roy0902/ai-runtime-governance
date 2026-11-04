# Test Plan: Native Authentication — enrollment password precondition follow-up 04

## 1. Provenance

| Field | Value |
|---|---|
| Feature | `native-auth-followup-04` |
| Source behavior | Locked `SCN-native-auth-034` in [native-auth](./native-auth.md) |
| Authority | User confirmed on 2026-11-04 that password proof remains required for initial enrollment completion |
| Status | Corrected test setup only; no product behavior change |

This follow-up does not edit the original plan or locked tests. It makes the
password proof an explicit setup precondition so SCN-034 isolates the TOTP and
saved-code acknowledgement requirements.

## 2. Scope

- Given a verified account with a current SETUP session and pending initial
  enrollment, submit the correct password and current unused TOTP while leaving
  recovery-code acknowledgement unchecked.
- Expect HTTP 400 `REQUEST_INVALID`, the exact
  `Confirm that you saved your recovery codes.` field message, no active MFA and
  no private scope.
- Retry the same operation with the same valid proof and acknowledgement checked.
  Expect completion, active MFA and exactly one private scope.

No password policy, TOTP policy, acknowledgement copy, or production behavior is
changed. This is a corrected test-oracle/setup baseline for existing behavior,
not a feature-missing red test.

## 3. Acceptance mapping

| Source SCN | Level | Test | Exact oracle |
|---|---|---|---|
| `SCN-native-auth-034` | Browser | `tests/specs/native-auth-followup-04.spec.ts` | Missing acknowledgement returns 400 with the exact field message and leaves the operation/scope uncommitted; retrying with acknowledgement completes the same operation and establishes one scope |

## 4. Verification

Run the focused browser test with the project-local environment. Freeze this
plan and lock the new follow-up test only after the corrected test passes. The
original `native-auth` manifest and locked test hashes remain unchanged.
