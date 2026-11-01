---
name: spec-to-test-workflow
description: 'Use when turning a feature specification into reviewed design, frozen acceptance tests, implementation, and verified code quality. Orchestrates the full spec-to-test development workflow.'
---

# Spec-to-Verified-Feature Workflow

Run the phases in order. Do not skip, merge or reorder them. Explicitly read the linked skill before each phase; automatic discovery alone is not sufficient. Phases 2 and 12 are defined here. Keep generated registers, designs, tasks, and evidence in the target project's feature-artifact folder, not in this reusable skill.

## Context loading: progressive, not all-at-once

The orchestration skill is an index and phase controller, not an instruction to
load every skill, artifact, or code file into one conversation. At each phase,
load only its linked skill and the inputs it names. Do not preload all Phase 0-12
skills or carry full upstream documents forward just in case.

For **Phase 9 implementation**, begin a fresh or continuing coding session with
only:

1. Applicable target-project instructions and the implementation skill.
2. The reviewed implementation design.
3. The assigned frontend or backend task list. Load both only for a genuinely
   full-stack assignment.
4. Relevant excerpts/rows from the frozen plan, shared API/UI contracts, and
   intent diagram for the assigned task's REQ/SCN IDs.
5. The corresponding locked acceptance test(s), plus the external execution
   record's red evidence and relevant quality-baseline rows.
6. Only the source files, tests, and direct dependencies needed for that task.

Use the task list's paths and cited IDs to retrieve focused ranges rather than
opening every feature artifact or recursively loading the repository. Bring in
another phase skill, supporting skill, requirement section, or code path only
when the active task needs it. If needed, follow the exact source reference
instead of rereading an entire upstream register. Do not load unrelated
scenarios, sibling task lists, all historical logs, or complete test suites
unless the scope or a failure makes them relevant.

When work spans sessions, persist concise progress, touched paths, unresolved
questions, and check results in the external execution record. On resume,
reload the minimal Phase 9 set above and the relevant handoff—not the whole prior
conversation or every workflow document. Context efficiency never permits
skipping a required gate or omitting evidence.

## Hard Rules (every phase)

1. The frozen plan `specs/<feature>.md` is never edited after Phase 7. Gaps go to a follow-up plan.
2. Expected values come only from the spec and the approved intent diagram. Never from code, DOM, a live response, a capture, or an existing test.
3. Acceptance tests are written red (Phase 8) before implementation starts, then locked. Supporting unit/integration tests follow the separate policy in the verification skill.
4. Implementation never edits the plan or the locked tests.
5. `@unspecified` and blocking `AMB` scenarios are never green.
6. The intent diagram and the as-built diagram are separate files. The intent diagram is never overwritten.
7. Agents never stage or commit.
8. Reviewed implementation design and applicable native quality checks are required. Behavioral green alone is not completion.
9. Execution evidence and changing status live outside the frozen plan. Never edit the plan to record a run.

If a hard rule would be broken, stop and report it. Do not work around it.

## Phases

