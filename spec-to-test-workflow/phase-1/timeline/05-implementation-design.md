# Activity timeline implementation design

Version: 0.1. Prepared: 2026-10-29. **Proposed; Phase 6 review pending.**
Implementation context only; behavior comes from the approved specification/
intent and later frozen scenarios. No production files or tools were created.

## 1. Sources and decisions

- [Requirements/register](./00-ingestion.md), eleven scoped REQs.
- [Domain](./01-domain-model.md), fourteen invariants.
- [Intent v0.1](./02-intent-v0.1.md), approved DR-017.
- [30 draft scenarios](./03-scenarios.md), including two approved-rule coverage
  additions from the review.
- [Single shared checklist/contract matrix](./04-shared-checklist.md).
- No target AGENTS.md or existing application conventions established.
- Open decisions: AMB-activity-timeline-004/005/006/007. Contract/UI proposals,
  native authentication prerequisites and actual tool versions remain blockers,
  not private implementation details this design can approve.

**Review update:** DR-018 sequences a separately planned and acceptance-tested
native-auth milestone before timeline delivery. Do not treat authentication as
an available dependency until that milestone's gates pass. Other review findings
and contract/setup blockers remain in [the review report](./08-review.md).

## 2. Files and patterns studied

| Scope / evidence | Finding | Reuse / departure |
|---|---|---|
| Target root and source baseline | Specifications only, no application manifest/routes/components/tests | Greenfield proposal; no imaginary existing helper or middleware |
| Source REQUIREMENTS/TECHNICAL_BASELINE | Java 25/Spring/Maven/PostgreSQL and React/TS/Vite direction | Reuse selected stack direction; versions/installations still unresolved |
| Scoped domain/intent/scenarios/checklist | Read-only metadata inspection, real frontend acceptance | Keep core detector, external clients, actionable approval and archives out |
| Existing workflow guard guidance | Protected UI test layout; plan/tests lock after review/red | Adopt unchanged mechanical guard; review unlocked helpers/config |

No unrelated stock project source was studied or copied as Java/frontend prior
art. No current screen exists for locator discovery.

## 3. Proposed structure and ownership

All paths below are new, relative to the target root. Backend package prefix
`dev.governance` and frontend folder `web` are naming proposals, not existing
conventions. Prefer a single backend application, not microservices.

| Path / module | Owner / responsibility | Allowed dependencies / reason |
|---|---|---|
| `pom.xml`, `.mvn/`, `mvnw.cmd` | Backend build and JDK 25/native test tooling | Local reviewed wrapper; no global Maven requirement |
| `src/main/java/dev/governance/GovernanceApplication.java`, `src/main/resources/application.yml` | Runnable backend bootstrap and reviewed configuration | No fake login, public fixture route or automatically enabled production test profile |
| `src/main/java/dev/governance/timeline/ActivityTrace.java` | Immutable trace/event metadata and validated domain value types | Java only; no controller, DB or frontend dependency |
| `src/main/java/dev/governance/timeline/TimelineReadService.java` | Scoped read orchestration, bounded traversal and truthful projection | Domain + repository contract; never trusts request scope |
| `src/main/java/dev/governance/timeline/ActivityMetadataService.java` | Safe metadata validation, producer authority, duplicate/parent integrity | Domain + transaction/repository; cannot grant human approval |
| `src/main/java/dev/governance/timeline/TimelineRepository.java` | Explicit scope-bound persistence operations | JDBC implementation only where needed; no generic repository framework |
| `src/main/java/dev/governance/timeline/JdbcTimelineRepository.java` | Scoped SQL, atomic uniqueness/conflict handling, hierarchy lookup | Spring JDBC/PostgreSQL; expose metadata only |
| `src/main/java/dev/governance/timeline/TimelineController.java` | READ-1/2/3 request/response validation and safe error mapping | Read service + authenticated principal; no inline SQL/business rules |
| `src/main/resources/db/migration/V001__activity_timeline.sql` | Metadata schema, scope/event uniqueness and query indexes | Flyway; revise numbering if auth migrations precede this; no payload blob columns |
| `web/src/api/activityTimeline.ts` | Shared-contract client and typed failure handling | Browser transport/types, no local authorization assumptions |
| `web/src/features/timeline/useActivityTimeline.ts` | Loading, continuation, refresh, cancellation and stale-request ownership | API client + pure model helpers; components do not orchestrate fetching |
| `web/src/features/timeline/activityHierarchy.ts` | Merge loaded records by ID, receipt-order siblings and unresolved/loaded-parent distinctions | Pure types/functions, no networking |
| `web/src/features/timeline/TraceList.tsx` | Accessible private trace summaries/loading/error/continuation | Hook/client owner; no persistence or permission definition |
| `web/src/features/timeline/ActivityTimeline.tsx` | Detail composition, event expansion and independent evidence dimensions | Hook + presentational event/evidence components |
| `web/src/features/timeline/ActivityEventItem.tsx` | Semantic event metadata/children/approval-history rendering | Pure props; never accepts body HTML or offers approval actions |
| `web/src/app/routes.tsx`, `web/src/features/timeline/timeline.css` | Routing and scoped minimal styling | No new arbitrary UI library necessary; semantic controls first |
| `web/index.html`, `web/src/main.tsx`, `web/src/app/App.tsx`, `web/vite.config.ts` | Runnable frontend entry/application composition and reviewed development proxy | Target React app, not a static test-only screen; same-origin production deployment strategy still reviewed |
| `tests/specs/activity-timeline.spec.ts` | Protected browser acceptance for frozen SCNs | Real browser/backend/persisted fixtures; not mocked successful API |
| `test-support/timeline/` | Nonproduction deterministic fixture provisioning/cleanup | Separate build/test entry; never a public production seed endpoint |

