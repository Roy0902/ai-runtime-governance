# Handoff — remaining work

Updated: 2026-11-03. Companion to the historical [HANDOVER.md](./HANDOVER.md).
This file logs the current state and the remaining development work only.

## 1. Current state

All three worktrees are clean. Backend and frontend are pushed; this handoff is
the only unpushed docs commit. The table records the last development commit in
each repository.

| Repository | Last development commit | Push state |
|---|---|---|
| `ai-runtime-governance` (docs) | `42f5809 [Test]Freeze and verify the guard decision core` | pushed; handoff commit ahead 1 |
| `ai-runtime-governance-backend` | `768821b [Feature]Implement the guard decision core` | pushed |
| `ai-runtime-governance-frontend` | `6602e2b [Feature]Handle traversal tombstones in the timeline UI` | pushed |

Frozen features (`npm run ai:verify` → all OK):

1. `native-auth` + follow-ups 01–03
2. `activity-timeline-slice`
3. `activity-timeline-read-ui` + follow-up 01
4. `activity-timeline-traversal` + follow-up 01
5. `activity-timeline-ingestion`
6. `guard-decision-core`

Latest recorded results:

| Gate | Result |
|---|---|
| Timeline + guard API | **28/29** — only the known locked SCN-031 defect |
| Timeline browser | **11/11** on the last run; original SCN-037 is still flaky |
| Guard core | 9/9 |
| Backend JUnit | 19/19 |
| Frontend typecheck / lint / build | pass |
| `npm run ai:verify` | all 11 frozen features OK |
| Native-auth focused recheck after the enrollment fix | SCN-002/003/004/008 4/4 |

Implemented: native auth; timeline read list/detail; traversal snapshots with
expiry/caps/tombstones; trusted ingestion with idempotency/conflict; guard
decision core with a test-only `/__test/guard/evaluate` harness.

## 2. Known locked-test defects (do not edit)

| Original test | Defect | Covered by |
|---|---|---|
| `SCN-activity-timeline-031` in `tests/api/activity-timeline-traversal.spec.ts` | Expects the 201st event on the refreshed 200-event first page | `activity-timeline-traversal-followup-01` |
| `SCN-activity-timeline-037` in `tests/specs/activity-timeline-read-ui.spec.ts` | `getByText('event 200')` can also match an `Expand event 200...` UUID button | `activity-timeline-read-ui-followup-01` |
| Native-auth browser 001/007/015/039/054/062/094; API 037/057/073/092 and follow-up-02 037 | Recorded in `HANDOVER.md` and the gap register | Native-auth follow-up plans; not re-run here |

A corrected test that is already green is an existing-behavior baseline, not a
weakened oracle. Never edit a locked file to make it pass.

## 3. Remaining work, ordered

1. **Native-auth full rerun.** The enrollment fix was verified on four focused
   browser tests only. Re-run the full browser API suites and update the recorded
   disposition; expect the known locked-test failures above.
2. **Timeline cleanup.** Decide whether to retire the two superseded locked
   tests (031 and 037) through a reviewed follow-up, so the suite no longer
   carries a known red/flaky case. Do not edit them directly.
3. **Production ingestion and event credentials.** Replace the test-only
   `/__test/timeline/ingest` path with an authenticated event-reporting contract:
   account-scoped ingestion tokens, separate from gateway/provider keys, with
   issuance, storage, rotation, revocation and rate limits. **Blocked on
   OD-01/OD-05/OD-11 decisions.**
4. **Guard detector catalog.** The core composes findings; it does not detect.
   Define the built-in literal/bounded-regex patterns, category-to-effect
   mapping, priorities, disabled-rule behavior and regex limits.
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
- Detector patterns, priorities and regex bounds (OD-04/OD-08).
- Approval channel/deadline inside client request limits.
- Provider protocol and supported client versions (OD-01).
- Whether to adopt a formal retirement mechanism for superseded locked tests.

## 5. Environment and resume commands

Project-local tools: JDK 25.0.5, Maven 3.9.16, Node 24.22.0, Playwright 1.64.1,
PostgreSQL 17.6, Mailpit 1.32.0. PostgreSQL is currently **running** on
`127.0.0.1:55434`; ports 8080/5173/8025 are free.

```powershell
cd C:\Users\pigcr\Documents\Workspace\ai-runtime-governance
. .\local-env\env.ps1
npm run ai:verify

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

1. Re-run the full native-auth browser/API suites and record the post-fix
   disposition.
2. Decide the retirement path for locked SCN-031 and SCN-037.
3. Pick the next approved slice: production ingestion credentials, detector
   catalog, or approval delivery.
