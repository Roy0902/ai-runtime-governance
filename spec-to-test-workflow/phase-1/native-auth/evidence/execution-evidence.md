# Execution Evidence: native-auth

Mutable execution record outside the frozen plan. Preserve chronological entries;
append corrections instead of overwriting red history. No secrets or raw
sensitive payloads are recorded here.

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
