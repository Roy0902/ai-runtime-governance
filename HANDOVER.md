# Cross-session handover

Updated: 2026-11-02. Use this as the first file in a new session.
Status: **Native-auth continuation prepared. Backend/frontend implementation
exists, but acceptance and invariant verification remain incomplete. No feature
code, frozen plan or locked test was changed during this preparation.**

## 0. Current continuation checkpoint: 2026-11-02

The November 1 counts below are historical run results, not a fresh acceptance
run on this checkout. Current read-only guard verification passes for
`native-auth`, `native-auth-followup-01` and `native-auth-followup-02`.
The preparation changes are confined to this handover and the mutable
[gap register](./spec-to-test-workflow/phase-1/native-auth/evidence/gap-register.md).

### Actual local prerequisites

The repository was clean at `923b63d` when preparation started; the local
`origin/main` tracking reference matched HEAD. No remote fetch/push was performed.
Ignored tool/data directories from the other host did not arrive with Git.

| Prerequisite | Current checkout |
|---|---|
| JDK used by current Playwright config | Missing at `.local-tools\jdk-25.0.5+8` |
| Available earlier JDK | Present at `.local-tools\java\jdk-25.0.5+8` |
| Maven used by `env.ps1` | Missing at `.local-tools\apache-maven-3.9.16` |
| Available earlier Maven | Present at `.local-tools\maven\apache-maven-3.9.16` |
| PostgreSQL 17.6 binary/data directory | Not present at the configured paths |
| Mailpit binary | Not present at the configured path |
| Root Playwright/frontend dependencies | Not restored |
| Backend application jar | Not built |
| Node/npm on this host | 22.19.0 / 10.9.3, not the other host's recorded 24.22.0 / 11.19.1 |

Restore/verify project-local prerequisites and reconcile configuration paths
before interpreting a test failure as a product defect. Keep PostgreSQL 17.6 as
the DR-042 local baseline; never reset an unverified existing database or use
global installation to repair this checkout. No service was started in this
preparation.

### Correct continuation order

1. **Harness correctness first:** establish awaited per-test reset, preserve data
   during duplicate signup, align the fixed server clock and TOTP inputs, use
   real independent sessions, and make prerequisite failures explicit.
2. **Invariant-first product verification:** reproduce original-deadline/recent-
   confirmation preservation on rotation, then the actual predecessor-rehash/
   concurrent-reset race. Do not equate the current API pass count with proof of
   those invariants.
3. **Reviewed test-only follow-up:** use the draft scope below; preserve all
   three existing frozen plans/manifests and every locked test.
4. **UI product fixes:** reproduce replacement/regeneration, step-up, status and
   sign-out behavior against sound fixtures before changing product code.
5. **Full verification:** approved default-policy tests, complete browser/API
   evidence, accessibility and as-built review. Timeline remains downstream.

### Draft scope for follow-up 03: not a frozen plan

This is preparation for a reviewable follow-up, not permission to author/lock
corrected tests or change product expectations.

| SCN | Proposed correction preserving the approved rule |
|---|---|
| 001 | Keep exact account/entitlement assertions; locate the `term` by role plus anchored text instead of unsupported accessible-name lookup |
| 007 | Prove the same verified account survives expired setup and can reacquire legitimate setup access; do not assert an unsupported expiry message from an expired session |
| 036 | Keep a valid setup context and synchronize candidate TOTP to the controlled server instant before the 24-hour boundary; do not let an unrelated context/clock failure stand in for operation validity |
| 037 | Acquire a fresh legitimate SETUP context before the original operation deadline without restarting/extending the operation; verify the same pending operation and a still-valid context, then assert `410 OPERATION_EXPIRED` at the original deadline |
| 054 | Establish the password page and last deliberate activity before the idle interval; submit invalid input without an intervening successful protected navigation that would legitimately renew inactivity |
| 058 | Authenticate a genuinely separate second session, not a copied cookie; assert current-session `createdAt`, `absoluteExpiresAt` and original `recentAuthExpiresAt` remain unchanged after the approved settings rotation while the other session is revoked |
| 062 | Create actual A/B account ownership and B's operation; assert the approved JSON `404 NOT_FOUND` when A attempts B's operation and inspect A's unchanged own-account view; do not expect an HTML message from an API URL |
| 092 | Use a real reviewed predecessor verifier and a deterministic interleaving: old authentication verified, reset commits a new credential revision, stale rehash resumes; assert no overwrite or stale session authority, and fresh-factor authentication succeeds only with the new password |
| 094 | Exercise observable raw paste before native sanitization and direct service rejection; setting `input.value` cannot prove rejection of original CR/LF already removed by the browser |

The proposed 037 data recipe uses normal credential-verified setup access, not
cookie forgery or secret readback. Its preconditions must be checked explicitly.
The 092 case still needs a reviewed test-only predecessor fixture and deterministic
barrier contract; `Promise.all` or a sequential reset is not that proof.

