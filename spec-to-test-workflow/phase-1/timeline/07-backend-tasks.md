# Activity timeline backend and acceptance tasks

Version: 0.1. **Proposed Phase 5 tasks; Phase 6 contract/setup review pending.**
References: [shared design](./05-implementation-design.md),
[single API/UI checklist](./04-shared-checklist.md),
[scenarios](./03-scenarios.md). No endpoint or implementation exists yet.

## 1. Files studied

Read target REQUIREMENTS/TECHNICAL_BASELINE and scoped ingestion/domain/intent/
scenarios/checklist/design. Root inspection found no application build manifests,
routes, handlers, validators, SQL schema/migrations, auth middleware, seed data or
tests to reuse. New paths below follow justified shared greenfield proposals,
not unrelated stock-project conventions.

## 2. Baseline status

READ-1/2/3 are new; all response baselines are **deferred**. Do not call imaginary
endpoints, capture expected values from runtime, or add public fixture routes.
Metadata-validation is an internal boundary here; external agent ingestion and
its final public contract remain separate.

## 3. File-level tasks

SCN suffixes denote `SCN-activity-timeline-###`; checklist suffixes denote
`CHK-TL-###`. All tasks are **not started**.

| ID | Checklist | Target / action | Shared-design responsibility / change | Scenarios |
|---|---|---|---|---|
| BE-TL-001 | 001, 009 | Verify reviewed native account/session prerequisite; target `src/main/java/dev/governance/auth/` only after its own approved design | Establish real principal/private scope from approved native password/2FA/session flow; never stub production auth. This is a dependency gate, not a complete auth implementation task | 001–003, 027, 028 |
| BE-TL-002 | 002, 003, 004, 005, 006 | Add `timeline/ActivityTrace.java`, `ActivityMetadataService.java` under proposed Java package | Domain-owned safe metadata, trusted producer classification, duplicate semantics and parent integrity; independent execution/completeness/coverage/loss | 004–022, 029, 030 |
| BE-TL-003 | 001–007 | Add `TimelineRepository.java`, `JdbcTimelineRepository.java`, reviewed Flyway metadata migration | Scope-bound SQL, atomic uniqueness/conflict rejection, relationships and stable indexed traversal after cursor review; metadata allowlist, no payload blob fields | 001, 003–025, 029, 030 |
| BE-TL-004 | 001, 002, 005, 007, 008 | Add `TimelineReadService.java`, reviewed cursor helper only if needed | Authorize every read, enforce 50/200 response bounds and approved traversal membership/cursors; safe projection and explicit errors; no old receipt-only snapshot assumption | 001–003, 010, 012–018, 023–030 |
| BE-TL-005 | 001, 007, 008 | Add `TimelineController.java`, reviewed API error mapping | Implement proposed READ-1/2/3 after contract approval; derive scope from auth, never request body; no SQL/business logic in controller | 001–003, 023–028 |
| BE-TL-006 | 001–009 | Add native `src/test/java/dev/governance/timeline/*Test.java` and `*IT.java` | JUnit/PostgreSQL test isolation; negative authority, metadata exclusion, hierarchy races and cursor scope; no replacement for browser acceptance | Supporting 001–030 |
| BE-TL-007 | 009 | Prepare `test-support/timeline/` and guarded test lifecycle config | Controlled persisted A/B metadata through isolated nonproduction setup; real auth enrollment/login setup, no public seed endpoint, deterministic cleanup; define how real metadata-service rejection reaches test assertions without a public write route | 001–030 fixture prerequisites |
| BE-TL-008 | 009 | After review/freeze, author `tests/specs/activity-timeline.spec.ts`, reviewed protected baselines if any | Genuine frontend browser acceptance for each frozen SCN; real frontend/backend/DB, feature-missing red, then lock. Do not claim setup/compile failure as red behavior evidence | All frozen 001–030 and added reviewed cases |
| BE-TL-009 | 009 | Prepare root `pom.xml`, Maven Wrapper, root acceptance manifest/config and CI adoption | Pin compatible JDK 25/test/static tooling and Playwright helpers/projects after setup approval; record true baseline, wire guard checks; no automatic install authorization | All executable gates |
| BE-TL-010 | 001, 008, 009 | Add `src/main/java/dev/governance/GovernanceApplication.java`, `src/main/resources/application.yml` | Shared-design runnable backend bootstrap and reviewed profile/configuration boundaries; no automatically enabled fixture endpoint, public test profile or authentication bypass | 001–030 execution prerequisite |

