# Execution Evidence: native-auth

Mutable execution record outside the frozen plan. Preserve chronological entries;
append corrections instead of overwriting red history. No secrets or raw
sensitive payloads are recorded here.

## Continuation verification: 2026-11-02

This section records a focused continuation, not a new whole-suite pass or
completion of native auth. Historical runs below remain unchanged.

### Environment actually restored on this checkout

- Used the existing checksum-verified nested Temurin 25.0.5+8/Maven 3.9.16
  installations; `local-env/env.ps1` now discovers either reviewed local layout.
- Restored project-local Node 24.22.0 against its published SHA-256
  `f9683a19877e12a9b167305c8db71040d812876359de21f0d2e97c3f321f80c3`.
- Restored existing root/frontend lockfiles with `npm ci`; did not update
  dependency versions or manifests to bypass checks.
- Restored Mailpit 1.32.0 against its release SHA-256
  `16915767a6c95dca569336e8f561f91cf355e9a33c57b91deedcc10a4bba7fd4`;
  native version command passed.
- Restored approved local PostgreSQL 17.6 from the vendor HTTPS binary archive.
  Recorded archive SHA-256
  `D378882ABD001A186735ACD6F6BA716BCA6CCD192E800412D4FD15ED25376B3E`
  is an observed archive hash, not independently authenticated vendor metadata.
  Extracted runtime bin/lib/share; no global installation.
- Initialized only the new task-owned
  `local-env/runtime/resume-20261102/pgdata`, loopback port 55434, 20 connections,
  64 MiB shared buffers. Native readiness and database/version queries passed.
  Existing unrelated databases were not reset.

### Reproduced defects and surgical fixes

1. Native JUnit baseline for session handling: five tests, three failures.
   Settings rotation created a fresh original lifetime/recent confirmation;
   expired human authority could be rotated; exact ten-minute confirmation was
   rejected. Added a distinct `rotateForSettings` path preserving original
   creation/absolute/recent timestamps, bounding renewed idle/cookie lifetime and
   rejecting expired authority. Fresh sign-in/initial enrollment retains its
   separate new-lifetime transition. Wired password, authenticator replacement
   and standalone regeneration to the retaining path.
2. Initial browser run did not reach any scenario: backend aggregate health
   waited for SMTP, but Playwright started Mailpit only after backend readiness.
   Direct backend startup returned health 503 before Mailpit and 200 after it.
   Fixed Mailpit-before-backend ordering and absolute local tool paths; no health
   check was suppressed. Backend reuse is disabled so the generated per-run
   control token cannot accidentally bind to an older server.
3. Focused locked browser baseline: 038/059 failed; 056/058 passed. Cancellation
   left no sign-out control outside Account; bodyless sign-out lacked the JSON
   content type and returned 415. Reproduced the client header failure in a
   supporting test, then fixed mutation headers and shared authenticated
   navigation with explicit sign-out error presentation/context refresh.
4. Regeneration baseline: 046/047/050 passed; 048 failed because reload discarded
   completion status. Persisted only an account-namespaced nonsecret operation
   ID in session storage; reload obtains actual own-operation metadata. No seed,
   provisioning URI, recovery code, credential or human-session token is stored
   there. Completion/cancellation errors are explicitly presented.

### Commands and final focused results

Working directory: `D:\Personal\ai-runtime-governance`, unless noted. Dot-source
`local-env/env.ps1` in each new shell. Maven uses the project-local installation,
isolated `local-env/measurements/settings.xml` and `.local-cache/m2`.

| Check | Command / selector | Actual result |
|---|---|---|
| Supporting session regression | Maven `-f backend/pom.xml -Dtest=SessionServiceTest test` | **7/7 passed** after fixes; includes initial enrollment, retained lifetime/recent auth, exact ten-minute boundary and expired authority |
| Backend package | Maven `-f backend/pom.xml package` | **Passed**, with 7 supporting tests; Java 25/Boot 4.1.2 |
| Client supporting tests | Node 24 `--test tests/supporting/api-client.test.mjs` | **2/2 passed**; mutation headers versus nonmutating context request |
| Locked session/settings browser cases | Playwright browser grep `SCN-native-auth-(038\|056\|058\|059)` | **4/4 passed** |
| Locked regeneration browser cases | Playwright browser grep `SCN-native-auth-(046\|047\|048\|050)` | **4/4 passed** |
| Existing locked pacing follow-up | Playwright API `tests/api/native-auth-followup-01.spec.ts` | **3/3 passed** |
| Real-database supporting session invariants | Playwright `--project=supporting-api` | **3/3 passed**: password change/replacement/regeneration retain exact creation/absolute/recent timestamps and revoke an independently authenticated second session |
| Frontend native quality | `npm run lint`, `npm run build` in frontend | **Passed**; build includes `tsc --noEmit` |
| Existing workflow guard tests | Node `--test tests/freeze-guard.test.mjs` | **22/22 passed** |

These are eight selected original Browser SCNs, not a rerun of all 49. The three
new API checks are supporting tests outside locked acceptance paths and have no
SCN tags; they do not supply missing acceptance coverage.

