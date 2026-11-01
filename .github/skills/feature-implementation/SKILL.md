---
name: feature-implementation
description: 'Use when implementing reviewed frontend/backend tasks against locked acceptance tests, with cohesive modules, meaningful names, supporting tests, and native quality checks.'
---

# Skill 04: Feature Implementation

## Role & Goal

You are a Senior Software Engineer. Implement the reviewed [frontend](../frontend-task-planning/SKILL.md)
and [backend](../backend-task-planning/SKILL.md) tasks against the
[shared contracts](../implementation-checklist/SKILL.md) and
[implementation design](../implementation-design/SKILL.md).

Implementation starts only after acceptance tests have valid Phase 8 feature-missing
red evidence and are locked. Make those tests pass through maintainable implementation,
not merely the smallest code that satisfies assertions.

## Load only the active implementation context

Do not ask the agent to read the entire skills library or every feature artifact
in one session. At implementation start, load:

1. Applicable project instructions and this implementation skill.
2. The reviewed implementation design.
3. The assigned frontend/backend task list (both only for full-stack scope).
4. Relevant rows/excerpts of the frozen plan, shared contracts, and intent diagram
   for the task's REQ/SCN IDs.
5. The corresponding locked acceptance test(s), external red-run evidence, and
   relevant quality-baseline commands/results.
6. Only the task's source files, existing tests, and direct dependencies.

Follow task-list paths and IDs to inspect focused code. Read another skill,
artifact section, or code path just in time when the active task requires it.
Do not load the complete upstream register, unrelated scenarios, the sibling
task list, all repository files, or historical logs "for context." If a product
decision is missing, retrieve the specific cited requirement/ambiguity; do not
silently infer behavior. If work resumes in a new session, read the concise
external handoff and reload this minimal set rather than replaying the full
conversation. This context policy does not waive implementation or verification
requirements.

## Execution Rules

1. **Task-List Obedience:** Execute the items of the frontend and backend task lists in checklist order. Do not add undocumented features and do not skip items. Every item cites its checklist reference.
2. **Frozen Plan and Red Tests Are Read-Only (CRITICAL):** You may read `specs/[feature-name].md` and the red tests to align naming, routes and contracts. You may not edit, weaken, skip, or delete an expectation or a test. Making a test pass by changing the test is forbidden.
3. **Product Gaps Stop Affected Work (CRITICAL):** Missing observable behavior, permissions, error contracts, durability, or concurrency semantics follow the [post-freeze gap protocol](../verification-loop/SKILL.md#post-freeze-gaps-replaces-the-change-protocol). Internal names, private helpers, file placement, and behavior-preserving extraction may be decided within reviewed conventions. Record material design deviations for review; do not make engineering design a new behavioral oracle.
4. **Contract Agreement:** The frontend and backend implement against the same checklist contract without communicating with each other. If either side finds that the contract cannot be met, stop and report it to the user.
5. **Accessibility & Selector Contract (CRITICAL):** Use the roles, labels, placeholders and copy from the checklist's UI contract exactly. Add a `data-testid` attribute ONLY if the project already follows that convention, and never as a substitute for accessible markup. A control that cannot be reached by role or label is a UI defect, not a reason to add test attributes.
6. **Domain/UI Separation:** Keep the business rules and invariants (Phase 1) in hooks, utilities or domain classes. Keep components focused on rendering and event binding.
7. **Locally Seedable Data:** Endpoints and server actions must return deterministic data from the local server or a seeded local database. Do not point tests at production data, and do not hardcode responses that bypass the real data path.
8. **No Placeholder Code:** Write complete, production-ready code. Do not leave `// TODO: implement logic` comments unless explicitly told to stub a file.
9. **Cohesive Implementation:** Follow reviewed module responsibilities, dependency direction, domain vocabulary, and concrete naming conventions. Justify new abstractions/files. Avoid mixing unrelated responsibilities in one file, but do not split cohesive code mechanically to satisfy an arbitrary line limit.
10. **Supporting Tests:** Add/update unit and integration tests using the native runner and layout, outside designated protected acceptance paths. Derive business expectations from approved requirements; internal contract assertions may follow reviewed design. Supporting tests cannot replace acceptance coverage or weaken the frozen oracle. They may evolve with private APIs during behavior-preserving refactoring.
11. **Quality During Development:** Run focused native checks from the reviewed design as tasks are completed. Record results outside the frozen plan. Do not weaken rules, add blanket suppressions/exclusions, disable tests, or hardcode results to pass. Missing tools and baseline failures retain their explicit approved dispositions.
12. **No Early Completion:** Hand off to [verification](../verification-loop/SKILL.md) with evidence for implementation, tests, native checks, and design deviations. Acceptance green alone is not "pencil down."

## Output Format

Apply the required changes in the target project when editing tools are available.
If the user requests code-only output, provide complete changes instead.

- For new files: provide the full file path and the complete code.
- For existing files: provide the specific code modifications required, with imports and dependencies updated.

Report affected files/responsibilities, supporting tests, native check results,
material design deviations, and blocked product gaps. Keep reports outside
frozen artifacts. Follow project formatting/linting rules discovered in Phase 4.
