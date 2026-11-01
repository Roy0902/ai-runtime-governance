# Test Plan: Native Authentication — TOTP pacing follow-up 01

> **Frozen artifact.** Derived from the approved requirements, intent and the
> original frozen plan. It corrects only the controlled-clock pacing of the
> affected scenarios; the behavioral oracle is unchanged. Never edit this file
> after freeze. Gaps go to a separate follow-up.

## 1. Provenance

| Field | Value |
| :--- | :--- |
| Feature | `native-auth-followup-01` |
| Original plan | [specs/native-auth.md](../../specs/native-auth.md) @ `3929c8570bb2ad6b2409f95b75393a43851521f9aff42261e7ca9e696cc699b5` |
| Authorizing decision | DR-043 |
| Spec artifact | [REQUIREMENTS.md](../../REQUIREMENTS.md) @ `EA0A567B471BE543F8EE7C337B367175B590AA08F19A6A8625137EEA9361B4F1` |
| Approved intent | v0.1–v0.4 at the fingerprints recorded in the original plan |
| Scenario catalog | [05-scenarios.md](../native-auth/05-scenarios.md) @ `61CD54F1497411C2B81722964E851352412795AF9B9AD61C0269F2805D0A7136` |
| Machine contract | [native-auth.openapi.json](../../../contracts/native-auth.openapi.json) @ `0.2.1` |
| Frozen by | user / DR-043 |
| Frozen at | 2026-11-01 |
| Execution evidence | [evidence/execution-evidence.md](../native-auth/evidence/execution-evidence.md) |
| Gap register | [evidence/gap-register.md](../native-auth/evidence/gap-register.md) |

## 2. Scope

**In scope:** the controlled-clock pacing of three TOTP scenarios whose original
locked tests reused the step consumed by enrollment or a prior authentication.

**Out of scope:** any change to per-step replay, enrollment, session or recovery
semantics; the browser-only replacement/recent-auth cases 039/041 remain blocked
until the frontend exists.

## 3. Scenarios

The only change from the original oracle is a controlled `+30s` advance before
each distinct authentication that must succeed. The same code is still reused
where the scenario expects a replay rejection.

| ID | REQ | Type | Gherkin | Expected observable | Level | Tag |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SCN-native-auth-033` | REQ-010 | Boundary | Given an enrolled account has completed enrollment at step N, When the clock advances one step and two concurrent sign-ins use the same current code, Then exactly one creates a session and the other is rejected as a replay | One `200`, one `401`; no second session authority | API | `@reg` |
| `SCN-native-auth-057` | REQ-006 | Negative | Given two sessions belong to one account and one session has confirmed recent authentication at a fresh step, When the other session attempts a sensitive password change, Then the confirmation does not apply to that other session | The other session receives `403 RECENT_AUTH_REQUIRED` | API | `@reg` |
| `SCN-native-auth-089` | REQ-002/REQ-011 | Boundary | Given six concurrent password checks at the same current step, When hash admission is bounded to one active and four waiting jobs, Then at least one request gets a temporary-service failure rather than unbounded work or late authority | At least one `503 TEMPORARILY_UNAVAILABLE`; no unbounded hash work | API | `@reg` |

## 4. State transitions and coverage

| From | To | Guard | Scenario |
| :--- | :--- | :--- | :--- |
| Enrolled | Human session | One concurrent step winner | 033 |
| Confirmed session | Other-session sensitive action | Confirmation is session-bound | 057 |
| Admission queue full | Temporary failure | No sixth active job | 089 |

Coverage: 3/3 affected SCNs, 3 API acceptance tests, no browser SCNs in this
follow-up. Original SCNs 039/041 remain blocked for the frontend iteration.

## 5. Data and evidence

- Real PostgreSQL, Mailpit and the test-profile control surface.
- Generated account, password and TOTP secret per test.
- The clock is reset per test by the reset reporter, then advanced explicitly.
- Evidence: `tests/api/native-auth-followup-01.spec.ts`, the locked manifest and
  the execution-evidence log.

## 6. Assumptions and ambiguities

| ID | Assumption | Blocking | Decision |
| :--- | :--- | :--- | :--- |
| F-01 | A `+30s` controlled advance is a legitimate test-pacing change, not a product-rule change | No | DR-043 |
| F-02 | 039/041 remain browser-blocked until the frontend is implemented | No | DR-043 |

No blocking ambiguity.

## 7. Freeze sign-off

- [x] Every scenario has a concrete expected observable.
- [x] No expected value came from code, a capture or a running app.
- [x] The product replay rule is unchanged.
- [x] The original frozen plan and locked tests are not edited.
- [x] Evidence and gap locations recorded.
- [x] Freeze stamp recorded. No edits after this point.
