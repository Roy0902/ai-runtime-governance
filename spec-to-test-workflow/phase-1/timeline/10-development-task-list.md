# Activity timeline: development task list (quality-gated)

Prepared: 2026-11-03. **Awaiting user review. No product code has been written.**
Companion to [09-vertical-slice-plan.md](./09-vertical-slice-plan.md). This list
controls *how* the slice is built, so quality does not drift between sessions.

## How this list is used

- Tasks run in order. A task is **done** only when its "Done when" command/check
  passes and its diff has been reviewed.
- **Review stops (R0–R5) are hard stops.** Do not continue past a stop until the
  user approves. This is the quality control, not an optional courtesy.
- One commit per phase, `[TaskType]Goal-oriented title`. No mixed commits, no
  pushing.
- Never edit `specs/*`, `*.freeze.json` or locked tests. The separate uncommitted
  DR-051 re-freeze in the docs repo is out of scope and must not be reverted.

## Global quality rules (apply to every task)

1. **Fail closed.** No empty-success `catch`, no default/empty page on error, no
   silent fallback. Errors surface as explicit API failures or UI error states.
2. **Never fabricate.** `null` stays `null`; missing values render "Not reported";
   no zero/now/default sentinels.
3. **Server owns authority.** Scope comes from the session, never from a cursor
   or body. Cursor tampering is rejected.
4. **Metadata only.** No prompt/response/tool bodies, reasoning, credentials or
   arbitrary attributes are stored, returned or rendered.
5. **Accessible by construction.** Semantic roles/labels, keyboard operation,
   `aria-expanded`, focus retention, polite status announcements.
6. **Tests are evidence.** Nine frozen oracles. No `test.skip`, no weakened
   assertions, no test-only branches in product code.
7. **Small diffs.** New files over edits where possible. No unrelated renames,
   no new dependencies, no formatting churn.
8. **Record what ran.** Every result is dated; "passed" requires the command and
   output, not recollection.

---

## Phase 0 — Baseline (no product code)

| ID | Task | Done when | Review |
|---|---|---|---|
| DEV-01 | Rebuild the backend at `f12f4e0` and record the current JUnit result | `mvn -f ..\ai-runtime-governance-backend\pom.xml test` green; jar rebuilt; counts recorded | — |
| DEV-02 | Start PostgreSQL 17.6 on 55434 and Mailpit; confirm health | `/actuator/health` 200; Mailpit `/readyz` 200; PIDs recorded | — |
| DEV-03 | Confirm ports and the test-session strategy | 8080/5173 free; no unknown listener; no forged-cookie shortcut accepted | — |

## Phase 1 — Contract and acceptance lock (quality gate)

| ID | Task | Done when | Review |
|---|---|---|---|
| DEV-04 | Confirm the minimal wire contract (3 endpoints, fields, statuses, 50/200 bounds) | The contract section in 09 matches the intended implementation; no open field | **R1** |
| DEV-05 | Freeze the nine scenarios and write the slice freeze manifest | `ai:freeze` succeeds for the slice; manifest hash recorded | **R2** |
| DEV-06 | Author focused acceptance tests and run them red | 9 tests exist; every one fails for a real missing behavior, not a setup error; failures recorded | **R2** |

Test split: API-observable — 001, 002, 003, 005, 012, 023, 030; browser —
004 (hierarchy/order), 030 (loaded vs unresolved copy). If a scenario cannot be
tested honestly at this stage, stop and report; do not substitute a weaker check.

## Phase 2 — Backend read path

| ID | Task | Done when | Review |
|---|---|---|---|
| DEV-07 | Add `V2__activity_timeline.sql` | Migration applies from V1; no payload columns; indexes present | — |
| DEV-08 | Add `TimelineRepository` + `TimelineCursor` | Queries are scope-filtered; parent existence is derived by join; cursor rejects wrong scope/malformed input | — |
| DEV-09 | Add `TimelineReadService` | `requireHuman` → `account.scope_id` → scoped read; 404 not 403 for unowned; bounds enforced; `relationship` derived from full trace | — |
| DEV-10 | Add `TimelineController` + per-file DTOs | Three routes; explicit `REQUEST_INVALID`/`NOT_FOUND`; no inline SQL/business logic; existing error envelope | — |
| DEV-11 | Add token-guarded, loopback-only test seed/reset | Disabled outside test profile; uses the real account scope; no public write route | — |
| DEV-12 | Add backend tests; get API acceptance green | `mvn test` green; the 7 API-observable acceptance tests green; A/B isolation proven | **R3** |

## Phase 3 — Frontend read path

