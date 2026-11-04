# Handoff — remaining work

Updated: 2026-11-04. Companion to the historical [HANDOVER.md](./HANDOVER.md).
This file logs the current state and the remaining development work only.

## 1. Current state

The backend worktree has uncommitted guard-detector implementation and test
changes; the frontend worktree remains clean. The docs branch was in sync with
upstream before the current evidence/handoff updates; those docs and new
acceptance artifacts are uncommitted. The original frozen plans and locked
tests remain unchanged. The table records the last development commit in each
repository.

| Repository | Last development commit | Push state |
|---|---|---|
| `ai-runtime-governance` (docs) | `42f5809 [Test]Freeze and verify the guard decision core` | branch was synced; current evidence/spec/test edits uncommitted |
| `ai-runtime-governance-backend` | `768821b [Feature]Implement the guard decision core` | pushed base; detector implementation/tests uncommitted |
| `ai-runtime-governance-frontend` | `6602e2b [Feature]Handle traversal tombstones in the timeline UI` | pushed |

Frozen features (`npm run ai:verify` → all OK):

1. `native-auth` + follow-ups 01–05
2. `activity-timeline-slice`
3. `activity-timeline-read-ui` + follow-up 01
4. `activity-timeline-traversal` + follow-up 01
5. `activity-timeline-ingestion`
6. `guard-decision-core`
7. `guard-sensitive-data-catalog`
8. `guard-injection-literals`
9. `native-auth-followup-05`

Latest recorded results:

| Gate | Result |
|---|---|
| Timeline + guard API | **28/29** — only the known locked SCN-031 defect |
| Timeline browser | **11/11** on the last run; original SCN-037 is still flaky |
| Guard core | 9/9 |
| Backend JUnit | **24/24** |
| Guard core + sensitive-data detector API | **13/13** |
| Guard core + sensitive-data + injection API | **16/16** |
| Corrected native-auth browser follow-up 05 | **5/5** |
| Frontend typecheck / lint / build | pass |
| `npm run ai:verify` | all **15** frozen features OK |
| Native-auth focused recheck after the enrollment fix | SCN-002/003/004/008 4/4 |
| Native-auth full API + browser rerun on port 18080 | **92/112**; 20 failures, including 8 not in the prior failure register |
| Focused triage of the six additional original browser cases | **5 failed, 1 passed**; likely test-ordering/precondition issues, see execution evidence |
| Corrected SCN-034 follow-up on port 18080 | **1/1 passed**; follow-up 04 frozen and locked |

Implemented: native auth; timeline read list/detail; traversal snapshots with
expiry/caps/tombstones; trusted ingestion with idempotency/conflict; guard
decision core; a sensitive-data-first detector catalog; and literal-only
prompt-injection indicators requiring approval, available through the
test-only `/__test/guard/detect` harness. No production guard/gateway forwarding
is implemented.

## 2. Known locked-test defects (do not edit)

| Original test | Defect | Covered by |
|---|---|---|
| `SCN-activity-timeline-031` in `tests/api/activity-timeline-traversal.spec.ts` | Expects the 201st event on the refreshed 200-event first page | `activity-timeline-traversal-followup-01` |
| `SCN-activity-timeline-037` in `tests/specs/activity-timeline-read-ui.spec.ts` | `getByText('event 200')` can also match an `Expand event 200...` UUID button | `activity-timeline-read-ui-followup-01` |
| Native-auth browser 001/007/015/039/054/062/094; API 037/057/073/092 and follow-up-02 037 | Recorded in `HANDOVER.md` and the gap register | Reproduced in the 2026-11-04 rerun; see execution evidence |

A corrected test that is already green is an existing-behavior baseline, not a
weakened oracle. Never edit a locked file to make it pass.

## 3. Remaining work, ordered

1. **Native-auth rerun triage.** The full API/browser rerun completed on port
   18080: 92/112 passed. Focused triage found the reset and replacement browser
   cases lack explicit completion waits; SCN-031/036 omit the Password field;
   SCN-063 passed in isolation. The user confirmed password remains required;
   corrected SCN-034 setup is covered by frozen/locked follow-up 04 (1/1).
   The remaining timing/setup candidates are covered by frozen/locked
   follow-up 05 (5/5). Preserve all original locked tests. API SCN-077 still
   needs an approved `local-env/runtime/key2.bin` fixture procedure; the full
   native-auth disposition remains 92/112 until original locked failures are
   retired by reviewed follow-up or otherwise resolved.
2. **Timeline cleanup.** Decide whether to retire the two superseded locked
   tests (031 and 037) through a reviewed follow-up, so the suite no longer
   carries a known red/flaky case. Do not edit them directly.
3. **Production ingestion and event credentials.** Replace the test-only
   `/__test/timeline/ingest` path with an authenticated event-reporting contract:
   account-scoped ingestion tokens, separate from gateway/provider keys, with
   issuance, storage, rotation, revocation and rate limits. **Blocked on
   OD-01/OD-05/OD-11 decisions.**
