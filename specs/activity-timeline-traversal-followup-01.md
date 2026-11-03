# Traversal follow-up 01 — frozen plan

Feature: `activity-timeline-traversal-followup-01`. Frozen: 2026-11-03.
Corrects one locked test-authoring error from `activity-timeline-traversal`. No
product behavior changes: the refreshed traversal already includes the late
event, but only after following its continuation because the 200-event page bound
excludes the 201st event.

## SCN-activity-timeline-031 — Refreshed traversal includes the late event

Given trace TA has 201 committed events and the first read returns 200 with a
continuation
When ELATE is committed before the continuation position
And A follows the original traversal
Then only the remaining original event is returned and ELATE is absent
When A refreshes and follows the refreshed traversal through all pages
Then ELATE is present exactly once and no original event is duplicated.

The corrected oracle asserts membership of the refreshed traversal, not presence
on its first page. The original locked test remains recorded as a test-authoring
defect; it is not edited or weakened.
