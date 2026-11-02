# Test Plan: Native Authentication — oracle/setup follow-up 03

> **DRAFT FOR PHASE 6 REVIEW. Not frozen, not locked and not authorized as a test
> expectation until Phase 6 approval.** Addendum only; the original plan and
> locked files remain immutable.

## 1. Provenance

| Field | Value |
|---|---|
| Feature | `native-auth-followup-03` |
| Original frozen plan | [specs/native-auth.md](./native-auth.md), current guard hash recorded in its manifest |
| Prior follow-ups | [follow-up 01](./native-auth-followup-01.md), [follow-up 02](./native-auth-followup-02.md) |
| Authority | DR-038 browser password constraint; DR-043 post-freeze test pacing; approved original requirements/intent |
| Domain/scenario authority | `spec-to-test-workflow/phase-1/native-auth/03-domain-model-v0.2.md`, `04-intent-v0.1–v0.4.md`, `05-scenarios.md` |
| Shared contract | `contracts/native-auth.openapi.json` @ 0.2.1; Phase 4 checklist/UI/operator contracts |
| Execution evidence | `spec-to-test-workflow/phase-1/native-auth/evidence/execution-evidence.md` |
| Gap register | `spec-to-test-workflow/phase-1/native-auth/evidence/gap-register.md` |
| Status | Draft awaiting user Phase 6 review; no follow-up tests authored or frozen |

This follow-up corrects setup, reachability and framework oracles only. It must
not modify the original plan, manifests or any locked original/follow-up test.
Existing implementation has already been developed; no new feature behavior is
authorized by this draft.

Continuation note: on 2026-11-02 the action-level database reset was removed
from the shared registration helper, and original browser cases 002/003 now pass
without deleting the account they are testing. Original SCN-030 also passes after
the product UI now reads existing enrollment metadata before attempting secret
creation on reload. These are closed before this follow-up and are not recast as
new cases.

## 2. Scope and classification

In scope: correct named-term query, current-link pacing, legitimate SETUP
reauthorization without extending a pending operation, TOTP clock/helper alignment,
independent-session assertions, direct API authorization, actual credential-reset
interleaving, and password-control native sanitization.

Explicit exclusions: changes to TOTP replay, session lifetime/reauth rules,
cleanup/link/reset limits, account isolation, password policy or any accepted copy.
Provider/client/WSL release evidence is outside this native-auth follow-up.

