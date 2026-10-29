# Incident activity timeline: scoped ingestion

Version: 0.2. Prepared: 2026-10-29. Feature key: `activity-timeline`.
Status: **Journey and package confirmed under DR-015/DR-016. Scoped domain gate
ready; diagram approval, exact contracts and implementation remain gated.**

**Progress update:** the domain model is prepared and intent v0.1 is approved
under DR-017. The [28 scenario draft](./03-scenarios.md),
[shared checklist](./04-shared-checklist.md), [design](./05-implementation-design.md)
and separate [frontend](./06-frontend-tasks.md)/[backend](./07-backend-tasks.md)
tasks are prepared for review. Exact contract/UI choices, authentication
prerequisites and actual toolchain/fixture setup remain blockers before freeze.

## 1. Source inventory

| Source | Revision / authority | Sections used |
|---|---|---|
| [Requirements](../../../REQUIREMENTS.md) | SHA-256 `00E9CCDAD6277625F68B586CE6832C6E793598D6BCF929D1CB44EEEB53C3AF1D`; primary oracle | Confirmed timeline subsection and included MON/GUARD/AUTH/EVT/UI/API/ARC requirements; full proposed EVT-002/003/UI-002 remain proposed |
| [Timeline scope](../09-timeline-first-slice.md) | SHA-256 `2193E3C1C11E5FDA657C1B5799EBC8FBA57954B39991E1826B8E6D536D41986D` | Confirmed frontend journey, metadata-only prompt log and read-only bounded inspection package |
| [Confirmation record](../05-decision-record.md) | DR-014/DR-015/DR-016 | Frontend acceptance mandatory; no library-subprocess replacement; no prompt bodies; confirmed behavior package |
| [Decision proposals](../04-decision-proposals.md) | DP-07/DP-14, unapproved where not expressly confirmed | Event/order/query suggestions, discovery only until approval |
| Versioned intent | Not yet produced | Requires settled domain behavior then explicit user approval |
| Implementation/tasks/tests | Not present for this slice | Later workflow outputs, not behavioral oracles |

No live agent, browser, API response or existing test was used to choose expected
behavior. Root graph generation `2026-10-27T05:00:43Z` is stale/not-tracked for
these documents; current source reads and fingerprints govern this preparation.

The original version 0.1 used requirements fingerprint
`9304761929ED49510AEB726F7D6FFE7E4964DE1F5A2E65DA1D9571C32F483FB0` and scope
fingerprint `58E68F6834AC9134B76A16CE6EC2D8B17950146A0D82F1F92B51B8AC8E2DB229`.
Those are historical pre-confirmation snapshots, not current fingerprints.

## 2. Confirmed scoped requirement register

Scoped IDs refine included portions of existing parent rows. They neither
renumber the 72 global requirements nor imply that a full parent requirement
passes when this inspection slice works.

| ID | Observable requirement | Source | Level | Testability |
|---|---|---|---|---|
| REQ-activity-timeline-001 | An authenticated human can locate and inspect traces only within their private account scope | AUTH-001, UI-001 | Browser + backend | Blocked: exact read/auth contract |
| REQ-activity-timeline-002 | Expand reported prompt/guard, agent, model and tool activity as a correlated nested timeline | MON-001, UI-001, EVT-001 | Browser + backend | Blocked: event/read contract |
| REQ-activity-timeline-003 | Prompt log contains event/time/identity/guard outcome/rule metadata, never original or redacted prompt bodies | DR-015, MON-001, UI-001 | Browser + backend/storage | Testable at confirmed boundary |
| REQ-activity-timeline-004 | Show reported approval lifecycle without fabricating a granted approval or treating an observation as authority | GUARD-002/006, DR-015 | Browser + backend | Blocked: inspection/action boundary |
| REQ-activity-timeline-005 | Distinguish event ordering, hierarchy and available duration from unavailable facts | MON-002 | Browser + backend | Blocked: ordering/time contract |
| REQ-activity-timeline-006 | Distinguish empty recorded activity from missing/unsupported telemetry and interrupted execution | MON-002, UI-001 | Browser + backend | Blocked: completeness states |
| REQ-activity-timeline-007 | Incomplete trace metadata exposes the known cause/extent without inventing unknown counts or time ranges | EVT-004 | Browser + backend | Testable business rule; wire/copy pending |
| REQ-activity-timeline-008 | Separate input enforcement, response observation and tool/lifecycle coverage; never claim unexposed capture | INT-008, MON-003 | Browser + backend | Blocked: coverage contract |
| REQ-activity-timeline-009 | No reasoning text, model output bodies, tool arguments/results, credentials or arbitrary payload bodies enter this metadata-only timeline | ARC-002, INT-009, DR-015 boundary | Browser + backend/storage | Testable exclusion; metadata allowlist pending |
| REQ-activity-timeline-010 | Read failures are explicit and distinguishable from successful empty/complete results | API-001, UI-001 | Browser + backend | Blocked: error/copy contract |
| REQ-activity-timeline-011 | Frontend acceptance uses real browser/backend reads over persisted controlled metadata, not a static fake screen or substitute unit suite | DR-014/015 | Browser end-to-end | Testable boundary; setup pending |

REQ-activity-timeline-009 narrows this inspection slice to metadata throughout;
it does not create an ordinary archive requirement. Credentials/reasoning remain
excluded even if they arrive through a generic event object.

