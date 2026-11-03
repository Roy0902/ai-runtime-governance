# Activity timeline frontend tasks

Version: 0.2. Updated: 2026-11-03. **Revised task draft under DR-044; not frozen.**
Single design: [implementation design](./05-implementation-design.md).
Single shared API/UI definition: [checklist sections 3/4](./04-shared-checklist.md).
Expected behavior: [scenarios](./03-scenarios.md), approved intent and source spec.

## 1. Existing frontend surface

The application is the sibling `ai-runtime-governance-frontend` repository and
is undergoing a user-owned file reorganization. Current files include
`src/ApplicationRoutes.tsx`, `src/ApplicationEntry.tsx`,
`src/ApplicationApiClient.ts`, `src/AuthenticationContext.tsx`, and
`src/ApplicationStyles.css`; the timeline preview is under
`src/features/activity-timeline/`, with shared layout and authentication routes
under `src/components/layout/` and `src/features/authentication/`.

The routes preserve `/activity` behind `RequireHuman` and a development-only
`/activity-preview`. The preview still uses local fixtures and has no timeline
API client. Extend the new structure; do not recreate or overwrite the removed
filenames or add a parallel app shell.

## 2. File-level tasks

SCN suffixes denote `SCN-activity-timeline-###`; checklist suffixes denote
`CHK-TL-###`. All tasks are **not started**.

| ID | Checklist | Action / target files | Pattern / responsibility and change | Scenarios |
|---|---|---|---|---|
| FE-TL-001 | 001, 007, 008 | Add typed timeline API calls under `ai-runtime-governance-frontend/src/features/activity-timeline/`; reuse `src/ApplicationApiClient.ts` | Consume READ-1/2/3 and the OpenAPI schema; preserve explicit auth/not-found/dependency/traversal errors and cursor boundaries; no body/scope override or empty-success catch | 001–003, 023–028, 031–034, 039–040 |
| FE-TL-002 | 002, 003, 004, 005, 006 | Extend existing `src/features/activity-timeline/ActivityTimelineModel.ts` | Pure derived metadata model; stable receipt sibling order; distinguish a validated linked parent not in the loaded page from a genuinely unresolved parent; deduplicate IDs and preserve separate evidence states | 004–022, 029, 030 |
| FE-TL-003 | 001, 007, 008 | Add a request-state hook under `ai-runtime-governance-frontend/src/features/activity-timeline/` | Own initial reads/continuation/manual refresh/abort, stale response ownership, one pending continuation, and refresh failure retention; no auto-polling | 001–003, 010, 023–028, 035–037 |
| FE-TL-004 | 001, 007, 008 | Extend existing `src/features/activity-timeline/ActivityTimelinePage.tsx` trace list/detail composition | Accessible summary list/detail content with loading/empty/error/auth states, data-free trace tombstones, explicit continuation and manual refresh; route registration belongs to FE-TL-007; authorization remains backend-owned | 001–003, 023, 025–028, 036–040 |
| FE-TL-005 | 002, 003, 004, 005, 006, 007, 008 | Extend `ActivityTimelinePage.tsx` event rendering and `ai-runtime-governance-frontend/src/ApplicationStyles.css`; split components only where useful | Semantic rendering from hook/model; expandable nested/unlinked records, safe metadata definition lists, read-only approval history, execution/completeness/coverage/loss display; map unknown cause codes to the approved neutral label; keyboard/status announcements; no bodies, unsafe HTML or approval actions | 001, 004–022, 024–030, 038 |
| FE-TL-006 | 009 | Add frontend supporting tests only after selecting a compatible runner | Cover hook races, hierarchy, safe rendering and role/keyboard behavior; current frontend manifest has no test script. The docs repo's `tests/supporting/api-client.test.mjs` still imports removed `src/api.ts` and failed after the rename. Align it after the user-owned restructure settles; do not mask the failure. | Supporting coverage for 001–040 |
| FE-TL-007 | 001, 008, 009 | Extend `ai-runtime-governance-frontend/src/ApplicationRoutes.tsx` using existing `RequireHuman` and `AuthenticationProvider`; reuse `src/ApplicationEntry.tsx` `BrowserRouter` | Add approved `/activity/:traceId` direct-link route beside `/activity`; do not create a second router, app entry or auth provider | 001–040 execution prerequisite |

`FE-TL-006` is supporting-test/setup responsibility, not permission to install
dependencies or modify locked browser acceptance. Protected tests are authored
in Phase 8 in the docs repository's `tests/specs/` path through the separate
reviewed acceptance task.

## 3. UI case matrix

