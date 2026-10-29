# Guard-core behavioral scenarios

Version: 0.1. Prepared: 2026-10-29. Phase 3 draft for later Phase 6 review/freeze.
Oracle: [confirmed specification](../../../REQUIREMENTS.md#client-independent-guard-decision-core-confirmed-first-slice),
[scoped requirements](./00-ingestion.md), [domain model](./01-domain-model.md),
and [approved intent v0.1](./02-intent-v0.1.md), approval DR-013.

These are business expectations, not executed tests or a frozen plan. State names
refer to the approved intent, not unreviewed Java types, field names or error-code
strings. Exact result/error types, offsets and protected acceptance setup remain
Phase 4 gates. None of the scenarios depends on WSL or a live agent.

## 1. Independent synthetic fixtures

Each scenario starts a fresh Message Evaluation. Unless overridden, its trusted
Catalog Revision has policy identity `guard-core-fixture-policy`, version
`fixtures-v1`, and the following fixed rule descriptors. These are test fixtures
for effect composition, not detector patterns or user-authored production rules.

| Catalog rule | Enabled | Fixed effect | Redaction priority | Typed marker |
|---|---|---|---|---|
| FX-EMAIL | Yes | Redact | 400 | `[REDACTED_EMAIL]` |
| FX-CREDENTIAL | Yes | Redact | 600 | `[REDACTED_CREDENTIAL]` |
| FX-API-TOKEN | Yes | Redact | 600 | `[REDACTED_API_TOKEN]` |
| FX-PHONE | Yes | Redact | 390 | `[REDACTED_PHONE]` |
| FX-CARD | Yes | Redact | 380 | `[REDACTED_PAYMENT_CARD]` |
| FX-FINANCIAL | Yes | Redact | 370 | `[REDACTED_FINANCIAL_ID]` |
| FX-DENY | Yes | Deny | Not applicable | Not applicable |
| FX-APPROVAL | Yes | Require approval | Not applicable | Not applicable |
| FX-DISABLED | No | Redact | 400 | `[REDACTED_EMAIL]` |

Redaction spans below identify exact original-message substrings. Where repeated,
an occurrence is explicitly identified. This does not select a Java text-offset
representation. Denial/approval findings have no redaction span.

`repeat("A", n)` means exactly n copies of the single ASCII character A.
`U+00E9` means that single Unicode character, not six literal escape characters;
it occupies two UTF-8 bytes. `U+1F600` occupies four UTF-8 bytes.
All fixture text is synthetic and remains local when tests are eventually run.

When an evaluation fails, its state is EvaluationFailed, not Allowed, Redacted,
Denied or ApprovalRequired. A failure is not a successful decision with missing
findings. Exact machine-readable failure codes are a separate contract gate.

## 2. Scenarios

```gherkin
Feature: Compose one Message Evaluation from trusted Findings

  Background:
    Given the trusted Catalog Revision "guard-core-fixture-policy" version "fixtures-v1" declared above

  @REQ-guard-core-002 @REQ-guard-core-003 @SCN-guard-core-001 @smoke
  Scenario: No findings permits the unchanged submitted message
    Given the Submitted Message is "Hello."
    And there are zero Findings
    When the Message Evaluation composes the Findings
    Then its state is Allowed and the message is exactly "Hello."
    And its Prompt Decision identifies policy "guard-core-fixture-policy" version "fixtures-v1"
    And its matched-rule attribution is empty

  @REQ-guard-core-002 @REQ-guard-core-004 @SCN-guard-core-002 @reg
  Scenario Outline: Each approved category uses its exact typed marker
    Given the Submitted Message is "left AA right"
    And one Finding for <rule> has Redaction Span "AA"
    When the Message Evaluation composes the Findings
    Then its state is Redacted and the message is exactly <message>
    And its Prompt Decision attributes the match to <rule>
    Examples:
      | rule          | message                                |
      | FX-EMAIL      | "left [REDACTED_EMAIL] right"            |
      | FX-CREDENTIAL | "left [REDACTED_CREDENTIAL] right"       |
      | FX-API-TOKEN  | "left [REDACTED_API_TOKEN] right"        |
      | FX-PHONE      | "left [REDACTED_PHONE] right"            |
      | FX-CARD       | "left [REDACTED_PAYMENT_CARD] right"     |
      | FX-FINANCIAL  | "left [REDACTED_FINANCIAL_ID] right"     |

  @REQ-guard-core-004 @SCN-guard-core-003 @reg
  Scenario: Separate redactions preserve the intervening message
    Given the Submitted Message is "AA BB"
    And FX-EMAIL identifies Redaction Span "AA"
    And FX-PHONE identifies Redaction Span "BB"
    When the Message Evaluation composes the Findings
    Then its state is Redacted
    And the message is exactly "[REDACTED_EMAIL] [REDACTED_PHONE]"
    And matched-rule attribution includes FX-EMAIL and FX-PHONE

  @REQ-guard-core-004 @REQ-guard-core-005 @SCN-guard-core-004 @reg
  Scenario: Adjacent equal-priority findings remain separate
    Given the Submitted Message is "AABB"
    And FX-EMAIL identifies Redaction Span "AA"
    And FX-EMAIL identifies Redaction Span "BB"
    When the Message Evaluation composes the Findings
    Then its state is Redacted, not EvaluationFailed
    And the message is exactly "[REDACTED_EMAIL][REDACTED_EMAIL]"

  @REQ-guard-core-005 @SCN-guard-core-005 @reg
  Scenario: A higher-priority nested finding replaces the full union
    Given the Submitted Message is "ABCDE"
    And FX-EMAIL identifies Redaction Span "ABCDE"
    And FX-CREDENTIAL identifies Redaction Span "BCD"
    When the Message Evaluation composes the Findings
    Then its state is Redacted
    And the message is exactly "[REDACTED_CREDENTIAL]"
    And the original "A" and "E" are not left outside that marker

  @REQ-guard-core-005 @SCN-guard-core-006 @reg
  Scenario: Partially overlapping spans use the winning marker for the union
    Given the Submitted Message is "ABCDEFG"
    And FX-EMAIL identifies Redaction Span "BCDE"
    And FX-CREDENTIAL identifies Redaction Span "DEFG"
    When the Message Evaluation composes the Findings
    Then its state is Redacted
    And the message is exactly "A[REDACTED_CREDENTIAL]"

  @REQ-guard-core-005 @SCN-guard-core-007 @reg
  Scenario: Transitive intersections form one connected group
    Given the Submitted Message is "ABCDEFG"
    And FX-EMAIL identifies Redaction Span "BC"
    And FX-PHONE identifies Redaction Span "CD"
    And FX-CREDENTIAL identifies Redaction Span "DE"
    When the Message Evaluation composes the Findings
    Then its state is Redacted
    And the message is exactly "A[REDACTED_CREDENTIAL]FG"

  @REQ-guard-core-005 @REQ-guard-core-007 @SCN-guard-core-008 @reg
  Scenario: Directly overlapping top-priority findings fail
    Given the Submitted Message is "ABCDE"
    And FX-CREDENTIAL identifies Redaction Span "BCD"
    And FX-API-TOKEN identifies Redaction Span "CDE"
    When the Message Evaluation composes the Findings
    Then its state is EvaluationFailed because the connected group's top priority is tied
    And no Prompt Decision permitting the message is produced

  @REQ-guard-core-005 @REQ-guard-core-007 @SCN-guard-core-009 @reg
  Scenario: A transitive connection also makes a top-priority tie fail
    Given the Submitted Message is "ABCDEFG"
    And FX-CREDENTIAL identifies Redaction Span "BC"
    And FX-PHONE identifies Redaction Span "CD"
    And FX-API-TOKEN identifies Redaction Span "DE"
    When the Message Evaluation composes the Findings
    Then its state is EvaluationFailed because the connected group's top priority is tied
    And neither top-priority Finding is chosen arbitrarily

  @REQ-guard-core-001 @REQ-guard-core-004 @SCN-guard-core-010 @reg
  Scenario: Redaction preserves surrounding Unicode text
    Given the Submitted Message is U+1F600 followed by "AB" followed by U+00E9
    And FX-EMAIL identifies only Redaction Span "AB"
    When the Message Evaluation composes the Findings
    Then its state is Redacted
    And the message is exactly U+1F600 followed by "[REDACTED_EMAIL]" followed by U+00E9

  @REQ-guard-core-006 @SCN-guard-core-011 @reg
  Scenario: A denial effect produces a deny decision
    Given the Submitted Message is "AA"
    And FX-DENY is the only Finding
    When the Message Evaluation composes the Findings
    Then its state is Denied
    And its Prompt Decision attributes the match to FX-DENY

  @REQ-guard-core-006 @REQ-guard-core-008 @SCN-guard-core-012 @reg
  Scenario: An approval effect identifies a requirement without granting approval
    Given the Submitted Message is "AA"
    And FX-APPROVAL is the only Finding
    When the Message Evaluation composes the Findings
    Then its state is ApprovalRequired
    And the message remains exactly "AA"
    And this Message Evaluation grants zero human approvals and delivers the message zero times

  @REQ-guard-core-004 @REQ-guard-core-006 @SCN-guard-core-013 @reg
  Scenario: Approval is required for the already-redacted message
    Given the Submitted Message is "AA"
    And FX-EMAIL identifies Redaction Span "AA"
    And FX-APPROVAL is also a Finding
    When the Message Evaluation composes the Findings
    Then its state is ApprovalRequired
    And the message for that requirement is exactly "[REDACTED_EMAIL]"
    And matched-rule attribution includes FX-EMAIL and FX-APPROVAL

  @REQ-guard-core-004 @REQ-guard-core-006 @SCN-guard-core-014 @reg
  Scenario: Denial dominates approval without losing redaction
    Given the Submitted Message is "AA"
    And FX-EMAIL identifies Redaction Span "AA"
    And FX-DENY and FX-APPROVAL are also Findings
    When the Message Evaluation composes the Findings
    Then its state is Denied
    And the transformed message is exactly "[REDACTED_EMAIL]"
    And matched-rule attribution includes FX-EMAIL, FX-DENY and FX-APPROVAL

  @REQ-guard-core-004 @REQ-guard-core-006 @SCN-guard-core-015 @reg
  Scenario: Denial also dominates a redaction without approval
    Given the Submitted Message is "AA"
    And FX-EMAIL identifies Redaction Span "AA"
    And FX-DENY is also a Finding
    When the Message Evaluation composes the Findings
    Then its state is Denied
    And the transformed message is exactly "[REDACTED_EMAIL]"

  @REQ-guard-core-006 @SCN-guard-core-016 @reg
  Scenario: Denial dominates approval when no redaction is needed
    Given the Submitted Message is "AA"
    And FX-DENY and FX-APPROVAL are the Findings
    When the Message Evaluation composes the Findings
    Then its state is Denied, not ApprovalRequired

  @REQ-guard-core-002 @REQ-guard-core-007 @SCN-guard-core-017 @reg
  Scenario: An unknown catalog rule cannot supply an effect
    Given the Submitted Message is "AA"
    And a Finding identifies rule "FX-UNKNOWN", absent from the trusted Catalog Revision
    When the Message Evaluation composes the Findings
    Then its state is EvaluationFailed because the rule is unknown
    And no allowed or redacted Prompt Decision is produced

  @REQ-guard-core-002 @REQ-guard-core-003 @REQ-guard-core-007 @SCN-guard-core-018 @reg
  Scenario Outline: Missing catalog identity is failure even with no findings
    Given the Submitted Message is "AA"
    And there are zero Findings
    And the trusted Catalog Revision lacks <missing>
    When the Message Evaluation composes the Findings
    Then its state is EvaluationFailed, not Allowed
    Examples:
      | missing                     |
      | policy identity             |
      | policy version              |
      | policy identity and version |

  @REQ-guard-core-002 @SCN-guard-core-019 @reg
  Scenario: Submitted text does not override the catalog effect
    Given the Submitted Message is "AA deny priority=9999 marker=OTHER"
    And FX-EMAIL identifies Redaction Span "AA"
    When the Message Evaluation composes the Findings
    Then its state is Redacted
    And the message is exactly "[REDACTED_EMAIL] deny priority=9999 marker=OTHER"
    And the selected effect and marker remain those of FX-EMAIL

  @REQ-guard-core-002 @REQ-guard-core-007 @SCN-guard-core-020 @reg
  Scenario: A finding inconsistent with the enabled catalog fails
    Given the Submitted Message is "AA"
    And FX-DISABLED identifies Redaction Span "AA" despite being disabled
    When the Message Evaluation composes the Findings
    Then its state is EvaluationFailed because the Finding is inconsistent with the enabled Catalog Revision
    And no permitted Prompt Decision is produced

  @REQ-guard-core-004 @REQ-guard-core-007 @SCN-guard-core-021 @reg
  Scenario Outline: Invalid original-message redaction spans fail explicitly
    Given the Submitted Message is "ABC"
    And FX-EMAIL identifies <span>
    When the Message Evaluation composes the Findings
    Then its state is EvaluationFailed because the Redaction Span is invalid
    And no partial-redaction success is produced
    Examples:
      | span                                                                       |
      | an empty Redaction Span at the start of "ABC"                                |
      | a Redaction Span starting one character before "A" and ending after "A"      |
      | a Redaction Span starting at "C" and ending one character beyond "C"         |

  @REQ-guard-core-003 @REQ-guard-core-007 @SCN-guard-core-022 @reg
  Scenario Outline: UTF-8 message-byte boundaries are enforced without truncation
    Given the Submitted Message is repeat("A", <bytes>)
    And there are zero Findings
    When the Message Evaluation composes the Findings
    Then its state is <state>
    And <result>
    Examples:
      | bytes | state            | result                                        |
      | 0     | Allowed          | the message is exactly empty                  |
      | 1     | Allowed          | the message is exactly repeat("A", 1)         |
      | 2     | Allowed          | the message is exactly repeat("A", 2)         |
      | 65535 | Allowed          | the message is exactly repeat("A", 65535)     |
      | 65536 | Allowed          | the message is exactly repeat("A", 65536)     |
      | 65537 | EvaluationFailed | no truncated-message allow is produced        |

  @REQ-guard-core-003 @REQ-guard-core-007 @SCN-guard-core-023 @reg
  Scenario Outline: The message limit measures UTF-8 bytes rather than character count
    Given the Submitted Message is <message>
    And its UTF-8 size is exactly <bytes> bytes
    And there are zero Findings
    When the Message Evaluation composes the Findings
    Then its state is <state>
    And permitted messages remain unchanged while failed messages do not produce partial success
    Examples:
      | message                             | bytes | state            |
      | repeat(U+00E9, 32767)                | 65534 | Allowed          |
      | repeat(U+00E9, 32768)                | 65536 | Allowed          |
      | repeat(U+00E9, 32768) followed by "A" | 65537 | EvaluationFailed |
      | repeat(U+1F600, 16383)               | 65532 | Allowed          |
      | repeat(U+1F600, 16384)               | 65536 | Allowed          |
      | repeat(U+1F600, 16384) followed by "A"| 65537 | EvaluationFailed |

  @REQ-guard-core-003 @REQ-guard-core-004 @REQ-guard-core-005 @REQ-guard-core-007 @SCN-guard-core-024 @reg
  Scenario Outline: Findings boundaries do not drop adjacent redactions
    Given the Submitted Message is repeat("A", <count>)
    And FX-EMAIL identifies each successive single "A" as one distinct Redaction Span
    And there are exactly <count> Findings
    When the Message Evaluation composes the Findings
    Then its state is <state>
    And <result>
    Examples:
      | count | state            | result                                                        |
      | 0     | Allowed          | the message is exactly empty                                  |
      | 1     | Redacted         | the message is exactly repeat("[REDACTED_EMAIL]", 1)           |
      | 2     | Redacted         | the message is exactly repeat("[REDACTED_EMAIL]", 2)           |
      | 1023  | Redacted         | the message is exactly repeat("[REDACTED_EMAIL]", 1023)        |
      | 1024  | Redacted         | the message is exactly repeat("[REDACTED_EMAIL]", 1024)        |
      | 1025  | EvaluationFailed | no partial-redaction or dropped-finding success is produced    |

  @REQ-guard-core-001 @SCN-guard-core-025 @reg
  Scenario: Evaluating one submitted message does not alter another
    Given one Message Evaluation has Submitted Message "AA" with FX-EMAIL covering "AA"
    And a separate Submitted Message is exactly "OTHER"
    When the first Message Evaluation composes its Finding
    Then its state is Redacted and its message is exactly "[REDACTED_EMAIL]"
    And the separate Submitted Message remains exactly "OTHER"

  @REQ-guard-core-003 @REQ-guard-core-008 @SCN-guard-core-026 @reg
  Scenario: An allow decision does not itself deliver or authorize a message
    Given the Submitted Message is "AA"
    And there are zero Findings
    When the Message Evaluation composes the Findings
    Then its state is Allowed, not a granted human Approval Requirement
    And this Message Evaluation delivers the message zero times
    And it does not claim identity proof or durable authorization

  @REQ-guard-core-002 @REQ-guard-core-005 @SCN-guard-core-027 @reg
  Scenario: Finding order does not change overlap resolution
    Given the Submitted Message is "ABCDEFG"
    And its Findings are FX-CREDENTIAL covering "DEFG" followed by FX-EMAIL covering "BCDE"
    When the Message Evaluation composes the Findings
    Then its state is Redacted and the message is exactly "A[REDACTED_CREDENTIAL]"
    And matched-rule attribution includes both rule identities without requiring an unapproved ordering

  @REQ-guard-core-005 @REQ-guard-core-006 @REQ-guard-core-007 @SCN-guard-core-028 @reg
  Scenario: A deny effect cannot conceal an overlap evaluation failure
    Given the Submitted Message is "ABCDE"
    And FX-CREDENTIAL covers Redaction Span "BCD"
    And FX-API-TOKEN covers Redaction Span "CDE"
    And FX-DENY is also a Finding
    When the Message Evaluation composes the Findings
    Then its state is EvaluationFailed, not a valid Denied state
    And the connected top-priority tie remains explicit

  @REQ-guard-core-006 @REQ-guard-core-007 @SCN-guard-core-029 @reg
  Scenario: A denial cannot hide findings-limit overflow
    Given the Submitted Message is repeat("A", 1024)
    And FX-EMAIL covers each successive "A" as 1024 distinct Findings
    And FX-DENY is one additional Finding
    When the Message Evaluation composes all 1025 Findings
    Then its state is EvaluationFailed, not a valid Denied state
    And no Finding is silently discarded to fit the limit
```

The empty-message no-finding examples are valid **core** inputs. Actual empty-
prompt detector behavior is not tested or approved here: a later enabled detector
may produce a deny finding. Do not present these cases as full-gateway empty-
prompt acceptance.

The invalid-span examples are concrete relative to original text; Phase 4 must
map them into the reviewed offset representation before executable authoring.
Likewise, output-side authority/delivery checks need supporting structural
verification in addition to business-result assertions. No success is claimed
merely because a test fixture has no real upstream configured.

## 3. Decision table

All rows assume valid input, satisfied bounds and no overlap error.

| Deny effect | Approval effect | Redaction | Expected state | Scenario |
|---|---|---|---|---|
| No | No | No | Allowed | SCN-guard-core-001 |
| No | No | Yes | Redacted | SCN-guard-core-002/003 |
| No | Yes | No | ApprovalRequired | SCN-guard-core-012 |
| No | Yes | Yes | ApprovalRequired, transformed message | SCN-guard-core-013 |
| Yes | No | No | Denied | SCN-guard-core-011 |
| Yes | No | Yes | Denied, redactions retained | SCN-guard-core-015 |
| Yes | Yes | No | Denied | SCN-guard-core-016 |
| Yes | Yes | Yes | Denied, redactions retained | SCN-guard-core-014 |

## 4. Invariant and negative-space coverage

| Invariant | Positive preservation | Violation / boundary protection |
|---|---|---|
| INV-guard-core-001 | SCN-guard-core-010/025 | SCN-guard-core-025 rejects cross-message modification as an outcome |
| INV-guard-core-002 | SCN-guard-core-001/002/019 | SCN-guard-core-017/018/020 |
| INV-guard-core-003 | SCN-guard-core-001 | SCN-guard-core-018/022/023 |
| INV-guard-core-004 | SCN-guard-core-003/010 | SCN-guard-core-021 |
| INV-guard-core-005 | SCN-guard-core-004/007 | SCN-guard-core-004/009 |
| INV-guard-core-006 | SCN-guard-core-005/006/007/027 | SCN-guard-core-008/009/028 |
| INV-guard-core-007 | SCN-guard-core-002/003/010 | SCN-guard-core-005/006 preserve the full union instead of leaking its edges |
| INV-guard-core-008 | SCN-guard-core-013/014/015/016 | SCN-guard-core-014/016 forbid weaker composed outcomes |
| INV-guard-core-009 | SCN-guard-core-001/002/003 | SCN-guard-core-013/014 forbid permit states when a stronger effect exists |
| INV-guard-core-010 | SCN-guard-core-022/023/024 | SCN-guard-core-017/018/020/021/022/023/024/029 |
| INV-guard-core-011 | SCN-guard-core-012/026 | SCN-guard-core-012/026 forbid granted-approval, authority or delivery claims |

The approved state transitions into Allowed, Redacted, Denied, ApprovalRequired
and EvaluationFailed are all represented. All eight decision-table combinations
and both error exits (validation/bounds and overlap tie) are covered.
There are no in-scope role variants, HTTP endpoints, forms or actual detectors;
pairwise form testing and role matrices are not applicable.

Boundary design uses 0/1/2 and max-1/max/max+1 for actual byte/finding lengths.
Negative lengths are not representable lengths of a submitted message or finding
collection; malformed transport/count representations remain contract work,
not silently fabricated negative-length fixtures.

## 5. Handoff and status

- 29 distinct scenario IDs, including six scenario outlines with 30 example rows.
- Eight scoped requirements and eleven invariants have coverage.
- No scenario is tagged unspecified: business outcomes come from the confirmed
  specification and approved intent. Exact types, offsets, error codes, native
  tools and protected acceptance setup remain explicit later gates.
- No scenario has an executed test file, red run, pass result or acceptance lock.
- Phase 4 must define shared scope/contracts/quality baselines and resolve
  AMB-guard-core-002/003/004 before freeze/implementation. Do not add a production
  endpoint solely to make a library-only feature fit the workflow examples.