### Still blocked, not made green

- Reproduced locked 039: completion succeeded, but the subsequent fresh login
  reuses its consumed TOTP step. Preserve strict replay; use DR-043's reviewed
  follow-up path, not a product exemption.
- Reproduced locked 041: its local clock advance does not synchronize the shared
  TOTP helper; step-up cannot receive the intended current code. Do not remove
  the reauthentication requirement or widen TOTP windows to pass the setup.
- Locked 037/092 and other source-confirmed fixture/locator/input issues retain
  their review/follow-up requirements. No original plan, manifest or locked test
  was modified, skipped in source, re-frozen or re-locked.
- The test profile's relaxed mail limits were NOT corrected or presented as
  verification of default production rates in this focused batch.
- The predecessor-rehash/reset race and latest-state commit checks remain
  unfinished. Successful session regression checks do not prove every concurrent
  account/factor transition.
- Mockito on Java 25 reports dynamic-agent self-attachment warnings. Supporting
  tests pass; no warning suppression or global JVM configuration was added.
- No full acceptance result, accessibility completion, as-built review or
  entire-Phase-1 readiness is claimed.

## Identity

- Frozen plan: [specs/native-auth.md](../../../../specs/native-auth.md) @ `3929c8570bb2ad6b2409f95b75393a43851521f9aff42261e7ca9e696cc699b5` (re-frozen under DR-041; previous hash `d03e6470b12957cef0794dd7601784a0f63c476bbdfee68b60a33c3af7d0b7b5`; previous manifest preserved as `native-auth.freeze.v1.json`)
- Feature manifest: [specs/native-auth.freeze.json](../../../../specs/native-auth.freeze.json)
- Acceptance files:
  - `tests/specs/native-auth.spec.ts` @ `E71A14B6769F4C97E1834D7D8D99A721B91515D1F64C674D629A13230E0793C1` (49 Browser SCNs)
  - `tests/api/native-auth.spec.ts` @ `3E0BF48F34CA1F5DCD3B7041E25E029D9CC8F5ECB3A2B8C173B2787B29EBD631` (45 API SCNs)
- Reviewed design: [12-implementation-design.md](../12-implementation-design.md), approved DR-040
- Existing historical evidence: none

## Red acceptance runs (Phase 8)

Scaffold versions: Spring Boot 4.1.2 on Temurin 25.0.5+8; React 19.3.1 /
Vite 8.3.5 / TypeScript 5.9.3; Playwright 1.64.1; Chromium 156.0.8078.4.

Command (working directory `C:\Users\pigcr\Documents\Workspace\ai-runtime-governance`):

```powershell
npx playwright test --config tests/playwright.config.ts --project=browser
```

Result: **49 failed, 0 passed, 0 skipped**, duration 343,741 ms. The frontend
serves the honest feature-missing shell: `AI Runtime Governance` /
`Native authentication is not implemented yet.` Every failure is a missing
approved heading, role or copy string, not a runner, server or database failure.
Raw report: `.local-cache/playwright-report.json`.

