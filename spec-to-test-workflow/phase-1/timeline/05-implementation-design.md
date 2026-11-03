# Activity timeline implementation design

Version: 0.2. Updated: 2026-11-03. **Revised draft under DR-044; not frozen.**
Implementation context only; behavior comes from the approved specification/
intent and later frozen scenarios. No production files or tools were created.

## 1. Sources and decisions

- [Requirements/register](./00-ingestion.md), eleven scoped REQs.
- [Domain](./01-domain-model.md), fourteen invariants.
- [Intent v0.1](./02-intent-v0.1.md), approved DR-017.
- [40 scenario IDs](./03-scenarios.md), with SCN-031–040 wording approved under
  DR-045–049.
- [Single shared checklist/contract matrix](./04-shared-checklist.md).
- [Machine-readable shared schema](../../../contracts/activity-timeline.openapi.json).
- Existing application conventions are in the sibling frontend/backend
  repositories; use those rather than the old greenfield proposal.
- DR-044 approves the traversal-membership, test-harness and schema directions.
  DR-045–049 approve SCN-031–040 wording, UI route/copy decisions, trace/event
  traversal status mapping and invalid-cursor failure behavior. Test setup and
  local backend readiness remain review gates.

**Review update:** DR-018 sequences a separately planned and acceptance-tested
native-auth milestone before timeline delivery. Do not treat authentication as
an available dependency until that milestone's gates pass. Other review findings
and contract/setup blockers remain in [the review report](./08-review.md).

## 2. Files and patterns studied

| Scope / evidence | Finding | Reuse / departure |
|---|---|---|
| Docs repository and sibling application repos | Existing React/Vite frontend with `App.tsx`, shared `api.ts` and `AuthProvider`; existing Spring Boot backend under `local.governance`, Flyway V1 and `/__test` | Extend the applications; do not create second bootstraps, route shells or auth modules |
| Frontend `src/ApplicationRoutes.tsx`, `src/ApplicationEntry.tsx`, `src/ApplicationApiClient.ts`, `src/api-contracts/`, `src/AuthenticationContext.tsx` | Current user-owned app reorganization: React Router, same-origin API helper, API types, native-auth context/guard and `BrowserRouter` | Add timeline feature modules and protected routes using current helpers; source worktree is in progress |
| Backend `GovernanceApplication`, authentication controllers/services, `TestControlController` | Existing native-auth prerequisite and test-profile harness | Derive the real account scope; extend the guarded test surface only |
| Backend `pom.xml`, V1 Flyway migration and frontend `package.json` | Java 25 / Spring Boot 4.1.2; React 19 / Vite 8 / TypeScript 5.9 | Reuse existing manifests and versions; add no runner/dependency without review |
| Scoped domain/intent/scenarios/checklist | Read-only metadata inspection, real frontend acceptance | Keep core detector, external clients, actionable approval and archives out |
| Existing workflow guard and Playwright projects | Protected acceptance paths, reset helper and native-auth browser suites | Reuse the docs-repository harness; add timeline coverage only after review |

The current frontend screen and components exist; derive locators from the
timeline UI only after implementation. No stock-project code is reused.

## 3. Proposed structure and ownership

Paths below are repository-relative and prefixed by their repository name.
Application bootstrap, auth, routing, styling, manifests and test harness already
exist. Timeline feature modules are new; use one backend and the existing React
application.

