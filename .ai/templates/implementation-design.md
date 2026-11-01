# Implementation Design: [feature]

Implementation context only. Expected behavior comes from approved requirements
and diagrams, then the frozen acceptance plan.

## 1. Sources and decisions

- Requirements/scenarios: `[IDs and versions]`
- Domain vocabulary and intent diagram: `[paths/versions]`
- Shared checklist: `[path/version]`
- Applicable project instructions: `[paths, or absent]`
- Status: `[proposed / reviewed]`; reviewer: `[name]`
- Product ambiguities: `[AMB IDs and resolution, or none]`

## 2. Files and patterns studied

| File / scope | Evidence | Reuse or departure, with reason |
|---|---|---|
| `[path, or greenfield]` | `[relevant responsibility/pattern]` | `[suitable pattern or justified proposal]` |

## 3. Proposed structure and ownership

| Path / module | Existing / new | Responsibility and owner | Dependencies / allowed direction | Rationale |
|---|---|---|---|---|
| `[path]` | `[status]` | `[cohesive purpose]` | `[depends on; must not depend on]` | `[why here; why a new file if new]` |

Describe ownership of validation, invariants, errors, lifecycle state, and side effects.
Use only the boundaries needed for the feature; no mandatory layer count.

## 4. Naming examples

| Domain term | Path / type / function | Project convention and meaning |
|---|---|---|
| `[term]` | `[concrete representative names]` | `[intent, ownership, casing]` |

## 5. Supporting-test strategy

| Responsibility / boundary | Unit / integration | Native runner and location | Data/reset/isolation | Related REQ / SCN |
|---|---|---|---|---|
| `[logic]` | `[level]` | `[outside protected acceptance paths]` | `[deterministic strategy]` | `[IDs]` |

Supporting tests cannot supply missing frozen acceptance coverage.

## 6. Quality baseline and required gates

| Check | Exact command | Working directory / scope | Baseline result and evidence | Required final result / disposition |
|---|---|---|---|---|
| `[lint/static analysis, format, build/type check, tests]` | `[native command]` | `[path/scope]` | `[actual result, timestamp/log]` | `[pass, justified N/A, or explicit baseline decision]` |

Missing tooling is a setup gap requiring an approved decision. Do not treat
unrun checks or baseline failures as passes. Identify existing failures and the
evidence needed to establish no introduced violations.

## 7. Review and deviations

- Design review: `[responsibilities, dependencies, names, tests, quality readiness]`
- Baseline/setup decisions: `[reviewer, rationale, scope; or none]`
- Material deviations: `[original design, proposed change, reason, review]`
- Out-of-scope work: `[explicit list]`
