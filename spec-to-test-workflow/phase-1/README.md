# Phase 1 development materials

Version: 0.8. Prepared: 2026-11-01. Feature key: `runtime-governance`.
Status: **Native-auth Phases 0-8 are complete: contracts approved, design/tasks
reviewed, plans frozen and the acceptance tests locked. Phase 9 API
implementation is complete for product behavior (44/48 + follow-up-01). The
frontend is implemented and 31/49 Browser SCNs pass. Timeline and guard-core stay
at their review/draft stages.**

**Review outcome, 2026-10-30:** timeline requires changes before freeze; see the
[Phase 6 review](./timeline/08-review.md). DR-018 selects a separately planned
and frontend-acceptance-tested native-auth prerequisite before timeline delivery.
Public registration/2FA and approved low-friction session rules are unchanged.

The requested native-auth prerequisite has scoped ingestion, decision
recommendations and a frontend-acceptance coverage plan. DR-019 through DR-032
settle core account, MFA, recovery, session, host-operator and abuse behavior.
DR-033/034/037/038 approve intent v0.1 and the v0.2 deadline, v0.3 verifier/
evidence/admission and v0.4 line-break addenda at their recorded fingerprints.
The [native-auth scenario catalog](./native-auth/05-scenarios.md) now has
**94 SCN IDs / 271 outline-expanded planned cases and zero active `@unspecified`
tags**. Phase 4 drafts exist: [shared checklist](./native-auth/06-shared-checklist.md),
[UI/copy](./native-auth/07-ui-contract.md),
[operator commands](./native-auth/08-operator-contract.md),
[SCN scope map](./native-auth/09-scn-scope-map.md),
[native baseline](./native-auth/10-native-baseline.md) and the
[ten consolidated proposals](./native-auth/11-decision-proposals.md). Phase 4 is
**approved under DR-039**; the machine contract is `0.2.1` / `reviewed`. Phase 5
now has a [shared design](./native-auth/12-implementation-design.md) and
[frontend](./native-auth/13-frontend-tasks.md) /
[backend](./native-auth/14-backend-tasks.md) task lists, both awaiting Phase 6
review. Freeze, red acceptance and test lock remain outstanding.

The current global requirement inventory is 75 rows (43 confirmed, 10 proposed,
22 deferred). AUTH-007–009 cover password reset, TOTP/recovery lifecycle and
account-enumeration/temporary-throttle behavior; existing requirement IDs remain
unchanged.

**Timeline direction (DR-014/DR-015/DR-016/DR-017):** prepare the
[incident activity timeline](./09-timeline-first-slice.md) as the first real
frontend-acceptance journey. Prompt logs are metadata-only, with no prompt body.
The library subprocess acceptance proposal was not approved. Guard-core materials
remain useful, but their earlier first-delivery priority is superseded; timeline
scope/domain/intent/contracts must be prepared before browser-test freeze.

## Materials

1. [Source inventory](./00-source-inventory.md): exact input revisions, precedence,
   discovery evidence, and scope.
2. [Requirement register](./01-requirement-register.md): all 74 source requirements,
   stable workflow IDs, status, testability, and blocking references.
3. [Ambiguity register](./02-ambiguity-register.md): decisions required before
   affected development can proceed; deferrals remain deferred.
4. [Traceability and coverage plan](./03-coverage-plan.md): requirement-to-review
   mapping, positive/negative coverage obligations, and feasibility evidence.
5. [Full-release decision proposals](./04-decision-proposals.md): recommendations
   for all 14 ambiguities, candidate catalog/contracts/limits, trade-offs and
   required evidence. Prepared at the user's request; see the record for partial approvals.
6. [Confirmation record](./05-decision-record.md): exact user-approved choices,
   unresolved details, verification criteria and source-reconciliation status.
7. [Integration feasibility](./06-integration-feasibility.md): observed WSL/client
   readiness, official-source capability review, unverified per-client matrix
   and the explicit Linux-installation gate.
8. [Manual WSL setup](./07-wsl-manual-setup.md): the user chose to perform Linux
   installation/initialization and VS Code WSL connection themselves.
