# Activity timeline domain model

Version: 0.1. Prepared: 2026-10-29. Scope: metadata-only inspection increment.

## 0. Sources & Traceability

- Spec: [confirmed timeline requirements](../../../REQUIREMENTS.md#metadata-only-activity-timeline-confirmed-first-frontend-slice).
- Register: [scoped ingestion version 0.2](./00-ingestion.md).
- Decisions: DR-015/DR-016 in the [confirmation record](../05-decision-record.md).
- Requirements: REQ-activity-timeline-001, REQ-activity-timeline-002,
  REQ-activity-timeline-003, REQ-activity-timeline-004,
  REQ-activity-timeline-005, REQ-activity-timeline-006,
  REQ-activity-timeline-007, REQ-activity-timeline-008,
  REQ-activity-timeline-009, REQ-activity-timeline-010,
  REQ-activity-timeline-011.
- Reviewed diagrams used as inputs: none. Intent diagrams follow this model
  and require separate explicit approval.
- Blocking domain ambiguities: none after DR-016. Exact representations and
  acceptance preparation remain later-gate questions, not invented facts.

## 1. Ubiquitous Language

- **Human:** an authenticated person permitted to inspect their private account's
  activity. A reporting credential is not human approval authority.
  [REQ-activity-timeline-001/004]
- **Private account scope:** the ownership boundary for a human's traces,
  approvals and client credentials. An asserted ownership identifier alone
  does not grant access. [REQ-activity-timeline-001]
- **Activity trace:** the correlated record of one observable execution,
  including its reported events, hierarchy, execution status and telemetry
  completeness. It is not a new incident-management case.
  [REQ-activity-timeline-002/005/006]
- **Activity event:** one reported prompt, guard, approval, agent, model or tool
  occurrence with attributable metadata. It is not the event's content body.
  [REQ-activity-timeline-002/003/009]
- **Prompt metadata:** prompt-event time, identity, guard outcome and applicable
  rule identifiers, without original or redacted prompt text.
  [REQ-activity-timeline-003]
- **Approval history:** trusted reported requests and approved, rejected, canceled
  or expired resolutions. Inspecting history does not approve or resume work.
  [REQ-activity-timeline-004]
- **Receipt order:** server receipt time ascending, then event identity ascending
  to distinguish equal receipt times among siblings; not universal causal order.
  [REQ-activity-timeline-005]
- **Source time:** the origin's reported time where available, separate from
  receipt time and not presumed synchronized across origins.
  [REQ-activity-timeline-005]
- **Parent relationship:** a reported, validated link from a child activity to its
  parent within the same private scope and trace. It determines nesting.
  [REQ-activity-timeline-002/005]
- **Unlinked activity:** an inspectable event whose required parent is not yet
  available. A later valid parent can resolve the relationship.
  [REQ-activity-timeline-005/006]
- **Execution status:** running, completed, failed, canceled or unknown,
  according to the trusted reported execution evidence.
  [REQ-activity-timeline-006]
- **Telemetry completeness:** complete, incomplete, unknown or unsupported;
  distinct from execution status. Complete requires positive trusted evidence.
  [REQ-activity-timeline-006/007]
- **Known loss extent:** reported missing count or time range, if known, and cause
  of incomplete telemetry. Unknown extent must remain unknown.
  [REQ-activity-timeline-007]
- **Coverage dimensions:** input enforcement, response observation and tool/
  lifecycle visibility, reported independently; observing activity does not
  establish enforcement. [REQ-activity-timeline-008]
- **Partial inspection:** some retained events have not yet been loaded. This
  is not evidence that telemetry was lost.
  [REQ-activity-timeline-005/006]
- **Inspection failure:** inability to inspect authorized activity, explicitly
  distinct from a successful empty activity result.
  [REQ-activity-timeline-001/010]
- **Controlled activity fixture:** isolated synthetic metadata used to verify
  inspection. It does not prove live agent capture or real approval enforcement.
  [REQ-activity-timeline-011]

## 2. Aggregates & Entities

- **Activity Trace (aggregate root):** owns the correlated inspection history,
  validated parent relationships and independently evidenced execution/
  completeness status for one private scope. [REQ-activity-timeline-001/002/006]
  - **Properties/state:** trace identity, scope ownership, reported activity,
    execution status, completeness, known loss cause/extent and coverage
    dimensions where available. [REQ-activity-timeline-005/006/007/008]
  - **Value objects:** receipt/source times, event identities, parent links,
    available duration, guard outcome/rule metadata and approval history.
    [REQ-activity-timeline-002/003/004/005]
  - **Commands:** inspect authorized activity, expand reported relationships,
    continue partial inspection and refresh retained activity.
    [REQ-activity-timeline-001/002/005/010]
  - **Boundary:** inspection cannot create a human approval or deliver model/
    tool work. [REQ-activity-timeline-004]

- **Activity Event (entity):** identified within authenticated scope and attributed
  to a validated origin. Its safe metadata and parent link contribute to a trace.
  An identical repeated event does not become a second historical occurrence;
  conflicting content cannot replace the accepted history.
  [REQ-activity-timeline-002/005; DR-016]

- **Approval History Entry (referenced entity):** trusted evidence that approval
  was requested or resolved as approved, rejected, canceled or expired. It is
  inspected, not acted on, in this increment. An absent resolution does not
  imply approval, rejection or expiry.
  [REQ-activity-timeline-004/006]

## 3. Business Rules (Invariants)

- **INV-activity-timeline-001:** inspection is authorized within the human's private
  account scope. Guessed identities, another account's ownership or a reporting
  credential do not grant inspection access. [REQ-activity-timeline-001]
- **INV-activity-timeline-002:** prompt events contain safe metadata only; neither
  original nor redacted prompt bodies are retained or exposed by this journey.
  [REQ-activity-timeline-003/009]
- **INV-activity-timeline-003:** activity can be correlated and nested only from
  validated reported relationships; unsupported or missing activity is not
  fabricated. [REQ-activity-timeline-002/005/008]
- **INV-activity-timeline-004:** siblings follow receipt time then event identity,
  ascending. Source time stays separate and does not establish global causality.
  [REQ-activity-timeline-005]
- **INV-activity-timeline-005:** missing-parent events remain inspectable.
  Later valid parents may resolve them; cyclic and cross-scope parent relationships
  are rejected without inventing a substitute parent.
  [REQ-activity-timeline-001/005]
- **INV-activity-timeline-006:** unavailable duration/time remains unavailable.
  No guessed duration, missing count or time range is represented as known.
  [REQ-activity-timeline-005/007]
- **INV-activity-timeline-007:** execution status and telemetry completeness are
  independent. Completion does not imply complete capture; no loss report alone
  is insufficient evidence of completeness. [REQ-activity-timeline-006/007]
- **INV-activity-timeline-008:** approval history is inspectable but not actionable.
  Missing resolution is not an implicit authorization; an observation cannot
  manufacture trusted guard or approval authority.
  [REQ-activity-timeline-004]
- **INV-activity-timeline-009:** input enforcement, response observation and tool/
  lifecycle coverage remain distinguishable; unknown/bypassed coverage is not
  presented as guarding or proof of absent activity.
  [REQ-activity-timeline-006/008]
- **INV-activity-timeline-010:** identical scoped duplicates do not multiply
  history, while conflicting duplicates fail without replacing accepted metadata.
  [REQ-activity-timeline-002; confirmed package DR-016]
- **INV-activity-timeline-011:** at most 50 trace summaries or 200 activity events
  are supplied at a time; further retained activity has explicit continuation.
  Partial inspection is not telemetry loss and must not hide retained activity
  as though it never existed. [REQ-activity-timeline-005/006; DR-016]
- **INV-activity-timeline-012:** inspection failures are explicit, not disguised as
  an empty, completed or fully observed trace. [REQ-activity-timeline-010]
- **INV-activity-timeline-013:** reasoning, credentials, model/tool bodies and
  arbitrary content payloads do not become timeline metadata.
  [REQ-activity-timeline-009]
- **INV-activity-timeline-014:** controlled fixture inspection does not prove
  live agent capture, prompt detection or actual approval/delivery enforcement.
  [REQ-activity-timeline-011]

## 4. Domain Events

These are conceptual outcomes, not a requirement to generate new activity records
for every inspection or internal operation.

- **AuthorizedActivityInspected:** a human inspected retained activity from their
  private scope. [REQ-activity-timeline-001/002]
- **ApprovalHistoryInspected:** reported approval requests/resolutions were
  inspected without granting approval. [REQ-activity-timeline-004]
- **UnlinkedActivityIdentified:** a retained event's parent is unavailable and
  remains explicitly unresolved. [REQ-activity-timeline-005/006]
- **ActivityRelationshipResolved:** a later valid parent made a previously
  unlinked event's relationship inspectable. [REQ-activity-timeline-005]
- **IncompleteTelemetryIdentified:** known loss cause and available extent were
  distinguished from unknown facts. [REQ-activity-timeline-006/007]
- **InspectionFailed:** access or availability prevented inspection without
  turning that failure into a successful empty history.
  [REQ-activity-timeline-001/010]
