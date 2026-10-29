# Guard-core: scoped ingestion and coverage

Version: 0.1. Prepared: 2026-10-29. Feature: `guard-core`.
Status: **Scoped behavior confirmed; ingestion ready for domain modeling.
Exact contracts, acceptance tooling and implementation remain gated.**

**Progress update:** intent v0.1 is approved under DR-013; the scenario draft
contains 29 IDs. The historical skeleton below retains its initial checkpoint;
the [scenarios](./03-scenarios.md) and [Phase 4 checklist](./04-shared-checklist.md)
now carry current coverage and setup proposals. AMB-guard-core-001 is resolved
for this intent version; AMB-guard-core-002/003/004 remain open.

## 1. Artifact inventory and authority

| Artifact | Revision | Used sections / authority |
|---|---|---|
| [Requirements](../../../REQUIREMENTS.md) | SHA-256 `9304761929ED49510AEB726F7D6FFE7E4964DE1F5A2E65DA1D9571C32F483FB0` | Confirmed guard-core first-slice section; included portions of GUARD-001 through GUARD-006, POL-001 through POL-003/POL-006, OPS-002. Primary behavior oracle. |
| [Approved slice](../08-first-slice-scope.md) | Version 0.2; SHA-256 `BF28B2BA3937A18949322C5E03E63D188E3392DF4FBC2607E62A346A8A401428` | Scope, explicit package choices, eight scoped REQs and exclusions. User approval is DR-012. |
| [Confirmation record](../05-decision-record.md) | DR-011/DR-012, 2026-10-29 | Defers WSL; explicitly approves this slice and its overlap/marker/bounds/validation package. |
| [Canonical workflow](../../../../spec-to-test-workflow/.github/skills/spec-to-test-workflow/SKILL.md) | Current source fingerprint in the parent inventory | Phase order and gates. Process authority, not a behavior oracle. |
| [Domain skill](../../../../spec-to-test-workflow/.github/skills/domain-modeling/SKILL.md) | SHA-256 `10E164077120B902BA0BE2B6E218303921A806A8B76C8E7DCDB512132F934B1A` | Required pure-domain structure and requirement traceability. |
| Reviewed intent diagram | Not yet approved at ingestion | Phase 2 approval remains required before scenarios. |
| Reviewed implementation task list | Not yet produced | Phase 5 output, not a behavior oracle. |

The global inventory and 72 global requirement rows are not replaced. This scope
refines selected portions of existing requirements; it does not add eight
independently completed full-release requirements. Source/diagram precedence and
the prohibition on deriving expectations from code remain in force.

## 2. Scoped requirement register

`Testable` below means the business expectation is determinate at the scoped
library boundary, not that an executable runner, approved diagram or test exists.
Library acceptance setup is explicitly unresolved for Phase 4. No HTTP route or
user interface is introduced merely to fit a template.

| ID | Confirmed expectation | Parent requirement / global REQ | Type | Planned level | Testability |
|---|---|---|---|---|---|
| REQ-guard-core-001 | One evaluation affects only the supplied already-identified new human message | GUARD-001/GUARD-005; REQ-runtime-governance-001/005, included portions only | Rule | Library boundary | Testable |
| REQ-guard-core-002 | Derive effects from the trusted enabled catalog; retain policy identity/version and matched-rule attribution | POL-001/POL-006; REQ-runtime-governance-029/034 | Rule | Library boundary | Testable |
| REQ-guard-core-003 | A valid evaluation with no findings allows the unchanged message | POL-002; REQ-runtime-governance-030 | Rule | Library boundary | Testable |
| REQ-guard-core-004 | Replace nonoverlapping original-message redaction spans using the confirmed six-marker vocabulary; preserve other text | GUARD-002/POL-002; REQ-runtime-governance-002/030; confirmed slice | Rule | Library boundary | Testable |
| REQ-guard-core-005 | Redact each connected group union with its highest-priority marker; connected top ties fail; adjacent findings remain separate | POL-002; REQ-runtime-governance-030; confirmed slice | Rule | Library boundary | Testable |
| REQ-guard-core-006 | After redaction, deny dominates approval; otherwise transformed permitted text has redact outcome, unchanged permitted text has allow outcome | GUARD-002/POL-002; REQ-runtime-governance-002/030 | Rule | Library boundary | Testable |
| REQ-guard-core-007 | Explicit failure for invalid/inconsistent findings or policy, more than 65,536 UTF-8 bytes or more than 1,024 findings; no truncation/allow fallback | GUARD-003/POL-003; REQ-runtime-governance-003/031; confirmed slice | Rule | Library boundary | Testable |
| REQ-guard-core-008 | A core result neither grants human approval nor proves identity, durable authorization or upstream dispatch | GUARD-004/005/006, OPS-002; REQ-runtime-governance-004/005/006/064, included boundaries only | Rule | Boundary/structural acceptance | Testable |

