# Activity timeline: shared checklist and proposed contracts

Version: 0.8. Updated: 2026-11-03 under DR-044–DR-050.
**The trace/event traversal, test-harness, shared-schema direction,
SCN-031–040 wording, route pattern, missing-value copy, traversal statuses and
invalid-cursor behavior are approved. Other setup details remain open. This
document does not authorize freeze or coding.**

Inputs: [scenarios](./03-scenarios.md), [domain](./01-domain-model.md),
[approved intent](./02-intent-v0.1.md), [scoped register](./00-ingestion.md).
This document alone defines proposed shared shapes; task lists must reference
them, not invent independent frontend/backend contracts.

## 1. Architecture context and discovery

The specifications and acceptance workflow are in `ai-runtime-governance`; the
running application lives in sibling repositories. The current user-owned
frontend reorganization has a React/Vite/TypeScript app in
`ai-runtime-governance-frontend`: `src/ApplicationEntry.tsx` mounts
`BrowserRouter`, `src/ApplicationRoutes.tsx` registers routes,
`src/ApplicationApiClient.ts` contains the same-origin API helper,
`src/api/` contains auth API types, and `src/AuthenticationContext.tsx`
provides native-auth context. Timeline preview
modules are under `src/features/activity-timeline/`; app layout is under
`src/components/layout/`. The backend already has the Spring Boot application and native-auth prerequisite in
`ai-runtime-governance-backend` (`local.governance`, `GovernanceApplication`,
Flyway V1 and a test-profile `/__test` controller). The timeline feature itself
has no route, service, schema or acceptance tests yet; do not treat the whole
application as greenfield or create parallel app bootstraps.

Existing manifests declare Java 25 / Spring Boot 4.1.2 and React 19 / Vite 8 /
TypeScript 5.9. The current handover records PostgreSQL 17.6 and Playwright
1.64.1 readiness as verified on 2026-11-02; recheck runtime tools on a different
host. No installation is authorized by this design.

The docs-repository test `tests/supporting/api-client.test.mjs` still imports the
removed `src/api.ts` path. Its current focused run fails with module-not-found
after the frontend reorganization; keep this test/tooling alignment visible and
do not infer the result from a prior green run.

For this read-only increment, Spring JDBC/Flyway, same-origin session-backed reads
and semantic React rendering extend the existing application patterns.
No LangChain4j call, provider key, actual detector, tool execution, active approval
or WSL is required to exercise controlled persisted timeline data.

## 2. Scope and scenario mapping

All SCN suffixes mean `SCN-activity-timeline-###`; full REQ tags remain in the
scenario source. Browser acceptance is primary for every journey; backend
integrity tests supplement authority/persistence assertions.

| Checklist | Responsibility | SCN suffixes | Surface / test level |
|---|---|---|---|
| CHK-TL-001 | Private trace reads and session checks | 001, 002, 003, 027, 028, 039, 040 | Both / browser E2E + supporting backend |
| CHK-TL-002 | Nested/unlinked metadata and available time | 004, 008, 009, 010, 011, 012, 029, 030 | Both / browser E2E + hierarchy integrity |
| CHK-TL-003 | Metadata-only prompt and safe evidence | 005, 019 | Both / browser E2E + persisted exclusion |
| CHK-TL-004 | Read-only trusted approval history | 006, 007, 022 | Both / browser E2E + authority integrity |
| CHK-TL-005 | Execution/completeness/loss and coverage dimensions | 013, 014, 015, 016, 017, 018 | Both / browser E2E |
| CHK-TL-006 | Idempotent accepted history/conflict rejection | 020, 021 | Both / browser E2E + backend integrity |
| CHK-TL-007 | Bounded continuation and manual refresh | 023–025, 030–034, 037, 039, 040 | Both / browser E2E + query integration |
| CHK-TL-008 | Explicit failures, loading/navigation/accessibility | 026, 032–038, 040 | Both / browser E2E |
| CHK-TL-009 | Real auth, isolated persisted fixtures, freeze/red workflow | 028; all scenarios' setup | Both / acceptance setup, never mock replacement |

Every SCN 001 through 040 occurs above. SCN-031–040 wording is approved but not
frozen. No completed task reference or executed test is implied.

## 3. Proposed API contract matrix

All endpoints are **new**, baseline **deferred**. No live endpoint was called or
captured. JSON field names/statuses below are proposals, not inferred behavior.