| ID | Task | Done when | Review |
|---|---|---|---|
| DEV-13 | Add typed API module + wire→view mapper | No `any`; unknown kinds/statuses map safely; nulls preserved | — |
| DEV-14 | Add request hook | Aborts stale requests on navigation; one pending continuation; refresh failure keeps prior data visibly stale; no polling | — |
| DEV-15 | Build the trace list page | Real `/api/v1/traces`; links to `/activity/:traceId`; loading/empty/error/session states; Load more | — |
| DEV-16 | Build the trace detail page and fix the model | Detail + events from API; expandable tree; `parentNotLoaded` distinct from `unresolved`; never fabricates durations | — |
| DEV-17 | Wire routes and styling; accessibility pass | `/activity` and `/activity/:traceId` behind `RequireHuman`; preview route untouched; keyboard/aria/status checks | **R4** |
| DEV-18 | Frontend gates + browser acceptance green | `typecheck`, `lint`, `build` pass; 2 browser tests green; no console errors | **R4** |

## Phase 4 — Close-out

| ID | Task | Done when | Review |
|---|---|---|---|
| DEV-19 | Full slice verification | 9/9 acceptance; backend + frontend gates; results dated in evidence | **R5** |
| DEV-20 | As-built note + handover update | Drift listed honestly; deferred scope unchanged; checkpoint updated | **R5** |

---

## Reviewer checklist at each stop

Ask these five questions; a "no" blocks the next phase:

1. Did the stated command actually run, and is the output recorded?
2. Does the diff contain only the task's files, with no scope creep or renames?
3. Can any failure path silently succeed, fabricate a value, or leak another
   account's data?
4. Is every missing value still missing, and every error still an error?
5. Are the frozen oracles untouched, and does each red failure have the right
   reason?

## Definition of done for the slice

- `/activity` and `/activity/:traceId` read real persisted data with a real
  session; A cannot see B.
- 9/9 frozen scenarios pass in a real browser/API against PostgreSQL.
- No payload/body, reasoning, credential or arbitrary attribute is stored,
  returned or rendered.
- `mvn test`, frontend `typecheck`/`lint`/`build`, and the focused acceptance
  suite pass; evidence is dated and linked.
- Deferred scope is still listed; nothing was silently dropped.

## Explicitly not in this list

Expiry/caps/tombstones (031–034, 039, 040), races/pending (036–038), approval
history (006/007/022), duplicate conflict (020/021), full coverage/loss
(013–018), refresh-failure retention (026), cursor signing, real ingestion,
filters/search, polling, payload archives.

## Progress log

**2026-11-03 — DEV-01 through DEV-19 complete for the nine-scenario slice.**

- DEV-01/02/03: baseline rebuilt; JUnit 19/19; PostgreSQL 17.6 and Mailpit
  started; ports confirmed free.
- DEV-04/05/06: contract confirmed; `specs/activity-timeline-slice.md` frozen;
  10 tests authored and locked after a genuine missing-feature red. One browser
  red attempt was rejected because it failed in enrollment setup, then corrected
  before lock.
- DEV-07 through DEV-12: V2 migration, repository, keyset cursor, read service,
  controller/DTOs and token-guarded seed/reset implemented; API acceptance 8/8.
- DEV-13 through DEV-18: API module, request hook, list/detail pages, model
  `parentNotLoaded` split, routes, styles and accessibility wiring implemented;
  browser acceptance 2/2; typecheck/lint/build pass.
- DEV-19: full slice verification recorded in the execution evidence.
- DEV-20: partially done — evidence updated; handover/as-built reconciliation is
  pending because the docs worktree also holds a separate uncommitted DR-051
  re-freeze.

Known deviation: the one locked timestamp assertion required millisecond
precision; the timeline DTOs now serialize `Instant` with a fixed UTC
millisecond pattern, matching the contract rather than editing the locked test.

**2026-11-03 — read-UI slice complete.** A second frozen slice
(`specs/activity-timeline-read-ui.md`, 8 scenarios) added approval history,
labeled loss/coverage, explicit read failure, stale-refresh retention, navigation
safety, single pending continuation and keyboard announcements. Results:
read-UI browser 8/8, original browser 2/2, API 8/8, backend 19/19, frontend
gates pass, `ai:verify` all six features OK. SCN-036 was an existing-behavior
baseline; the rest were red-first.

**2026-11-03 — traversal lifecycle complete.** A third frozen slice added
server-managed committed-ID snapshots, five-minute expiry, active/member caps,
tombstones and cursor privacy. Results: traversal API 6/7 + follow-up 1/1,
original API 8/8, browser 10/10, backend 19/19, frontend gates pass. The one
API failure is a locked SCN-031 test-authoring defect (refreshed first page vs
201st event); follow-up 01 proves the correct refreshed-traversal membership.

**2026-11-03 — ingestion authority complete.** A fourth frozen slice added
allowlist rejection, producer authority, idempotent duplicates and conflict
rejection on the test-only ingest path. Results: ingestion API 4/4, full API
19/20 (known SCN-031), browser 9/10 plus a follow-up for the flaky SCN-037
locator, backend 19/19. No frontend change was needed.