9. [First client-independent slice](./08-first-slice-scope.md): approved guard
   decision core, included/excluded requirement portions and its actual gates.
10. [Guard-core ingestion](./guard-core/00-ingestion.md),
    [domain model](./guard-core/01-domain-model.md) and
    [intent diagrams v0.1](./guard-core/02-intent-v0.1.md): scoped Phase 0/1
    materials and Phase 2 review artifact. Intent v0.1 was approved under DR-013.
11. [Guard-core scenarios](./guard-core/03-scenarios.md) and
    [shared checklist/contracts](./guard-core/04-shared-checklist.md):
    29 scenario IDs and Phase 4 contract/tooling proposals awaiting confirmation.
12. [Timeline first-slice scope](./09-timeline-first-slice.md): selected frontend
    journey, metadata-only prompt log and remaining contract/acceptance boundaries.
13. [Timeline scoped ingestion](./timeline/00-ingestion.md): eleven traced
    requirements and confirmed DR-016 behavior package. Its
    [domain model](./timeline/01-domain-model.md) and
    [intent diagrams v0.1](./timeline/02-intent-v0.1.md) are prepared;
    intent is approved under DR-017.
14. [Timeline scenarios](./timeline/03-scenarios.md),
    [shared checklist/contracts](./timeline/04-shared-checklist.md),
    [implementation design](./timeline/05-implementation-design.md),
    [frontend tasks](./timeline/06-frontend-tasks.md) and
    [backend/acceptance tasks](./timeline/07-backend-tasks.md):
    review drafts, not frozen or implementation-ready.
15. [Phase 6 timeline review](./timeline/08-review.md): findings, corrections and
    unresolved decisions. Verdict: not ready to freeze or implement.
16. [Native-auth scoped ingestion](./native-auth/00-ingestion.md),
    [decision recommendations](./native-auth/01-decision-proposals.md),
    [shared checklist](./native-auth/06-shared-checklist.md),
    [UI/copy contract](./native-auth/07-ui-contract.md),
    [operator contract](./native-auth/08-operator-contract.md),
    [SCN scope map](./native-auth/09-scn-scope-map.md),
    [native baseline](./native-auth/10-native-baseline.md) and
    [Phase 4 proposals](./native-auth/11-decision-proposals.md): DR-018
    prerequisite materials through DR-039, plus the Phase 5
    [design](./native-auth/12-implementation-design.md),
    [frontend tasks](./native-auth/13-frontend-tasks.md) and
    [backend tasks](./native-auth/14-backend-tasks.md).
    The [frontend acceptance coverage plan](./native-auth/02-acceptance-plan.md)
    records real-browser/backend prerequisites without treating its candidates
    as scenarios or tests.
    The [draft machine contract](../../contracts/native-auth.openapi.json) is the
    single Phase 4 shape definition, validated but not approved or implemented.
    See the [native-auth status](./native-auth/README.md).

**Earlier guard-core direction (DR-011/DR-012), superseded by DR-015:** WSL remains pending for its own live
integration tests. The guard-core first slice and its overlap/marker/input-bound
package are approved. Its [scoped ingestion](./guard-core/00-ingestion.md) is ready
for the prepared domain model; intent v0.1 is approved and scenarios are drafted.
The shared checklist is prepared; exact library contract and acceptance setup
still need confirmation. Full-release scope and integration obligations are
preserved. No freeze or code implementation has been produced for this slice.

Source specifications now include explicitly confirmed client-support and native
public-account/2FA choices. Existing uncommitted changes were preserved, not
reverted or replaced. Current and original input fingerprints are distinguished
in the inventory. The reusable workflow repository is unchanged by this work.

DR-007/DR-008 additionally confirm low-friction 30-day/7-day-idle sessions,
a reusable 10-minute recent-authentication window for sensitive changes,
password-manager-friendly login, once-at-signup email verification, private
account scopes and explicit operator approval before gateway budget use.

## Scope and authority

