# Session progress: native-auth Phase 4 readiness

Started: 2026-11-01. Supersedes
[SESSION-PROGRESS-2026-10-30-1835.md](./SESSION-PROGRESS-2026-10-30-1835.md) as the
current resume point. The older handoff and readiness audit are historical.

Status: **Native-auth Phase 9 API implementation is complete for product behavior
(44/48 original + follow-up-01). The frontend is implemented and **31/49 Browser
SCNs pass**; the remaining failures are UI/flow and test-framework issues. Two
test-oracle follow-ups remain (037/092).**

## 1. Verified snapshot

Read-only checks at the start of this session:

| Check | Result |
|---|---|
| Requirements SHA-256 | `EA0A567B471BE543F8EE7C337B367175B590AA08F19A6A8625137EEA9361B4F1` |
| Technical baseline SHA-256 | `09C0C8213A7165F7486C6C48BB349434EAB304901D2F9D47DE015BC60AA49A16` |
| Decision record SHA-256 (at session start) | `CED75280EA062B1FD55C797A1E8BDE8B07F2F93C515B45FADCDE3AE8BAD32B18` |
| Decision record SHA-256 (after DR-039) | `3A5BDBE572FFDE33089660B170BAC8BB32E64B3546429178A1A37B59236C956E` |
| Intent v0.1 | `5AB84C0B99BDCAB8BF9C419AF6E55C958D1B159E8FFB155F7DE926EA042E6981` |
| Intent v0.2 | `7FD646D33431671BED907282FE7735DA1F1E6427BECF0A9AD8B019B8A368EE99` |
| Intent v0.3 | `C78BDBA0B2839F9D907159D4C60391B85EBFC119ADC5CF531629F9B4662A7F67` |
| Intent v0.4 | `40761C1AD0C1233339B301F17DF6D483B4D6078D6B2CA4D5AB3BC4E62F1622EE` |
| Native-auth scenario IDs | 94 unique, SCN-native-auth-001 through -094 |
| Scenario/outline blocks | 94 |
| Active `@unspecified` tags | 0 |
| Global requirement rows | 75 (43 confirmed / 10 proposed / 22 deferred) |
| Timeline scenario IDs | 30 |
| Guard-core scenario IDs | 29 |
| Git state | clean at `81bfeaf` before these edits |

All fingerprints matched the recorded values. These are document checks, not
runtime results.

## 2. Confirmed decisions that must not be reopened

DR-001 through DR-038 remain authoritative. In particular:

- DR-033/034/037/038 approve intent v0.1–v0.4 at the fingerprints above.
- The v0.3 profile approves Argon2id profiles, bounded hash work, recovery
  verifiers, seed encryption/randomness, rolling-window admission, mail bounds,
  trusted-proxy source identity and the evidence inventory.
- The v0.4 addendum rejects CR/LF in passwords as a browser constraint while
  keeping 12–128 code points and all other allowed content.
- DR-035 authorizes bounded project-local tools and downloads.
- DR-036 permits prerequisite implementation only after that increment's own
  design, freeze, genuine red acceptance and test lock.

## 3. Work performed this session

### Batch 1 — status reconciliation

- `native-auth/README.md`: status moved to DR-038, v0.3/v0.4 linked, 94/271 and
  zero-unspecified recorded, stale DR-034 wording preserved as history.
- `phase-1/README.md`: version 0.7, package-aware workflow-position table, current
  next decision.
- `native-auth/00-ingestion.md`, `01-decision-proposals.md`,
  `02-acceptance-plan.md`: status headers updated; approved/proposed distinction
  retained.
- `REMAINING-WORK-HANDOFF.md` and `10-full-phase1-readiness.md`: marked historical
  with the resolution path.
- `SESSION-PROGRESS-2026-10-30-1835.md`: left unchanged as the prior snapshot.

No approved intent file, scenario ID, requirement ID or decision record was
modified.

### Batch 2 — workflow guard adoption