| Run / timestamp | SCN | Failure and feature-missing reason |
|---|---|---|
| red-001 | SCN-native-auth-001 | `/register` has no `Create account` heading |
| red-002 | SCN-native-auth-002 | `/register` has no `Create account` heading |
| red-003 | SCN-native-auth-003 | `/register` has no `Create account` heading |
| red-004 | SCN-native-auth-004 | `/register` has no `Create account` heading |
| red-007 | SCN-native-auth-007 | `/register` has no `Create account` heading |
| red-008 | SCN-native-auth-008 | `/register` has no `Create account` heading |
| red-009 | SCN-native-auth-009 | `/register` has no `Create account` heading |
| red-013 | SCN-native-auth-013 | `/register` has no `Create account` heading |
| red-015 | SCN-native-auth-015 | `/register` has no `Create account` heading |
| red-017 | SCN-native-auth-017 | `/register` has no `Create account` heading |
| red-020 | SCN-native-auth-020 | `/register` has no `Create account` heading |
| red-021 | SCN-native-auth-021 | `/register` has no `Create account` heading |
| red-022 | SCN-native-auth-022 | `/register` has no `Create account` heading |
| red-023 | SCN-native-auth-023 | `/register` has no `Create account` heading |
| red-025 | SCN-native-auth-025 | `/register` has no `Create account` heading |
| red-026 | SCN-native-auth-026 | `/register` has no `Create account` heading |
| red-027 | SCN-native-auth-027 | `/register` has no `Create account` heading |
| red-028 | SCN-native-auth-028 | `/register` has no `Create account` heading |
| red-029 | SCN-native-auth-029 | `/sign-in` has no `Sign in` heading |
| red-030 | SCN-native-auth-030 | `/register` has no `Create account` heading |
| red-031 | SCN-native-auth-031 | `/register` has no `Create account` heading |
| red-032 | SCN-native-auth-032 | `/register` has no `Create account` heading |
| red-034 | SCN-native-auth-034 | `/register` has no `Create account` heading |
| red-035 | SCN-native-auth-035 | `/register` has no `Create account` heading |
| red-036 | SCN-native-auth-036 | `/register` has no `Create account` heading |
| red-038 | SCN-native-auth-038 | `/register` has no `Create account` heading |
| red-039 | SCN-native-auth-039 | `/register` has no `Create account` heading |
| red-040 | SCN-native-auth-040 | `/register` has no `Create account` heading |
| red-041 | SCN-native-auth-041 | `/register` has no `Create account` heading |
| red-042 | SCN-native-auth-042 | `/register` has no `Create account` heading |
| red-043 | SCN-native-auth-043 | `/register` has no `Create account` heading |
| red-044 | SCN-native-auth-044 | `/register` has no `Create account` heading |
| red-046 | SCN-native-auth-046 | `/register` has no `Create account` heading |
| red-047 | SCN-native-auth-047 | `/register` has no `Create account` heading |
| red-048 | SCN-native-auth-048 | `/register` has no `Create account` heading |
| red-049 | SCN-native-auth-049 | `/register` has no `Create account` heading |
| red-050 | SCN-native-auth-050 | `/register` has no `Create account` heading |
| red-051 | SCN-native-auth-051 | `/register` has no `Create account` heading |
| red-052 | SCN-native-auth-052 | `/register` has no `Create account` heading |
| red-053 | SCN-native-auth-053 | `/register` has no `Create account` heading |
| red-054 | SCN-native-auth-054 | `/register` has no `Create account` heading |
| red-055 | SCN-native-auth-055 | `/register` has no `Create account` heading |
| red-056 | SCN-native-auth-056 | `/register` has no `Create account` heading |
| red-058 | SCN-native-auth-058 | `/register` has no `Create account` heading |
| red-059 | SCN-native-auth-059 | `/register` has no `Create account` heading |
| red-060 | SCN-native-auth-060 | `/register` has no `Create account` heading |
| red-062 | SCN-native-auth-062 | `/register` has no `Create account` heading |
| red-063 | SCN-native-auth-063 | `/register` has no `Create account` heading |
| red-094 | SCN-native-auth-094 | `/register` has no `Create account` heading |

Reviewer note: all 49 red failures are feature-missing. No test failed because a
server, browser, database or mail sink was unavailable.

### API project red run

Command (working directory `C:\Users\pigcr\Documents\Workspace\ai-runtime-governance`):

```powershell
npx playwright test --config tests/playwright.config.ts --project=api
```

Result: **45 failed, 0 passed, 0 skipped**, duration 31,612 ms. Every failure is
an expectation mismatch caused by the absent API: expected `202`/`200`/`201`/
`400`/`429`/`503`, received `404`. No test failed on a control connection or a
missing Mailpit after the first product assertion. Raw report:
`.local-cache/playwright-report.json`.

Reviewer note: the API run is feature-missing. The test-only control surface
described in `tests/support/control-contract.md` is not implemented yet, so the
first product assertion fails before any control call.

## Test lock

`npm run ai:lock-tests native-auth` → **locked 2 test files**.

Manifest: `specs/native-auth.freeze.json`, locked at 2026-11-01T11:38:50.416Z.
`npm run ai:verify` → `native-auth: OK`.

## Subsequent verification

| Run / timestamp | Check / scope | Command and working directory | Artifact identity | Result | Evidence / disposition |
|---|---|---|---|---|---|
| 2026-11-01 | Contract and types | `npm run ai:contract` (root) | contract `0.2.1` | pass | Redocly valid 0/0; types 57,292 bytes |
| 2026-11-01 | Workflow guard | `npm run ai:verify` (root) | plan + locked tests | pass | 94/94 tagged; lock verified; `native-auth: OK` |
| 2026-11-01 | Backend scaffold build | `mvnw -q -DskipTests package` (backend) | backend jar | pass | Spring Boot 4.1.2 starts; health UP |
| 2026-11-01 | Frontend checks | `npm run typecheck`, `npm run lint`, `npm run build` (frontend) | dist | pass | Feature-missing shell builds |
| 2026-11-01 | Backend implementation | `mvnw -q -DskipTests package` (backend) | backend jar | pass | Flyway V1 applied; context 200; 2/45 API tests pass |
| 2026-11-01 | API acceptance full run | `npx playwright test --project=api` (root) | locked tests | partial | **32/45 passed**. Remaining: 016, 037, 065, 068, 069, 071, 072, 073, 079, 082, 085, 086, 092, plus follow-up ordering |
| 2026-11-01 | Host CLI smoke | `arg-admin totp-key status` (root) | backend jar | pass | JSON status, exit 0 |
| 2026-11-01 | TOTP pacing follow-up | `npx playwright test --project=api --grep "TOTP pacing follow-up 01"` | follow-up plan + lock | pass | **3/3 passed**: 033, 057, 089 |
| 2026-11-01 | Test-oracle follow-up 02 | `npx playwright test --project=api --grep "test-oracle follow-up 02"` | follow-up plan + lock | partial | **1/3 passed** (073); 037/092 fail on test setup (session expiry, mail-identity limit) |
| 2026-11-01 | Browser full run | `npx playwright test --project=browser` (root) | locked tests | partial | **31/49 passed**. Remaining: term locator, clock/expiry, status flow, line-break input, replacement/regeneration, SCN-062 |