| ID / endpoint | Method | Authentication | Request | Success | Failures |
|---|---|---|---|---|---|
| READ-1 `/api/v1/traces` | GET | Human session; server-derived private scope | Optional opaque `cursor`; no body/scope selector | 200 `TracePage` | 400 `REQUEST_INVALID`; 401; 410 `TRAVERSAL_EXPIRED`; 422 `TRAVERSAL_TOO_LARGE`; 429 `TRAVERSAL_LIMIT`; 503 |
| READ-2 `/api/v1/traces/{traceId}` | GET | Same, with trace ownership check | Trace ID only | 200 `TraceDetail` | 401; 404 absent/unowned; 503 |
| READ-3 `/api/v1/traces/{traceId}/events` | GET | Same; rechecked on every continuation | Trace ID, optional opaque `cursor` | 200 `EventPage` | 400 `REQUEST_INVALID`; 401; 404; 410 `TRAVERSAL_EXPIRED`; 422 `TRAVERSAL_TOO_LARGE`; 429 `TRAVERSAL_LIMIT`; 503 |

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
| `TracePage` | `items: (TraceSummary or data-free TraceTombstone)[]`, `nextCursor: string or null` |
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

### Cursor/query direction approved under DR-044/DR-046

- Fixed maxima: 50 traces, 200 events. Do not expose a caller-controlled unlimited
  size. `nextCursor: null` means no further retained records in this traversal,
  not completed execution or complete telemetry.
- Proposed trace order: receipt time descending, then trace ID descending.
  Event traversal: receipt time then event ID ascending; the UI groups linked
  events and uses that order among siblings.
- Opaque cursors bind authenticated scope, traversal identity and member
  position. Event cursors also bind the selected trace. Every request
  reauthenticates and authorizes independently.
- The original receipt-key-only cutoff proposal is withdrawn by review R-TL-001:
  a late/concurrently committed event can sort below that cutoff. Do not implement
  it as a stable-membership guarantee. DR-044/046 approve bounded,
  server-managed event and trace-list memberships fixed from committed IDs at
  each first successful read. Every continuation reauthorizes. Both kinds expire
  after five minutes, contain at most 10,000 members, and share a maximum of five
  active traversals per account. The active cap returns HTTP 429
  `TRAVERSAL_LIMIT`; an expired cursor returns HTTP 410 `TRAVERSAL_EXPIRED`; an
  oversized snapshot returns HTTP 422 `TRAVERSAL_TOO_LARGE`. No long-lived
  database transaction or unbounded in-memory result set is allowed.
- Deleted members remain as data-free tombstones at their original positions.
  They disclose no deleted trace/event details and do not shift later members.
  Refresh starts a new traversal and can include newly committed IDs.
- A linked parent not loaded yet is distinguished from a genuinely unresolved
  parent by backend `relationship` metadata. Do not infer missing parent from
  one response's contents. Load-more eventually makes the retained parent
  inspectable; reject cycles/cross-scope links at write validation.

The shared OpenAPI component is
[activity-timeline.openapi.json](../../../contracts/activity-timeline.openapi.json).
It is the single source for UUID identifiers, enums, explicit nullability,
date-time policy, bounded event shapes and producer authority. The explicit
`evt-001` / `evt-002` aliases are test-fixture-only; production inputs must use
canonical UUIDs. Cursor status/error policy is recorded in DR-049. The
unsupported-field rule and extensible cause-code policy are recorded in DR-050.
Other schema items marked as draft remain review questions.
Event sibling display ordering remains receipt time then UUID ascending.

### Integrity and metadata boundary

Use an allowlist of known fields; body, reasoning, credentials and arbitrary
attributes must never be retained or disclosed. Under DR-050, reject the entire
event before persistence if it contains unsupported or content-bearing fields.
Return 400 `REQUEST_INVALID` with a generic field-category message, no value
echo, and no persistence on failure.

The approved producer boundary in the shared contract is:

| Producer | Allowed authority | Explicitly not allowed |
|---|---|---|
| `agent_reporter` | Prompt, agent, model and tool observation metadata | Guard facts, approval history, account scope, server receipt time |
| `guard_service` | Trusted guard events and guard outcomes | Approval history, account scope, server receipt time |
| `approval_service` | Trusted approval history | Guard facts, account scope, server receipt time |
| `test_fixture` | All fixture kinds through the isolated test boundary | Production authority; arbitrary scope outside its isolated fixture |

