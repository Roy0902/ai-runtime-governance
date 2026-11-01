---
name: behavioral-specifications
description: 'Use when translating requirements and domain models into concrete acceptance scenarios, boundary cases, and state-transition coverage before freezing a test plan.'
---

# Skill 02: Behavioral Specifications (SDD)

## Role & Goal

You are a Quality Assurance Architect specializing in Specification-Driven Development (SDD). Translate the [domain model](../domain-modeling/SKILL.md) and [ingested requirements](../spec-ingestion/SKILL.md) into testable business behaviors with **concrete expected outcomes**. These scenarios become the oracle frozen in Phase 7.

## Execution Rules

1. **Vocabulary Lock (CRITICAL):** You may ONLY use nouns and verbs explicitly defined in the Domain Model's Ubiquitous Language.

2. **Requirement Traceability (CRITICAL):** Every scenario carries an `SCN-<feature>-###` ID and cites the `REQ-<feature>-###` it verifies. A scenario with no requirement is either a missing requirement (return to Skill 00) or an invented test.

3. **Zero UI Automation:** Do not write steps about _how_ a user manipulates a screen.
   - **WRONG:** `When the user clicks the "Submit Payment" button`
   - **RIGHT:** `When the Customer submits the Payment`

4. **Concrete Oracle (CRITICAL):** Every `Then` must state an observable, checkable outcome: exact copy, a value, a state, a status, a count, an ordering, or a URL. "Works correctly", "is displayed properly" and "handles the error" are forbidden.
   - **WRONG:** `Then the order is created successfully`
   - **RIGHT:** `Then the Order is in the Confirmed state and the total is 90.00 USD`

5. **Unspecified Means Blocked:** If the spec and reviewed diagrams do not define an expected value, tag the scenario `@unspecified` and record an `AMB` entry. An `@unspecified` scenario is **blocked**, never counted as passing.

6. **Scenario Independence:** Each scenario tests one business rule or invariant. `Given` states must be self-contained and reproducible.

7. **Design the Negative Space:** Happy paths alone are not coverage. Apply the techniques below.

## Test-Design Techniques (mandatory, applied per requirement)

| Technique                | Use it for                                        | Output                                                    |
| :----------------------- | :------------------------------------------------ | :-------------------------------------------------------- |
| Equivalence partitioning | Input domains (valid/invalid classes)             | One scenario per class                                    |
| Boundary values          | Numeric/text/date limits                          | `min-1, min, min+1, max-1, max, max+1`                    |
| Decision tables          | Multiple conditions combining into an outcome     | One scenario per distinct rule column                     |
| State transition         | States and guards from the Mermaid `stateDiagram` | Every valid transition + every guarded/invalid transition |
| Pairwise / combinatorial | Independent multi-field forms                     | Minimal set covering all pairs                            |
| Error guessing (limited) | Known historical failure modes                    | Only when traced to a `REQ` or `AMB`                      |

Do not enumerate every combination exhaustively; use the technique that proves the rule.

## Coverage Quotas

- Every `REQ` in scope: at least one positive scenario, plus a negative/boundary scenario where the requirement allows invalid input.
- Every guarded or invalid state transition: at least one scenario asserting the state does **not** change and the correct error is surfaced.
- Every invariant from the domain model: at least one violation scenario.
- Every error exit in the source flowchart: at least one scenario.
- Every role that changes behavior: at least one scenario per role.

## Output Format

```gherkin
Feature: [Name of the Feature/Aggregate]
  As a [Role]
  I want to [Perform Action]
  So that [Business Value]

  Background:
    Given [Any shared initial state across all scenarios]

  @REQ-[feature]-001 @SCN-[feature]-001 @smoke
  Scenario: [Happy Path - Successful State Transition]
    Given [Specific initial state, e.g., "an Active Cart with 1 Item"]
    When [Domain Action occurs, e.g., "the Customer applies a 10% Promo Code"]
    Then [Exact expected domain state, e.g., "the Cart Total is 90.00 USD"]
    And [Exact expected event or copy, e.g., "a PromoApplied event is recorded"]

  @REQ-[feature]-002 @SCN-[feature]-002 @reg
  Scenario: [Failure Mode - Invariant Protection]
    Given [Specific initial state]
    When [An invalid Domain Action is attempted]
    Then [The state remains unchanged: "Cart Total is 100.00 USD"]
    And [Exact business error: "Promo code has expired"]

  @REQ-[feature]-003 @SCN-[feature]-003 @reg
  Scenario Outline: [Boundary Behavior]
    Given a Cart with <quantity> items
    When the Customer checks out
    Then the result is "<outcome>"

    Examples:
      | quantity | outcome                     |
      | 0        | "Cart is empty"             |
      | 1        | "Checkout is available"     |
      | 100      | "Maximum quantity exceeded" |
```

## Handoff

- Pass the scenario list to Skill 03 (Phase 4) for scope mapping. Scenarios are reviewed against the frontend and backend task lists in Phases 5-6, then frozen in Phase 7.
- The scenario text (steps and expected values) is frozen there. Later skills may not rewrite an expectation to match observed behavior.
- Any scenario lacking a concrete `Then` must be resolved with the user before the freeze.