- Added `package.json` with `ai:freeze`, `ai:lock-tests`, `ai:verify` and `test`.
- Copied `scripts/ai/freeze-guard.mjs`, `.ai/templates/*`, `.github/skills/*` and
  the guard's own test suite from the reusable workflow repository.
- Created `specs/`, `tests/specs/`, `tests/api/` and `tests/testdata/api/` without
  adding fake tests or a fake plan.
- `npm test`: **22/22 passed**. `npm run ai:verify`: "no frozen features".

### Batch 3 — project-local toolchain

| Item | Result |
|---|---|
| Eclipse Temurin JDK | 25.0.5+8, Windows x64; archive SHA-256 verified against the approved value |
| Maven | 3.9.16; archive SHA-512 verified against the approved value |
| Java runtime probe | `openjdk 25.0.5 2026-10-20 LTS`, Temurin 25.0.5+8 |
| Maven probe | Apache Maven 3.9.16 running on Java 25.0.5 |
| Playwright | `@playwright/test` 1.64.1 restored with lockfile |
| Chromium | Chrome for Testing 156.0.8078.4, build 1248; headless shell installed |
| Browser smoke | Launched headless Chromium and read a page title; exit 0 |
| OpenAPI tooling | `@redocly/cli` 2.72.1, `openapi-typescript` 7.13.0, TypeScript 5.9.3 |
| Generated types | 33,777 bytes from the draft contract; generation succeeded |
| Not installed | PostgreSQL, mail capture, application server, Maven Wrapper |

The Redocly lint parsed the contract successfully but reported 22 style errors
(missing operation `summary`) and 23 warnings (missing `license`, no explicit
`4XX` response). No `$ref` or schema parse failure occurred. These are Phase 4
contract-completeness gaps, not runtime results.

Evidence: [toolchain-baseline.json](../../local-env/evidence/toolchain-baseline.json).
Reproduction helper: [env.ps1](../../local-env/env.ps1).

### Batch 4 — native-auth Phase 4 contracts

Created:

- `native-auth/06-shared-checklist.md` — single contract source, transport,
  failure taxonomy, operation matrix, harness rules, ownership.
- `native-auth/07-ui-contract.md` — routes, context guards, exact copy, accessible
  locators, failure presentation, secret-display boundary.
- `native-auth/08-operator-contract.md` — local `arg-admin` commands, authority
  proof, audit record, exit codes, key lifecycle.
- `native-auth/09-scn-scope-map.md` — all 94 SCNs mapped to operations and a
  49 Browser / 45 API acceptance split.
- `native-auth/10-native-baseline.md` — verified toolchain, proposed pins,
  harness, quality gates.
- `native-auth/11-decision-proposals.md` — ten consolidated decisions.

Updated `contracts/native-auth.openapi.json`:

- operation summaries, license, explicit 4xx responses and failure headers;
- `x-failure-code-status` for the 15 codes;
- `x-contract-notes` naming the companion documents.

Validation:

- `npm run ai:contract`: Redocly valid, 0 errors / 0 warnings; TypeScript types
  generated at 57,292 bytes.
- The 94-row map contains every SCN exactly once (49 Browser / 45 API).
- Repository link check: 69 Markdown files, 480 local links, 0 problems.
- Guard tests: 22/22 pass.
- All seven source/intent fingerprints unchanged.

**Phase 4 is approved under DR-039.** The next step is Phase 6 review of the
Phase 5 design/task drafts and their six listed conflicts.

### Batch 5 — DR-039 approval and Phase 5 drafts

- Recorded **DR-039** with the ten approved Phase 4 choices.
- Contract moved to `0.2.0` / `x-review-status: reviewed` under DR-039, then to
  `0.2.1` by DR-040 (explicit 404 for `readEnrollment`); lint and type generation
  still pass.
- Updated the Phase 4 documents from "proposed" to approved under DR-039.
- Created `12-implementation-design.md`: schema, crypto, transactions, sessions,
  rate/cooldown/hash admission, mail pipeline, frontend structure, harness,
  quality gates and risks.
