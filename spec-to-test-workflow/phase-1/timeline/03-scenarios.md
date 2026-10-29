# Activity timeline frontend acceptance scenarios

Version: 0.1. Prepared: 2026-10-29. Phase 3 draft; **not frozen or executed**.
Sources: [confirmed specification](../../../REQUIREMENTS.md#metadata-only-activity-timeline-confirmed-first-frontend-slice),
[scoped requirements](./00-ingestion.md), [domain model](./01-domain-model.md),
[approved intent v0.1](./02-intent-v0.1.md), approval DR-017.

## Fixture and execution rules

Every scenario is independent. Controlled activity fixtures create retained
metadata for Human A/private scope A and, where needed, Human B/private scope B.
Identifiers and timestamps below are synthetic fixture values, not production
defaults. No real prompt, secret or model request is needed.

Acceptance executes the real browser and backend reads against persisted
metadata. No mocked successful network response or static fake timeline replaces
that journey. Provisioning fixtures/authenticated identities must be reviewed,
isolated and unavailable as an unauthenticated production seed mechanism.
Production authentication requirements remain intact.

An event's server receipt time and source time are separate. A missing duration,
parent or loss extent is deliberately absent, not zero. Guard/approval facts
come from controlled trusted records; reporting credentials do not authorize
guard/approval decisions. Test setup that inserts authoritative records does
not demonstrate live agent authority.

The scenarios assert business results, not interaction mechanics. Phase 4 will
declare accessible roles/labels/copy and wire contracts. No UI wording, HTTP
status code or previously unspecified cursor behavior is invented here.

## Scenarios

```gherkin
Feature: Inspect private metadata-only activity traces

  @REQ-activity-timeline-001 @REQ-activity-timeline-002 @REQ-activity-timeline-011 @SCN-activity-timeline-001 @smoke
  Scenario: A human inspects their retained correlated activity
    Given Human A is authenticated in Private Account Scope A
    And Activity Trace TA belongs to A with root Activity Event E1 and child E2
    And E1 reports prompt metadata and E2 reports a guard outcome "redact" with rule "fixture-email"
    When Human A inspects TA and expands its reported activity
    Then E1 and E2 are inspectable with E2 nested under E1
    And the reported guard outcome is "redact" with rule identity "fixture-email"
    And that activity is obtained through the actual retained Activity Trace

  @REQ-activity-timeline-001 @SCN-activity-timeline-002 @reg
  Scenario Outline: An invalid human session discloses no private history
    Given Activity Trace TA belongs to Private Account Scope A
    And the Human's authenticated session is <session>
    When the Human attempts to inspect TA
    Then protected Activity Events from TA are not disclosed
    And authentication is required rather than successful empty inspection
    Examples:
      | session |
      | absent  |
      | expired |
      | revoked |

  @REQ-activity-timeline-001 @SCN-activity-timeline-003 @reg
  Scenario: A guessed other-account trace does not grant inspection
    Given Human A is authenticated in Private Account Scope A
    And Activity Trace TB belongs to B with event identity "B-PRIVATE-EVENT"
    When Human A attempts direct inspection of TB
    Then zero events or metadata from TB are disclosed
    And "B-PRIVATE-EVENT" is absent from Human A's inspected activity
    And the result is an explicit unavailable or access failure, not successful empty history

  @REQ-activity-timeline-002 @REQ-activity-timeline-005 @SCN-activity-timeline-004 @reg
  Scenario: Reported model and tool activity follows its validated parent hierarchy
    Given Human A has Activity Trace TA with root E1, child model event E2 and tool event E3 whose parent is E2
    When Human A inspects and expands TA
    Then E2 is nested under E1 and E3 is nested under E2
    And no additional parent or tool authorization is inferred

  @REQ-activity-timeline-003 @REQ-activity-timeline-009 @SCN-activity-timeline-005 @reg
  Scenario: Prompt history is metadata-only
    Given Human A has a prompt Activity Event E1 received at "2026-10-29T10:00:00Z"
    And its reported identity is "fixture-human-A", guard outcome is "deny" and rule is "fixture-rule"
    When Human A inspects E1
    Then its prompt time, identity, guard outcome and rule identity are inspectable with those exact fixture values
    And original and redacted prompt bodies are absent from retained and inspected timeline metadata
    And no prompt-body retrieval is offered by this journey

  @REQ-activity-timeline-004 @SCN-activity-timeline-006 @reg
  Scenario Outline: Approval resolutions are inspectable without approval actions
    Given Human A has trusted Approval History recording requested then <resolution>
    When Human A inspects that Approval History
    Then the reported request and exact resolution <resolution> are inspectable
    And inspection grants zero approvals and exposes no approval or rejection action
    Examples:
      | resolution |
      | approved   |
      | rejected   |
      | canceled   |
      | expired    |

  @REQ-activity-timeline-004 @REQ-activity-timeline-006 @SCN-activity-timeline-007 @reg
  Scenario: An unresolved approval request remains unresolved
    Given Human A has trusted Approval History containing requested and no resolution
    When Human A inspects the Approval History
    Then requested is inspectable
    And no approved, rejected, canceled or expired resolution is fabricated

  @REQ-activity-timeline-005 @SCN-activity-timeline-008 @reg
  Scenario: Source-clock order does not replace receipt order
    Given Human A has sibling events E1 and E2
    And E1 receipt time is "2026-10-29T10:00:01Z" and source time is "2026-10-29T10:00:10Z"
    And E2 receipt time is "2026-10-29T10:00:02Z" and source time is "2026-10-29T10:00:00Z"
    When Human A inspects the siblings
    Then receipt order is exactly E1 then E2
    And both reported source times remain separately inspectable
    And that ordering is identified as receipt order, not global causal order

  @REQ-activity-timeline-005 @SCN-activity-timeline-009 @reg
  Scenario: Equal receipt times use ascending event identity
    Given Human A has sibling events "evt-002" and "evt-001" with equal receipt time
    When Human A inspects the siblings
    Then their order is exactly "evt-001" then "evt-002"

  @REQ-activity-timeline-005 @REQ-activity-timeline-006 @SCN-activity-timeline-010 @reg
  Scenario: Missing parent remains inspectable and later resolves
    Given Human A has E2 with claimed parent E1 and no retained E1
    When Human A inspects the Activity Trace
    Then E2 is inspectable as Unlinked Activity with unresolved parent identity E1
    When a valid E1 is retained in the same trace and scope and Human A refreshes inspection
    Then E2 has the validated parent relationship to E1
    And E2 has not become a duplicate Activity Event

  @REQ-activity-timeline-001 @REQ-activity-timeline-005 @SCN-activity-timeline-011 @reg
  Scenario Outline: Invalid parent relationships are not accepted
    Given Human A has retained valid activity in TA
    And controlled attempted metadata claims <relationship>
    When that relationship is evaluated and Human A inspects TA
    Then the invalid relationship is explicitly rejected
    And no cyclic hierarchy or other-account metadata is added to TA
    Examples:
      | relationship                                  |
      | an event as its own parent                    |
      | a two-event parent cycle                      |
      | a parent belonging to Private Account Scope B |

  @REQ-activity-timeline-005 @REQ-activity-timeline-007 @SCN-activity-timeline-012 @reg
  Scenario: Unavailable time and duration do not become zero
    Given Human A has E1 with a receipt time but no source time or duration
    When Human A inspects E1
    Then its receipt time is inspectable
    And its source time and duration are identified as unavailable
    And neither is replaced by a fabricated timestamp or zero duration

  @REQ-activity-timeline-006 @SCN-activity-timeline-013 @reg
  Scenario Outline: Execution and completeness remain independent
    Given Human A has an Activity Trace with Execution Status <execution> and Telemetry Completeness <telemetry>
    And any complete status has trusted positive evidence
    When Human A inspects the trace
    Then Execution Status is exactly <execution>
    And Telemetry Completeness is exactly <telemetry>
    Examples:
      | execution | telemetry   |
      | running   | complete    |
      | completed | incomplete  |
      | failed    | complete    |
      | canceled  | unknown     |
      | unknown   | unsupported |

  @REQ-activity-timeline-006 @SCN-activity-timeline-014 @reg
  Scenario Outline: No recorded events does not erase telemetry uncertainty
    Given Human A has a trace with zero retained Activity Events and Telemetry Completeness <telemetry>
    When Human A inspects that trace
    Then zero recorded Activity Events are inspectable
    And Telemetry Completeness remains <telemetry>
    And zero events is not presented as proof that no activity occurred
    Examples:
      | telemetry   |
      | complete    |
      | incomplete  |
      | unknown     |
      | unsupported |

  @REQ-activity-timeline-006 @SCN-activity-timeline-015 @reg
  Scenario: No loss report alone does not establish complete capture
    Given Human A has a trace without trusted positive completeness evidence
    And no loss report has been received
    When Human A inspects the trace
    Then Telemetry Completeness is not complete solely because no loss report exists
    And absent capture evidence remains unknown

  @REQ-activity-timeline-007 @SCN-activity-timeline-016 @reg
  Scenario: Known loss extent is preserved exactly
    Given Human A has an incomplete trace with cause "fixture-collector-outage"
    And its known missing count is 3 with known range "2026-10-29T10:00:00Z" to "2026-10-29T10:01:00Z"
    When Human A inspects the trace
    Then incomplete status and cause "fixture-collector-outage" are inspectable
    And missing count is exactly 3 with that exact reported range

  @REQ-activity-timeline-007 @SCN-activity-timeline-017 @reg
  Scenario: Unknown loss extent remains unknown
    Given Human A has incomplete telemetry with cause "fixture-spool-unavailable"
    And missing count and missing time range are unknown
    When Human A inspects the trace
    Then the reported cause is inspectable
    And no zero missing count or fabricated time range is supplied

  @REQ-activity-timeline-008 @SCN-activity-timeline-018 @reg
  Scenario: Coverage dimensions do not collapse into one healthy state
    Given Human A has reported input coverage bypassed, response coverage unknown and tool coverage degraded
    When Human A inspects the trace
    Then all three reported coverage dimensions remain independently inspectable
    And the trace is not claimed to have guarded input or complete response/tool capture

  @REQ-activity-timeline-009 @SCN-activity-timeline-019 @reg
  Scenario: Metadata inspection does not expose ordinary or reasoning payloads
    Given controlled attempted activity includes synthetic prompt, model response, tool argument/result, reasoning and credential body fields
    When the metadata boundary evaluates that activity and Human A inspects accepted history
    Then none of those body values is retained or returned as timeline metadata
    And none is exposed in the inspected activity or error details

  @REQ-activity-timeline-002 @SCN-activity-timeline-020 @reg
  Scenario: Identical scoped duplicates do not multiply history
    Given authenticated controlled activity reports event E1 twice with identical validated content in Scope A
    When Human A inspects that trace
    Then E1 occurs exactly once with its accepted metadata

  @REQ-activity-timeline-002 @REQ-activity-timeline-010 @SCN-activity-timeline-021 @reg
  Scenario: A conflicting duplicate does not overwrite history
    Given E1 is accepted in Scope A with source time "2026-10-29T10:00:00Z"
    And a second report reuses E1 with conflicting source time "2026-10-29T10:01:00Z"
    When that report is evaluated and Human A inspects E1
    Then the conflicting report is explicitly rejected
    And E1 still has source time "2026-10-29T10:00:00Z", not "2026-10-29T10:01:00Z"

  @REQ-activity-timeline-004 @REQ-activity-timeline-009 @SCN-activity-timeline-022 @reg
  Scenario: An observation reporter cannot manufacture approval authority
    Given an event-reporting credential attempts to report an authoritative approved outcome it is not permitted to establish
    When that attempted history is evaluated and Human A inspects accepted Approval History
    Then the forged authoritative outcome is explicitly rejected
    And no approved history entry is created from that attempted authority

  @REQ-activity-timeline-005 @REQ-activity-timeline-006 @SCN-activity-timeline-023 @reg
  Scenario Outline: Bounded trace inspection does not hide retained traces
    Given Human A owns exactly <count> retained traces and no concurrent changes occur
    When Human A inspects and continues through all retained trace summaries
    Then each response contains at most 50 trace summaries
    And exactly <count> unique traces are inspectable across the completed traversal
    And continuation is explicit whenever more retained traces remain
    Examples:
      | count |
      | 0     |
      | 1     |
      | 49    |
      | 50    |
      | 51    |

  @REQ-activity-timeline-005 @REQ-activity-timeline-006 @SCN-activity-timeline-024 @reg
  Scenario Outline: Partial loading is not lost telemetry
    Given Human A has a trace with exactly <count> retained events and trusted complete telemetry evidence
    And no concurrent changes occur
    When Human A inspects and continues through all retained activity
    Then each response contains at most 200 events
    And exactly <count> unique events are inspectable across the completed traversal
    And retained but unloaded events are not labeled telemetry loss
    Examples:
      | count |
      | 0     |
      | 1     |
      | 199   |
      | 200   |
      | 201   |

  @REQ-activity-timeline-002 @REQ-activity-timeline-005 @SCN-activity-timeline-025 @reg
  Scenario: Manual refresh reveals newly retained activity
    Given Human A inspects a trace containing E1
    And E2 is subsequently retained in the same trace
    When Human A manually refreshes inspection
    Then both E1 and E2 are inspectable in the confirmed hierarchy and receipt order
    And no automatic polling or live-token stream is required

  @REQ-activity-timeline-010 @SCN-activity-timeline-026 @reg
  Scenario Outline: Read failure is not successful empty inspection
    Given Human A is authenticated and authorized for the requested activity
    And <read> cannot obtain retained metadata because its dependency is unavailable
    When Human A requests that inspection
    Then an explicit Inspection Failure is observable
    And the failed operation is not reported as successfully empty, complete or completed
    Examples:
      | read         |
      | trace listing|
      | trace detail |
      | continuation |
      | refresh      |

  @REQ-activity-timeline-001 @SCN-activity-timeline-027 @reg
  Scenario: Continuation rechecks authorization
    Given Human A inspected authorized retained activity with continuation remaining
    And the authenticated session is revoked before continuation
    When the Human requests further activity
    Then no additional private Activity Events are disclosed
    And the terminated session cannot authorize continuation

  @REQ-activity-timeline-011 @SCN-activity-timeline-028 @reg
  Scenario: Controlled persisted metadata proves inspection only
    Given isolated Controlled Activity Fixtures contain traces for A and B
    And Human A is authenticated through the reviewed real authentication boundary
    When Human A inspects their fixture trace through the real frontend and retained backend activity
    Then the authorized fixture history is inspectable and B's private activity is absent
    And the evidence is classified as timeline inspection, not verified agent capture or live approval enforcement
```

For SCN-014's complete case, the fixture includes trusted positive completeness
evidence even though no events were recorded; zero events alone is insufficient.
SCN-019 asserts the no-body boundary, not a yet-unselected reject-versus-omit
wire policy. SCN-021 changes source time rather than introducing an unsupported
execution-status value.

## Coverage and open exact-contract cases

| Requirement | Primary scenario suffixes |
|---|---|
| REQ-activity-timeline-001 | 001, 002, 003, 011, 027 |
| REQ-activity-timeline-002 | 001, 004, 020, 021, 025 |
| REQ-activity-timeline-003 | 005 |
| REQ-activity-timeline-004 | 006, 007, 022 |
| REQ-activity-timeline-005 | 004, 008, 009, 010, 011, 012, 023, 024, 025 |
| REQ-activity-timeline-006 | 007, 010, 013, 014, 015, 023, 024 |
| REQ-activity-timeline-007 | 012, 016, 017 |
| REQ-activity-timeline-008 | 018 |
| REQ-activity-timeline-009 | 005, 019, 022 |
| REQ-activity-timeline-010 | 021, 026 |
| REQ-activity-timeline-011 | 001, 028 |

Invariant coverage by suffix:

- 001: SCN-002/003/027; 002: SCN-005/019; 003: SCN-004/010/011.
- 004: SCN-008/009; 005: SCN-010/011; 006: SCN-012/016/017.
- 007: SCN-013/014/015; 008: SCN-006/007/022; 009: SCN-018.
- 010: SCN-020/021; 011: SCN-023/024; 012: SCN-026.
- 013: SCN-005/019/022; 014: SCN-028.

Cases still blocked before freeze:

| Candidate | Why it is not a ready acceptance expectation | Existing ambiguity |
|---|---|---|
| Exact HTTP statuses, error schema, cursor tampering/expiry and concurrent traversal | Wire/security/query contract not yet selected | AMB-activity-timeline-004 |
| Exact accessible labels, date format/time zone, loading/empty/error copy, focus and refresh-retention behavior | UI contract not yet declared | AMB-activity-timeline-005 |
| Exact login fixture bootstrap, verification/2FA setup, authority-origin permissions and ingest setup | Real auth/data setup must not be bypassed by fake successful sessions | AMB-activity-timeline-006/007 |
| Equal timestamp ordering for identifiers beyond simple ASCII fixtures | Event-ID syntax/comparison and precision belong to the exact contract | AMB-activity-timeline-004 |

These candidates are not passing tests. If promoted to SCNs before resolution,
they must be tagged unspecified and excluded from freeze until concretized.
No scenario file, red run, browser pass, lock or frozen manifest exists yet.

## Phase 4 handoff

28 business scenario IDs cover the eleven scoped requirements and fourteen
invariants. Browser acceptance must prove the inspection outcomes; native tests
and controlled setup supplement checks of persistence exclusions, duplicate/
authority rejection and missing-parent integrity. Do not claim browser rendering
alone proves those storage/authorization properties.

Next prepare one shared read/event/UI contract matrix and native setup baseline,
then implementation design plus separate frontend/backend tasks. Tests must be
authored red after review/freeze and before product implementation.