The [requirements](../../REQUIREMENTS.md) are the behavioral oracle. Phase 1 means
prompt guarding, public native accounts with mandatory authenticator 2FA/recovery,
and an authorized observable-activity timeline, not a workspace,
BYOK-management, payload-archive, attachment-scanning, or output-analysis platform.
The [baseline](../../TECHNICAL_BASELINE.md) provides architecture candidates and
selected technology direction, not permission to promote proposed behavior or
performance numbers into defaults.

The source permits bounded feasibility prototypes. It does not establish that
OpenCode or VS Code Copilot can satisfy guarded integration, nor authorize a
particular wire contract, authentication mechanism, catalog, or resource budget.
No live integration tests were performed during this documentation preparation.

## Workflow position

No package has passed every gate. Position by package:

| Phase | Deliverable | Native auth | Timeline | Guard core |
|---|---|---|---|---|
| 0 | Inventory, REQ/AMB registers, coverage plan | Prepared | Prepared | Prepared |
| 1 | Pure domain model and invariants | Presented (v0.1) | Prepared | Prepared |
| 2 | Versioned Mermaid intent diagrams | v0.1–v0.4 approved (DR-033/034/037/038) | v0.1 approved (DR-017) | v0.1 approved (DR-013) |
| 3 | Concrete behavioral scenarios | 94 SCNs / 271 cases, zero unspecified | 30 draft SCNs | 29 draft SCNs |
| 4 | Shared contracts, checklist, native baselines | Draft OpenAPI only; checklist/copy/locator/operator/baseline pending | Draft checklist; membership contract withdrawn (R-TL-001) | Library contract approved; frontend evidence path missing |
| 5 | Shared implementation design, frontend/backend tasks | Draft design + 7 FE / 13 BE tasks; Phase 6 pending | Draft design + 7 FE / 10 BE tasks | Not started |
| 6 | User review | Approved DR-040; eight conflicts resolved | Review done: not ready (R-TL-001/003/004/005/008) | Pending |
| 7 | Frozen acceptance plan | `specs/native-auth.md`, hash `3929c857…c699b5` | Not created | Not created |
| 8 | Red acceptance tests and lock | 49 Browser + 45 API SCNs red for feature-missing; **locked** | Not created | Not created |
| 9-12 | Implementation, verification, accessibility, as-built diagrams | API complete: 44/48 + follow-up 01 3/3; frontend 31/49; 037/092 test follow-up pending | Not started | Not started |

This follows the [canonical workflow](../../../spec-to-test-workflow/.github/skills/spec-to-test-workflow/SKILL.md).
These documents are not a substitute for the later design, task lists, or frozen
plan. A request to prepare materials is not approval of unresolved product choices.

## Next decision

Finish native-auth Phase 4 from the draft machine contract, then Phase 5 design
and separate task lists, Phase 6 review, Phase 7 freeze, Phase 8 red acceptance
and test lock. DR-036 permits implementing a prerequisite only after its own
gates pass. After native auth, resolve the timeline findings (R-TL-001/003/004/
005/008) and the guard-core frontend/service evidence path. The 14 global
ambiguities and the user-performed Windows-with-WSL client gate remain open.

## Preparation checks

- Requirement reconciliation: 75 source rows = 43 confirmed + 10 proposed +
  22 deferred; one unique workflow ID per row.
- Complete active acceptance is blocked for all 43 confirmed rows; deterministic
  subassertions are identified in the coverage plan, not reported as passing tests.
- No scenarios, approved diagrams, frozen manifests, locked tests, application code,
  staging, or commits were produced.
- Source hashes, local artifact links, requirement/ambiguity references, and
  coverage membership are checked separately from application validation.
- No application build/test result is claimed: this target is currently
  specifications only.

Historical validation before guided confirmations, executed on 2026-10-29 using
Node's built-in filesystem, SHA-256 and
assertion facilities: **passed**. All 67 rows exactly reconciled with source
IDs/statuses, all 35 confirmed rows appeared in the traceability skeleton, all
14 ambiguity definitions and explicit REQ/AMB references were valid, 85 local
Markdown links resolved, and all six recorded source/workflow hashes were
unchanged. No frozen acceptance manifest was created.

