# Activity timeline: shared checklist and proposed contracts

Version: 0.1. Prepared: 2026-10-29. Phase 4 review draft.
**Only the source behavior and intent are approved. New shapes, routes, copy,
cursor and error choices below require Phase 6 confirmation before freeze.**

Inputs: [scenarios](./03-scenarios.md), [domain](./01-domain-model.md),
[approved intent](./02-intent-v0.1.md), [scoped register](./00-ingestion.md).
This document alone defines proposed shared shapes; task lists must reference
them, not invent independent frontend/backend contracts.

## 1. Architecture context and discovery

Target is greenfield: root inspection found the four source specifications,
Git metadata and preparation artifacts, without application manifests/source,
frontend routes/components/styles or tests. No existing application pattern is
claimed. Previous target instruction discovery found no AGENTS.md. Do not copy
the unrelated stock projects' authentication, framework versions or conventions.

Selected direction: Java 25/Maven/Spring, PostgreSQL and React/TypeScript/Vite.
Observed Windows PATH: Java 21.0.5 (`java --version`, exit 0), no Maven command,
Node/npm available. No JDK, package or database was installed. There is no
application command to baseline yet; absent tests/manifests are not passing checks.

For this read-only increment, Spring JDBC/Flyway, same-origin session-backed reads
and semantic React rendering are proposals following the baseline direction.
No LangChain4j call, provider key, actual detector, tool execution, active approval
or WSL is required to exercise controlled persisted timeline data.

## 2. Scope and scenario mapping

All SCN suffixes mean `SCN-activity-timeline-###`; full REQ tags remain in the
scenario source. Browser acceptance is primary for every journey; backend
integrity tests supplement authority/persistence assertions.

| Checklist | Responsibility | SCN suffixes | Surface / test level |
|---|---|---|---|
| CHK-TL-001 | Private trace reads and session checks | 001, 002, 003, 027, 028 | Both / browser E2E + supporting backend |
| CHK-TL-002 | Nested/unlinked metadata and available time | 004, 008, 009, 010, 011, 012 | Both / browser E2E + hierarchy integrity |
| CHK-TL-003 | Metadata-only prompt and safe evidence | 005, 019 | Both / browser E2E + persisted exclusion |
| CHK-TL-004 | Read-only trusted approval history | 006, 007, 022 | Both / browser E2E + authority integrity |
| CHK-TL-005 | Execution/completeness/loss and coverage dimensions | 013, 014, 015, 016, 017, 018 | Both / browser E2E |
| CHK-TL-006 | Idempotent accepted history/conflict rejection | 020, 021 | Both / browser E2E + backend integrity |
| CHK-TL-007 | Bounded continuation and manual refresh | 023, 024, 025 | Both / browser E2E + query integration |
| CHK-TL-008 | Explicit failures, loading/navigation/accessibility | 026; other UI edge candidates below | Both / browser E2E |
| CHK-TL-009 | Real auth, isolated persisted fixtures, freeze/red workflow | 028; all scenarios' setup | Both / acceptance setup, never mock replacement |

Every SCN 001 through 028 occurs above. No completed task reference or executed
test is implied; Phase 5 assigns responsibilities.

## 3. Proposed API contract matrix

All endpoints are **new**, baseline **deferred**. No live endpoint was called or
captured. JSON field names/statuses below are proposals, not inferred behavior.

| ID / endpoint | Method | Authentication | Request | Success | Failures |
|---|---|---|---|---|---|
| READ-1 `/api/traces` | GET | Human session; server-derived private scope | Optional opaque `cursor`; no body/scope selector | 200 `TracePage` | 401 session; 400 cursor; 503 dependency |
| READ-2 `/api/traces/{traceId}` | GET | Same, with trace ownership check | Trace ID only | 200 `TraceDetail` | 401; 404 absent/unowned; 503 |
| READ-3 `/api/traces/{traceId}/events` | GET | Same; rechecked on every continuation | Trace ID, optional opaque `cursor` | 200 `EventPage` | 401; 400 cursor; 404 absent/unowned; 503 |

No mutation/approval/production-fixture endpoint is added by this matrix.
Native registration/login/2FA routes are prerequisites with their own review,
not silently specified by a timeline read contract.

### Single-source shared shapes

All dates: proposed UTC RFC3339 with milliseconds for stored receipt precision.
UUID event/trace identifiers are proposed canonical lowercase ASCII strings;
event-ID tie-break uses ordinal comparison. Source time is nullable; never default
it to receipt time. Durations/counts are nullable nonnegative values, not zero
sentinels. Source clock precision/validation still needs explicit review.

