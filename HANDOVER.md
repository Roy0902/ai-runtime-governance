# Cross-session handover

Updated: 2026-11-02, after the split, the reset/suite rerun, and the approved
default mail-policy evidence. Read the next section first.
Status: **Reset determinism, the whole-suite rerun, the approved default
mail-policy evidence, and the Phase 10 review are recorded. Accessibility and
as-built work remain. Timeline stays downstream.**

## Next-agent follow-up list: authoritative resume checkpoint

This section supersedes the older preparation checkpoint and its next-action
lists below. Keep those sections as history, not current instructions.

### 1. Establish the checkpoint and load only relevant inputs

- Working folder: `C:\Users\pigcr\Documents\Workspace\ai-runtime-governance`,
  branch `main`. The application code is in sibling repositories:
  `../ai-runtime-governance-frontend` and `../ai-runtime-governance-backend`.
- Latest commit: `251a057 Update handover`; the last implementation checkpoint is
  `b946e99 [Fix]Correct native-auth session handling and acceptance harness`.
- The frontend/backend split and the reset/suite work are committed and pushed.
  The approved default mail-policy evidence is the current increment. The local
  branches `split/frontend` and `split/backend` remain in the docs repository.
- No push was performed. Do not commit, amend or push unless explicitly asked.
  When asked, use `[TaskType]Goal-oriented title`.
- Read [latest execution evidence](./spec-to-test-workflow/phase-1/native-auth/evidence/execution-evidence.md),
  especially **Follow-up 03 and focused regression: 2026-11-02** and
  **Reset determinism and whole-suite rerun: 2026-11-02 (second continuation)**.
  Earlier unfinished-race statements and November 1 totals are historical.
- Then read the [gap register](./spec-to-test-workflow/phase-1/native-auth/evidence/gap-register.md),
  applicable [decision records](./spec-to-test-workflow/phase-1/05-decision-record.md),
  and only the frozen requirements/contracts needed for the assigned work.
- Graph coverage checked for the handover/evidence/F03/config paths was
  unavailable with Windows absolute paths; no current graph completeness is
  claimed. The known graph generation is October 27. Use project-relative
  coverage queries and current source fallback before making code claims.

### 2. Preserve completed work and frozen artifacts

- Follow-up 03 is actually frozen and locked. Its
  [manifest](./specs/native-auth-followup-03.freeze.json) and execution evidence
  record this, although the [plan](./specs/native-auth-followup-03.md) retains
  stale draft/review wording. **Do not edit the frozen plan to repair that
  wording.** Review provenance/approval evidence and record any discrepancy in
  mutable evidence; hash verification alone does not prove review approval.
- Preserve all four feature plans/manifests and locked Browser/API test files.
  Incorrect locked tests require a separately reviewed follow-up, not edits,
  silent skips, weaker assertions or product exceptions.
- Recorded November 2 results after the reset fix: Browser **48/55** (original
  **42/49** + F03 **6/6**); API **52/57** (original **41/45** + F01 **3/3** +
  F02 **2/3** + F03 **6/6**); supporting-api **4/4**; backend JUnit **10/10**;
  workflow/client **24/24**; frontend lint/typecheck/build pass; contract valid
  and 57,292 bytes generated. See the evidence for the exact remaining failures.
- The remaining failures are the known locked-test defects corrected by the
  follow-ups: browser 001, 007, 015, 039, 054, 062, 094; API original
  037/057/073/092 and follow-up-02 037. No proven product defect remains.
- The whole-suite rerun did happen on 2026-11-02 after the reset fix; do not
  reuse the older "not rerun" statement.
- Approved default mail policy: isolated `npm run test:mail-policy` with
  `GOVERNANCE_MAIL_IDENTITY_PER_MINUTE=1` and `..._PER_HOUR=5` passed **1/1**.
  The main test profile stays relaxed for setup-heavy suites.
- Phase 10 review: recorded in the evidence. Test-only controls remain
  disabled-by-default, loopback-only and token-protected; the latest-state
  review found no proven product defect. Narrow residual concurrency risks
  (concurrent settings rotation or admin disable, last-writer-wins password
  change) are documented, not silently declared safe.
- Do not redo the fixed session-deadline/recent-auth preservation, deterministic
  predecessor-rehash/reset race, sign-out headers, enrollment reload or
  regeneration status fixes unless a regression provides new evidence.

### 3. Ordered remaining work

1. **Local readiness: verified on this checkout (done 2026-11-02).** PostgreSQL
   17.6 is available on `127.0.0.1:55434` (`.local-cache/pgdata17`); Playwright
   starts Mailpit/backend/frontend; the config falls back to `process.execPath`
   when the flat local Node is absent. Re-check on a different host. Stop
   task-owned services by specific PID after verification.
2. **Reset determinism: fixed (done 2026-11-02).** `tests/support/reset-hook.ts`
   installs an awaited per-test reset and fails on any non-2xx response; the
   asynchronous reporter was removed. Do not reintroduce a reporter-only reset.