SCN-002/003 are **not named-term locator cases in the current source**. Their
duplicate-signup action calls the shared `register` helper, which resets all
test state and deletes the very account whose preservation is being asserted.
Prepare a behavior-preserving unlocked-helper correction with actual per-test
isolation; do not rewrite their locked expectations or reset on each user action.

If a corrected test is already green, record it as an existing-behavior baseline.
Never break the product or manufacture a feature-missing red result. Do not
claim the follow-up freeze/red/lock gate passed until the proper disposition of
test-only corrections versus new product-gap assertions has been reviewed.

### Concrete source-backed review risks

- `SessionService.rotate` currently ends the old session then calls `create`,
  which initializes fresh creation/deadline timestamps. The settings path also
  supplies a new recent-authentication time. This conflicts with preservation
  requirements and needs a focused runtime regression, not a cosmetic UI fix.
- The rehash update is conditional on account version, but its affected-row
  outcome is not returned to the sign-in flow, which proceeds toward session
  creation. The exact race must be reproduced before declaring it correct or
  deciding its fix.
- `ResetReporter.onTestBegin` is asynchronous and only warns on reset failure.
  Reporter callbacks must not be assumed to provide an awaited fixture barrier.
- The test profile sets mail-identity limits to 100/minute and 1,000/hour.
  Approved default-policy evidence must exercise 1/minute and 5/hour; pace reset
  setup instead of weakening those limits to make SCN-092 green.

These are preparation findings, not new runtime pass/fail results. The
[gap register](./spec-to-test-workflow/phase-1/native-auth/evidence/gap-register.md)
records them as GAP-NA-022 through GAP-NA-027.

## 1. Read first

1. This file.
2. [Session progress](./spec-to-test-workflow/phase-1/SESSION-PROGRESS-2026-11-01.md).
3. [Gap register](./spec-to-test-workflow/phase-1/native-auth/evidence/gap-register.md).
4. [Decision record](./spec-to-test-workflow/phase-1/05-decision-record.md), especially DR-039–DR-043.
5. [Frozen plan](./specs/native-auth.md) and the two follow-ups.
6. [Test-only control contract](./tests/support/control-contract.md).

## 2. Repository state

- Branch `main`; clean before this documentation-only preparation.
- Local `origin/main` tracking ref matches HEAD; **do not push** unless asked.
- Last local commit: `923b63d [Docs]Create handover list`.
- First commit `38d6727` is already on `origin/main`; do not amend or force-push it.
- Commit style: `[TaskType]Goal-oriented title`, e.g.
  `[Test]Correct the TOTP pacing and remaining test oracles`.
- No secrets are committed. `.local-cache/`, `.local-tools/`, `local-env/runtime/`
  and `frontend/dist/` are ignored.

## 3. Last recorded application results: 2026-11-01

| Suite | Result |
|---|---|
| API original + follow-up 01 | **44/48** |
| Follow-up 01 (TOTP pacing) | **3/3** |
| Follow-up 02 (test oracles) | 1/3 (073; 037/092 are test setup) |
| Browser | **31/49** |
| `npm run ai:verify` | all three features `OK` |
| Guard tests | 22/22 |
| Backend build | pass |
| Frontend typecheck/lint/build | pass |

## 4. Environment

Project-local tools live in `.local-tools`; source `local-env/env.ps1` for
`JAVA_HOME`, Maven, Playwright and npm cache paths.

PostgreSQL 18.6 backends crash on this host (`0xC0000142`); **use 17.6** under
DR-042. Some unkillable 18.6 children may still linger, but the 17.6 server on
port 55434 is the working one.

```powershell
# 1. PostgreSQL 17.6
.\.local-tools\pgsql17\bin\postgres.exe -D .\.local-cache\pgdata17 -p 55434

# 2. Mail capture
.\.local-tools\mailpit\mailpit.exe --listen 127.0.0.1:8025 --smtp 127.0.0.1:1025

# 3. Acceptance (Playwright starts backend and frontend)
npm run test:acceptance -- --project=browser
npm run test:acceptance -- --project=api

# Single case
npx playwright test --config tests/playwright.config.ts --project=browser --grep "SCN-native-auth-039"
```

The Playwright config starts the backend with the `test` profile, test token
`test-token`, DB `jdbc:postgresql://127.0.0.1:55434/governance`, and the shared
fault/dispatch files. Do not expose `__test` in production.

## 5. Recorded browser failure groups (18 failures on November 1)

These are historical failure counts, not a fresh reproduction or a declaration
that every failure is a UI bug. Use section 0's fixture/invariant-first order.

### 5.1 Replacement and regeneration (7)

`SCN-038`, `039`, `041`, `046`, `047`, `048`, `050`.

Symptoms: step-up/transition loops and list/ack flows. Check:

- `frontend/src/App.tsx` → `AuthenticatorPage`, `RecoveryGenerationPage`,
  `StepUpDialog`.
- `Start replacement` / `Complete replacement` / `Cancel replacement` request
  paths and recents.
- `SCN-041` advances 11 minutes in the locked test; the app must open the step-up
  dialog and retry the action.
- Regeneration needs the list, acknowledgement, `Continue`, `Cancel`, and
  post-commit status.

### 5.2 Clock/expiry (4)

`SCN-007`, `036`, `054`, `059`.

Symptoms: the locked test advances the server clock but the TOTP helper offset is
not updated for all paths; setup-session expiry can pre-empt operation expiry.
Check `register` / `completeEnrollment` offsets in
`tests/support/native-auth.ts` (helpers are not locked).

### 5.3 Status/flow (2)

`SCN-015` (supersession) and `SCN-030` (reload/readback).

Check the verify/setup status regions and the "already shown" path when
`GET /auth/enrollment` returns 200.

### 5.4 Line-break input (1)

`SCN-094`: the test sets `input.value` directly, after which native password
sanitization has already removed CR/LF. Changing React to `onInput` cannot
recover the unobservable original. Use a reviewed follow-up for raw paste before
sanitization and keep direct server rejection; do not weaken the server rule.

### 5.5 API URL assertion (1)

`SCN-062`: the test navigates to the JSON API and expects “Not found”. This is a
test defect; correct it in a follow-up rather than shaping the API response.

### 5.6 Term locator and duplicate-signup fixtures (3)

`SCN-001` uses the named-term locator. Playwright 1.64.1
`getByRole('term', { name })` was recorded as matching zero even with exact text
and `aria-label` (`GAP-NA-020`); use the reviewed role/text follow-up.

`SCN-002/003` have a distinct source-backed fixture problem: the duplicate signup
calls `register`, which resets the existing account. Do not presume a locator
change fixes those cases.

## 6. Immediate API/test-oracle work

- **037:** advancing 24h expires the `SETUP` session, so completion returns 401
  before the operation 410. Correct the setup (refresh the session or shorten the
  operation deadline) in a follow-up.
- **092:** respect the normal mail window before requesting reset. The sequential
  follow-up-02 case is not proof of the required concurrent predecessor rehash;
  prepare the deterministic race case described above. Relaxed test-profile
  limits do not prove the approved production policy.
- **057:** the original is superseded by follow-up 01.
- **073:** passes in follow-up 02.

Do not edit the frozen plans or locked test files. Create a third follow-up plan
with its own freeze/lock, or retire the superseded originals in a reviewed way.

## 7. Constraints

- Never edit `specs/*.md`, `specs/*.freeze.json`, `tests/specs/*.spec.ts`,
  `tests/api/*.spec.ts` after freeze/lock.
- A locked test that is wrong goes to a follow-up plan; never weaken it to pass.
- Do not push; commit only when asked, in phase-based commits with goal-oriented
  titles.
- Do not add real outbound email, production credentials or global tool installs.
- Keep PostgreSQL 17.6 as the local verification DB until 18.6 is fixed.
- Never commit `.local-cache`, `.local-tools`, `local-env/runtime` or
  `frontend/dist`.

## 8. Remaining phases

1. Finish the 18 browser failures and the remaining API test setup.
2. Phase 10 verification: full acceptance, supporting tests, native checks,
   maintainability review.
3. Phase 11 accessibility: contract locators against the running build.
4. Phase 12 as-built diagrams and intent comparison.

## 9. Useful file map

| Area | Path |
|---|---|
| Frozen plan | `specs/native-auth.md` |
| Follow-up 01 | `specs/native-auth-followup-01.md` |
| Follow-up 02 | `specs/native-auth-followup-02.md` |
| Browser tests | `tests/specs/native-auth.spec.ts` |
| API tests | `tests/api/native-auth.spec.ts` |
| Follow-up tests | `tests/api/native-auth-followup-0{1,2}.spec.ts` |
| Test helpers | `tests/support/` |
| Backend | `backend/` |
| Frontend | `frontend/src/` |
| Session evidence | `spec-to-test-workflow/phase-1/native-auth/evidence/` |
| Gap register | `spec-to-test-workflow/phase-1/native-auth/evidence/gap-register.md` |
| Activity log | `activity-log/2026-11-01-session-summary.md` |

## 10. Suggested first three actions

1. Restore and verify this checkout's project-local tools, dependencies and
   isolated PostgreSQL 17.6/Mailpit before starting acceptance.
2. Review fixture-isolation and invariant regressions, then finalize the
   follow-up-03 scope and its test-only race controls. Do not freeze it while
   its gate/precondition questions remain unresolved.
3. Reproduce the remaining UI clusters against sound fixtures; fix only proven
   product defects, preserve locked artifacts and proceed through full native/
   browser/API, accessibility and as-built verification.