| Shape | Proposed fields |
|---|---|
| `TracePage` | `items: TraceSummary[]`, `nextCursor: string or null` |
| `TraceSummary` | `traceId`, `receivedAt`, `executionStatus`, `telemetryStatus`, `guardOutcome: allow/deny/redact/require_approval or null` |
| `TraceDetail` | Summary fields plus safe `identity` reference/display value, `coverage`, `loss` or null; no body fields |
| `coverage` | `input`, `response`, `tools`; each has `status` and safe known `causeCode` or null |
| `loss` | Safe `causeCode`, `missingCount: number or null`, `from: timestamp or null`, `to: timestamp or null` |
| `EventPage` | `items: ActivityEvent[]`, `nextCursor: string or null`; continuation describes loaded records, not capture completeness |
| `ActivityEvent` | `eventId`, `traceId`, `parentEventId: string or null`, `relationship: root/linked/unresolved`, `kind`, `receivedAt`, `sourceAt: timestamp or null`, `durationMs: number or null`, safe `identity`, kind-specific metadata |
| Prompt metadata | No text; applicable `guardOutcome` and `ruleIds` |
| Guard metadata | `outcome`, `policyId`, `policyVersion`, `ruleIds`; trusted origin only |
| Approval metadata | `approvalId`, `state: requested/approved/rejected/canceled/expired`; trusted origin only; never approval controls |
| Model/tool/agent metadata | Safe names and execution status where available; no arguments/results/response text or arbitrary attributes |
| `ApiError` | `code`, safe `message`, `correlationId`; never body values, credentials or arbitrary upstream diagnostics |

Coverage vocabulary proposal: input `guarded/bypassed/unknown/unsupported/degraded`;
response/tools `observed/unknown/unsupported/degraded`. These describe reported
evidence, not proof of enforcement from traffic alone. Exact identity fields/
display values and safe producer permission matrix must be reviewed.

### Cursor/query proposal

- Fixed maxima: 50 traces, 200 events. Do not expose a caller-controlled unlimited
  size. `nextCursor: null` means no further retained records in this traversal,
  not completed execution or complete telemetry.
- Proposed trace order: receipt time descending, then trace ID descending.
  Event traversal: receipt time then event ID ascending; the UI groups linked
  events and uses that order among siblings.
- Signed opaque cursors bind authenticated scope, selected trace and traversal
  cutoff/key. Every request reauthenticates and authorizes independently.
- Proposed traversal cutoff: maximum accepted receipt key at first read. Later
  events appear on manual refresh, not unpredictably injected into the same
  traversal. This is not a historical snapshot of mutable trace status/hierarchy.
- A linked parent not loaded yet is distinguished from a genuinely unresolved
  parent by backend `relationship` metadata. Do not infer missing parent from
  one response's contents. Load-more eventually makes the retained parent
  inspectable; reject cycles/cross-scope links at write validation.

These are observable proposed choices under AMB-activity-timeline-004. Add
scenarios for cursor scope/tampering, concurrent arrival, and exact ordering/
precision after approval. No freeze while these remain unapproved.

### Integrity and metadata boundary

Use an allowlist of known fields; proposed policy is explicit rejection of
unsupported content-bearing fields before persistence, with a safe field-category
reason and no value echo. This reject-versus-omit decision is not yet approved.
Reporters do not choose authenticated scope/origin or create authoritative guard/
approval history. Resolve internal producer permissions before implementation.
Accepted event ID/content is immutable for deduplication; receipt time assigned
on first acceptance is preserved on identical retry. Relinking is separately
derived hierarchy state, not permission to rewrite accepted source metadata.

## 4. Proposed UI and copy contract matrix

All elements are new; no DOM was inspected as an expectation source.
Representative routes: `/traces` and `/traces/:traceId`. No test IDs or CSS-path
locators are proposed. Use roles/labels first and approved exact text second.