| SCN | Existing issue | Follow-up treatment |
|---|---|---|
| 001 | Playwright 1.64.1 does not resolve `<dt>` by accessible name `term` | Keep role, anchor by exact visible text: `getByRole('term').filter({ hasText: /^Gateway access$/ })`; oracle unchanged |
| 002/003 | `register()` reset all persisted accounts before each registration | Fixed the helper; per-test reset remains the isolation boundary and duplicate actions no longer erase the account under test |
| 030 | Setup reload called POST create rather than GET current operation, redisclosing fresh setup secrets | Fixed product behavior; initialization now reads existing operation first and never resends secrets. Original SCN-030 verified green |
| 007 | At +25 hours the original SETUP context is expired; the test expects an in-session alert | Use password-authenticated setup access, explicitly restart the expired pending attempt, and prove the same verified account can finish required setup without prior protected access |
| 015 | Initial issued mail consumes the per-address one-minute admission window | Advance controlled server time by 60 seconds before explicit eligible resend; assert the newest durable link succeeds and the superseded one fails |
| 036 | Browser clock advances while Node-side TOTP helper remains on the prior step | API control helper advances the shared helper offset; complete at `expiry - 1s` with valid current TOTP |
| 037 | Setup cookie expires at the same 24-hour deadline as the operation | At `operation expiry - 1s`, re-establish SETUP by password. Confirm the same operation ID/expiry, advance the final second, and expect 410. Do not restart or extend the pending operation |
| 039 | The follow-up successful sign-in reuses the TOTP step consumed by replacement | Advance one 30-second step through the shared helper immediately before that distinct sign-in; strict replay remains |
| 041 | Server clock advances 11 minutes, but TOTP calculation uses wall-clock Node time | Use the shared controlled-clock helper to update server time and code-generation offset together |
| 054 | Recent-authentication expires before the invalid-password assertion is reached | Complete the required step-up with current credentials, let the retried invalid password fail validation, then advance beyond idle expiry and verify denial |
| 058 | Second browser context copies the same session cookie; it is not an independent session and fields are not compared | Sign in independently in a new context, compare exact `createdAt`, `absoluteExpiresAt`, `recentAuthExpiresAt`; verify second session revocation |
| 062 | Browser navigates to a JSON API and expects HTML text | Move ownership/foreign-operation assertion to the existing API surface; assert exact 404 `NOT_FOUND` and unchanged caller account |
| 092 | Sequential reset did not exercise stale predecessor rehash; `Promise.all` is not deterministic | Use a per-run authenticated, loopback/test-profile barrier after predecessor hash derivation and before compare-and-set. Commit a real reset while paused, release, assert old-password sign-in gets generic 401 and creates no session, new password plus fresh factor succeeds |
| 094 | Test assigns CR/LF via the native password `value` property; Chromium strips it before application code observes it | Move explicit CR/LF rejection oracle to direct raw JSON API submission. Retain the browser control as only platform-feasibility/safe-input coverage; do not claim the browser submitted text it removed |

The original frozen SCNs are preserved with their historical execution results.
This plan does not retroactively label those runs as passing.

## 3. Proposed independent scenarios

These are corrected execution setups for the existing behavioral requirements;
expected values are unchanged and sourced from the frozen original/approved
intent.

| Follow-up case | Source SCN | Level | Given / When / Then summary | Exact oracle |
|---|---|---|---|---|
| `SCN-native-auth-001` | 001 | Browser | Complete enrollment; locate only the `Gateway access` term; verify no operator grant exists | Visible exact term/value `Not granted`; own account remains enrolled |
| `SCN-native-auth-007` | 007 | API | Expire pending enrollment; password-acquire SETUP; explicitly restart and complete new 24-hour attempt | Account/email remain verified; scope exists only after valid completion; no scope/access before |
| `SCN-native-auth-015` | 015 | Browser | Issue new verification mail after approved identity wait, then try old and new links | Old link 410/no verification; new current link verifies once |
| `SCN-native-auth-036` | 036 | API | Current attempt, valid TOTP, complete exactly `expiry - 1s` using synchronized fake clock | HTTP 200; HUMAN context and exactly one private scope |
| `SCN-native-auth-037` | 037 | API | Start operation, reacquire SETUP at `expiry - 1s`, prove unchanged operation ID/expiry, complete at equality | HTTP 410 `OPERATION_EXPIRED`; no factor/scope activation |
| `SCN-native-auth-039` | 039 | Browser | Complete replacement; wait one fresh TOTP step; try old then new factor | Old factor denied; new factor signs in; other session revoked |
| `SCN-native-auth-041` | 041 | Browser | Advance server clock 11 minutes, step up at start with current aligned TOTP | Dialog appears before authority; correct step-up resumes start and shows pending one-time key |
| `SCN-native-auth-054` | 054 | Browser | At six idle days, step up, submit invalid 11-code-point password, then advance two days | Exact password validation feedback; rejected change does not renew idle; protected access denied at idle expiry |
| `SCN-native-auth-058` | 058 | Browser + supporting | Establish two independent human sessions; perform password change in one | Exact original current-session creation/absolute/recent-auth timestamps retained; other session denied |
| `SCN-native-auth-062` | 062 | API + browser | Two fully enrolled accounts; A reads B’s operation identifier | HTTP 404 `NOT_FOUND`; A’s own identity/scope unchanged and B’s values undisclosed |
| `SCN-native-auth-092` | 092 | API + supporting | Real predecessor verifier; pause after old verifier succeeds/hash is derived; commit verified-email reset; resume sign-in | Concurrent stale sign-in generic 401/no session; DB reset password remains current; new password + fresh TOTP succeeds |
| `SCN-native-auth-094` | 094 | API; browser characterization | Send raw CR/LF in 12–128 code-point password; separately characterize native browser insertion | Raw API: HTTP 400 `REQUEST_INVALID`, `password` field has exact approved line-break copy, no account/password change. Browser does not claim delivery of sanitized CR/LF |