## Reviews, gaps, and completion

- Maintainability: not yet reviewed; implementation has not started.
- Shared helpers/configuration: no disabled suites, weakened assertions or
  mocked successful screens. The frontend shell explicitly says native auth is
  not implemented.
- Accessibility: deferred to Phase 11; browser suite uses role/name locators.
- Requirement results: 49 Browser SCNs red for feature-missing; 45 API SCNs red
  for feature-missing; both files locked.
- Gaps and blocked work: 44/48 API + follow-up-01 pass; follow-up-02 1/3. The
  frontend is implemented and **31/49 Browser SCNs pass**. Remaining: term-role
  locator limitation, clock/expiry plus TOTP offset, status/flow, line-break input,
  replacement/regeneration and SCN-062. 037/092 need a third test follow-up.
  GAP-NA-011 is the accepted PostgreSQL 17.6 deviation.
- As-built comparison: not yet applicable.
- Final status: **API complete for product behavior; frontend at 31/49. No full
  acceptance pass. Do not edit frozen plans or locked tests.**

## Follow-up 03 and focused regression: 2026-11-02

The November 1 totals remain historical and are not replaced with a claim that
the original frozen plan is wholly green. All frozen artifacts were verified
unchanged before/after this work.

### Frozen follow-up 03

- Plan: `specs/native-auth-followup-03.md`.
- Plan normalized SHA-256:
  `4ab64c2c787d4de88a5fc2b68447a1d356e69ed2463ee47b952b45c49acf6905`.
- Frozen at `2026-11-02T08:34:30.375Z`; locked at `2026-11-02T09:48:48.371Z`.
- Locked API test normalized SHA-256:
  `06748abe67ce3073966a2ee21a9d8ef8818661f11ccb915d149d0df52f5b830a`.
- Locked browser test normalized SHA-256:
  `ea61fc9e6aa7ee321e40a5a21f9f88761ee5dac4ebaf563947a45f512a27c927`.
- Full F03 API run: **6/6 passed**: 007, 036, 037, 062, 092 and 094.
- Full F03 browser run: **6/6 passed**: 001, 015, 039, 041, 054 and 058.
- Canonical `ai:verify`: native-auth and follow-ups 01/02/03 all `OK`.

These are corrected post-freeze setups/framework evidence and regression checks.
They are not falsely represented as a new feature-missing red baseline because
the native-auth implementation already existed. Existing original/follow-up plan
and test bytes were not edited.

### Additional focused evidence

| Check | Result |
|---|---|
| Maven backend package/supporting tests | Pass; 10 JUnit tests, including 3 stale-account/session-finalizer cases and 7 session boundary/rotation cases |
| Frontend lint/typecheck/build | Pass |
| Root workflow/freeze guard plus API client tests | 24/24 pass |
| OpenAPI contract validation/type generation | Redocly 0 errors/0 warnings; 57,292 generated TypeScript bytes |
| Real-PostgreSQL session lifecycle supporting checks | 3/3 pass for password change, factor replacement and recovery-code regeneration |
| Real-PostgreSQL multi-account supporting check | 1/1 pass |
| Earlier focused locked browser regressions | 12 passes across settings/sign-out and recovery/regeneration clusters, including original 038/046/047/048/050/056/058/059 |
| Existing locked TOTP pacing follow-up 01 | 3/3 pass |

### Product fixes verified

- Settings-session rotation retains the original creation/absolute/recent-auth
  timestamps, renews only idle time and clips the cookie lifetime to the original
  absolute deadline. An expired session or confirmation cannot be revived.
- The final authentication step locks/rechecks account version and eligibility
  before consuming the factor and creating authority. A lost predecessor rehash
  CAS returns a generic sign-in failure rather than continuing to a session.
  The F03 test-profile barrier deterministically raced a real verified-email
  reset against the old credential attempt; reset remained current and only the
  new password/fresh factor created a session.
- Settings pages have shared sign-out navigation; bodyless sign-out uses the
  required JSON content type and explicit error handling.
- Recovery-code generation uses only the nonsecret operation ID in session
  storage and reads real own-operation metadata after reload. Raw codes remain
  one-display-only.
- Initial enrollment reload first reads the existing pending operation. Existing
  secret-bearing operations show the approved already-shown state; they are not
  re-created/redelivered.
- Duplicate registration helper no longer resets the account under test.

### Local test infrastructure

- PostgreSQL 17.6/PostgreSQL 17.6 database, Mailpit and the application/frontend
  use the isolated local runtime and dynamic free ports. An unrelated local
  Tomcat on port 8080 was preserved; tests used separate loopback ports.
- The test profile is loopback-only. A nonsecret test-clock snapshot in ignored
  runtime files keeps Node TOTP calculation synchronized with browser-driven
  server-clock changes. Per-run control token is random; backend reuse is off.