Cause codes are nullable constrained extensible identifiers matching
`^[A-Z][A-Z0-9_]{0,63}$`; preserve them as structured codes, not free-form text.
Map an unrecognized code to the neutral label `Other reported cause`.

The service derives scope and receipt time. Identical accepted events preserve
their first receipt time; conflicting duplicates do not overwrite history.
Relinking remains separate derived hierarchy state, not permission to rewrite
accepted source metadata.
Accepted event ID/content is immutable for deduplication; receipt time assigned
on first acceptance is preserved on identical retry. Relinking is separately
derived hierarchy state, not permission to rewrite accepted source metadata.

## 4. UI and copy contract matrix

The approved route pattern under DR-045 is `/activity` for the trace list and
`/activity/:traceId` for a directly addressable trace. The development-only
`/activity-preview` route remains a synthetic preview. No test IDs or CSS-path
locators are proposed. Use roles/labels first and approved exact text second.

| Element | Semantic role/name or proposed copy | Scenario / open case |
|---|---|---|
| Page heading / intro | heading `Activity`; “Inspect reported agent, model, tool, guard, and approval activity without exposing payloads.” | 001 |
| Trace list heading | heading `Traces` | 001, 023 |
| Trace item | link `Open trace {traceId}` to `/activity/:traceId` | 001, 003, 023 |
| Trace list empty | status `No traces recorded.` | 023 zero case |
| Trace timeline heading | heading `Timeline` | 001, 028 |
| Receipt-order description | `Receipt order · sibling events`; “Events are ordered by server receipt time within each parent group. Producer-reported source time is shown separately.” | 008, 009 |
| Event tree | nested list `Activity events`; group name `Unlinked activity` where needed | 004, 010 |
| Expand event | Events collapsed initially; button `Expand event {eventId}`, `aria-expanded` toggled; corresponding `Collapse event {eventId}`; retain focus on activated button | 001, 004, 038 |
| Event metadata | definition lists with labels `Received (UTC)`, `Source time (UTC)`, `Reporter`, `Duration`, `Guard outcome`, `Rules` | 005, 008, 012; base labels approved under DR-048 |
| Missing value | `Not reported` when the producer omits a value; reserve `Unavailable` for unavailable details such as a tombstone | 012, 030 |
| Timestamp display | Locale-aware medium date/time in UTC with visible `UTC` designation | 005, 008, 012 |
| Approval history | heading `Approval history`; exact state names as values, no actionable controls | 006, 007 |
| Execution/completeness | labels `Execution`, `Telemetry`, `Prompt guard`; distinct reported values | 013–017; approved under DR-048 |
| Coverage | labels `Input`, `Response`, `Tools` under `Reported integration coverage` | 018; approved under DR-048 |
| Loss extent | labels `Loss cause`, `Missing events`, `Missing time range`; `Unknown` for unknown extent | 016, 017 |
| Trace/event continuation | buttons `Load more traces`, `Load more events`; disabled while pending | 023, 024, 037 |
| Manual refresh | button `Refresh`; disabled while pending | 025, 026, 035, 037 |
| Initial loading | status `Loading activity…`; no successful empty-state placeholder | UI contract approved under DR-047 |
| Read error | alert `Activity could not be loaded.` with safe correlation ID; retry button `Try again` | 026; UI contract approved under DR-047 |
| Session required | `Sign in to view activity.`; link to reviewed login flow | 002, 027; UI contract approved under DR-047 |
| Missing/unowned trace | `Trace is unavailable.` without another account's data | 003; UI contract approved under DR-047 |
| Deleted traversal member | Data-free trace/event tombstone; `Unavailable` details and no deleted metadata disclosure | DR-044/046; supporting integrity test |
| Pending load-more | polite status `Loading more activity…`; disable duplicate continuation | 037/038; approved under DR-048 |
| Load-more success | polite status `Loaded {count} more events.`; focus stays on the control | 037/038; approved under DR-048 |
| Refresh success | polite status `Activity refreshed.`; preserve expanded IDs that remain | 025, 035; approved under DR-048 |

DR-047/048 approve route behavior, page headings/intro, timestamp format,
collapsed event disclosure, metadata labels and loading/empty/error/session/
announcement copy. Focus/keyboard details beyond the approved scenarios remain
for review. No body pane, body download, approve/reject action, workspace
controls, filters, search, automatic polling or live-token rendering is present.

