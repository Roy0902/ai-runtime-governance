# Test Plan: Native Authentication — Test-oracle follow-up 02

> **Frozen artifact.** Corrects three locked-test setup/oracle defects without
> changing product behavior. Derived from the approved requirements, intent and
> original plan. Never edit after freeze.

## 1. Provenance

| Field | Value |
| :--- | :--- |
| Feature | `native-auth-followup-02` |
| Original plan | [specs/native-auth.md](../../specs/native-auth.md) @ `3929c8570bb2ad6b2409f95b75393a43851521f9aff42261e7ca9e696cc699b5` |
| Prior follow-up | [specs/native-auth-followup-01.md](native-auth-followup-01.md) @ DR-043 |
| Authorizing decision | DR-043 post-freeze path; this plan records the corrected setup |
| Spec artifact | [REQUIREMENTS.md](../../REQUIREMENTS.md) @ `EA0A567B471BE543F8EE7C337B367175B590AA08F19A6A8625137EEA9361B4F1` |
| Scenario catalog | [05-scenarios.md](../spec-to-test-workflow/phase-1/native-auth/05-scenarios.md) |
| Machine contract | [native-auth.openapi.json](../contracts/native-auth.openapi.json) @ `0.2.1` |
| Frozen by | user / DR-043 path |
| Frozen at | 2026-11-01 |
| Evidence | [execution-evidence.md](../spec-to-test-workflow/phase-1/native-auth/evidence/execution-evidence.md) |

## 2. Scope

Three locked tests had setup/oracle defects, not product defects:

- **037** started a new enrollment from a `HUMAN` context; the context guard
  correctly rejects it. Correct setup: a verified, not-enrolled account in `SETUP`.
- **073** used the same authenticated `request` context and expected `401`; the
  correct check uses a fresh unauthenticated context after the host grant.
- **092** expected the reset password to be current after a signed-in change was
  rejected `403`. Correct setup: complete a real one-time reset, then verify the
  new password authenticates and the old one does not.

**057** is already covered by `native-auth-followup-01`; it is not duplicated.

## 3. Scenarios

| ID | REQ | Type | Gherkin | Expected observable | Level | Tag |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SCN-native-auth-037` | REQ-010 | Boundary | Given a verified account is in setup-only context with a pending enrollment, When the pending lifetime reaches exactly 24 hours and completion is attempted, Then activation is rejected as expired | `410 OPERATION_EXPIRED`; no factor activation | API | `@reg` |
| `SCN-native-auth-073` | REQ-007/REQ-008 | Negative | Given a host grant exists for an enrolled account, When a fresh unauthenticated client reads the private account, Then the grant is not private human authority | `401 SIGN_IN_REQUIRED` | API | `@reg` |
| `SCN-native-auth-092` | REQ-003/REQ-009 | Negative | Given an enrolled account completes a one-time password reset with a new password, When authentication is attempted with the old then the new password, Then the old credential fails and the new credential authenticates | Old `401`; new `200`; reset password wins | API | `@reg` |

## 4. Data and evidence

- Real PostgreSQL, Mailpit, test clock and host CLI.
- Generated account, password, TOTP secret and reset token per test.
- Evidence: `tests/api/native-auth-followup-02.spec.ts` and the locked manifest.

## 5. Assumptions

| ID | Assumption | Blocking | Decision |
| :--- | :--- | :--- | :--- |
| F2-01 | These are test setup/oracle corrections, not product-rule changes | No | DR-043 path |
| F2-02 | 057 remains covered by follow-up 01 and is not retested here | No | DR-043 |

## 6. Freeze sign-off

- [x] Every scenario has a concrete expected observable.
- [x] No product rule is changed.
- [x] The original plan and locked tests are not edited.
- [x] Evidence and gap locations recorded.
- [x] Freeze stamp recorded.
