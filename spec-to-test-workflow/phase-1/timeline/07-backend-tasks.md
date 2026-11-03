# Activity timeline backend and acceptance tasks

Version: 0.2. Updated: 2026-11-03. **Revised task draft under DR-044; not frozen.**
References: [shared design](./05-implementation-design.md),
[single API/UI checklist](./04-shared-checklist.md),
[scenarios](./03-scenarios.md). No endpoint or implementation exists yet.

## 1. Existing backend surface

The backend is the sibling `ai-runtime-governance-backend` repository. Its
existing `pom.xml` declares Java 25 and Spring Boot 4.1.2; the runnable
`local.governance.GovernanceApplication`, native-auth controllers/services,
Spring JDBC/Flyway configuration, V1 auth migration, and JUnit test layout are
already present. `local.governance.test.TestControlController` is conditional on
the test-control property and requires `X-Test-Token`; the test profile binds
that surface to loopback per the current handover.

READ-1/2/3 and timeline metadata persistence are new. Extend the existing
application, packages, migration sequence and test harness; do not create a
second bootstrap, auth module, or public fixture endpoint.

## 2. Baseline status

READ-1/2/3 and timeline persistence are new; their response baselines are
**deferred**. Native-auth endpoints and session handling already exist and passed
their recorded gates, but no timeline runtime result exists. Do not capture
expected timeline values from a nonexistent endpoint or add public fixture
routes. Metadata validation remains an internal service boundary here; external
agent ingestion and its final public contract remain separate.

## 3. File-level tasks

SCN suffixes denote `SCN-activity-timeline-###`; checklist suffixes denote
`CHK-TL-###`. All tasks are **not started**.

| ID | Checklist | Target / action | Shared-design responsibility / change | Scenarios |
|---|---|---|---|---|
| BE-TL-001 | 001, 009 | Integrate timeline authorization with existing session/authentication services under `ai-runtime-governance-backend/src/main/java/local/governance/authentication/` | Resolve the real authenticated account/private scope on each read; do not duplicate or stub the completed native-auth module | 001–003, 027, 028 |
| BE-TL-002 | 002, 003, 004, 005, 006 | Add domain/services under `ai-runtime-governance-backend/src/main/java/local/governance/timeline/` | Domain-owned safe metadata, trusted producer classification, duplicate semantics and parent integrity; independent execution/completeness/coverage/loss | 004–022, 029, 030 |
| BE-TL-003 | 001–007 | Add `TimelineRepository.java`, `JdbcTimelineRepository.java`, and `V2__activity_timeline.sql` in the existing backend | Scope-bound SQL, atomic uniqueness/conflict rejection, trace/event snapshot membership; metadata allowlist, no payload fields; preserve deleted members as data-free tombstones | 001, 003–025, 029–034, 039 |
| BE-TL-004 | 001, 002, 005, 007, 008 | Add `TimelineReadService.java` and reviewed cursor helper only if needed | Authorize every read, enforce 50/200 response bounds and the approved 10,000-member/five-active/five-minute shared trace/event traversal policy; explicit traversal and invalid-cursor errors; no long-lived transaction or receipt-only cutoff | 001–003, 010, 012–018, 023–034, 039–040 |
| BE-TL-005 | 001, 007, 008 | Add `TimelineController.java` under `local.governance.timeline.api`; add individual DTO records under `local.governance.api` | Implement proposed `/api/v1/traces` READ-1/2/3 from the shared OpenAPI contract; event/trace traversal status codes and 400 `REQUEST_INVALID` are approved; derive scope from auth, never request body; no SQL/business logic in controller or `ApiDtos` container | 001–003, 023–028, 031–034, 039–040 |
| BE-TL-006 | 001–009 | Add JUnit tests under `ai-runtime-governance-backend/src/test/java/local/governance/timeline/` | Use existing Spring/JUnit setup and the reviewed PostgreSQL 17.6 profile; test authority, unsupported-field rejection/no echo/no persistence, cause-code validation, hierarchy races, trace/event snapshot membership, caps, expiry, invalid cursors and tombstones. Do not assume Testcontainers is installed | Supporting 001–040 |
| BE-TL-007 | 009 | Extend `ai-runtime-governance-backend/src/main/java/local/governance/test/TestControlController.java`; add fixture helpers under `ai-runtime-governance/tests/support/` | Through loopback-only, token-protected test controls, invoke the same metadata validation/dedup/producer-authority service path; use existing awaited reset lifecycle; no public seed endpoint | 001–038 fixture prerequisites |
| BE-TL-008 | 009 | After review/freeze, author `ai-runtime-governance/tests/specs/activity-timeline.spec.ts` | Genuine browser acceptance for each approved frozen SCN; real frontend/backend/DB and real auth; feature-missing red, then lock. SCN-031–040 wording is approved but not frozen | All approved frozen scenarios |
| BE-TL-009 | 009 | Reuse existing backend `pom.xml`, frontend manifest, root Playwright configs and freeze guard | Verify recorded Java/Maven/Node/Playwright/PostgreSQL baselines; validate the shared OpenAPI 3.1 schema and test-only aliases; no duplicate wrapper or unapproved installation | All executable gates |
| BE-TL-010 | 001, 008, 009 | Integrate reviewed timeline properties into existing `GovernanceApplication.java` / `application.yml` | Reuse the current application and test profile; test controls stay disabled by default and production auth remains mandatory | 001–040 execution prerequisite |