Synthetic descriptors are trusted test fixtures for composition, not production
user-authored rules. The first slice does not establish that actual content was
detected or that an external agent invoked the core.

## 3. Scoped ambiguity register

The product choices required to model this slice are resolved by DR-012. The
remaining items have explicit later gates; no value is silently invented.

| ID | Open question | Default disposition | Blocking gate | Current decision |
|---|---|---|---|---|
| AMB-guard-core-001 | User approval of the versioned intent diagram | No approval inferred; do not start Phase 3 | Phase 3 | Pending Phase 2 review |
| AMB-guard-core-002 | Exact result/error types, text offsets, malformed-text handling and multiple-failure reporting | Define from confirmed semantics during contract/design review; no silent normalization or arbitrary error precedence | Exact contract assertions/freeze | Pending Phase 4 |
| AMB-guard-core-003 | Protected acceptance runner for a library-only Java slice under the reusable workflow's Playwright/API assumptions | Explicit setup decision; supporting JUnit tests cannot silently replace locked acceptance; do not invent a production endpoint | Phase 4/7/8 | Pending setup review |
| AMB-guard-core-004 | Available native Java/Maven versions, quality tools and exact commands | Discover at the relevant setup/design phase; missing tools are not clean baselines | Phase 4/5/implementation | Pending discovery |

WSL, detector patterns, active-policy editing, human approval delivery, persistence
and external protocol gaps remain in the full-release ambiguity register, outside
this slice. They are deferred by scope, not closed or claimed implemented.

## 4. Traceability skeleton and coverage plan

| REQ | Positive coverage | Negative / boundary coverage | Scenario / test file | Status |
|---|---|---|---|---|
| REQ-guard-core-001 | Only supplied message is transformed | Other text/context not included or modified; no client-mapping claim | Pending / Pending | Awaiting intent approval |
| REQ-guard-core-002 | Correct catalog-derived effect and complete attribution | Missing identity/version, unknown/inconsistent rule/effect input | Pending / Pending | Awaiting intent approval |
| REQ-guard-core-003 | No findings -> unchanged allow | Evaluation failure never masquerades as no findings | Pending / Pending | Awaiting intent approval |
| REQ-guard-core-004 | Each marker; multiple disjoint replacements | Adjacent intervals, Unicode-surrounding text, invalid/empty/out-of-range spans | Pending / Pending | Awaiting intent approval |
| REQ-guard-core-005 | Highest-priority union for nested/transitive overlap | Tied top priorities, transitively connected ties, adjacent nonoverlap | Pending / Pending | Awaiting intent approval |
| REQ-guard-core-006 | Each permitted/deny/approval outcome | Deny+approval+redaction, approval+redaction, no loss of matched attribution | Pending / Pending | Awaiting intent approval |
| REQ-guard-core-007 | Exactly 65,536 UTF-8 bytes / 1,024 findings accepted when otherwise valid | Limit+1, multibyte sizing, invalid policy/findings, no partial success | Pending / Pending | Awaiting intent approval |
| REQ-guard-core-008 | Evaluation returns only a decision/transformed message | No human approval, durable authorization, network dispatch or client support asserted | Pending / Pending | Awaiting intent approval |

Totals: eight scoped REQs, eight determinate domain expectations, zero unresolved
domain-blocking decisions, four later-gate ambiguities, zero approved diagrams,
zero scenarios/tests/frozen files. Full-release requirements remain blocked as
recorded in the parent register.

Coverage quotas: positive and negative/boundary coverage per REQ; every domain
invariant violation; all diagram outcome/error branches after approval. Role
switching, HTTP endpoints and client execution are not present in this slice.

## 5. Handoff

The scoped ingestion gate is satisfied for Phase 1 domain modeling. Produce the
pure domain model from these sources, then present versioned Phase 2 intent
diagrams for explicit approval. Do not equate domain readiness with complete
implementation readiness or reopen the unrelated WSL setup gate.
