# Execution Evidence: [feature]

Mutable execution record outside the frozen plan. Preserve chronological entries;
append corrections/results rather than overwriting red history. This is reviewed
evidence, not a checksum-protected artifact or mechanically verified proof.
Never include secrets or raw sensitive payloads.

## Identity

- Frozen plan: `[path and plan hash from manifest]`
- Feature manifest: `[path]`
- Acceptance files: `[paths and hashes/commit identifying the run]`
- Reviewed design: `[path/version]`
- Existing historical evidence: `[legacy plan section, or none]`

## Red acceptance runs (Phase 8)

One entry per acceptance test, before implementation and acceptance lock.

| Run / timestamp | REQ / SCN / test identity | Command and working directory | Artifact identity | Failure and feature-missing reason | Log / reviewer |
|---|---|---|---|---|---|
| `[run]` | `[IDs and test name]` | `[exact command]` | `[hashes/commit]` | `[actual failure, not setup failure]` | `[reference]` |

## Subsequent verification

| Run / timestamp | Check / scope | Command and working directory | Artifact identity | Result | Evidence / disposition |
|---|---|---|---|---|---|
| `[run]` | `[acceptance, supporting tests, lint, format, build/type check, integrity]` | `[exact command]` | `[hashes/commit]` | `[pass / fail / blocked / N/A / baseline issue]` | `[log, reason, explicit baseline approval if any]` |

## Reviews, gaps, and completion

- Maintainability: `[module ownership, dependencies, naming, abstractions, reuse]`
- Shared helpers/configuration: `[no disabled suites, weakened assertions/setup, or quality rules]`
- Accessibility: `[contract locator results]`
- Requirement results: `[REQ -> SCN -> acceptance file -> result]`
- Gaps and blocked work: `[separate follow-up paths; never edit frozen plan]`
- As-built comparison: `[diagram path and differences]`
- Final status: `[all gates satisfied / approved baseline exceptions / blocked]`
