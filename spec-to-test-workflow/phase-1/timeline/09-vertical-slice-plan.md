# Activity timeline: vertical-slice development preparation

Prepared: 2026-11-03; **implemented 2026-11-03** for the nine-scenario slice.
The frozen authority is `specs/activity-timeline-slice.md`; results are in the
execution evidence. This mutable document is the preparation rationale and must
not be cited over the frozen plan. A decision-record entry is pending until the
separate DR-051 password-verifier re-freeze lands.

## 1. Goal

An authenticated human opens `/activity`, sees **their own** traces read from
PostgreSQL, opens a trace at `/activity/:traceId`, and inspects its ordered
events. Real session, real backend, real persisted data. No mock login, no static
fixture screen, no prompt bodies.

The vertical slice ends when those two pages work against the real service and
the nine core scenarios below pass in a real browser. The ordered, quality-gated
work breakdown is [10-development-task-list.md](./10-development-task-list.md).

## 2. Freeze set (9 scenarios)

| SCN | Behavior kept in the slice |
|---|---|
| 001 | Human A reads A's retained trace and events |
| 002 | No human session cannot read protected activity |
| 003 | A cannot read B's trace (404, no data disclosure) |
| 004 | Hierarchical parent/child events render in receipt order |
| 005 | Metadata-only: no prompt body, reasoning, credentials or tool payload |
| 012 | Missing duration/source time shows "Not reported", never zero or fabricated |
| 023 | Trace continuation returns the next bounded page without loss or duplication |
| 025 | Manual refresh replaces the traversal with newly committed records |
| 030 | A validated parent not loaded in this page stays distinct from a genuinely unresolved parent |

Everything else is deferred. Do not weaken these nine oracles to match code.

## 3. Minimal wire contract

Only three read endpoints. All require an authenticated `HUMAN` session; the
private scope is derived from the session, never from a request field.

| Endpoint | Success | Notes |
|---|---|---|
| `GET /api/v1/traces?cursor=` | `{ items: TraceSummary[], nextCursor }` | 50 max, receipt time desc then trace ID desc |
| `GET /api/v1/traces/{traceId}` | `TraceDetail` | 404 when absent or owned by another scope |
| `GET /api/v1/traces/{traceId}/events?cursor=` | `{ items: ActivityEvent[], nextCursor }` | 200 max, receipt time asc then event ID asc |

`TraceSummary` = `traceId`, `receivedAt`, `executionStatus`, `telemetryStatus`,
`guardOutcome | null`.
`TraceDetail` adds safe `identity`, `coverage {input,response,tools}`, `loss`.
`ActivityEvent` = `eventId`, `traceId`, `parentEventId | null`,
`relationship: root|linked|unresolved`, `kind`, `receivedAt`,
`sourceAt | null`, `durationMs | null`, safe `identity`, kind-specific `metadata`.

Server derives `relationship` from full trace membership, not from the loaded
page. That is what makes SCN-030 answerable.

Slice cursor: opaque keyset token, base64url of
`scopeId|receivedAtEpochMillis|id`. Wrong scope, malformed input or tampering
returns `400 REQUEST_INVALID`; expiry/caps are out of scope for this slice.
Keyset paging keeps new head inserts from duplicating or skipping traversed
positions. Unowned/unknown trace stays `404 NOT_FOUND`.

## 4. Persistence (V2 migration)

Two tables; no payload columns.

- `activity_trace`: `id`, `scope_id`, `received_at`, `execution_status`,
  `telemetry_status`, `guard_outcome`, `identity`, input/response/tools
  coverage, loss fields. Index on `(scope_id, received_at DESC, id DESC)`.
- `activity_event`: `id`, `trace_id`, `scope_id`, `parent_event_id`, `kind`,
  `received_at`, `source_at`, `duration_ms`, `identity`, `label`,
  `guard_outcome`, `policy_id`, `policy_version`, `rule_ids text[]`,
  `approval_id`, `approval_state`, `observed_status`.
  Index on `(trace_id, received_at ASC, id ASC)`.

`scope_id` is copied from `account.scope_id` on seed and checked on every read.
An event's parent link only resolves inside the same trace and scope.