| Phase                  | Skill                    | Output                                                                 | Gate                                                                               |
| :--------------------- | :----------------------- | :--------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| 0 Spec ingestion       | [Spec ingestion](../spec-ingestion/SKILL.md) | `REQ`, `AMB`, coverage plan | No untraceable `REQ`; blocking `AMB` raised |
| 1 Domain model         | [Domain modeling](../domain-modeling/SKILL.md) | Domain model | Presented; no blocking domain `AMB` |
| 2 Intent diagrams      | inline                   | Versioned intent diagram file                                          | User approves; version recorded                                                    |
| 3 Scenarios            | [Behavioral specifications](../behavioral-specifications/SKILL.md) | `SCN` list with concrete `Then` | No open `@unspecified` |
| 4 Shared checklist     | [Implementation checklist](../implementation-checklist/SKILL.md) | Contracts, scope, conventions, native-tool baselines | Presented; setup gaps explicit |
| 5 Design and task lists | [Implementation design](../implementation-design/SKILL.md), then [frontend](../frontend-task-planning/SKILL.md) and [backend](../backend-task-planning/SKILL.md) planning | One shared design, independently prepared task lists | File ownership, dependencies, naming, supporting tests, quality commands ready for review |
| 6 Review               | user | Reviewed design, tasks, scope, and `SCN`/`AMB` decisions | No blocking `AMB`; quality setup and baseline dispositions explicit |
| 7 Freeze               | [Test-plan template](../../../.ai/templates/test-plan.md) | Frozen plan referencing design and external evidence location | `npm run ai:freeze -- <feature>` succeeds |
| 8 Red acceptance tests | [Playwright](../playwright-authoring/SKILL.md), [API](../api-level-tests/SKILL.md), [network support](../dynamic-api-response/SKILL.md) | Feature-missing red results in external evidence | Every acceptance test red for the right reason; `npm run ai:lock-tests -- <feature>` succeeds |
| 9 Implementation       | [Feature implementation](../feature-implementation/SKILL.md) | Cohesive code and supporting tests for reviewed tasks | Complete; focused checks run; product gaps stop affected work |
| 10 Verification        | [Verification loop](../verification-loop/SKILL.md) | Acceptance integrity, tests, native checks, maintainability review | Required gates satisfied with truthful baseline reporting, or halt |
| 11 Accessibility check | [Verification loop](../verification-loop/SKILL.md#accessibility-check-phase-11) | Contract locators checked against running build | Per-requirement results recorded; no unresolved accessibility defect |
| 12 As-built diagrams   | inline                   | As-built diagram in a separate file                                    | Compared with the intent diagram; differences reported, nothing overwritten        |

### Phase 2 (inline)

Draft the Mermaid diagrams that apply (state, sequence, flowchart, class, ER) from the spec and domain model. Label every guard, failure branch and transition. An unlabeled decision becomes an `AMB`.

### Phase 12 (inline)

After verification, regenerate the diagrams from the code into a separate as-built file. List each difference from the intent diagram as spec drift (follow-up plan) or product defect.

Completion requires all applicable phases through Phase 12. Do not declare the feature done at the first green test run. Approved baseline exceptions are reported as exceptions, not clean passes.

## Engineering decisions and quality tools

Phase 5 produces one shared implementation design before frontend/backend planning. Internal file placement, private names, and behavior-preserving extraction may evolve within reviewed conventions; record material deviations for review. A decision affecting observable behavior, permissions, error contracts, durability, or concurrency is not merely an engineering detail. Resolve it through the spec/ambiguity process.

Use the target project's existing toolchain for formatting, lint/static analysis, build/type checks, and supporting tests. Missing tools require an approved setup decision; genuinely inapplicable checks require a reason. Capture baseline failures before edits, require no introduced violations, and obtain an explicit disposition for unresolved baseline failures. Never weaken configuration or suppress failures to obtain green.

## Post-Freeze Gaps

When implementation reveals a missing or wrong expectation after Phase 7:

1. Stop the affected item.
2. Record the scenario ID, the observed behavior, and the open question outside the frozen plan.
3. Create a follow-up plan for a later iteration with its own review and freeze.
4. Report the scenario as blocked in this iteration. Do not edit the plan, the tests, or any baseline.

## Enforcement

`scripts/ai/freeze-guard.mjs` (run through npm) checks the mechanical rules:

| Command                              | When                   | Checks                                                                                                                                      |
| :----------------------------------- | :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run ai:freeze -- <feature>`     | Phase 7                | Plan has `SCN`s, no `@unspecified`, no blocking `AMB`. Writes `specs/<feature>.freeze.json` with the plan's checksum. Refuses to overwrite. |
| `npm run ai:lock-tests -- <feature>` | Phase 8, after red     | Every `SCN` has a tagged test, and no test tags an unknown `SCN`. Records checksums of the test files.                                      |
| `npm run ai:verify`                  | Pre-commit hook and CI | Plan unchanged, selected locked acceptance files/baselines unchanged, no newly selected protected files, acceptance tag coverage. |

A failed check means stop and report. Do not edit the guard, the manifest, or the checksums to make it pass.

The guard does not run tests, validate red evidence, enforce design quality, or inspect every shared helper/configuration file. Those require execution and review. Keep supporting tests outside the protected paths; they cannot replace acceptance coverage. Wire the guard and each required native check into the target project's existing CI/pre-commit setup through its normal reviewed configuration process.

## Resources and adoption

- [Implementation-design template](../../../.ai/templates/implementation-design.md)
- [Project-conventions template](../../../.ai/templates/project-conventions.md)
- [Execution-evidence template](../../../.ai/templates/execution-evidence.md)
- [Red-authoring prompt](../../../.ai/templates/playwright-prompt.md)
- [Verification prompt](../../../.ai/templates/verification-prompt.md)

Copy `.github/skills`, `.ai/templates`, and `scripts/ai` when adopting. Include `.ai/skills` and `.ai/workflows` when legacy entry points are needed. For hosts without native discovery, explicitly open this skill. Keep Playwright, the project's helper library, and browser tooling prerequisites explicit; native quality-tool discovery does not replace acceptance-runner setup.

## Trigger

When the user provides a prompt alongside this workflow, read Phase 0 and begin.
