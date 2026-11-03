# Read-UI follow-up 01 — frozen plan

Feature: `activity-timeline-read-ui-followup-01`. Frozen: 2026-11-03.
Corrects a flaky locked locator in `activity-timeline-read-ui`. No product
behavior changes: the pending continuation, single request, announcement and
focus retention already work. The original `getByText('event 200')` can also
match an `Expand event 200...` UUID button, so the corrected oracle targets the
event heading by role and exact name.

## SCN-activity-timeline-037 — Pending continuation is single

Given a trace has another event page available
When A activates continuation and attempts it again while pending
Then only one request is issued and the control is disabled
When the response arrives
Then events are appended once, focus remains on the control, and the appended
event heading `event 200` is visible by exact heading name.

The original test remains recorded as a test-authoring defect; it is not edited
or weakened.