## 3. Confirmed behavior package

The following package was **explicitly approved under DR-016** for this slice:

1. **Inspection-only first increment.** Show approval requested, approved, rejected,
   canceled and expired where trusted records report them. Do not provide
   approve/reject controls or claim that this read model enforces approval.
2. **Receipt ordering.** Within each sibling group, order by server receipt time
   ascending, then event ID ascending as tie-breaker; label the order as receipt
   order. Keep reported source time separately, never trust cross-machine clocks
   as proof of causality. Parent relationships determine nesting, not timestamps.
3. **Missing and late parents.** Keep unresolved events inspectable as unlinked
   activity; resolve hierarchy when a valid parent becomes available. Reject
   cycles and cross-scope parent references; never invent parents/durations.
4. **Separate statuses.** Execution: running/completed/failed/canceled/unknown.
   Telemetry: complete/incomplete/unknown/unsupported. A completed execution can
   still have incomplete telemetry. `complete` requires trusted positive evidence,
   not merely absence of a reported loss.
5. **Bounded reads/manual refresh.** At most 50 trace summaries and 200 timeline
   events per response, with explicit continuation/load-more and manual refresh.
   No live token stream, automatic polling, filters or free-text search in the
   initial increment. Never silently truncate; partial event loading is separate
   from telemetry incompleteness.
6. **Authenticated metadata.** Scope and reporter identity come from authentication.
   Authoritative guard/approval records are not created by arbitrary event tokens.
   Identical scoped event IDs/content are idempotent; conflicting duplicates fail
   rather than overwrite existing history.

Approval selects these business semantics only for this slice, not all of
EVT-002/003/UI-002 or the larger DP-07 proposal. Exact schema/HTTP status/cursor
semantics, permission checks, UI copy and implementation remain subsequent work.

## 4. Ambiguity register

| ID | Question | Disposition before confirmation | Gate |
|---|---|---|---|
| AMB-activity-timeline-001 | Inspection-only versus actionable approval? | Resolved DR-016: inspection-only | Resolved domain/intent |
| AMB-activity-timeline-002 | Event ordering, unlinked parents, completeness, duplicate handling? | Resolved DR-016: package items 2/3/4/6 | Resolved domain/intent |
| AMB-activity-timeline-003 | Initial read bounds, refresh and query features? | Resolved DR-016: package item 5 | Resolved intent/scenarios |
| AMB-activity-timeline-004 | Exact scoped read/event shapes, cursor/snapshot semantics, status/error mappings? | Define shared contracts before freezing; no guessed wire expectations | Contract/freeze |
| AMB-activity-timeline-005 | Exact accessible UI states, labels, copy and navigation/loading behavior? | Derive declared UI matrix, then review; no DOM-derived expected values | Scenarios/contracts |
| AMB-activity-timeline-006 | Minimum real authentication versus account-flow implementation dependency? | Preserve mandatory native login/2FA/private scope; test identity setup is not production authentication | Design/acceptance |
| AMB-activity-timeline-007 | Isolated persisted fixtures, genuine red browser failures, native/runtime tooling and CI? | Java 25/Maven direction confirmed; tooling/setup still not installed or baselined | Design/freeze/red |

No domain-blocking package decision remains. Requirements with pending wire/copy/
setup assertions remain blocked at their exact-acceptance gates; their now-
confirmed business behavior can be modeled without inventing those details.
Later contract/setup gaps are not a reason to wait for Linux.

## 5. Coverage plan and traceability skeleton

Each scoped REQ will receive at least one browser acceptance scenario, plus
applicable negative/boundary coverage. SCN and test file references are pending
intent approval; they are not passing, frozen or executable tests yet.

| REQ suffix | Positive coverage | Negative / boundary coverage |
|---|---|---|
| 001 | Human opens their listed trace | Unauthenticated/expired session, guessed other-account trace, no operator data-access assumption |
| 002 | Nested prompt/guard/model/tool/agent events | Missing relation, unsupported activity, large/partial timeline |
| 003 | Exact safe prompt metadata | Seeded synthetic body fields never stored/returned/rendered |
| 004 | Trusted approval lifecycle records inspected | Missing resolution, event-token forged authority, no approval inferred |
| 005 | Available order/duration/hierarchy | Clock disagreement, absent source time/duration, late parents |
| 006 | Empty versus incomplete/unsupported | Completed execution with missing telemetry; no false success |
| 007 | Known loss cause/count/range | Unknown extent remains unknown; no separate invented gap event |
| 008 | Independent coverage dimensions | Native bypass, unknown/unexposed capture, degraded tool visibility |
| 009 | Metadata-only useful timeline | Reasoning/credentials/tool bodies rejected or excluded per reviewed input contract; no sensitive echo |
| 010 | Successful reads | Loading, unavailable backend, authorization failure and recoverable error, never empty fallback |
| 011 | Real browser/backend/persisted fixture journey | No production test-seed route, isolated account fixtures, no real provider dependency |

## 6. Handoff

Package items 1 through 6 and intent v0.1 are confirmed. Domain, scenario and
design/task drafts are prepared. Proceed to explicit shared contract/setup/
design review, add or concretize the identified UI/wire candidate scenarios,
and resolve native authentication prerequisites before freeze/red tests.
Existing guard-core diagrams/tests cannot stand in for this user-facing journey.
WSL remains deferred.