The new SCN tags intentionally point at original requirement/behavior identifiers;
the follow-up feature has its own frozen manifest and exact plan-to-test mapping.

Cases 002/003 and 030 remain documented as closed results and are not duplicated
in this follow-up.

## 4. Test-only race control proposal for 092

This control is **not yet approved or implemented**. It is absent from the current
test-control contract.

- New named fault: `predecessor-rehash-after-derive`.
- With the test profile and correct per-run `X-Test-Token`, pause the sign-in
  thread after it verifies the predecessor credential and derives the current
  hash, but before compare-and-set. It must not log credentials/hash material.
- A nonsecret authenticated state read reports only `waiting: true/false`; an
  authenticated release disables this single named gate. Bound pause duration
  to 10 seconds, release on reset/shutdown, and fail closed on timeout.
- Test performs actual reset through the existing SMTP capture/one-use link while
  the old sign-in is paused. It then releases the gate and observes the real CAS
  and session outcome. No public API/control, mocked session, injected result or
  hard-coded green response is permitted.
- If the reviewed control cannot be made reliable, SCN-092 remains blocked;
  uncontrolled timing or one sequential `Promise.all` attempt is not equivalent.

Other non-product test corrections may use existing authenticated test support,
without expanding production endpoints or reading/exporting secrets.

## 5. Acceptance/data discipline

- Read-only original freeze manifests/test hashes remain untouched; new plan and
  test files use `native-auth-followup-03` artifacts and a separate manifest.
- Real Playwright browser, backend, isolated PostgreSQL and local Mailpit; per-test
  generated identity/password/TOTP/recovery/token values. No real mailbox,
  production credential or secret-bearing exported trace/report.
- Wait exactly at rate/operation/session boundaries from the approved server
  clock. TOTP samples are chosen in test data not to collide across adjacent steps.
- Reset rates, clock, faults and owned DB rows once per completed test fixture,
  never during a scenario action or duplicate signup.
- Preserve the mandatory CSRF/session/profile behavior. Test/API helpers use
  genuine `SETUP`/`HUMAN` acquisition and distinct contexts.
- No assertion or setup expectation is inferred from implementation output;
  all expected values above reference the approved frozen plan and contract.
- Run the canonical guard/freeze/lock commands only after review; archive feature-
  missing red evidence for truly product-missing assertions. Corrected setup cases
  that are green on existing functionality are recorded honestly as corrected
  test-oracle/setup cases, not fabricated as feature-missing red.

## 6. Review checklist

- [ ] Post-freeze corrections and classification (test setup/framework vs product gap) accepted.
- [ ] SCN-092 test-only barrier and its bound/failure/reset semantics accepted.
- [ ] SCN-094 API-level oracle/surface change accepted; native-browser sanitization claim narrowed.
- [ ] Current rate window for SCN-015 and exact helper pacing accepted.
- [ ] Frontend/browser semantics for 001, 039, 041, 054, 058 accepted.
- [ ] No changes to original plans/manifests/locked tests; separate review/freeze/lock required.

**Freeze status:** unchecked; requires explicit user review. No follow-up test files
for this draft have been authored, frozen or locked. Original 002/003/030 passed
in focused existing-plan runs; no follow-up case is counted as passed.
