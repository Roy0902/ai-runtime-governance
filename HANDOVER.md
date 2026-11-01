# Cross-session handover

Updated: 2026-11-01. Use this as the first file in a new session.
Status: **API implementation complete for product behavior; frontend implemented;
acceptance suites partially green. Nothing is pushed.**

## 1. Read first

1. This file.
2. [Session progress](./spec-to-test-workflow/phase-1/SESSION-PROGRESS-2026-11-01.md).
3. [Gap register](./spec-to-test-workflow/phase-1/native-auth/evidence/gap-register.md).
4. [Decision record](./spec-to-test-workflow/phase-1/05-decision-record.md), especially DR-039–DR-043.
5. [Frozen plan](./specs/native-auth.md) and the two follow-ups.
6. [Test-only control contract](./tests/support/control-contract.md).

## 2. Repository state

- Branch `main`, clean working tree.
- `ahead 11` of `origin/main`; **do not push** unless explicitly asked.
- Last local commit: `4dcac68 [Docs]Record the session outcome and remaining gaps`.
- First commit `38d6727` is already on `origin/main`; do not amend or force-push it.
- Commit style: `[TaskType]Goal-oriented title`, e.g.
  `[Test]Correct the TOTP pacing and remaining test oracles`.
- No secrets are committed. `.local-cache/`, `.local-tools/`, `local-env/runtime/`
  and `frontend/dist/` are ignored.

## 3. Current results

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

## 5. Immediate browser work (18 failures)

Fix in this order — highest count first.

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

`SCN-094`: the test sets `input.value` directly. React's controlled input may not
observe that value. Use `onInput` and read the native value, or an uncontrolled
input, without weakening the server rule.

### 5.5 API URL assertion (1)

`SCN-062`: the test navigates to the JSON API and expects “Not found”. This is a
test defect; correct it in a follow-up rather than shaping the API response.

### 5.6 Term locator (3)

`SCN-001`, `002`, `003`: Playwright 1.64.1 `getByRole('term', { name })` returns
zero even with exact text and `aria-label` (`GAP-NA-020`). Use
`getByRole('term').filter({ hasText })` in a test follow-up.

## 6. Immediate API/test-oracle work

- **037:** advancing 24h expires the `SETUP` session, so completion returns 401
  before the operation 410. Correct the setup (refresh the session or shorten the
  operation deadline) in a follow-up.
- **092:** reset immediately after registration hits the mail-identity limit.
  The test-profile limit is now 100/min, so rerun first; if it still fails,
  advance the clock before the reset request.
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

1. Start PostgreSQL 17.6 and Mailpit, then run the replacement/regeneration
   cluster (`038/039/041/046/047/048/050`) and fix the UI transitions.
2. Rerun follow-up 02 and the remaining API cases; confirm whether the mail-limit
   change fixed 092.
3. Create a test-only follow-up for 037, 062 and the `term` locator, then return
   to the browser suite.
