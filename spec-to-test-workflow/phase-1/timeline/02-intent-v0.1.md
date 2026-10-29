# Incident activity timeline: intent v0.1

Prepared: 2026-10-29. Version: **v0.1**.
Status of approval is recorded in the [confirmation record](../05-decision-record.md),
not by rewriting this versioned artifact. As-built diagrams must be separate.

## 1. Sources and scope

- [Confirmed timeline specification](../../../REQUIREMENTS.md#metadata-only-activity-timeline-confirmed-first-frontend-slice).
- [Scoped ingestion](./00-ingestion.md), confirmed package DR-016.
- [Pure domain model](./01-domain-model.md).
- REQ-activity-timeline-001 through REQ-activity-timeline-011.
- INV-activity-timeline-001 through INV-activity-timeline-014.

This is the read-only authenticated metadata timeline, not a prompt-submission
interface or approval console. No approval action, original/redacted prompt body,
reasoning, model/tool payload or live integration is introduced by this artifact.

## 2. Human inspection journey

```mermaid
flowchart TD
    Start["Human requests trace inspection"]
    Auth{"Valid authenticated human session?"}
    Login["Authentication required<br/>No protected trace data"]
    ListRead{"Private-scope trace listing available?"}
    ListError["Explicit listing failure<br/>Not an empty-success fallback"]
    List["Show at most 50 private-scope trace summaries<br/>Continuation explicit; manual refresh"]
    Select["Human selects a trace or opens its trace identity"]
    Owned{"Trace belongs to authenticated private scope?"}
    Denied["No trace data disclosed<br/>Explicit unavailable/access result per later contract"]
    Read{"Authorized trace metadata available?"}
    ReadError["Explicit trace-read failure<br/>Never completed or empty-success fallback"]
    Timeline["Inspect nested and unlinked activity<br/>Receipt-ordered siblings; source time separate"]
    Evidence["Show available duration, guard and approval history<br/>Execution and telemetry status kept separate<br/>No invented facts, bodies or approval controls"]
    More{"More retained activity not yet loaded?"}
    Continue["Explicit continuation<br/>At most 200 events per response<br/>Loading boundary is not telemetry loss"]
    Inspect["Continue inspection<br/>Manual refresh only; no automatic polling"]

    Start -->|"Begin inspection"| Auth
    Auth -->|"No: absent, expired or revoked session"| Login
    Auth -->|"Yes: resolve account ownership from authentication"| ListRead
    ListRead -->|"No: dependency/read failure"| ListError
    ListRead -->|"Yes: including a genuinely empty result"| List
    List -->|"Select available trace or enter a trace identity"| Select
    Select -->|"Recheck ownership for this read"| Owned
    Owned -->|"No: unowned or unavailable trace"| Denied
    Owned -->|"Yes: ownership verified"| Read
    Read -->|"No: dependency/read failure"| ReadError
    Read -->|"Yes: actual persisted metadata, even if empty or incomplete"| Timeline
    Timeline -->|"Inspect reported evidence only"| Evidence
    Evidence -->|"Check response continuation separately from completeness"| More
    More -->|"Yes: additional retained metadata"| Continue
    More -->|"No: current retained result exhausted"| Inspect
    Continue -->|"Human loads more; reauthenticate and reauthorize on each read"| Auth
    Inspect -->|"Human manually refreshes; reauthenticate and reauthorize"| Auth
```

The return to authorization denotes repeating checks for the selected operation,
not forcing a valid session through another login or making a detail continuation
depend on rereading the trace list. Exact routes/cursors and whether to preserve
old data during a failed refresh are later UI/contract decisions. Neither route
choice nor new visible copy is silently approved by this flow.

A direct trace identity must be authorized even when the human has not visited
the list; the selection node represents both access paths. No HTTP status or
resource-enumeration policy is invented here.

## 3. Metadata integrity and hierarchy

```mermaid
flowchart TD
    Input["Reported metadata for authenticated scope and origin"]
    Safe{"Supported safe metadata and applicable authority?"}
    Reject["Explicit metadata rejection<br/>No body/credential echo or successful history mutation"]
    Dup{"Scoped event identity already accepted?"}
    Same{"Same validated content?"}
    Existing["Retain accepted event once<br/>No duplicate occurrence"]
    Parent{"Claimed parent creates a cycle or crosses scope?"}
    Pending{"Parent available among retained metadata?"}
    Unlinked["Keep event inspectable as unlinked activity<br/>Never invent a parent"]
    Nested["Use validated parent relationship<br/>Receipt time then event identity order among siblings"]
    Root["Keep reported root activity<br/>No parent inferred"]
    HasParent{"Parent claimed?"}
    Store["Retain safe correlated metadata<br/>Only trusted records establish guard/approval facts"]

    Input -->|"Validate scope, origin and safe field contract"| Safe
    Safe -->|"No: unsupported/unsafe data or forged authority"| Reject
    Safe -->|"Yes: validated metadata"| Dup
    Dup -->|"Yes: identity already retained"| Same
    Same -->|"Yes: identical validated content"| Existing
    Same -->|"No: conflicting duplicate"| Reject
    Dup -->|"No: new event identity"| HasParent
    HasParent -->|"No: reported root"| Root
    HasParent -->|"Yes: relationship claimed"| Parent
    Parent -->|"Yes: invalid relationship"| Reject
    Parent -->|"No: no invalid relationship established"| Pending
    Pending -->|"No: unresolved parent"| Unlinked
    Pending -->|"Yes: valid relationship"| Nested
    Root -->|"Accept once"| Store
    Unlinked -->|"Accept unresolved relationship explicitly"| Store
    Nested -->|"Accept validated relationship"| Store
    Unlinked -->|"Later parent arrives; revalidate before linking"| Parent
```

This is intended behavior, not a new public ingestion endpoint. Exact producer
authentication, allowed fields, payload rejection versus omission, durable
storage transaction and relinking races remain shared-contract/design work.
Missing parent data must not be confused with pagination: a parent absent from
the currently loaded response may already be retained and valid.

## 4. Independent evidence dimensions

| Dimension | Confirmed choices | Forbidden inference |
|---|---|---|
| Execution | running, completed, failed, canceled, unknown | Missing observations do not prove completion/failure |
| Telemetry | complete, incomplete, unknown, unsupported | Completed execution does not imply complete capture |
| Complete evidence | Trusted positive capture evidence required | Absence of a loss report alone is insufficient |
| Loss extent | Cause and only known count/range | Do not fill unknown counts/durations/ranges with zero |
| Loading | Explicit continuation and response bounds | Unloaded retained events are not lost telemetry |
| Input coverage | Reported enforcement/unknown/bypass state | A prompt event alone does not establish guarding |
| Response coverage | Reported observation status | A model event does not establish every response was captured |
| Tool/lifecycle coverage | Reported observation status | An observed tool call does not prove service authorization |
| Approval | Trusted requested/resolved history only | An absent result does not imply approved/rejected/expired |

These are inspection dimensions, not a newly invented approval state machine.
Exact wire enums and safe visible wording require shared contracts and scenarios.

## 5. Requirement and invariant mapping

| Responsibility | Requirements | Invariants |
|---|---|---|
| Private authenticated inspection, direct-link ownership checks | REQ-activity-timeline-001 | INV-activity-timeline-001 |
| Correlated nested/unlinked reported activity | REQ-activity-timeline-002, REQ-activity-timeline-005 | INV-activity-timeline-003/005 |
| Metadata-only prompt log | REQ-activity-timeline-003, REQ-activity-timeline-009 | INV-activity-timeline-002/013 |
| Read-only trusted approval history | REQ-activity-timeline-004 | INV-activity-timeline-008 |
| Sibling receipt order, distinct source time, available duration | REQ-activity-timeline-005 | INV-activity-timeline-004/006 |
| Execution versus completeness, genuinely empty versus unknown | REQ-activity-timeline-006, REQ-activity-timeline-007 | INV-activity-timeline-006/007 |
| Separate coverage dimensions and honest bypass | REQ-activity-timeline-008 | INV-activity-timeline-009 |
| Explicit failure rather than empty fallback | REQ-activity-timeline-010 | INV-activity-timeline-012 |
| Safe scoped duplicates and rejection of forged metadata | REQ-activity-timeline-002/004/009 | INV-activity-timeline-008/010/013 |
| 50-trace/200-event responses and explicit continuation/manual refresh | REQ-activity-timeline-005/006 | INV-activity-timeline-011 |
| Actual browser/backend/persisted controlled-data acceptance | REQ-activity-timeline-011 | INV-activity-timeline-014 |

## 6. Review gate

Approve or revise v0.1 before concrete scenarios. Approval confirms the read-only
journey, hierarchy/ordering and evidence boundaries—not exact API shapes, visible
labels, login implementation, metadata-origin enforcement or live client support.

After approval, derive browser scenarios with controlled persisted metadata and
explicit contract/copy proposals, then the shared checklist, frontend/backend
design/task lists and Phase 6 review. No freeze or implementation occurs here.