4. **Complete guard catalog and integration.** Sensitive-data detectors and
   literal-only prompt-injection indicators are frozen and verified.
   Unsafe-content and invalid/weak-prompt rules, user rule enablement, and
   production gateway integration remain. A semantic classifier was requested,
   but runtime/provider and prompt-data policy are undecided; do not implement
   model-backed detection or send prompts to an external service yet.
5. **Approval delivery.** Submitter-only approval UI bound to the exact message,
   with cancellation, expiry and no forwarding without a decision.
6. **Gateway integration.** Provider-compatible forwarding that runs the guard
   before dispatch, uses a separate upstream key, observes responses, and never
   falls back to a direct provider on failure.
7. **Client integration.** OpenCode CLI/TUI and VS Code Copilot BYOK; Windows with
   WSL; at least one fully verified guarded integration for release.
8. **Tombstone browser acceptance.** Traversal tombstones are covered at the API
   level; add browser coverage for the unavailable rows/details.
9. **Docs reconciliation.** Reconcile `HANDOVER.md` with this file and record a
   decision entry (DR) for the five development slices if formal provenance is
   required.

## 4. Open decisions before the next coding slice

- Event-ingestion credential lifecycle and rate limits (OD-01/OD-05/OD-11).
- Remaining detector categories, policy toggles and full catalog coverage
  (OD-04/OD-08); the sensitive-data slice is in
  `specs/guard-sensitive-data-catalog.md`.
- Semantic-classifier runtime/provider, prompt-data boundary and latency
  contract. The user set a 500 ms target but has not selected a runtime; semantic
  detection remains paused.
- Approval channel/deadline inside client request limits.
- Provider protocol and supported client versions (OD-01).
- Whether to adopt a formal retirement mechanism for superseded locked tests.

## 5. Environment and resume commands

Project-local tools: JDK 25.0.5, Maven 3.9.16, Node 24.22.0, Playwright 1.64.1,
PostgreSQL 17.6, Mailpit 1.32.0. PostgreSQL is currently **running** on
`127.0.0.1:55434`. An existing non-project service occupies 8080; do not stop
or change it. The native-auth rerun used port 18080. Ports 5173/8025 were free.

```powershell
cd D:\Personal\ai-runtime-governance
. .\local-env\env.ps1
npm run ai:verify

# Isolate Playwright's backend from the existing listener on 8080
$env:GOVERNANCE_PORT = '18080'

# PostgreSQL, if it is not already running
.\.local-tools\pgsql17\bin\postgres.exe -D .\.local-cache\pgdata17 -p 55434

# Acceptance (Playwright starts Mailpit, backend and frontend)
npm run test:acceptance -- --project=api
npm run test:acceptance -- --project=browser
npm run test:mail-policy
npm run test:a11y

# Native checks
mvn -f ..\ai-runtime-governance-backend\pom.xml test
mvn -f ..\ai-runtime-governance-backend\pom.xml -DskipTests package
npm --prefix ..\ai-runtime-governance-frontend run typecheck
npm --prefix ..\ai-runtime-governance-frontend run lint
npm --prefix ..\ai-runtime-governance-frontend run build
```

Focused timeline/guard suites:

```powershell
npx playwright test --config tests/playwright.config.ts --project=api tests/api/activity-timeline-slice.spec.ts tests/api/activity-timeline-traversal.spec.ts tests/api/activity-timeline-traversal-followup-01.spec.ts tests/api/activity-timeline-ingestion.spec.ts tests/api/guard-decision-core.spec.ts
npx playwright test --config tests/playwright.config.ts --project=browser tests/specs/activity-timeline-slice.spec.ts tests/specs/activity-timeline-read-ui.spec.ts tests/specs/activity-timeline-read-ui-followup-01.spec.ts
```

## 6. Constraints

- Do not push unless asked. Commit with `[TaskType]Goal-oriented title`.
- Do not edit `specs/*.md`, `specs/*.freeze.json` or locked test files.
- Preserve frozen artifacts and follow-ups; corrections go to a reviewed follow-up.
- Never weaken an oracle, skip a test or add a product exception to make a test pass.
- Test-only surfaces (`/__test/...`) stay loopback-only, token-protected and
  disabled outside the test profile. No public seed/write route.
- The application repos ignore `node_modules`, `dist` and `target`; the docs repo
  ignores `.local-cache`, `.local-tools` and `local-env/runtime`.
- PostgreSQL 17.6 remains the local verification database (DR-042).

## 7. First three actions

1. Resolve the approved local fixture procedure for API SCN-077 and record the
   remaining native-auth locked-test disposition.
2. Decide the retirement path for locked timeline SCN-031 and SCN-037.
3. Select the next guard or gateway slice after resolving semantic-classifier
   runtime and data-boundary decisions.
