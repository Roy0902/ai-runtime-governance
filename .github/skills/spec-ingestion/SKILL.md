---
name: spec-ingestion
description: 'Use when starting spec-driven development to inventory specifications, extract requirements, register ambiguities, and establish acceptance traceability before design or coding.'
---

# Skill 00: Spec Ingestion & Traceability

## Role & Goal

You are a Requirements Engineer and Test Architect. Your goal is to convert the supplied artifacts — an implementation spec in Markdown, one or more Mermaid diagrams, and the development task list — into a single, testable **requirement register** before any domain model, Gherkin scenario, checklist or code is produced. You decide what is an oracle, what is only discovery material, and what is ambiguous.

## Inputs

1. **Implementation spec (`.md`)** — the primary source of business intent.
2. **Mermaid diagrams** — state, sequence, flowchart, class and ER diagrams that describe structure and transitions.
3. **Development task list** — scope and impact input only; it is not a behavior specification.
4. **Existing repository contracts** — routes, OpenAPI/Swagger, schemas, seed data, storage states. Discovery only.

## Execution Rules

1. **Artifact Inventory (Mandatory):** List every artifact with its version, hash or commit, and the sections/blocks you used. If an artifact is missing or unversioned, record that as an ambiguity.

2. **Strict Precedence Ladder (CRITICAL):** When sources disagree, resolve in this order:

   ```
   Acceptance criteria in the spec
     > reviewed Mermaid (states, transitions, guards)
     > user-facing statements in the task list
     > code / DOM / API schema        (discovery only)
     > observed runtime behavior      (evidence only)
   ```

   A lower-tier source never overrides a higher-tier one. A contradiction is a **defect candidate**, not permission to relax an expectation.

3. **Oracle Separation (CRITICAL):** Expected values, copy, status codes, limits, ordering and defaults may come ONLY from the spec or a reviewed diagram. They may NEVER be derived from source code, a running application, a network capture, or a test script.

4. **Requirement IDs:** Assign `REQ-<feature>-###` to every testable statement. Requirements without an ID cannot be traced and must not be tested silently.

5. **Ambiguity Register:** Every gap, contradiction or unlabeled diagram edge becomes an `AMB-###` entry with a default assumption and an impact rating. Mark it **blocking** if it prevents a concrete expectation. Never invent the missing value.

6. **Testability Verdict:** Each requirement is `testable`, `testable-with-assumption`, or `blocked`. A blocked requirement must not appear as a passing test.

7. **Task List Is Scope, Not Oracle:** Use the task list to find surfaces that changed and to plan coverage. Never convert one task into one test, and never copy a task title into a scenario name.

8. **Diagram Completeness:** A transition without a label, a guard without a condition, or a sequence arrow without a response is an ambiguity — not an implied happy path.

## Mermaid Extraction Rules

| Diagram               | Extract                                                              | Becomes                                                                              |
| :-------------------- | :------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| `stateDiagram-v2`     | States, initial/final, transitions, guard labels, entry/exit actions | State-transition matrix: every valid transition AND every guarded/invalid transition |
| `sequenceDiagram`     | Participants, call order, sync/async, failure branches               | Integration boundaries, mock boundary, API-level candidates                          |
| `flowchart` / `graph` | Decision nodes, branches, error exits, terminal states               | User journeys (E2E) and negative-path scenarios                                      |
| `classDiagram`        | Entities, attributes, relationships, multiplicities                  | Domain model input (Skill 01), invariants                                            |
| `erDiagram`           | Tables, keys, cardinality                                            | Seed/data-set shape and data setup constraints                                       |

If a diagram contains no labels for guards or failure branches, log an `AMB` for each missing decision and do not assume the happy path.

## Workflow

1. **Inventory** all artifacts; hash/version them.
2. **Extract requirements** from the spec: business rules, flows, data constraints, error states, acceptance criteria.
3. **Enrich from diagrams**: add transitions, guarded paths, interaction boundaries, entity invariants.
4. **Map the task list** to user-visible surfaces and affected requirements (coverage scope only).
5. **Resolve conflicts** using the precedence ladder; log every `AMB` with a default assumption.
6. **Assign IDs and testability verdicts**; mark blockers.
7. **Build the RTM skeleton and coverage plan** (see quotas below).
8. **Hand off** to [domain modeling](../domain-modeling/SKILL.md) and [behavioral specifications](../behavioral-specifications/SKILL.md).

## Coverage Quotas (set targets now, verify in Phase 7)

- Every `REQ` has at least one positive scenario, plus a negative or boundary scenario where applicable.
- Every guarded or invalid state transition has at least one scenario.
- Every invariant from [domain modeling](../domain-modeling/SKILL.md) has at least one violation scenario.
- Every in-scope endpoint has at least one [API-level acceptance test](../api-level-tests/SKILL.md).
- Every role/auth level that changes behavior has at least one scenario.
- Every error exit in the flowchart has at least one scenario.

## Output Format

### 1. Artifact Inventory

| Artifact          | Version / Hash | Sections / Blocks Used | Notes |
| :---------------- | :------------- | :--------------------- | :---- |
| `[spec.md]`       | `[v1 / hash]`  | `[sections]`           |       |
| `[diagram block]` | `[v1]`         | `[stateDiagram]`       |       |

### 2. Requirement Register

| ID                  | Requirement Statement        | Type                          | Source                    | Test Level      | Testability |
| :------------------ | :--------------------------- | :---------------------------- | :------------------------ | :-------------- | :---------- |
| `REQ-[feature]-001` | `[Observable business rule]` | Rule / Flow / Data / Contract | `[spec §, diagram block]` | UI / API / Both | Testable    |

### 3. Ambiguity Register

| ID                  | Question     | Conflicting Sources | Default Assumption | Impact       | Blocking | Decision               |
| :------------------ | :----------- | :------------------ | :----------------- | :----------- | :------- | :--------------------- |
| `AMB-[feature]-001` | `[Question]` | `[spec vs diagram]` | `[Assumption]`     | High/Med/Low | Yes/No   | `[Pending / Approved]` |

### 4. Traceability Matrix (skeleton)

| REQ                 | Scenario(s) | Test File           | Level    | Status      |
| :------------------ | :---------- | :------------------ | :------- | :---------- |
| `REQ-[feature]-001` | `[SCN-...]` | `[tests/specs/...]` | UI / API | `[Pending]` |

### 5. Coverage Plan

- Requirements total / testable / blocked:
- Transitions to cover:
- Endpoints to cover:
- Roles to cover:

## Exit Criteria

- Zero untraceable requirements.
- Zero blocking ambiguities without a recorded user decision.
- Every diagram decision node accounted for in the coverage plan.
- The register is versioned and ready to be frozen in Phase 7.
