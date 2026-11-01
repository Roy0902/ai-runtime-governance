---
name: implementation-design
description: 'Use when preparing feature coding or structural refactoring to design folder/module boundaries, dependency direction, domain-based names, supporting tests, and native quality gates for existing or greenfield projects.'
---

# Implementation Design

## Purpose and inputs

Produce one shared engineering design in Phase 5, before frontend/backend task planning.
Read the [shared checklist](../implementation-checklist/SKILL.md), requirements, domain
vocabulary, scenarios, intent diagrams, and applicable persistent project instructions.
Use the [design template](../../../.ai/templates/implementation-design.md).
The design is implementation context, never a new behavioral oracle.

## Procedure

1. **Study the affected area.** Cite relevant entry points, modules, dependencies,
   tests, and instruction files. Explain which existing patterns are suitable.
   Do not copy a poor pattern simply because it exists.
2. **Choose proportionate boundaries.** For each proposed file/module state its
   responsibility, owner, callers/dependencies, and why it belongs there.
   Separate unrelated business rules, UI/transport, persistence, and integrations
   where applicable. Do not mandate layers, interfaces, file counts, or line limits.
3. **Handle greenfield explicitly.** If there is no suitable pattern, propose a
   small structure with reasons. Mark conventions as proposed for Phase 6 review;
   never claim an invented structure is an existing project convention.
4. **Name from the domain.** Give representative paths, types, and function names
   using the glossary and project casing conventions. Prefer names explaining
   intent and ownership over vague buckets. Judge context, not a word blacklist.
5. **Assign error and side-effect ownership.** Locate validation, business
   invariants, error translation, state transitions, and side effects. Specify
   dependency direction so business decisions do not accidentally depend on
   rendering or transport details.
6. **Plan supporting tests.** Identify logic best isolated by unit tests and
   boundaries needing integration tests, with deterministic data/reset strategy.
   Reuse the native runner and layout outside protected acceptance paths.
   Supporting tests supplement the frozen acceptance oracle, not replace it.
7. **Record exact quality commands.** Consume the Phase 4 baseline register:
   command, working directory, scope, result, and log/evidence reference for
   lint/static analysis, formatting, build/type checks, and tests. Run missing
   baselines before edits. Missing tools are setup gaps requiring a decision;
   inapplicable checks need reasons. Do not install a tool merely to fill a row.
8. **Separate decisions.** Private names, file placement, and behavior-preserving
   extraction are engineering choices within reviewed boundaries. Missing
   observable behavior, permissions, error contracts, durability, or concurrency
   semantics are product ambiguities. Before freeze raise them for Phase 6;
   after freeze use the [gap protocol](../verification-loop/SKILL.md#post-freeze-gaps-replaces-the-change-protocol).
9. **Review and hand off.** Phase 6 reviews responsibilities, dependencies,
   names, test strategy, commands, setup decisions, and baseline dispositions.
   Frontend/backend planners reference the same design and contracts. Record
   material later deviations for review without changing the frozen oracle.

## Review standard

- Each module has a coherent purpose, not merely a different filename.
- New files and abstractions have a concrete responsibility or reuse rationale.
- Dependency direction is explicit and appropriate to the existing stack.
- Names convey domain intent; an example demonstrates the naming convention.
- Supporting tests target meaningful logic and failure boundaries.
- Baseline problems remain visible; no blanket suppressions or weakened rules.
- A single cohesive file can be correct. Splitting a god file mechanically is
  not sufficient; explain the responsibility boundaries.

For lasting conventions, adapt the [project-conventions template](../../../.ai/templates/project-conventions.md)
into the target project's supported persistent instruction mechanism. Reuse
existing instructions and obtain review for conflicting or new conventions.