- F03 acceptance controls are test-profile-only and absent from product OpenAPI.
  The predecessor race barrier pauses at most ten seconds, exposes only boolean
  wait status, and is released on reset/release.
- Task-owned services were stopped after verification. No global installation,
  production credential, real outbound email, secret export, commit or push.

### Remaining work and honest limits

- Full original `native-auth` Browser/API suites have **not** been rerun after
  follow-up 03; do not aggregate selected follow-up green into a whole original-
  plan pass.
- Original SCN-094's browser setup is still historically defective; F03 tests its
  raw line-break boundary through the API. Browser-native sanitization is not
  claimed to have submitted the original line-break value.
- Original/follow-up 02 locked files remain immutable; F03 provides corrected
  separate cases. Preserve the earlier red/run results.
- The test profile still raises mail identity limits to 100/minute and 1,000/hour.
  F03 does not establish real default 1/minute and 5/hour policy coverage.
- `ResetReporter.onTestBegin` is asynchronous and warns on reset failure; this
  remains a test-isolation risk for broad suite runs. F03 uses an awaited
  per-test reset. Full original-suite reset determinism still needs review.
- Whole-suite approved-default-policy verification, code review, accessibility,
  as-built diagrams and non-auth Phase 1 work remain incomplete. Windows/WSL
  client feasibility remains user-performed and externally blocked.

## Reset determinism and whole-suite rerun: 2026-11-02 (second continuation)

This section records the deterministic-isolation fix and the first clean
whole-suite rerun after follow-up 03. Historical results above remain unchanged.

### Harness changes

- Replaced the fire-and-forget `ResetReporter` with an awaited `test.beforeEach`
  in `tests/support/reset-hook.ts`. It calls `POST /__test/reset`, resets the
  controlled clock, and throws on any non-2xx response, so a dirty fixture fails
  the test instead of warning. `native-auth.ts` and `api.ts` import it; both
  modules drop themselves from the CommonJS module cache after each file loads so
  the hook registers for every test file in a worker. No locked test was edited;
  F03's explicit `beforeEach` remains and is idempotent.
- `tests/playwright.config.ts` now uses `process.execPath` when the flat
  `.local-tools/node-v24.22.0-win-x64/node.exe` is absent, so the frontend
  webServer starts on this checkout.
- The config exports `GOVERNANCE_TEST_FAULTS_FILE` and
  `GOVERNANCE_DISPATCH_FILE` to the test process and passes the same paths to the
  backend. `host()` now uses the same file-backed fault/dispatch state as the web
  process. This resolved 065, 071 and 072; they were harness path mismatches, not
  product defects.
- `tests/support/control-contract.md` documents `POST /__test/reset` and its
  destructive per-test barrier. `tests/support/reset-reporter.ts` was removed.

### Environment

- PostgreSQL 17.6 on `127.0.0.1:55434`, data `.local-cache/pgdata17`.
- Playwright started Mailpit, backend and frontend; per-run random control token.
- Backend built from `../ai-runtime-governance-backend`; frontend from
  `../ai-runtime-governance-frontend`.

### Results on this checkout

| Project / check | Result | Disposition |
|---|---|---|
| browser | **48 passed / 7 failed** (55) | original 42/49 + F03 6/6 |
| api | **52 passed / 5 failed** (57) | original 41/45 + F01 3/3 + F02 2/3 + F03 6/6 |
| supporting-api | **4/4** | multi-account 1/1 + session lifetime 3/3 |
| backend JUnit | **10/10** | AuthenticationFinalizer 3, SessionService 7 |
| guards/client | **24/24** | freeze guard + API client |
| frontend | lint, typecheck, build pass | — |
| contract | valid; 57,292 bytes generated | — |
| `npm run ai:verify` | all four features `OK` | — |

### Remaining failures and classification

Browser (all original locked cases):

- 001: `getByRole('term', { name })` limitation; F03 001 passes.
- 007: expired SETUP context; F03 007 passes.
- 015: mail supersession pacing; F03 015 passes.
- 039: consumed TOTP step reused; F03 039 passes.
- 054: recent-auth/idle setup; F03 054 passes.
- 062: HTML expectation on a JSON API; F03 062 passes.
- 094: the browser sanitizes CR/LF before the app observes it; F03 tests the raw
  API boundary. The original browser case remains invalid.

API:

- original 037 and follow-up-02 037: the SETUP session expires at the same
  24-hour deadline; F03 037 passes with a reacquired SETUP context.
- original 057: consumed TOTP step; follow-up 01 057 passes.
- original 073: reuses the authenticated `request` context; follow-up 02 073 uses
  a fresh session and passes.
- original 092: sequential, not the deterministic predecessor race; follow-up 02
  and F03 092 pass.

No remaining failure is a proven product defect. Do not edit the original plans
or locked tests to make these green; use the existing follow-ups.

### Still open

- Phase 10 maintainability review is not complete; the native checks above are
  green.