- Created `13-frontend-tasks.md` (7 tasks, all 49 Browser SCNs) and
  `14-backend-tasks.md` (13 tasks, all 45 API SCNs).
- Raised six explicit Phase 6 conflicts rather than inventing resolutions:
  `readEnrollment` no-operation status, Windows operator proof, `__Host-` cookie
  on loopback HTTP, PostgreSQL install form, mail-capacity definition and
  `host_audit.changed_fields` representation.

### Batch 6 — DR-040, Phase 7 freeze and Phase 8 red baseline

- Recorded **DR-040** approving the design/task package and all eight resolution
  choices; contract corrected to `0.2.1` for `readEnrollment` 404.
- Frozen [specs/native-auth.md](../../specs/native-auth.md) with all 94 SCNs,
  provenance hashes, state transitions, 22-operation API coverage, data plan,
  evidence location and sign-off. Guard manifest:
  `3929c8570bb2ad6b2409f95b75393a43851521f9aff42261e7ca9e696cc699b5` (pre-lock
  link correction under DR-041; old hash `d03e6470…b7b5` retained in the
  evidence record).
- Built the feature-missing scaffold: Spring Boot 4.1.2 backend (health only) and
  React/Vite frontend shell that explicitly says native auth is not implemented.
- Added Playwright config with `browser` and `api` projects, real servers, JSON
  report and capture disabled by default.
- Authored `tests/specs/native-auth.spec.ts`: **49 Browser SCNs**, literal tags,
  role/name locators, clock/fault helpers.
- Ran the browser project: **49 failed / 0 passed / 0 skipped**, every failure a
  missing approved heading or locator. Evidence:
  [execution-evidence.md](./native-auth/evidence/execution-evidence.md).
- `npm run ai:verify`: 49 browser tags recognized, 45 API SCNs still without
  tests; test lock blocked.
- Recorded DR-041 and corrected the frozen-plan provenance links only; re-froze
  at `3929c8570bb2ad6b2409f95b75393a43851521f9aff42261e7ca9e696cc699b5`.
- Authored `tests/api/native-auth.spec.ts`: **45 API SCNs**, literal tags, real
  HTTP/Mailpit/control assertions. Ran the API project: **45 failed / 0 passed**,
  every failure an expectation mismatch from the absent API.
- Added the test-only control contract and the feature-missing `arg-admin` stub.
- `npm run ai:lock-tests native-auth` → **locked 2 test files**;
  `npm run ai:verify` → `native-auth: OK`.

### Batch 7 — Phase 9 implementation (blocked)

Implemented so far:

- Installed project-local PostgreSQL 17.6 and Mailpit 1.32.0 under `.local-tools`.
  PostgreSQL 18.6 backends crash on this host (`0xC0000142`); 17.6 runs.
  Recorded as GAP-NA-011.
- Created `governance` database; Flyway `V1__auth_core.sql` migrated all 16 tables.
- Added JDBC/Flyway/mail/BouncyCastle dependencies and Spring Boot 4.1.2 config.
- Implemented: account/session/link/mail/operation/seed/recovery persistence;
  Argon2id current/predecessor and bounded hash admission; opaque tokens; TOTP;
  AES-256-GCM seed/mail-token encryption; recovery verifiers; session/CSRF/context;
  registration/verification/reset/sign-in/set-up/account/password services;
  enrollment/replacement/regeneration; test-only control surface; test reset
  reporter.
- `GET /api/v1/auth/context` returns anonymous context; Flyway migrates cleanly;
  `SCN-native-auth-012` and `SCN-native-auth-083` pass.

**Blocker (GAP-NA-010):** locked tests reuse the TOTP step that enrollment or
replacement completion just consumed, then sign in with the same code. The
backend correctly rejects the replay (`401`), but the tests expect `200`.
Examples: 033, 039, 041, 057, 089. The implementation must not weaken the
approved per-step replay rule to satisfy a defective test.