| Path / module | Owner / responsibility | Allowed dependencies / reason |
|---|---|---|
| `ai-runtime-governance-backend/pom.xml`, `ai-runtime-governance-backend/src/main/java/local/governance/GovernanceApplication.java`, `ai-runtime-governance-backend/src/main/resources/application.yml` | Existing backend build, bootstrap and configuration | Extend current app; no parallel bootstrap or wrapper |
| `ai-runtime-governance-backend/src/main/java/local/governance/timeline/ActivityTrace.java` | Immutable trace/event metadata and validated domain value types | Java domain types; no controller or frontend dependency |
| `ai-runtime-governance-backend/src/main/java/local/governance/timeline/TimelineReadService.java` | Scoped read orchestration, bounded traversal and truthful projection | Existing auth/session services + repository contract; never trusts request scope |
| `ai-runtime-governance-backend/src/main/java/local/governance/timeline/ActivityMetadataService.java` | Safe metadata validation, producer authority, duplicate/parent integrity | Domain + transaction/repository; cannot grant human approval |
| `ai-runtime-governance-backend/src/main/java/local/governance/timeline/TimelineRepository.java`, `JdbcTimelineRepository.java` | Scope-bound persistence operations, uniqueness/conflict handling and hierarchy lookup | Existing Spring JDBC/PostgreSQL setup; no generic repository framework |
| `ai-runtime-governance-backend/src/main/java/local/governance/timeline/api/TimelineController.java` | READ-1/2/3 validation and safe error mapping | Existing session/auth boundary; no inline SQL/business rules |
| `ai-runtime-governance-backend/src/main/java/local/governance/api/` | Individual request/response DTO records | Follow backend convention; one record per file, no `ApiDtos` container |
| `ai-runtime-governance-backend/src/main/resources/db/migration/V2__activity_timeline.sql` | Timeline metadata schema, scoped identity uniqueness and indexes | Follows existing `V1__auth_core.sql`; no payload/body columns |
| `ai-runtime-governance/contracts/activity-timeline.openapi.json` | Single shared event/read-model schema and producer authority contract | OpenAPI 3.1; canonical UUIDs; test aliases are explicitly nonproduction |
| `ai-runtime-governance-frontend/src/ApplicationApiClient.ts`, `src/api-contracts/` | Current same-origin fetch, credentials, native-auth DTOs and `ApiError` mapping | Reuse `apiRequest` / `ApiError`; align the docs API-client test after the source rename is stable |
| `ai-runtime-governance-frontend/src/features/activity-timeline/ActivityTimelinePage.tsx`, `ActivityTimelineTypes.ts`, `ActivityTimelineFixtures.ts`, `ActivityTimelineModel.ts` | Existing user-owned synthetic activity preview | Extend current route/page/model and migrate fixtures to API data only after acceptance gates; distinguish not-loaded linked parents from unresolved parents and render data-free trace/event tombstones |
| `ai-runtime-governance-frontend/src/features/activity-timeline/ActivityTimelineApi.ts`, `useActivityTimeline.ts` | Timeline-specific typed READ-1/2/3 calls and request lifecycle | Reuse `ApplicationApiClient.apiRequest`, `AuthenticationProvider` and same-origin transport |
| `ai-runtime-governance-frontend/src/ApplicationStyles.css` | Existing app and preview styling | Extend in place; no parallel stylesheet/app shell unless later justified |
| `ai-runtime-governance-frontend/src/ApplicationRoutes.tsx`, `src/ApplicationEntry.tsx`, `src/AuthenticationContext.tsx` | Current route tree, native-auth context and `BrowserRouter` entry | Add protected timeline list/detail navigation; do not replace app shell; exact deep-link route is approved but not yet implemented |
| `ai-runtime-governance-frontend/src/components/layout/ApplicationShell.tsx`, `src/features/authentication/AuthenticationRoutes.tsx` | Existing layout and authentication/`RequireHuman` guard | Reuse for the real timeline route; the dev-only preview shell is not an authenticated acceptance path |
| `ai-runtime-governance-backend/src/main/java/local/governance/test/TestControlController.java` | Existing test-profile control boundary | Extend only with loopback/token-guarded test operations; absent from production contract |
| `ai-runtime-governance/tests/specs/activity-timeline.spec.ts`, `tests/support/timeline.ts` | Protected browser acceptance and isolated fixture helpers | Existing Playwright/reset harness; real auth, backend and persisted data |

Extract DTOs, evidence display or cursor helpers only where a clear responsibility
requires it; this table is representative, not a mandatory file-count target.

### Boundaries, errors and side effects

- Authentication resolves human/account scope before every read through the
  existing native-auth session services. The prerequisite is implemented and
  verified; timeline code must reuse it and must not introduce a parallel
  password/session mechanism.
- Permission checks belong to backend auth/read services. Hiding a link is not
  authorization. Operator gateway grants do not imply timeline data access.
- Metadata service owns safe fields, producer classification, deduplication and
  relationship validation. The timeline is read-only to humans; actual production
  integration ingest remains outside this increment unless separately selected.
- PostgreSQL enforces scoped identity uniqueness; transaction checks prevent
  conflicting duplicate overwrites and invalid relinking. Retry publication must
  not dispatch models or mutate human approval authority.
- A traversal stores the ordered committed event-ID membership from the first
  successful read, with a five-minute expiry, at most 10,000 members and at most
  five active traversals per account. Every page reauthorizes; the snapshot uses
  a bounded transaction and does not pin one across pages. Deleted members become
  data-free tombstones to preserve membership and cursor position. Refresh starts
  a fresh traversal. The exact implementation must preserve receipt-time/event-ID
  sibling order.
- Receipt ordering/parent logic is shared semantically, not duplicated as separate
  contradictory frontend/server rules. Backend knows retained parent validity;
  frontend distinguishes not-yet-loaded parents from genuinely unresolved parents.
- Controllers map known errors safely. No broad catch returning empty success,
  arbitrary body field echo, guessed durations or optimistic completeness.
- React renders escaped metadata text. No unsafe HTML/body pane; abort/ignore
  stale requests on navigation and prevent parallel duplicate continuation.
- The test-only timeline boundary is disabled outside the test profile, binds to
  loopback and requires a per-run token. It calls the production metadata service
  validation/deduplication/producer-authority path; browser acceptance reads the
  persisted outcome through the normal API. Do not add a public seed/write route.
- The current `/activity-preview` route is development-only and explicitly
  renders local synthetic fixtures. It does not mount the auth provider or issue
  timeline requests; its “load more” controls reveal more fixture items. This is
  visual-prototype evidence only, not a feature implementation or acceptance run.