`timeline/` in Java target rows means
`src/main/java/dev/governance/timeline/`. Migration numbering must respect any
preceding native-account migrations, not overwrite them. BE-TL-008 is explicitly
a Phase 8 acceptance-authoring task, before Phase 9 product implementation.

## 4. Server/read case matrix

| Operation / case | Required handling or unresolved decision | Scenario / AMB |
|---|---|---|
| Authenticated own-scope reads | Actual private data only | SCN-001/028 |
| Missing/expired/revoked session | No protected data; explicit authentication requirement | SCN-002/027 |
| Unknown/unowned trace | No cross-account disclosure; exact 404 policy is proposed | SCN-003; AMB-activity-timeline-004 |
| Malformed trace/cursor, tamper, cross-scope cursor, expiry | Reviewed failure schema/status, no silent default | AMB-activity-timeline-004 |
| At/below/above 50 traces / 200 events | Bound every response; explicit traversal without lost/duplicate retained records | SCN-023/024 |
| Repeated identical metadata | One accepted occurrence, original receipt metadata stable | SCN-020 |
| Conflicting duplicate | Reject, no overwrite | SCN-021 |
| Missing/late parent, cycle, cross-scope parent | Inspect unresolved; resolve only valid relations; reject invalid | SCN-010/011 |
| Metadata bodies/unsafe fields/forged guard approval | Safe boundary, no sensitive echo or fabricated authority | SCN-005/019/022; exact rejection policy AMB-004 |
| Execution/completeness/coverage projection | Preserve independent reported evidence and unknowns | SCN-012–018 |
| Dependency unavailable | Explicit read failure, not empty success | SCN-026 |
| Concurrent reads/new metadata/relinking | Cursor cutoff/snapshot semantics and write races must be reviewed | AMB-activity-timeline-004 |
| Absent optional telemetry | No fabricated time/duration/count | SCN-012/017 |

No permission to mutate approvals or dispatch tools/models is added. Operator
gateway grant authority must not become implicit trace-read authority.

## 5. Seed/data needs and isolation

- Human A/B accounts/private scopes; real native login/2FA prerequisites and
  session termination. No session-creation shortcut in a public deployment.
- Stable synthetic event IDs, known receipt/source times, nested/unresolved
  parents, all approval history states, separate execution/telemetry coverage.
- 0/1/49/50/51 trace fixtures; 0/1/199/200/201 event fixtures.
- Safe synthetic rejected body/credential sentinels, duplicate/conflict cases,
  outage/loss fixtures; never real secrets.
- Per-test DB/schema and identity allocation with specifically scoped cleanup.
  Browser worker concurrency must not share mutable trace/account state.
- Trusted fixture producer must be confined to test tooling/builds; no generic
  user event token may assert authoritative guard/approval history.

## 6. Phase 6 conflicts and prerequisites

Native account/authentication design and implementation remain unresolved
dependencies; BE-TL-001 is not a claim that the first slice is independently
ready for a protected browser run. DR-018 selects a separately planned and
acceptance-tested native-auth milestone before timeline delivery. BE-TL-001
verifies that dependency after its own gates pass, not an implicit authorization
to implement it outside the workflow. Never silently replace approved
authentication with a fake demo login.

Finalize shared wire/UI choices and new boundary scenarios, pin setup versions,
resolve test DB/browser/helper paths, record baselines, then approve design/tasks.
These blockers prevent freeze/red authoring now. Full external ingest/durable
guard dispatch/client support remain outside the inspection acceptance claim.

## 7. Coverage

Nine backend checklist responsibilities have tasks. All 30 business scenarios
have backend/read/fixture/acceptance ownership, without claiming their exact
contract candidates are resolved. Existing global source requirements remain
partially included, not wholly implemented by this slice.

## 8. Validation and naming

Use the shared design's owners and proposed names:
`TimelineReadService.readTrace`, `ActivityMetadataService.acceptMetadata`,
`JdbcTimelineRepository`, `AuthenticatedAccountScope`.
Business validation belongs in services/domain; persistence owns transactions;
controllers own protocol translation.

After reviewed setup, proposed target-root command is `.\mvnw.cmd verify`;
browser and guard commands are defined in design section 6. None is an existing
passing command. No dependencies, wrapper, manifests, migrations, tests or
application code have been installed/created by this task-list document.