`timeline/` in Java target rows means
`ai-runtime-governance-backend/src/main/java/local/governance/timeline/`.
The existing migration is `V1__auth_core.sql`; the timeline migration is next in
the Flyway sequence. BE-TL-008 remains a Phase 8 acceptance-authoring task,
before Phase 9 product implementation.

## 4. Server/read case matrix

| Operation / case | Required handling or unresolved decision | Scenario / AMB |
|---|---|---|
| Authenticated own-scope reads | Actual private data only | SCN-001/028 |
| Missing/expired/revoked session | No protected data; explicit authentication requirement | SCN-002/027 |
| Unknown/unowned trace | No cross-account disclosure; exact 404 policy is proposed | SCN-003; AMB-activity-timeline-004 |
| Malformed trace/cursor, tamper, cross-scope cursor | Reviewed failure schema/status, no silent default | AMB-activity-timeline-004 |
| Traversal snapshot/concurrent commit | Snapshot committed event or trace IDs at first successful read; later commits are visible only after refresh | SCN-031/039; DR-044/046 |
| Traversal expiration and active/member caps | Shared five-minute expiry, five active per account, 10,000 members; explicit 410/429/422 error mapping | SCN-032–034/039; DR-044/045/046 |
| Deleted snapshot members | Preserve cursor position using data-free tombstones; disclose no deleted event details | DR-044; supporting integrity case |
| At/below/above 50 traces / 200 events | Bound every response; explicit traversal without lost/duplicate retained records | SCN-023/024 |
| Repeated identical metadata | One accepted occurrence, original receipt metadata stable | SCN-020 |
| Conflicting duplicate | Reject, no overwrite | SCN-021 |
| Missing/late parent, cycle, cross-scope parent | Inspect unresolved; resolve only valid relations; reject invalid | SCN-010/011 |
| Metadata bodies/unsafe fields/forged guard approval | Reject unsupported/content-bearing fields with no value echo/persistence; no fabricated authority | SCN-005/019/022; DR-050 |
| Execution/completeness/coverage projection | Preserve independent reported evidence and unknowns | SCN-012–018 |
| Dependency unavailable | Explicit read failure, not empty success | SCN-026 |
| Concurrent reads/new metadata/relinking | Use server-managed trace/event membership; verify snapshot barriers, shared caps, expiry and tombstones | SCN-031–034, 039; DR-044/046 |
| Absent optional telemetry | No fabricated time/duration/count | SCN-012/017 |

No permission to mutate approvals or dispatch tools/models is added. Operator
gateway grant authority must not become implicit trace-read authority.

## 5. Seed/data needs and isolation

- Human A/B accounts/private scopes through the existing real native-auth
  registration/login/2FA flow and session termination. No session-creation
  shortcut in a public deployment.
- Stable synthetic event IDs, known receipt/source times, nested/unresolved
  parents, all approval history states, separate execution/telemetry coverage.
- 0/1/49/50/51 trace fixtures; 0/1/199/200/201 event fixtures.
- Safe synthetic rejected body/credential sentinels, duplicate/conflict cases,
  outage/loss fixtures; never real secrets.
- Reuse `ai-runtime-governance/tests/support/reset-hook.ts` for awaited reset
  behavior; allocate isolated fixture identities/data and specifically scoped
  cleanup. Browser workers must not share mutable trace/account state.
- Trusted fixture producer must be confined to test tooling/builds; no generic
  user event token may assert authoritative guard/approval history.

## 6. Phase 6 conflicts and prerequisites

The native-auth prerequisite is implemented and its recorded checks passed.
BE-TL-001 integrates with that real session/account boundary; it is not permission
to bypass it, forge cookies or create a second authentication module. The
timeline-specific persisted fixture setup and cross-account authorization tests
remain to be designed and run.

The traversal, test-harness and schema directions are approved by DR-044.
SCN-031–040 wording and trace/event traversal status mapping are approved by
DR-045–049. Remaining wire/UI details, setup versions, test DB/browser/helper
paths and true baselines still require review. These blockers prevent freeze/red
authoring now. Full
external ingest/durable
guard dispatch/client support remain outside the inspection acceptance claim.

## 7. Coverage

Nine backend checklist responsibilities have tasks. All 40 scenario IDs have
backend/read/fixture/acceptance ownership; SCN-031–040 wording is approved but
not frozen or executed. Existing global source
requirements remain
partially included, not wholly implemented by this slice.

## 8. Validation and naming

Use the shared design's owners and proposed names:
`TimelineReadService.readTrace`, `ActivityMetadataService.acceptMetadata`,
`JdbcTimelineRepository`, `AuthenticatedAccountScope`.
Business validation belongs in services/domain; persistence owns transactions;
controllers own protocol translation.

Use `mvn -f ..\ai-runtime-governance-backend\pom.xml test` from the docs
repository root after rechecking the local JDK/Maven environment. The backend
manifest, application, V1 migration, frontend manifests and Playwright/guard
commands already exist. Timeline code, migration and acceptance tests do not;
their baselines remain unrun. Do not add a wrapper or dependency merely to match
the old greenfield draft.
