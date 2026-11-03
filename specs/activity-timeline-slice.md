# Activity timeline vertical slice — frozen plan

Feature: `activity-timeline-slice`. Frozen: 2026-11-03.
This is the first read-only development slice of the metadata-only activity
timeline. It deliberately narrows the approved timeline scope to nine scenarios
and three read endpoints. Deferred behavior is listed without scenario IDs and
must not be inferred as included.

## Scope

An authenticated human reads their own private traces and ordered events from
PostgreSQL through the existing native-auth session boundary. Metadata only: no
prompt/response/tool bodies, reasoning text, credentials or arbitrary attributes
are stored, returned or rendered.

Included: private list/detail reads, parent/child hierarchy, receipt order,
missing-value honesty, bounded continuation, manual refresh, and the
loaded-parent versus unresolved-parent distinction.

Not included: traversal expiry/caps/tombstones, navigation races, pending
continuation, approval history, duplicate-history conflicts, full
coverage/loss presentation, refresh-failure retention, ingestion from real
agents, filters, search, polling and payload archives.

## Wire contract

All routes require an authenticated `HUMAN` session. The private scope is
derived from the session, never from a request parameter or cursor.

| Route | Success | Failures |
|---|---|---|
| `GET /api/v1/traces?cursor=` | `200 {items: TraceSummary[], nextCursor}` | `400 REQUEST_INVALID`, `401 SIGN_IN_REQUIRED`, `404 NOT_FOUND`, `503 TEMPORARILY_UNAVAILABLE` |
| `GET /api/v1/traces/{traceId}` | `200 TraceDetail` | `401`, `404`, `503` |
| `GET /api/v1/traces/{traceId}/events?cursor=` | `200 {items: ActivityEvent[], nextCursor}` | `400`, `401`, `404`, `503` |

Bounds: at most 50 traces and 200 events per response.

Ordering: traces by server receipt time descending then trace ID descending;
events by server receipt time ascending then event ID ascending. Source time is
nullable and never defaults to receipt time.

Cursors are opaque keyset tokens: base64url of
`scopeId|receivedAtEpochMillis|id`. A malformed, tampered or wrong-scope cursor
returns `400 REQUEST_INVALID` without echoing it. New records committed after a
page do not duplicate or skip already-traversed positions when they sort at the
head; a refresh starts a new read.

`TraceSummary` = `traceId`, `receivedAt`, `executionStatus`, `telemetryStatus`,
`guardOutcome`. `TraceDetail` adds safe `identity`, `coverage`, `loss`.
`ActivityEvent` = `eventId`, `traceId`, `parentEventId`, `relationship`,
`kind`, `receivedAt`, `sourceAt`, `durationMs`, `identity`, `metadata`.

`relationship` is derived by the server from full-trace membership:
`root` when there is no parent, `linked` when the parent exists in the same
trace and scope, `unresolved` otherwise. It is never inferred from the loaded
page.

Persistence: `activity_trace` and `activity_event`, both scope-bound, no payload
columns. The event metadata allowlist is `kind`, receipt/source time, duration,
identity, label, guard outcome, policy id/version, rule ids, approval id/state
and observed status.

Test-only fixture path: token-protected, loopback-only
`/__test/timeline/seed` and `/__test/timeline/reset`, available only in the test
profile. Seed derives the scope from the named real account. No public write
route is added.

## Scenarios

### SCN-activity-timeline-001 — Human reads their own retained trace

Given Human A is authenticated in private scope A and owns trace TA with root
event E1 and child E2
When A requests the trace list and TA
Then both reads return 200 and TA with its execution, telemetry and guard
metadata, and A's event read returns E1 and E2 in receipt order.

### SCN-activity-timeline-002 — No session cannot read activity

Given no human session is established
When the trace list is requested
Then the response is 401 `SIGN_IN_REQUIRED` and contains no trace metadata.

### SCN-activity-timeline-003 — Cross-account read is denied

Given Human A and Human B have separate private scopes and traces
When A requests B's trace
Then the response is 404 `NOT_FOUND` with no B metadata, and A's list does not
contain B's trace.

### SCN-activity-timeline-004 — Hierarchy and receipt order

Given trace TA has root event E1 and child event E2, and E2's reported source
time is older than its receipt time
When A opens TA in the browser
Then E2 is nested under E1, siblings are in server receipt order, and source
time is displayed separately from receipt time.

### SCN-activity-timeline-005 — Metadata only

Given trace TA contains prompt, guard, approval, model and tool events
When A reads TA and its events
Then every event exposes only the metadata allowlist and no prompt body, model
or tool payload, reasoning text, credential or arbitrary attribute is returned
or rendered.

### SCN-activity-timeline-012 — Missing values stay missing

Given an event E3 has no reported duration and no reported source time
When A reads the event
Then `durationMs` and `sourceAt` are null and the UI renders "Not reported",
with no zero or current-time substitution.

### SCN-activity-timeline-023 — Bounded continuation

Given A owns 51 traces retained in one scope
When A reads the first page and then follows its cursor
Then the first page contains 50 traces, the second contains the remaining one,
both carry explicit cursors as applicable, and no trace is duplicated or lost.

### SCN-activity-timeline-025 — Manual refresh

Given A read the first trace page and then a newer trace was committed
When A refreshes from the start
Then the newer trace appears; following the earlier page cursor never returns a
record already returned on that traversal.

### SCN-activity-timeline-030 — Loaded parent versus unresolved parent

Given trace TA has 201 events where E1 references parent E201, which is not in
the first 200-event page, and another event has a parent absent from the trace
When A reads the first event page
Then E1's relationship is `linked` because the parent is retained in TA, the
absent-parent event is `unresolved`, and the browser distinguishes "parent not
loaded in this page" from "Unlinked activity".

## Acceptance mapping

API project: SCN 001, 002, 003, 005, 012, 023, 025, 030.
Browser project: SCN 004 and SCN 030.

Tests must carry the exact `[SCN-activity-timeline-NNN]` tag. Red authoring runs
before product implementation; failures must be missing-feature failures, not
setup defects. No test may be skipped or weakened to pass.
