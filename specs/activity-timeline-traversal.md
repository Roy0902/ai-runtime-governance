# Activity timeline traversal lifecycle — frozen plan

Feature: `activity-timeline-traversal`. Frozen: 2026-11-03.
Third read-only slice. It replaces the ad-hoc keyset cursor with a bounded,
server-managed traversal snapshot and adds expiry, active and member caps, and
explicit traversal errors. No mutation, approval action or ingestion producer is
added.

## Scope

Included: committed-membership snapshots per traversal, five-minute expiry,
five active traversals per account, 10,000-member cap, deleted-member tombstones,
trace-list and event-list membership, and invalid-cursor privacy.

Deferred: production ingestion, duplicate-history conflicts, approval actions,
payload archives, filters and search.

## Traversal contract

- On the first successful read without a cursor, the server snapshots the
  committed member IDs in display order and stores one traversal row.
- Continuations read the stored membership, not a live query. New commits do not
  enter an active traversal; refresh starts a new traversal.
- Every page reauthorizes and resolves the private scope from the session.
- Traversals expire five minutes after creation. Continuing an expired traversal
  returns `410 TRAVERSAL_EXPIRED`, never an empty success.
- At most five unexpired traversals are active per account across trace-list and
  event-list kinds. A sixth start returns `429 TRAVERSAL_LIMIT` with
  `Retry-After`, and creates no traversal or page.
- A snapshot with more than 10,000 members returns `422 TRAVERSAL_TOO_LARGE` and
  retains no traversal.
- Deleted snapshot members are returned as data-free tombstones at their original
  position. They disclose no trace/event metadata and do not shift later members.
- A malformed, tampered or wrong-scope/wrong-trace cursor returns
  `400 REQUEST_INVALID` with a generic message, no echoed cursor and no data.
- Response bounds remain 50 traces and 200 events.

## Scenarios

### SCN-activity-timeline-031 — Concurrent commits cannot shift an event traversal

Given trace TA has 201 committed events in a stable receipt order
And the first read returns the first 200 and a continuation
When a controlled event ELATE is committed before the continuation position
And A follows the continuation
Then exactly the remaining original event is returned, with no duplicate or skip
And ELATE is absent from that traversal
When A refreshes
Then a fresh traversal includes ELATE.

### SCN-activity-timeline-032 — Expired traversal fails explicitly

Given A has an active event traversal with a continuation
When the controlled clock advances beyond five minutes
And A follows the continuation
Then it fails with `410 TRAVERSAL_EXPIRED` and returns no empty page or data
And a fresh read after reauthorization creates a new traversal.

### SCN-activity-timeline-033 — Active traversal limit is enforced

Given A owns five unexpired active event traversals
When A starts another event traversal
Then it fails with `429 TRAVERSAL_LIMIT` and creates no sixth traversal or page
When one existing traversal expires
Then A can start a new traversal after reauthorization.

### SCN-activity-timeline-034 — Oversized snapshot is rejected

Given trace TA has 10,001 committed events
When A starts an event traversal for TA
Then it fails with `422 TRAVERSAL_TOO_LARGE` and no partial page
And no traversal with more than 10,000 members is retained.

### SCN-activity-timeline-039 — New trace cannot shift a trace-list traversal

Given A owns 51 committed trace summaries
And the first list read returns 50 and a continuation
When a new trace TNEW is committed with a sort key before the continuation
And A follows the continuation
Then exactly the remaining original trace is returned, without duplicate or skip
And TNEW is absent from that traversal
When A refreshes
Then a fresh traversal includes TNEW.

### SCN-activity-timeline-040 — Invalid cursors disclose nothing

Given A has a valid continuation cursor for trace TA
And B has a valid cursor for a different private scope
When A tampers with the cursor and requests the next page
Then the response is `400 REQUEST_INVALID` with a generic message and no data or
cursor echo
When A submits B's cursor for A's trace
Then the response is `400 REQUEST_INVALID` with the same privacy.

## Acceptance mapping

API project: all six scenarios in
`tests/api/activity-timeline-traversal.spec.ts`, each tagged with the exact
`[SCN-activity-timeline-NNN]` id, plus one untagged supporting tombstone check.
Tests are locked after the red authoring run.