- Phase 11 accessibility and Phase 12 as-built remain.
- The split/reset work is committed and pushed; `split/frontend` and
  `split/backend` remain in the docs repository as local history.

## Approved default mail-policy evidence: 2026-11-02

The test profile intentionally relaxes mail-identity limits to 100/minute and
1,000/hour. This run proves the approved default policy separately without
changing the main suite profile.

- Config: `tests/playwright.mail-policy.config.ts`, which imports the main config
  and sets the backend env `GOVERNANCE_MAIL_IDENTITY_PER_MINUTE=1` and
  `GOVERNANCE_MAIL_IDENTITY_PER_HOUR=5`.
- Test: `tests/supporting/mail-policy.spec.ts` (supporting, no SCN tag).
- Command: `npm run test:mail-policy` from the docs repository root.
- Controlled clock: `2026-11-02T00:00:00Z`.
- Result: **1/1 passed** (22.5s).

Assertions:

- first issuance for the identity: `202`;
- second issuance in the same minute: `429` (proves 1/minute, not 100/minute);
- one issuance per minute for five total in the hour: `202` each;
- sixth issuance inside the rolling hour: `429` (proves 5/hour, not 1,000/hour);
- a different identity is still admitted: `202`;
- a case/whitespace variant of the first identity shares the bucket: `429`.

No product code changed. The main `test` profile remains relaxed for setup-heavy
acceptance; this isolated run is the default-policy evidence.

## Phase 10 maintainability review: 2026-11-02

Scope: native-auth backend/frontend, test-only controls, and the acceptance
harness. This is a static review plus the green native checks below; it is not a
new behavioral run.

### Checks

- Backend: `mvn -f ../ai-runtime-governance-backend/pom.xml test` → **10/10**.
- Frontend: lint, typecheck, build pass.
- Contract: Redocly valid; 57,292 bytes generated.
- Guards: `npm run ai:verify` all four features `OK`; `node --test` **24/24**.
- Live: browser 48/55, API 52/57, supporting 4/4, mail policy 1/1 (recorded
  above).

### Test-only control isolation

- `TestControlController` is guarded by
  `@ConditionalOnProperty(governance.test-control.enabled=true)`.
- Production defaults to disabled; the test profile enables it and binds
  `server.address=127.0.0.1`.
- Every control route checks the per-run `X-Test-Token`; Playwright generates a
  random token and disables backend reuse.
- The reset route is destructive but test-only; the awaited `beforeEach` runs it
  before each test and fails on any non-2xx response.
- No control route appears in the OpenAPI contract.

### Latest-state/concurrency review

- `AuthenticationFinalizer.complete` locks the account row (`FOR UPDATE`) and
  rechecks `version`, status, verified email, MFA state and recovery flag before
  factor verification and session creation. Good.
- `SessionService.rotateForSettings` preserves original creation/absolute/recent
  timestamps, clips idle to the absolute deadline and rejects expired authority.
  It reads the request-time session row rather than re-locking it, so a
  concurrent admin disable or two simultaneous settings rotations remain a
  narrow residual race. No deterministic repro was found; current tests do not
  prove every such interleaving.
- `AuthService.changePassword` performs an unconditional password update after
  recent-auth; concurrent changes are last-writer-wins. The account remains
  subject to the same session/status rules. No proven product defect.
- Controllers enforce CSRF and sensitive changes require recent auth; step-up is
  not bypassed.
- No product code changed in this review.

### Harness maintainability

- `tests/support/reset-hook.ts` relies on Playwright's CommonJS helper loading and
  drops itself from `require.cache` per file. A fail-fast guard now rejects an
  ESM migration instead of silently reducing isolation.
- `tests/playwright.mail-policy.config.ts` fails fast if it cannot find the
  test-profile backend server.
- The mail-policy sequence uses 9 of the separate 10/hour source-admission
  events; the test documents that budget so future additions split the case
  rather than hit an unrelated 429.

## Phase 11 accessibility: 2026-11-02

Scope: real browser against the running frontend, covering the approved role/name
contract, keyboard order, live error/status regions, and the step-up dialog.

- Config: `tests/playwright.a11y.config.ts` (imports the main config; one `a11y`
  project, desktop Chrome, frontend base URL).
- Test: `tests/supporting/accessibility.spec.ts` (supporting, no SCN tags).
- Command: `npm run test:a11y`.
- Result: **4/4 passed**.

Covered:

- register page: h1, named email/password controls, `role=alert` for validation,
  `role=status` for accepted registration;
- sign-in: linear Tab order email → password → authenticator → submit, and
  `role=alert` for sign-in failure;
- enrollment: h1, labelled manual key, recovery-code list, saved-codes checkbox,
  complete button;
- step-up: dialog is modal, focus starts on password, Shift+Tab wraps to Cancel,
  Escape cancels, and the page is usable again.

### Defect found and fixed