## 5. File-level work list

**Backend (new files only):**

| Area | Files |
|---|---|
| Migration | `db/migration/V2__activity_timeline.sql` |
| Read path | `timeline/TimelineRepository.java`, `TimelineReadService.java`, `TimelineCursor.java`, `timeline/api/TimelineController.java` |
| DTOs | `api/TraceSummaryResponse`, `TracePageResponse`, `TraceDetailResponse`, `CoverageResponse`, `LossResponse`, `ActivityEventResponse`, `EventMetadataResponse`, `EventPageResponse` |
| Test seeding | `timeline/test/TimelineTestController.java` (loopback + `X-Test-Token`, disabled outside the test profile) |

**Frontend (extend existing app, no new bootstrap):**

| Area | Files |
|---|---|
| Wire + mapping | `src/features/activity-timeline/ActivityTimelineApi.ts` |
| Request lifecycle | `useActivityTimeline.ts` |
| Pages | `ActivityTracesPage.tsx` (list), `ActivityTracePage.tsx` (detail + events) |
| Model fix | `ActivityTimelineModel.ts`: add `parentNotLoaded` separate from `unresolved` (SCN-030) |
| Routes/style | `ApplicationRoutes.tsx` (`/activity/:traceId`), `ApplicationStyles.css` |

Reuse `apiRequest`, `AuthenticationProvider`, `RequireHuman`,
`ApplicationShell`, the existing `buildEventTree`, the preview page and its CSS.
Keep `/activity-preview` as the synthetic preview; do not point it at the API.

## 6. Prerequisites (verified 2026-11-03)

| Item | State |
|---|---|
| JDK 25.0.5 / Maven 3.9.16 / Node 24.22.0 | present via `local-env/env.ps1` |
| PostgreSQL 17.6 data dir `.local-cache/pgdata17` | present, port 55434 free |
| Mailpit, Playwright Chromium, frontend `node_modules` | present |
| Ports 8080 / 5173 / 8025 / 1025 | free |
| Backend jar | **stale** (2026-11-02 22:14) vs HEAD `f12f4e0` (2026-11-03 20:13) — rebuild before acceptance |
| Docs repo | clean after `6d86bcf`; separate uncommitted DR-051 re-freeze must not be reverted |

Start commands are the existing ones in `HANDOVER.md` section 4. Do not start,
stop or replace unknown listeners.

## 7. Verification ladder

1. `mvn -f ..\ai-runtime-governance-backend\pom.xml test` and `package`.
2. Start PostgreSQL 17.6 on `55434`, then the backend on `8080` with the `test`
   profile and a per-run token.
3. Seed A and B fixtures through the token-guarded test control, using real
   registered accounts and their real `scope_id`.
4. Exercise the three endpoints with a real session cookie from the existing
   native-auth flow; assert A/B isolation, 404, bounds and cursor errors.
5. `npm --prefix ..\ai-runtime-governance-frontend run typecheck`, `lint`,
   `build`; open `/activity` and `/activity/:traceId` with a real session.
6. Add the nine-spec browser acceptance only after the pages work; run red
   against absent code only if the plan is frozen first.

Open prep decision: the first API smoke needs either the existing real
register/login/TOTP helper or a reviewed test-only session grant. No forged
cookie and no public session bypass is acceptable. Prefer the existing helper.

## 8. Explicitly deferred

Traversal expiry/caps/tombstones (031–034, 039, 040), navigation races and
pending continuation (036–038), approval history (006, 007, 022), duplicate
conflict history (020, 021), full coverage/loss presentation (013–018),
refresh-failure retention (026), signed/opaque cursor hardening, real ingestion
producers, live agent capture, filters/search, polling and all payload archives.

## 9. Definition of done for the slice

- `/activity` and `/activity/:traceId` read real persisted data with the real
  session; A cannot see B.
- The nine scenarios pass in a real browser against backend + PostgreSQL.
- No prompt body or payload is stored, returned or rendered.
- `mvn test`, frontend `typecheck`/`lint`/`build`, and the focused browser suite
  pass; results are recorded in the execution evidence and handover.
- Deferred scope remains listed, not silently dropped.