- The receipt-key-only traversal cutoff is withdrawn. The approved bounded
  server-managed membership direction is recorded in DR-044 and the shared
  checklist; exact error/status and remaining UI details stay in review.

## 4. Naming examples

| Domain term | Representative names | Meaning |
|---|---|---|
| Private scope | `AuthenticatedAccountScope`, `readTrace(scope, traceId)` | Server-derived authority is explicit |
| Activity trace | `ActivityTrace`, `TraceSummary`, `TimelineReadService` | Read model not a generic incident-case entity |
| Telemetry completeness | `TelemetryStatus`, `LossExtent` | Separate from `ExecutionStatus` |
| Parent relationship | `ParentRelationship`, `buildActivityHierarchy` | Unresolved versus unloaded parent kept distinct |
| Scoped duplicates | `acceptMetadata`, `ConflictingEventIdentity` | Explicit accepted/idempotent/conflict paths |

## 5. Supporting-test strategy

| Responsibility | Native location / level | Isolation / related scenarios |
|---|---|---|
| Scope/hierarchy/evidence projection | `ai-runtime-governance-backend/src/test/java/local/governance/timeline/*Test.java`, existing JUnit setup | Pure synthetic values; SCN-004/008–018 |
| JDBC scope/idempotency/parent validation | Same backend package with the reviewed PostgreSQL 17.6 test profile | Isolated test data/cleanup; do not assume Testcontainers dependency; SCN-003/011/020/021/022 |
| Metadata body exclusion | Domain/JDBC integration tests plus browser assertions | Synthetic sentinel values; inspect persistence/read/error paths; SCN-005/019 |
| Cursor limits/consistency | Query integration tests | >50 traces/>200 events, trace/event snapshot membership, expiry/caps, scope reauthorization and tombstones; SCN-023/024/027/031–034/039 |
| Hook request state and hierarchy | `ai-runtime-governance-frontend/src/features/activity/*.test.ts(x)` only after a runner is reviewed | Abort/race/empty/error cases, deterministic promises; no frontend test script exists today; supplement real E2E |
| Browser acceptance | Protected `ai-runtime-governance/tests/specs/activity-timeline.spec.ts`, existing Playwright harness | Real app/server/DB and real auth; A/B isolation, fixtures per test; SCN-031–040 approved but not frozen or executed |

Supporting mocks can test isolated failure/race logic; they cannot stand in for
the browser's end-to-end success journey. Reuse real auth setup rather than
forging a cookie. Guard all fixture tools against public/production execution.

## 6. Quality baseline and commands

Commands below reuse existing manifests/scripts. Native-auth checks passed as
recorded in the handover; no timeline-specific build or acceptance baseline has
run yet.

| Gate | Proposed command / working directory | Current disposition |
|---|---|---|
| Backend tests/package | `mvn -f ..\ai-runtime-governance-backend\pom.xml test` and `mvn -f ..\ai-runtime-governance-backend\pom.xml -DskipTests package`, docs repository root | Existing backend manifest; recheck project-local JDK/Maven environment before execution |
| Frontend type check | `npm --prefix ..\ai-runtime-governance-frontend run typecheck` | Existing script; native-auth baseline is recorded, timeline changes still need validation |
| Frontend lint | `npm --prefix ..\ai-runtime-governance-frontend run lint` | Existing script; timeline changes still need validation |
| Frontend production build | `npm --prefix ..\ai-runtime-governance-frontend run build` | Existing script; timeline changes still need validation |
| Frontend unit tests | No current command | Choose and review a runner before adding dependencies; do not imply a passing baseline |
| Protected browser acceptance | `npm run test:acceptance -- --project=browser`, docs repository root | Existing Playwright harness; timeline test file/project not yet authored |
| Acceptance integrity | `npm run ai:verify`, docs repository root | Existing freeze guard; no timeline freeze manifest or lock yet |

Use the versions already declared by the application repos and the reviewed
local baseline. Recheck Java/Maven/Node/PostgreSQL readiness on a different host;
do not install packages or add Testcontainers from a design document alone.
Record timeline-specific baselines before implementation; do not weaken existing
acceptance oracles.

## 7. Review and deviations

DR-044 resolves the recommended traversal, harness and shared-schema directions.
DR-045–049 approve SCN-031–040 wording, `/activity` plus `/activity/:traceId`,
missing-value copy, trace/event traversal error statuses, and the cursor failure
policy. Other UI
labels/focus behavior, test-fixture isolation, local backend/
tool readiness and deployment/test DB boundaries remain review gates. These are
explicit blockers, not clean baseline exceptions. Only after review may the
artifacts be frozen and genuine feature-missing acceptance authored.

Out of scope: live OpenCode/Copilot verification, WSL setup, detectors,
actionable approval, model/tool dispatch, archives and incident case management.
Material later deviations are recorded externally; never overwrite approved
intent or edit frozen acceptance to accommodate code.