3. **Approved mail-rate policy: proven (done 2026-11-02).** `npm run
   test:mail-policy` runs an isolated backend with 1/minute and 5/hour and
   passed 1/1. The main test profile stays relaxed for setup-heavy suites; do
   not treat its green runs as default-policy evidence.
4. **Whole-suite disposition: recorded (done 2026-11-02).** Browser 48/55 and
   API 52/57; the remaining failures are known test defects/superseded cases.
   Re-run only when a change could affect them; do not edit locked tests or
   relax oracles.
5. **Phase 10 review: complete (done 2026-11-02).** Backend 10/10, frontend
   lint/typecheck/build, contract, guards and live suites are green. Isolation
   and latest-state findings are recorded in the evidence; no proven product
   defect was found. Residual concurrency risks are documented, not assumed
   safe.
6. **Finish Phase 11 accessibility** against the real running frontend,
   including contract locators, keyboard/focus and error/status announcements.
7. **Finish Phase 12 as-built diagrams and intent comparison.** Keep as-built
   output separate; never overwrite approved intent. Record drift and blockers.
8. **Only then return to timeline preparation/review.** Native-auth completion
   must be supported by all applicable gates, not selected green cases.
   WSL/client integration remains separate, user-performed and externally blocked.

### 4. Starting commands and exit conditions

From the docs repository root, after checking tools/environment and safe ports:

```powershell
. .\local-env\env.ps1
npm run ai:verify
node --test tests\freeze-guard.test.mjs tests\supporting\api-client.test.mjs
# Run live suites only after PostgreSQL readiness:
npm run test:acceptance -- --project=api
npm run test:acceptance -- --project=browser
npm run test:acceptance -- --project=supporting-api
# Native checks across the sibling repositories:
mvn -f ..\ai-runtime-governance-backend\pom.xml test
npm --prefix ..\ai-runtime-governance-frontend run lint
npm --prefix ..\ai-runtime-governance-frontend run typecheck
npm --prefix ..\ai-runtime-governance-frontend run build
npm run ai:contract
npm run test:mail-policy
```

Ports are configurable through the current
[Playwright config](./tests/playwright.config.ts); do not copy old fixed
ports/control tokens from historical instructions below. Keep screenshots,
traces and videos secret-safe; do not export seeds/codes/passwords. Do not
install globally, send real email, touch ignored runtime data in Git, or edit
anything under `node_modules`.

Persist next-session results in mutable execution evidence and update this
checkpoint. Completion requires truthful whole-suite dispositions, approved
default-policy coverage, native checks/review, accessibility and as-built review.
If a real product/review decision blocks progress, ask the user rather than
inventing approval or weakening an oracle.

## 0. Historical preparation checkpoint: 2026-11-02, before implementation continuation

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

- Branch `main`; the split, reset/suite, and mail-policy work are committed and
  pushed.
- **Do not push** unless asked.
- Last implementation commit: `63e1ba8 [Test]Prove approved default
  mail-identity policy`.
- First commit `38d6727` is already on `origin/main`; do not amend or force-push it.
- Commit style: `[TaskType]Goal-oriented title`, e.g.
  `[Test]Correct the TOTP pacing and remaining test oracles`.
- No secrets are committed. `.local-cache/`, `.local-tools/` and
  `local-env/runtime/` are ignored here; `node_modules/`, `dist/` and `target/`
  are ignored in the sibling application repositories.

## 3. Last recorded application results: 2026-11-01

These are historical. The current 2026-11-02 whole-suite disposition is in the
authoritative section above and in the execution evidence.

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

- `../ai-runtime-governance-frontend/src/App.tsx` → `AuthenticatorPage`, `RecoveryGenerationPage`,
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
- Never commit `.local-cache`, `.local-tools` or `local-env/runtime` here, or
  `node_modules`, `dist` and `target` in the application repositories.

## 8. Remaining phases

1. Finish the 18 browser failures and the remaining API test setup.
2. Phase 10 verification: full acceptance, supporting tests, native checks,
   maintainability review.
3. Phase 11 accessibility: contract locators against the running build.
4. Phase 12 as-built diagrams and intent comparison.

## 9. Useful file map

The application code lives in two sibling repositories next to this one:
`../ai-runtime-governance-frontend/` and `../ai-runtime-governance-backend/`.
Historical documents under `specs/`, `spec-to-test-workflow/` and `activity-log/`
still use the pre-split `frontend/` and `backend/` paths.

| Area | Path |
|---|---|
| Frozen plan | `specs/native-auth.md` |
| Follow-up 01 | `specs/native-auth-followup-01.md` |
| Follow-up 02 | `specs/native-auth-followup-02.md` |
| Browser tests | `tests/specs/native-auth.spec.ts` |
| API tests | `tests/api/native-auth.spec.ts` |
| Follow-up tests | `tests/api/native-auth-followup-0{1,2}.spec.ts` |
| Test helpers | `tests/support/` |
| Mail-policy evidence | `tests/playwright.mail-policy.config.ts`, `tests/supporting/mail-policy.spec.ts` |
| Backend | `../ai-runtime-governance-backend/` |
| Frontend | `../ai-runtime-governance-frontend/src/` |
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