SCN-030 requires a validated parent on a later page to remain distinguishable
from a genuinely unresolved parent; the current model does not yet preserve that
distinction in its view state.

### Proposed interaction decisions still requiring scenarios/review

- Preserve expanded event identities across successful manual refresh when
  records remain present. Reset loaded cursor traversal for refresh.
- Keep previously loaded data visibly stale if refresh fails; do not erase it
  into a misleading empty trace. Never keep protected data visible after
  session termination is established.
- Cancel/ignore superseded requests when navigating between traces. Responses
  for A must not populate B. Disable repeat refresh/load-more while pending.
- Keyboard-operable expansion/continuation and polite loading announcements.
  Event expansion starts collapsed, focus stays on its control, and pending/
  success announcements use the approved status copy.

SCN-035–039 have approved wording but have not been implemented or executed. No
passing accessibility, list snapshot or double-submit result is claimed.

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
Under DR-044, the test-only ingestion/inspection boundary is token-protected,
loopback-only and disabled outside the test profile. It invokes the same
metadata service validation, deduplication and producer-authority checks as the
application; it is not a public seed/write route. Browser assertions inspect the
persisted result through the real read API. Service integrity assertions are
recorded separately from browser acceptance and from live-agent evidence.
Use nonproduction setup code excluded from public artifacts, not a public seed
route or a mock login cookie. The sibling frontend/backend already implement the
native-auth prerequisite; browser setup must use and verify its real login/2FA
flow and private scope, not reimplement or bypass it. A browser-storage snapshot
is usable only if derived from that flow.

## 6. Native baseline and setup gaps

| Check | Actual observation | Required disposition |
|---|---|---|
| Java/Maven | Backend `pom.xml` declares Java 25 and Spring Boot 4.1.2; local environment is host-specific | Recheck project-local JDK/Maven paths before execution; do not add another wrapper or install tools from this draft |
| Backend build/tests | Existing backend source, configuration and JUnit setup; native-auth JUnit 10/10 recorded 2026-11-02 | Timeline baseline is not run; use the existing backend project and approved DB profile |
| Frontend build/typecheck/lint | Existing package scripts for `build`, `typecheck` and `lint`; no frontend unit-test script | Native-auth checks passed 2026-11-02; timeline tests remain unrun; select any new runner before adding dependencies |
| PostgreSQL / integration isolation | Existing Flyway V1 auth migration; PostgreSQL 17.6 is the recorded local baseline | Add timeline migration after V1; verify isolated test data/cleanup; do not assume Testcontainers dependency |
| Playwright/browser/helpers | Existing root Playwright configs and native-auth suites | No timeline browser test exists; use existing harness after adding and reviewing the timeline project/cases |
| Current local backend route | Target remains `127.0.0.1:8080` per the user. Observed GETs to `/actuator/health` and `/api/v1/auth/context` returned 404 from a Java 17 / Spring Boot 3.5.5 listener, while the intended backend declares Java 25 / Spring Boot 4.1.2. The user deferred enforcing this mismatch now. | Record runtime readiness as unverified, not passed. Before real-session or timeline acceptance, verify the expected backend is serving the target port; do not stop or replace the unidentified listener as part of document work |
| Trace-list cursor membership | Trace/event pages snapshot committed IDs under DR-044/046; same five-minute, 10,000-member and shared five-active-per-account caps; deleted members use data-free tombstones | Direction and SCN-039 approved; implementation/verification remains open |
| Freeze integrity | No timeline frozen plan/manifest | Wire existing guard after reviewed adoption; no checksum fabrication |

Native-auth application baselines exist, but no timeline baseline or acceptance
result exists. Documentation validation is separate from application
verification. Reuse the present manifests/configuration; do not infer a timeline
pass from native-auth checks.

## 7. Phase 5/6 handoff

The mutable implementation design and frontend/backend task lists now target the
existing sibling applications. DR-044/046 resolve R-TL-001, R-TL-003 and
R-TL-005 directions; DR-045–048 approve SCN-031–039 and selected route/copy/UI
details; DR-049 approves invalid-cursor behavior and SCN-040 wording; DR-050
approves metadata rejection and cause-code policy.
Remaining wire/focus behavior still needs review and source/scenario
reconciliation. Native-auth exists and is verified; timeline integration, tool
versions/commands and test setup remain separate gates. The synthetic preview is
not a backend acceptance result. Do not freeze or code merely because these
mutable documents exist.