After adding the requested decision-review pack, validation passed again:
14 one-to-one DP/AMB mappings with every approval pending, 12 unique candidate
catalog rules, six documents, 90 resolving local links including fragments,
13 structurally consistent Markdown tables, all 67 source requirement/status
mappings intact, and all six input fingerprints unchanged.

Historical validation after the first guided confirmations: **passed**. There were 70
source/register rows (38 confirmed, 10 proposed, 22 deferred); all original 67
workflow IDs are unchanged. All 38 confirmed rows have traceability entries,
14 ambiguity definitions and six confirmation records remain consistent,
99 local links/fragments resolve, 13 Markdown tables are structurally valid,
and six current source/workflow fingerprints match. The source now includes
AT-09 and OD-11 for the confirmed public native-account scope. These are document
integrity checks, not executed registration, MFA, client or recovery tests.

Historical validation before DR-019/DR-020: **passed**. At that checkpoint, 72
requirements reconciled with source status (40 confirmed, 10 proposed, 22 deferred);
the original 70 workflow IDs were unchanged. All 40 confirmed rows had traceability entries,
14 ambiguity definitions and eight decision records are consistent, 101 local
links/fragments resolve, 13 Markdown tables are structurally valid, and all six
current input fingerprints match. Explicit source checks confirmed the
30-day/7-day/10-minute session rules, signup verification and gateway-grant
requirements. No authentication, email delivery or client integration was run.

## Current timeline checkpoint

DR-016 confirms the read-only package and DR-017 approves timeline intent v0.1.
Scoped domain, 30 browser business scenarios, shared contract/checklist, design
and separate frontend/backend tasks are prepared as review drafts. The Phase 6
review found R-TL-001/003/004/005/008 still open; R-TL-002 sequencing is resolved
by DR-018. Native-auth Phase 3 business oracles are now closed, but native-auth
Phase 4–8 gates and actual authentication implementation remain explicit
timeline blockers. No freeze, red browser evidence or application implementation
has been performed. WSL remains deferred.

Preparation checks passed: eleven scoped requirements, fourteen pure-domain
invariants, two diagrams with 34 labeled edges and complete binary decision
branches; six global/two timeline input fingerprints matched and 140 checked
local links/fragments resolved at that checkpoint. The global requirement count
has since increased with AUTH-007. These checks
did not render Mermaid or execute frontend acceptance or application code.

### Historical timeline design/task preparation validation

The subsequent Phase 3–5 review drafts passed document/traceability checks:
Before review corrections, 28 scenario IDs covered all eleven scoped requirements;
the shared checklist and both task lists covered those scenarios and nine checklist items.
There were six frontend tasks and nine backend/acceptance tasks, with native-auth
and toolchain prerequisites explicitly blocked. Checked 169 local links/fragments,
42 Markdown tables, source fingerprints and unchanged approved intent.

These are **review drafts**, not completion of Phase 6. Proposed wire/UI/cursor/
interaction contracts require source/scenario reconciliation and review; native
account/session setup and actual Java 25/Maven/frontend/browser/PostgreSQL tooling
must be established before freeze/red acceptance. No installation, manifest,
browser test file, app code, seed endpoint or frozen timeline plan was created.

## Guard-core preparation checkpoint

The scoped ingestion gate is satisfied and the pure domain model is prepared
and presented. Intent v0.1 is ready for user review; scenarios must wait for that
approval. Exact contracts, native tooling, protected acceptance setup, design,
freeze/red evidence and implementation are not yet completed.

Preparation validation passed on 2026-10-29: 13 documents, 132 local links/
fragments, 24 structurally consistent Markdown tables, six current global input
fingerprints and three scoped evidence fingerprints. The eight scoped REQs,
11 pure-domain invariants, 14 labeled flow edges and 11 labeled state transitions
are accounted for; 72 global rows remain unchanged in count. The checker uses
CRLF-aware Markdown parsing and raw-file hashing. Mermaid rendering and
application/acceptance execution were not performed.