Extract DTOs, evidence display or cursor helpers only where a clear responsibility
requires it; this table is representative, not a mandatory file-count target.

### Boundaries, errors and side effects

- Authentication resolves human/account scope before every read. Native account/
  2FA/session functionality is a prerequisite, **not an existing reusable module**.
  Finalize that bounded design or explicitly sequence an auth milestone before
  asserting real authenticated browser acceptance.
- Permission checks belong to backend auth/read services. Hiding a link is not
  authorization. Operator gateway grants do not imply timeline data access.
- Metadata service owns safe fields, producer classification, deduplication and
  relationship validation. The timeline is read-only to humans; actual production
  integration ingest remains outside this increment unless separately selected.
- PostgreSQL enforces scoped identity uniqueness; transaction checks prevent
  conflicting duplicate overwrites and invalid relinking. Retry publication must
  not dispatch models or mutate human approval authority.
- Receipt ordering/parent logic is shared semantically, not duplicated as separate
  contradictory frontend/server rules. Backend knows retained parent validity;
  frontend distinguishes not-yet-loaded parents from genuinely unresolved parents.
- Controllers map known errors safely. No broad catch returning empty success,
  arbitrary body field echo, guessed durations or optimistic completeness.
- React renders escaped metadata text. No unsafe HTML/body pane; abort/ignore
  stale requests on navigation and prevent parallel duplicate continuation.
- Native auth, event write durability/recovery and cursor concurrency semantics
  must be reviewed before claiming full first-increment implementation readiness.
- The receipt-key-only traversal cutoff is withdrawn (R-TL-001). Follow the
  replacement proposal only after its membership/expiry/cap/deletion semantics
  are confirmed in the shared checklist; do not silently implement the old cutoff.

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
| Scope/hierarchy/evidence projection | `src/test/java/dev/governance/timeline/*Test.java`, JUnit | Pure synthetic values; SCN-004/008–018 |
| JDBC scope/idempotency/parent validation | Same package `*IT.java`, PostgreSQL Testcontainers | Isolated DB/schema; SCN-003/011/020/021/022 |
| Metadata body exclusion | Domain/JDBC integration tests plus browser assertions | Synthetic sentinel values; inspect persistence/read/error paths; SCN-005/019 |
| Cursor limits/consistency | Query integration tests | >50 traces/>200 events, scoped cursor validation; SCN-023/024 plus reviewed new cases |
| Hook request state and hierarchy | `web/src/features/timeline/*.test.ts(x)`, proposed native frontend runner | Abort/race/empty/error cases, deterministic promises; supplement real E2E |
| Browser acceptance | Protected `tests/specs/activity-timeline.spec.ts`, Playwright | Real app/server/DB and real auth; A/B isolation, fixtures per test |

Supporting mocks can test isolated failure/race logic; they cannot stand in for
the browser's end-to-end success journey. Reuse real auth setup rather than
forging a cookie. Guard all fixture tools against public/production execution.

## 6. Quality baseline and commands

Commands below are **proposed setup targets**, not existing scripts or successful
checks. They become exact runnable commands only once reviewed manifests/
configuration exist. All application baselines remain not run.

| Gate | Proposed command / working directory | Current disposition |
|---|---|---|
| Java format/static analysis/build/tests | `.\mvnw.cmd verify`, target root | JDK 25/wrapper/plugins/dependency versions not yet established |
| Frontend type check | `npm run typecheck`, `web` | No manifest/script; not run |
| Frontend lint | `npm run lint`, `web` | Proposed ESLint configuration; not run |
| Frontend tests | `npm test -- --run`, `web` | Proposed Vitest setup; not run |
| Frontend production build | `npm run build`, `web` | Vite/TS dependencies unpinned; not run |
| Protected browser acceptance | `npx playwright test tests/specs/activity-timeline.spec.ts --project=chromium`, acceptance root | Project/helper/browser/install paths not resolved; not run |
| Acceptance integrity | `node .\\scripts\\ai\\freeze-guard.mjs verify activity-timeline`, acceptance root | Guard adoption and frozen plan absent; no vacuous pass claimed |

Select compatible pinned Maven/JUnit/Testcontainers/format/static tooling and
React/Vite/TypeScript/Playwright/helper versions during approved setup. Do not
install packages from a design document alone. Record true baselines before
implementation; no introduced violations or weakened exclusions.

## 7. Review and deviations

Phase 6 must decide the proposed shared contract/UI behavior, remaining scenarios,
authentication prerequisite plan, trusted fixture/metadata origins, native
tooling/commands and deployment/test DB boundaries. These are explicit blockers,
not clean baseline exceptions. Only then finalize tasks and freeze/red authoring.

Out of scope: live OpenCode/Copilot verification, WSL setup, detectors,
actionable approval, model/tool dispatch, archives and incident case management.
Material later deviations are recorded externally; never overwrite approved
intent or edit frozen acceptance to accommodate code.
