# Activity timeline read UI — frozen plan

Feature: `activity-timeline-read-ui`. Frozen: 2026-11-03.
Second read-only slice. It extends the verified trace/event read pages with
approval history, loss/coverage presentation, read-failure handling, stale-data
retention, navigation safety, pending continuation and keyboard announcements.
No mutation, approval action, ingestion producer or payload body is added.

## Scope

Included: approval history inspection, known loss extent, independent coverage
dimensions, explicit read failure, failed-refresh retention, navigation race
safety, single pending continuation, and keyboard/status operability.

Not included: traversal expiry/caps/tombstones, production ingestion, duplicate
history conflicts, approval actions, payload archives, filters or search.

## UI contract

- Detail page retains the existing `Activity` heading and `Timeline` section.
- `Approval history` lists reported `requested`, `approved`, `rejected`,
  `canceled` and `expired` states from trusted approval events; it exposes no
  approve/reject control.
- Loss metadata uses the labels `Loss cause`, `Missing events` and
  `Missing time range`; unknown extent renders `Unknown`, never zero or a guess.
- Coverage keeps `Input`, `Response` and `Tools` independent, without collapsing
  them into a single healthy claim.
- A read failure is an explicit alert, never an empty successful view.
- A failed refresh keeps the previously loaded trace and events visible and
  labels them stale, with a retry control. Retry replaces the data without
  duplicating events.
- A late response for a previous trace is ignored; the newly selected trace
  remains displayed.
- The continuation control disables while a request is pending, issues one
  request, and stays present after the last page so focus is not lost.
- Continuation announces `Loading more activity…` and `Loaded {count} more
  events.` through a polite status region; expansion announces its state and
  retains focus.

## Scenarios

### SCN-activity-timeline-006 — Approval history without approval actions

Given Human A has trusted approval history recording a request and a resolution
When A inspects the trace
Then the request and resolution are listed under `Approval history`
And no approve or reject action is exposed.

### SCN-activity-timeline-016 — Known loss extent is preserved

Given a trace has incomplete telemetry with cause `fixture-collector-outage`,
missing count 3 and range 2026-10-29T10:00:00Z to 2026-10-29T10:01:00Z
When A inspects the trace
Then the incomplete status, exact cause, count 3 and that exact range are visible.

### SCN-activity-timeline-018 — Coverage dimensions stay independent

Given input coverage is `bypassed`, response coverage is `unknown` and tool
coverage is `degraded`
When A inspects the trace
Then all three values remain independently visible and the trace is not shown as
guarded or fully observed.

### SCN-activity-timeline-026 — Read failure is explicit

Given the timeline read dependency is unavailable
When A requests trace detail
Then an explicit failure alert is visible, no `Timeline` section is shown as a
successful empty state, and retry is offered.

### SCN-activity-timeline-035 — Failed refresh keeps stale data

Given A has loaded event E1 for a trace
When a manual refresh fails
Then E1 remains visible and is identified as stale, a refresh failure alert with
retry is shown, and the trace is not presented as empty or complete
When the dependency recovers and A retries
Then the refreshed activity replaces the stale state without duplicate events.

### SCN-activity-timeline-036 — Late response cannot replace the selected trace

Given A opened trace TA and its event request is pending
When A navigates to trace TB and TB resolves before TA
Then TB remains the selected trace with only TB activity
And TA's late response is ignored.

### SCN-activity-timeline-037 — Pending continuation is single

Given a trace has another event page available
When A activates continuation and attempts it again while pending
Then only one request is issued and the control is disabled
When the response arrives
Then events are appended once and focus remains on the control.

### SCN-activity-timeline-038 — Keyboard operation and announcements

Given A opens a trace with a keyboard
When A activates an event expansion control
Then the event expands, `aria-expanded` is true and focus stays on the control
When A starts continuation
Then pending and loaded states are announced through a polite status region
And timeline actions remain in a logical keyboard order.

## Acceptance mapping

Browser project: all eight scenarios in
`tests/specs/activity-timeline-read-ui.spec.ts`, each tagged with the exact
`[SCN-activity-timeline-NNN]` id. Tests are locked after the red authoring run.