**Resolution:** DR-043 authorizes a separate follow-up. `specs/native-auth-followup-01.md`
and `tests/api/native-auth-followup-01.spec.ts` are frozen/locked; **3/3 pass**
(033, 057, 089). Original 039/041 remain browser-blocked until the frontend.

**Current API result:** **44/48 original + follow-up-01 tests pass.** Remaining
original failures: 037, 057, 073 and 092. 073 now passes in follow-up 02; 057 is
covered by follow-up 01. Follow-up 02 is frozen/locked at 1/3: 037 advances past
the SETUP session expiry, and 092 hits the mail-identity 60-second limit. These
are test setup defects, not product bugs.

**Next:** fix the browser-suite failures (GAP-NA-021), especially the term
locator limitation, status/copy/navigation flows, replacement/regeneration
timeouts and SCN-062; then a third test follow-up for 037/092. PostgreSQL 17.6 is
the accepted local deviation under DR-042.

### Batch 8 — frontend implementation

Implemented `frontend/src/api.ts`, `auth.tsx` and `App.tsx`:

- Session/CSRF bootstrap, typed API client and `AuthProvider`.
- Routes: sign-in, register, verify, forgot/reset password, setup enrollment,
  restart, account, password change, authenticator replacement, recovery-code
  generation, signed-out.
- Exact copy/role locators from the UI contract, secret display, step-up dialog.
- Enrollment accepts the SCN oracle's code + acknowledgement (password optional
  server-side, recorded as a contract gap).

Verification:

- `npm run typecheck`, `npm run lint`, `npm run build` → pass.
- Full browser suite: **31/49 passed**, 18 failed.
- Failure clusters: term-role locators (001/002/003), clock/expiry plus TOTP
  offset (007/036/054/059), status/flow (015/030), line-break input (094),
  replacement/regeneration (038/039/041/046/047/048/050) and SCN-062's API-URL
  assertion.
- `npm run ai:verify` still OK; no locked test was edited.

## 4. Environment note

The previous session ran at `D:\Personal\ai-runtime-governance` with project-local
tools. This copy is at `C:\Users\pigcr\Documents\Workspace\ai-runtime-governance`
and initially had no `.local-tools`. Recorded at session start:

- `java` / `mvn`: not on PATH.
- Node 24.22.0, npm 11.19.1 (previous snapshot recorded Node 22.19.0 / npm 10.9.3).
- git 2.56.0.windows.2.
- No PostgreSQL, mail capture, application manifest or browser runner installed.

After Batch 3, project-local JDK 25, Maven 3.9.16, Playwright 1.64.1, Chromium
156.0.8078.4 and the contract tools are installed under `.local-tools` /
`.local-cache`. No global installation or PATH change was made. PostgreSQL and
mail capture remain not installed and are declared as such in the baseline
evidence; they belong to the harness batch.

## 5. Next gate

Implementation is blocked by **GAP-NA-010**: the locked tests reuse the TOTP step
that enrollment/replacement just consumed. A correct backend rejects the replay;
the tests expect success.

Choose one:

1. **Recommended:** authorize a follow-up plan that advances the controlled clock
   by one 30-second step before each distinct successful authentication, then
   re-freeze and re-lock the corrected tests. The product rule stays strict.
2. Explicitly exempt enrollment/replacement verification from replay consumption.
   This changes the approved DR-021/DR-037 rule and needs a new decision.

After the corrected suite is red/locked, continue Phase 9: finish the frontend,
replace the `arg-admin` stub, run the full 94-test suite, then Phase 10-12.
Do not edit the frozen plan or the locked tests directly.

## 6. Preservation rules

- Do not rewrite approved intent v0.1–v0.4.
- Do not renumber SCNs, weaken oracles or invent copy/limits.
- Do not claim a document check, generated type or seed as a runtime pass.
- Do not stage or commit.
- Keep Windows-with-WSL client setup explicitly user-performed and blocked.