| Behavior | Case / handling | Scenario or ambiguity | Status |
|---|---|---|---|
| Trace reads | Successful private read, absent/expired/revoked human session, guessed other account | SCN-001/002/003/027 | Mapped; exact wire/copy pending except approved route family |
| Initial reads | Loading versus genuinely empty versus dependency failure | SCN-014/023/026; AMB-activity-timeline-005 for exact loading/copy | Mapped/candidate |
| Approved READ errors | 401 session, proposed 400 cursor, 404 unowned/unavailable, 503 dependency | SCN-002/003/026/027; AMB-activity-timeline-004/005 for cursor/exact messages | Not ready for freeze |
| Event tree | Nesting, receipt ties/source disagreement, unresolved/late parent | SCN-004/008/009/010/011 | Mapped |
| Metadata evidence | No body/reasoning/credentials; absent duration; known/unknown loss | SCN-005/012/013/014/015/016/017/018/019 | Mapped |
| Approval | Requested/resolved history; no actions, no inferred resolution | SCN-006/007/022 | Mapped/read-only |
| Duplicate history | One accepted occurrence; no conflicting overwrite | SCN-020/021 | Mapped; backend integrity not client authority |
| Continuation | Per-response bounds, load all, partial loading distinct from loss | SCN-023/024 | Mapped |
| Refresh | Manual new activity; success/error; no polling | SCN-025/026 | Mapped |
| Duplicate request | Disable load-more/refresh while pending; exact disabled/focus state | SCN-037 | Scenario wording approved; implementation not present |
| Navigation pending | Abort/ignore obsolete trace A response after moving to B | SCN-036 | Scenario wording approved; implementation not present |
| Read-only/roles | All timeline humans inspect only; scope changes data ownership, not new workspace roles | SCN-001/003/006/022/028 | Mapped |
| Keyboard/status feedback | Semantic labels, expansion keyboard behavior, announcement/focus rules | SCN-038 | Scenario wording approved; remaining accessible copy/focus details need implementation review |
| Traversal membership | New event or trace commits do not enter an active snapshot; refresh starts a new traversal | SCN-031, 039 | Wording and shared trace/event snapshot policy approved in DR-044/046 |
| Trace-list traversal membership | New trace commits do not shift an active list traversal | SCN-039 | Scenario wording and same snapshot limits approved in DR-046 |
| Traversal lifetime/caps | Expired cursor and per-account/member caps fail explicitly | SCN-032–034 | Scenario wording and 410/429/422 status mapping approved by DR-045 |
| Refresh failure | Keep previous records visibly stale and expose retry; no empty-success state | SCN-035 | Scenario wording approved; exact loading/error copy still needs review |
| Parent present on later page | Current model labels `relationship: linked` with an unloaded parent as unlinked; separate that from genuinely unresolved activity per SCN-030 | SCN-030 | Source-backed preview discrepancy; fix and add focused model coverage before acceptance |
| Trace navigation | Approved `/activity` list and `/activity/:traceId` detail routes; prototype still uses in-page selected row | SCN-001/003; DR-045 | Route decision recorded; implement deep links before acceptance |
| Missing-value copy | “Not reported” when the producer omits a value; “Unavailable” for unavailable details such as tombstones | SCN-012/030; DR-045 | Approved wording; implementation not present |
| Refresh/continuation behavior | Prototype's load-more only reveals more local fixtures; no backend request, pending state or refresh retry | SCN-023–026, 031–037 | Clearly synthetic preview only; not acceptance evidence |

No form submission, mutation double-submit, approval action or body download is
part of this frontend slice. Do not invent text or permission fallbacks to fill
unresolved cases.

## 4. Phase 6 conflicts

- The traversal, test-harness and schema directions are approved by DR-044.
  SCN-031–040 wording, route pattern, missing-value copy and traversal/cursor
  status mapping are approved by DR-045–049. Other UI copy/focus details remain to review;
  do not treat the documents as frozen.
- Native-auth routes and account setup already exist in the sibling application;
  timeline routes must reuse `RequireHuman` / `AuthProvider`, with no fake storage
  state or locally forged session.
- Backend must provide parent validity independently of loaded records; otherwise
  the UI cannot distinguish unresolved from unloaded parents.
- Exact helper/project paths and native tool versions remain unresolved setup
  gates. SCN-031–040 wording is approved but not frozen or executed.
- The user-owned activity preview exists under `src/features/activity/` and the
  dev-only `/activity-preview` route. It renders in-memory fixtures; it is not
  connected to auth, API or persisted data. Its current lint/build pass is not
  timeline acceptance. Do not edit the user-owned worktree without direction.

## 5. Coverage

All nine frontend checklist responsibilities have at least one task.
All 40 scenario IDs have a frontend task or browser assertion owner; SCN-031–040
wording is approved but not frozen or executed. Backend integrity
checks remain supplemental for cases where browser appearance alone cannot prove
safe persistence/authority. No task or acceptance scenario is executed.

## 6. Design and validation references

FE-TL-001 -> existing same-origin `api()` transport and typed timeline calls.
FE-TL-002 -> pure hierarchy owner; example `buildActivityHierarchy`.
FE-TL-003 -> request lifecycle owner; example `useActivityTimeline`.
FE-TL-004/005 -> presentation only; FE-TL-007 registers protected routes; no
SQL/auth decisions in components.
FE-TL-006 -> supporting tests outside protected acceptance.
FE-TL-007 -> existing app/router/auth integration, not a new entry or mock.

Use existing scripts from the frontend repository:
`npm run typecheck`, `npm run lint`, and `npm run build`. No frontend unit-test
command currently exists; select and review a runner before adding dependencies.
Protected browser validation and freeze integrity use the existing Playwright
and freeze-guard commands from the docs repository.
