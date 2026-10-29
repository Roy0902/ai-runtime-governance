# First frontend-acceptance slice: incident activity timeline

Version: 0.2. Prepared: 2026-10-29.
Status: **Journey and behavior package confirmed by DR-015/DR-016; detailed
contracts and intent review still required. Supersedes library-only priority.**

## Confirmed user journey

An authenticated human opens an authorized incident/activity trace and inspects
the visual timeline of prompt events, guard outcomes, approval lifecycle and
other reported execution activity. Frontend acceptance tests must be produced
through the spec-to-test workflow. Supporting unit tests may supplement but
never replace those browser acceptance tests.

The user explicitly selected metadata only: prompt event, time, identity,
guard outcome and rule IDs. Do not retain or show prompt bodies, including
redacted bodies. No ordinary payload archive or reasoning-text capture is
introduced by this journey.

An incident/activity trace is an inspection journey, not automatically a new
incident-management entity. Triage, assignment, comments, incident severity,
notifications and case management are not selected requirements.

## Existing requirement basis

| Requirement | Included responsibility |
|---|---|
| MON-001 | Correlate guard decisions with reported agent/model/tool activity |
| MON-002 | Order, hierarchy, status and available duration; distinguish missing telemetry |
| MON-003 | Observable execution sequence, not private reasoning |
| EVT-001 | Authenticated scoped persisted events and trace/span correlation |
| EVT-004 | Explicit incomplete cause/known extent when observation is lost |
| UI-001 | Authorized trace listing and expandable nested activity timeline |
| GUARD-002/GUARD-006 | Represent reported approval requirement/resolution truthfully; no fabricated approval authority |
| AUTH-001 | Private account scope, authenticated reads and submitter-only authority |
| API-001 | Explicit safe typed failures, not success-shaped fallbacks |
| ARC-002 | No reasoning text in monitoring/display/storage |

This is a scope reference, not a claim that full parent requirements are already
satisfied. Event schema/order/query details under OD-05 and approval/dispatch
contracts remain open.

## Acceptance boundary

Real frontend acceptance must exercise the browser, timeline backend reads and
persisted controlled metadata. A fixture-only static screen or mocked frontend
responses cannot be presented as complete end-to-end acceptance.

Deterministic setup may create synthetic traces and events through reviewed
test-only setup or an approved ingestion contract. Such setup must be isolated,
authenticated appropriately and absent from the public production interface.
It proves timeline inspection, not real agent capture, prompt detection, secure
integration mapping or actual human approval/dispatch enforcement.

Do not add real model calls, WSL dependency or production credentials merely to
produce timeline test data. Agent-specific integration tests remain separate.

## Confirmed package and remaining gates

DR-016 selects read-only approval history, receipt-ordered siblings with source
time separate, inspectable unresolved parents, no fabricated facts, separate
execution/completeness status, 50-trace/200-event read bounds, explicit
continuation/manual refresh, authenticated identity and scoped duplicate handling.
The current [requirements](../../REQUIREMENTS.md#metadata-only-activity-timeline-confirmed-first-frontend-slice)
record the package. Approval actions are outside this increment; filters/search,
automatic polling and live-token display are not included.

- Define the event/read contracts and trusted origin of authoritative approval/
  guard metadata; event reporting cannot grant approval or forge policy authority.
- Define event ordering versus receipt/source time, late/missing parents,
  completeness and available durations without fabricated facts.
- Define the trace-list/detail frontend states, accessible labels/copy and errors.
- Define exact cursor/snapshot semantics within the approved bounded/manual
  read behavior. Do not promote the remaining UI-002 filters or full proposal.
- Use the confirmed login/private-scope behavior. If full public registration/
  2FA is not implemented in the same increment, a test identity mechanism must
  not be represented as production authentication or a bypass of its requirements.

## Relationship to guard-core materials

The approved guard-core scope, intent and scenarios remain valid for that bounded
component, but its no-frontend boundary does not meet the user's required first
frontend acceptance journey. Do not force its internal cases into arbitrary
browser controls or silently adopt the rejected subprocess acceptance proposal.

Return to scoped ingestion/domain/intent for this timeline journey, then prepare
browser scenarios, shared API/UI checklist, implementation design and separate
frontend/backend tasks. Freeze and red browser acceptance follow review, before
implementation. Preserve the guard-core artifacts as supporting future work;
do not overwrite the approved intent diagram.