| Element | Semantic role/name or proposed copy | Scenario / open case |
|---|---|---|
| Trace list heading | heading `Activity traces` | 001, 023 |
| Trace item | link `Open trace {traceId}` | 001, 003, 023 |
| Trace list empty | status `No traces recorded.` | 023 zero case |
| Trace detail heading | heading `Activity timeline` | 001, 028 |
| Receipt-order description | text `Ordered by receipt time.` | 008, 009 |
| Event tree | nested list `Activity events`; group name `Unlinked activity` where needed | 004, 010 |
| Expand event | button `Expand event {eventId}`, `aria-expanded` toggled; corresponding collapse name | 001, 004 |
| Event metadata | definition lists with labels `Received`, `Source time`, `Identity`, `Duration`, `Guard outcome`, `Rules` | 005, 008, 012 |
| Missing value | `Unavailable` for unknown source time/duration | 012 |
| Approval history | heading `Approval history`; exact state names as values, no actionable controls | 006, 007 |
| Execution/completeness | labels `Execution status`, `Telemetry status`; distinct reported values | 013–017 |
| Coverage | labels `Input enforcement`, `Response observation`, `Tool and lifecycle visibility` | 018 |
| Loss extent | labels `Loss cause`, `Missing events`, `Missing time range`; `Unknown` for unknown extent | 016, 017 |
| Trace/event continuation | buttons `Load more traces`, `Load more events`; disabled while pending | 023, 024; double request pending decision |
| Manual refresh | button `Refresh`; disabled while pending | 025, 026 |
| Initial loading | status `Loading activity...`; no successful empty-state placeholder | UI candidate |
| Read error | alert `Activity could not be loaded.` with safe correlation ID; retry button `Try again` | 026 |
| Session required | `Sign in to view activity.`; link to reviewed login flow | 002, 027 |
| Missing/unowned trace | `Trace is unavailable.` without another account's data | 003 |

No body pane, body download, approve/reject action, workspace controls, filters,
search, automatic polling or live-token rendering is present.

### Proposed interaction decisions still requiring scenarios/review

- Preserve expanded event identities across successful manual refresh when
  records remain present. Reset loaded cursor traversal for refresh.
- Keep previously loaded data visibly stale if refresh fails; do not erase it
  into a misleading empty trace. Never keep protected data visible after
  session termination is established.
- Cancel/ignore superseded requests when navigating between traces. Responses
  for A must not populate B. Disable repeat refresh/load-more while pending.
- Keyboard-operable expansion/continuation, focus preservation and polite loading
  announcements. No new custom role widget unless needed.

Add reviewed scenarios for these candidates before freeze. No invented passing
accessibility or double-submit result is claimed from a proposed UI matrix.

## 5. Discovery and acceptance boundaries

No existing screens/locators exist to inspect with playwright-cli. At setup,
resolve the actual Playwright project, installed playwright-cli and helper paths;
missing helper/browser tools remain setup gaps. Do not replace native browser
acceptance with subprocess/library tests.

Protected UI acceptance path proposal: `tests/specs/activity-timeline.spec.ts`
at the target acceptance root. Any required API-support tests are additional;
they never replace browser acceptance. Supporting Java and frontend unit tests
stay outside protected acceptance paths.

Fixtures need persisted A/B account histories, real authentication and negative
session cases, synthetic trusted guard/approval origins and isolated cleanup.
Use nonproduction setup code excluded from public artifacts, not a public seed
route or a mock login cookie. A browser-storage snapshot is usable only if derived
from the real approved native authentication flow. Account/login prerequisites
must be implemented/tested honestly, not declared present.

## 6. Native baseline and setup gaps

| Check | Actual observation | Required disposition |
|---|---|---|
| Java | `java --version`: 21.0.5, exit 0, target root | JDK 25 not established on PATH; no installation authorized |
| Maven | Command unavailable on PATH | Plan local wrapper; pin/check distribution before creating |
| Backend build/tests/static checks | No manifest/source/config | Not run, not passing; define native commands after reviewed setup |
| Frontend build/typecheck/lint/tests | No frontend manifest/source/config | Not run; React/TS/Vite direction is not an installed toolchain |
| PostgreSQL / integration isolation | No target service/config tested | Provision reviewed test DB/containers; no SQLite substitute |
| Playwright/browser/helpers | No target runner/project/helper paths resolved | Setup decision before freeze/red tests; no install performed |
| Freeze integrity | No timeline frozen plan/manifest | Wire existing guard after reviewed adoption; no checksum fabrication |

No native application baseline exists yet. Documentation validation is separate
from application verification. Missing tools/manifests are setup gaps, not
pre-existing test failures to suppress.

## 7. Phase 5/6 handoff

Prepare one proposed implementation design and distinct frontend/backend task
lists referencing this shared matrix. New contract/copy/interaction choices need
review and source/scenario reconciliation before freeze. Required review blockers:
AMB-activity-timeline-004 through 007, real native-auth prerequisites, tool versions/
commands and test setup. Do not declare the first slice ready for coding merely
because a design proposal exists.