The step-up dialog used `<dialog open>`, which is non-modal: focus stayed on the
page behind, Shift+Tab fell to `<body>`, Escape did nothing, and the dialog
duplicated the page's h1. Fixed in the frontend repository with `showModal()`, an
explicit Tab/Shift+Tab focus loop, Escape/`cancel` handling, and an h2 dialog
heading (frontend commit `7437262`). The existing step-up browser cases
038/041/058/059 and F03 041/054/058 still pass; original 054 remains the known
pre-existing setup defect.

## Phase 12 as-built review: 2026-11-02

- As-built record:
  `spec-to-test-workflow/phase-1/native-auth/as-built/README.md`.
- Diagrams: component/context, registration and enrollment sequence, sign-in and
  sensitive-change sequence, account/MFA/session/operation states, and the core
  ERD.
- Drift register AB-001–AB-009. Key items: `web_session.csrf_token` is stored
  plaintext while the approved design says `csrf_hash`; the frontend is a compact
  `App.tsx` rather than separate route/copy modules; no Spring Security
  configuration (session/CSRF checks are explicit); the harness layout differs
  from design §14; virtual threads are not explicitly configured; PostgreSQL
  17.6 is the local baseline under DR-042.
- Verification snapshot: browser 48/55, API 52/57, supporting 4/4, mail policy
  1/1, accessibility 4/4, backend JUnit 10/10, guards/client 24/24.
- No product code, approved intent, frozen plan, manifest or locked test was
  changed. Drift findings are recorded for review, not silently accepted.

## Backend naming and DTO refactor: 2026-11-02

- Commit `b5fad17 [Refactor]Uppercase acronym type names and split API DTOs`.
- Acronyms in type names are uppercase: `AdminCLI`, `APIException`,
  `APIErrorHandler`, `TOTP`, and the `*DTO` response types. Packages, methods and
  fields keep Java lower-camel/lowercase conventions.
- The former `ApiDtos` container is gone; each of the 21 API request/response
  records now has its own file under `local/governance/api`.
- Behavior is unchanged: backend JUnit **10/10**, a real API smoke case
  (`SCN-native-auth-016`) passed, and `arg-admin totp-key status` returned JSON
  through the renamed `AdminCLI`.

## Timeline Phase 6 decision drafting: 2026-11-03

- The user approved the recommended directions for R-TL-001 traversal
  membership, R-TL-003 test harness and R-TL-005 shared schema; see DR-044.
- The user authorized drafting, not approving, exact SCN-031–038 wording for
  concurrent arrival, traversal expiry/limits, refresh failure, navigation
  races, pending continuation and accessibility.
- Updated the mutable timeline checklist, OpenAPI schema draft, implementation
  design, scenarios and frontend/backend task lists. Approved intent and prior
  scenario IDs were not changed.
- Reconciled the timeline design/task targets to the existing sibling app
  repositories (`src/App.tsx`, native-auth/session integration, backend
  `local.governance`, Flyway V1 and the existing test-control harness); no
  product source was changed.
- No plan freeze/lock, product implementation, application test, live service or
  acceptance run was performed. Exact scenario wording and remaining UI/status/
  toolchain/test-setup gates are still open.
- After the initial clean-worktree check, the user confirmed new frontend
  `App.tsx`/`styles.css` changes and `src/components/` / `src/features/` folders
  are their in-progress work. They were not inspected or modified here.

## Timeline preview and local readiness review: 2026-11-03

- Read-only review of the current frontend established a dev-only
  `/activity-preview` route backed by in-memory fixtures. It does not call
  timeline APIs or prove real auth/persistence. The authenticated `/activity`
  route uses the existing `AuthProvider` / `RequireHuman` boundary.
- Frontend checks against the user-owned worktree: `npm run lint` passed;
  `npm run build` (including `tsc --noEmit`) passed. No feature behavior or
  browser acceptance test was run.
- Found a preview/model discrepancy against SCN-030: a validated `linked`
  parent absent from the current page is represented/rendered as `unlinked`,
  conflating it with a genuinely unresolved parent. See the 2026-11-03 addendum
  in the [timeline review](../timeline/08-review.md).
- At the time of this review, route/deep-link behavior and absent-value copy
  were pending. DR-045 below records the user's subsequent decisions.
- Existing fixture-only continuation does not test the real cursor, pending
  state, refresh or request-race contracts.
- Runtime probe: Vite `/api` proxy is configured for `127.0.0.1:8080`. Browser
  `GET /api/v1/auth/context` returned 404; direct GETs to that endpoint and
  `/actuator/health` on port 8080 also returned 404. The listener uses Java 17
  and a Spring Boot 3.5.5 classpath, whereas the intended backend declares
  Java 25/Spring Boot 4.1.2. The listener was not started/stopped/modified. The
  user confirmed 8080 remains the target and deferred enforcing the mismatch at
  this stage; readiness is unverified and must be established before real-session
  acceptance.
- The frontend changes belong to the user. No application source was modified;
  no feature freeze/lock, backend implementation, or real persisted-data
  acceptance was performed.

## Timeline Phase 6 approvals: 2026-11-03 (continued)

