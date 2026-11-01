---
name: frontend-task-planning
description: 'Use when deriving file-level frontend tasks from shared contracts and implementation design, including UI states, reuse, module ownership, and supporting tests.'
---

# Skill 03a: Frontend Task List

## Role & Goal

You are a Senior Frontend Engineer. Produce file-level tasks from the [shared checklist](../implementation-checklist/SKILL.md), shared [implementation design](../implementation-design/SKILL.md), and relevant frontend code. State what to change, which suitable patterns to reuse, and which cases the UI must handle.

You work alone. Do not coordinate with the backend agent. If the checklist's API contract cannot support a UI behavior, record it as a conflict for the user to resolve in Phase 6.

## Inputs

1. Shared checklist output, sections 1, 2, 3 (read only), 4 and 6.
2. [Scenarios](../behavioral-specifications/SKILL.md) for the frontend-surface rows.
3. Intent diagram (Phase 2), for states, transitions and guards.
4. The repository frontend code and existing frontend tests.
5. The shared implementation design, including reviewed/proposed structure, dependency boundaries, naming examples, supporting-test strategy, and native quality baselines.

## Execution Rules

1. **Study Before Listing (Mandatory):** Before writing any item, read the routes, components, hooks, state management, form handling, styling conventions and existing tests in the affected area. Cite the files you read.
2. **Stay in the Frontend Layer:** Do not define server-side logic, persistence, or response shapes. Consume the API contract matrix as written.
3. **Reuse Before Creating:** Name a suitable existing pattern or the shared design's justified greenfield proposal. Explain new files by responsibility, not arbitrary size limits. Do not reproduce an unsuitable existing pattern without review.
4. **Possible Cases (Mandatory):** For each behavior, list the cases the UI code path must handle: loading, empty, success, each error response in the contract, disabled and read-only states, double submit, navigation during pending requests, and any role that changes the view. Each case is either:
   - mapped to a `SCN-*` (or a new scenario, raised for Phase 6), or
   - raised as an `AMB-*` if the spec does not state the expected result.
     Never invent copy, values or messages to fill a case.
5. **Contract-Bound Locators:** Each element the code renders must match a row in the UI contract matrix (role, label, placeholder or copy). Do not add `data-testid` attributes unless the project already uses them.
6. **Domain / UI Separation:** Put business rules and validation in hooks, utilities or domain modules. Keep components for rendering and event binding.
7. **Checklist Traceability:** Every item cites the checklist item it implements. Every checklist frontend item has at least one task.
8. **Design and Quality Traceability:** Reference the shared design's module owner, allowed dependencies, representative names, and supporting tests for each task. Keep tests outside protected acceptance paths. Include exact native validation commands from the design, and surface conflicts for Phase 6 instead of silently inventing a second architecture.

## Output Format

### 1. Files Studied

| File     | Why it matters            |
| :------- | :------------------------ |
| `[path]` | `[pattern or constraint]` |

### 2. Task List

| ID       | Checklist Ref      | Action                | Target File | Existing / New | Pattern To Follow               | Change Detail                             | Scenario(s)         |
| :------- | :----------------- | :-------------------- | :---------- | :------------- | :------------------------------ | :---------------------------------------- | :------------------ |
| `FE-001` | `[checklist item]` | Add / Update / Verify | `[path]`    | existing       | `[file that shows the pattern]` | `[what changes, in implementation terms]` | `SCN-[feature]-001` |

### 3. Case Matrix

| Behavior     | Case                  | Handling in UI                  | Scenario / AMB                            | Status                       |
| :----------- | :-------------------- | :------------------------------ | :---------------------------------------- | :--------------------------- |
| `[behavior]` | `[e.g. 422 from API]` | `[what the UI shows and where]` | `SCN-[feature]-002` / `AMB-[feature]-003` | Mapped / Candidate / Blocked |

Cases marked **Candidate** are not tests. They become tests only after Phase 6 maps them to a scenario.

### 4. Conflicts for Phase 6

- `[shared contract or scope conflict, with the backend concern if known]`

### 5. Coverage Against Checklist

- Checklist frontend items covered: `[n/n]`
- Scenarios with a frontend task: `[n/n]`

### 6. Implementation Design and Validation

| Task | Design responsibility / dependency rule | Naming example | Supporting test / location | Native validation command |
|---|---|---|---|---|
| `FE-001` | `[design section and owner]` | `[concrete name]` | `[unit/integration test outside protected paths]` | `[command and working directory]` |
