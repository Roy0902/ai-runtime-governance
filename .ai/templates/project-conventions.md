# Project Engineering Conventions

Template only: replace placeholders and merge into the target project's supported
persistent instruction file, such as `AGENTS.md` or `.github/copilot-instructions.md`.
Do not install both with duplicated rules. Preserve existing project instructions;
review conflicts rather than overwriting them. This is not a feature specification.

## Structure and dependencies

- Feature code belongs in `[paths and rationale]`.
- Shared code belongs in `[paths and criteria for genuine reuse]`.
- Tests belong in `[native unit/integration paths]`; protected acceptance paths
  follow the spec-to-test workflow.
- Dependencies may flow `[allowed directions]`; prohibited imports: `[boundaries]`.
- Business invariants, validation, transport mapping, persistence, and side effects
  are owned by `[modules appropriate to this stack]`.

## Naming and implementation

- Use `[domain glossary]`, `[file/type/function casing]`, and examples `[names]`.
- Follow suitable existing patterns in `[files]`; explain justified departures.
- Keep responsibilities cohesive. Do not add layers, interfaces, or files without
  a concrete purpose.
- Error handling/logging: `[existing helpers and conventions]`; surface failures
  explicitly and avoid leaking sensitive data.

## Required native checks

| Check | Exact command | Working directory / scope |
|---|---|---|
| Formatting | `[command or justified N/A]` | `[scope]` |
| Lint/static analysis | `[command or approved setup decision]` | `[scope]` |
| Build/type check | `[command or justified N/A]` | `[scope]` |
| Supporting tests | `[command]` | `[scope]` |
| Acceptance integrity | `npm run ai:verify -- <feature>` | `[target project root]` |

Record baselines before edits. Do not weaken rules, add blanket suppressions,
exclude changed code, or disable tests to pass. Report unresolved baseline issues
and obtain explicit dispositions; do not describe them as clean passes.
Wire required checks into the project's reviewed CI/pre-commit configuration.