- Under DR-045 the user approved the exact wording of SCN-031–038; the
  `/activity` list and `/activity/:traceId` detail route pattern; “Not reported”
  for omitted optional values and “Unavailable” for unavailable details; and
  traversal status/code mapping: 410 `TRAVERSAL_EXPIRED`, 429
  `TRAVERSAL_LIMIT` with `Retry-After`, and 422 `TRAVERSAL_TOO_LARGE`.
- Updated mutable decision, scenario, checklist, design/task documents and the
  OpenAPI draft accordingly. The full scenario set remains unfrozen/unexecuted.
- No production implementation, freeze/lock or backend process change was made.

## Timeline trace-list traversal decision: 2026-11-03

- Under DR-046 the user approved applying the same server-managed snapshot
  semantics, five-minute expiry, 10,000-member cap, shared five-active-per-
  account quota, and data-free deletion tombstones to trace-list pages.
- The user approved SCN-039 wording as written. Trace-list cursors now bind
  committed trace IDs at the first successful read; refresh begins a new
  traversal. SCN-031–039 remain unfrozen and unexecuted.
- Updated the decision record, scenario/checklist/design/task documents,
  OpenAPI draft, handover and review evidence. No product code or local service
  was changed.

## Timeline UI contract decisions: 2026-11-03

- Under DR-047 the user approved direct trace links for `/activity/:traceId`,
  collapsed event cards with keyboard-operable expand/collapse, localized
  medium date/time formatting in UTC, the prototype's “Activity” / “Traces” /
  “Timeline” headings and intro, and the proposed loading/empty/error/session
  copy.
- Updated the mutable UI contract and handover. Remaining metadata labels,
  error presentation for unspecified cases, focus/announcement details, and
  local backend readiness remain open.
- No frontend/backend source, tests, or runtime service were modified; no
  feature freeze, test lock, or real browser/backend acceptance was performed.

## Timeline remaining UI copy decisions: 2026-11-03

- Under DR-048 the user approved current prototype summary/event metadata labels
  and polite status messages for pending load-more, successful continuation and
  successful refresh.
- Updated the UI contract, decision record, review evidence and handover. Exact
  focus/keyboard details beyond the scenarios and backend/test readiness remain
  open. No source was changed.

## Timeline design reconciliation after frontend rename: 2026-11-03

- The user confirmed the frontend reorganization is intentional and requested
  read-only reconciliation. Current observed structure: `ApplicationEntry.tsx`,
  `ApplicationRoutes.tsx`, `ApplicationApiClient.ts`,
  `AuthenticationContext.tsx`, `ApplicationStyles.css`, `api-contracts/`,
  `components/layout/ApplicationShell.tsx`, and
  `features/activity-timeline/ActivityTimelinePage.tsx`,
  `ActivityTimelineModel.ts`, `ActivityTimelineTypes.ts`, and
  `ActivityTimelineFixtures.ts`.
- The dev-only preview still uses in-memory fixtures; it issues no timeline API
  reads. The current model still marks a linked event whose parent is outside
  the loaded page as unlinked. No source was changed.
- Current frontend `npm run lint` and `npm run typecheck` pass; the last
  production build predates the latest rename. The docs-repository
  `tests/supporting/api-client.test.mjs` still imports the removed `src/api.ts`;
  its focused run failed with module-not-found during this work. No source or
  test files were changed to mask that failure.

## Timeline Phase 6 document validation: 2026-11-03

- Redocly lint of the OpenAPI draft passed.
- `npm run ai:verify` passed for all frozen native-auth features.
- `node --test tests/freeze-guard.test.mjs` passed **22/22**.
- Scenario integrity check passed: original 30 scenarios unchanged; SCN-031–040
  present. The complete plan remains unfrozen/unexecuted.
- Current frontend lint and typecheck passed after the user-owned reorganization.
  The focused `tests/supporting/api-client.test.mjs` still fails because it
  imports the removed `src/api.ts`; it was left untouched.

## Timeline cursor error decision: 2026-11-03

- Under DR-049 the user approved HTTP 400 `REQUEST_INVALID` with a generic
  no-echo message for malformed, tampered, or wrong-scope cursors. Expired
  traversals remain 410; unowned/unknown trace identities remain 404.
- SCN-040 was drafted to assert this behavior and remains unapproved pending
  exact wording review. The schema and mutable checklists record the error
  policy; no acceptance tests or code were changed.

## Timeline SCN-040 approval: 2026-11-03

- The user approved SCN-040 wording as written. SCN-031–040 are now approved
  wording, but remain unfrozen/unexecuted.
- No code, tests, freeze, lock, or local runtime process was changed.

## Timeline metadata-boundary decisions: 2026-11-03

- Under DR-050 the user approved rejecting unsupported/content-bearing event
  fields as a whole with 400 `REQUEST_INVALID`, a generic field-category message,
  no echo and no persistence.
- The user approved nullable constrained extensible cause codes matching
  `[A-Z][A-Z0-9_]{0,63}`; unrecognized codes are labeled “Other reported cause”.
- Updated the decision record, mutable shared checklist, OpenAPI draft, backend
  task list, review and handover. No source was changed.
