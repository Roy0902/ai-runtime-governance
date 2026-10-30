# Activity timeline frontend tasks

Version: 0.1. **Proposed Phase 5 task list; Phase 6 contract/setup review pending.**
Single design: [implementation design](./05-implementation-design.md).
Single shared API/UI definition: [checklist sections 3/4](./04-shared-checklist.md).
Expected behavior: [scenarios](./03-scenarios.md), approved intent and source spec.

## 1. Files studied and greenfield evidence

Read source REQUIREMENTS/TECHNICAL_BASELINE and the timeline scope, scoped
ingestion, domain, intent, scenarios, checklist and shared design. Target root
inspection found no frontend manifest, routes, components, hooks, state/forms,
styles or tests to study/reuse. No existing UI pattern is claimed. All paths
below are new, justified greenfield proposals under the shared design.

No separate backend contract or ownership model is invented here.

## 2. File-level tasks

SCN suffixes denote `SCN-activity-timeline-###`; checklist suffixes denote
`CHK-TL-###`. All tasks are **not started**.

| ID | Checklist | Action / target files | Pattern / responsibility and change | Scenarios |
|---|---|---|---|---|
| FE-TL-001 | 001, 007, 008 | Add `web/src/api/activityTimeline.ts` and shared read types | Design API-client owner; consume READ-1/2/3 verbatim; preserve explicit auth/not-found/dependency errors and cursor boundaries; no body/scope override or empty-success catch | 001–003, 023–028 |
| FE-TL-002 | 002, 003, 004, 005, 006 | Add `web/src/features/timeline/activityHierarchy.ts` | Pure derived metadata model; stable receipt sibling order, loaded/unlinked distinction, ID deduplication, separate evidence states; never infer authority/completeness or change backend conflict decisions | 004–022, 029, 030 |
| FE-TL-003 | 001, 007, 008 | Add `web/src/features/timeline/useActivityTimeline.ts` | Hook owner for initial reads/continuation/manual refresh/abort and stale response ownership; no auto-polling; contract-approved state retention only | 001–003, 010, 023–028 |
| FE-TL-004 | 001, 007, 008 | Add `web/src/features/timeline/TraceList.tsx`, `web/src/app/routes.tsx` | Accessible summary list/direct detail routing; loading/empty/error/auth states, explicit continuation and manual refresh; authorization remains backend-owned | 001–003, 023, 025–028 |
| FE-TL-005 | 002, 003, 004, 005, 006, 007, 008 | Add `ActivityTimeline.tsx`, `ActivityEventItem.tsx`, `timeline.css` under `web/src/features/timeline` | Semantic rendering from hook/model; expandable nested/unlinked records, safe metadata definition lists, read-only approval history, execution/completeness/coverage/loss display; no bodies, unsafe HTML or approval actions | 001, 004–022, 024–030 |
| FE-TL-006 | 009 | Add native frontend supporting tests beside the above modules; establish reviewed `web/package.json`/TS/Vite configs | Design test owner; hook races, hierarchy, safe render, role/keyboard behavior; resolve exact tooling first, never substitute mocks for E2E or edit locked acceptance | Supporting coverage for 001–030 |
| FE-TL-007 | 001, 008, 009 | Add `web/index.html`, `web/src/main.tsx`, `web/src/app/App.tsx`, `web/vite.config.ts` | Shared-design bootstrap owner; runnable React app and approved router/providers/proxy, with actual auth integration and no fake timeline replacement | 001–030 execution prerequisite |

`FE-TL-006` is supporting-test/setup responsibility, not permission to install
dependencies or modify locked browser acceptance. Protected tests are authored
in Phase 8 through a separate reviewed acceptance work item in the backend/
acceptance task list.

## 3. UI case matrix

| Behavior | Case / handling | Scenario or ambiguity | Status |
|---|---|---|---|
| Trace reads | Successful private read, absent/expired/revoked human session, guessed other account | SCN-001/002/003/027 | Mapped; exact wire/copy pending |
| Initial reads | Loading versus genuinely empty versus dependency failure | SCN-014/023/026; AMB-activity-timeline-005 for exact loading/copy | Mapped/candidate |
| Approved READ errors | 401 session, proposed 400 cursor, 404 unowned/unavailable, 503 dependency | SCN-002/003/026/027; AMB-activity-timeline-004/005 for cursor/exact messages | Not ready for freeze |
| Event tree | Nesting, receipt ties/source disagreement, unresolved/late parent | SCN-004/008/009/010/011 | Mapped |
| Metadata evidence | No body/reasoning/credentials; absent duration; known/unknown loss | SCN-005/012/013/014/015/016/017/018/019 | Mapped |
| Approval | Requested/resolved history; no actions, no inferred resolution | SCN-006/007/022 | Mapped/read-only |
| Duplicate history | One accepted occurrence; no conflicting overwrite | SCN-020/021 | Mapped; backend integrity not client authority |
| Continuation | Per-response bounds, load all, partial loading distinct from loss | SCN-023/024 | Mapped |
| Refresh | Manual new activity; success/error; no polling | SCN-025/026 | Mapped |
| Duplicate request | Disable load-more/refresh while pending; exact disabled/focus state | AMB-activity-timeline-005 | Candidate, not a test yet |
| Navigation pending | Abort/ignore obsolete trace A response after moving to B | AMB-activity-timeline-005 | Candidate; add reviewed SCN before freeze |
| Read-only/roles | All timeline humans inspect only; scope changes data ownership, not new workspace roles | SCN-001/003/006/022/028 | Mapped |
| Keyboard/status feedback | Semantic labels, expansion keyboard behavior, announcement/focus rules | AMB-activity-timeline-005 | Exact contract/scenarios pending |

No form submission, mutation double-submit, approval action or body download is
part of this frontend slice. Do not invent text or permission fallbacks to fill
unresolved cases.

## 4. Phase 6 conflicts

- Shared READ/UI contracts are proposals; do not code against them as approved
  expectations before review/source/scenario reconciliation.
- Real native-auth routes and account setup are prerequisites but not established;
  no fake storage state or locally forged session may become the production path.
- Backend must provide parent validity independently of loaded records; otherwise
  the UI cannot distinguish unresolved from unloaded parents.
- Exact helper/project paths, accessibility cases and race/refresh behavior need
  setup/contracts. Missing scenarios remain explicit candidates.

## 5. Coverage

All nine frontend checklist responsibilities have at least one task.
All 30 scenarios have a frontend task or browser assertion owner. Backend integrity
checks remain supplemental for cases where browser appearance alone cannot prove
safe persistence/authority. No task or acceptance scenario is executed.

## 6. Design and validation references

FE-TL-001 -> design API-client boundary; example `readActivityEvents`.
FE-TL-002 -> pure hierarchy owner; example `buildActivityHierarchy`.
FE-TL-003 -> request lifecycle owner; example `useActivityTimeline`.
FE-TL-004/005 -> presentation/routing only; no SQL/auth decisions in components.
FE-TL-006 -> supporting tests outside protected acceptance.
FE-TL-007 -> runnable frontend entry/configuration, not an acceptance-only mock.

After approved tooling/manifests, proposed validation from `web` is
`npm run typecheck`, `npm run lint`, `npm test -- --run`, `npm run build`.
These commands have **not** been run and scripts do not yet exist.
Protected browser validation and freeze integrity use the shared design's
acceptance-root commands once that setup is established.
