# Phase 1 development materials

Version: 0.6. Prepared: 2026-10-30. Feature key: `runtime-governance`.
Status: **Phase 0 prepared; guided confirmation in progress; exit gate blocked.
Only explicitly recorded choices are approved. Nothing is frozen.**

**Review outcome, 2026-10-30:** timeline requires changes before freeze; see the
[Phase 6 review](./timeline/08-review.md). DR-018 selects a separately planned
and frontend-acceptance-tested native-auth prerequisite before timeline delivery.
Public registration/2FA and approved low-friction session rules are unchanged.
No application implementation or tool installation was authorized.

The requested native-auth prerequisite has scoped ingestion, decision
recommendations and a frontend-acceptance coverage plan. DR-019 approved signup
email identity/verification, DR-020 password minimum/usability/reset, DR-021
TOTP/recovery behavior, and DR-022/023 host-operator/public-auth-abuse boundaries;
confirmed requirements are in the source register.
DR-024 through DR-032 settle further core behavior. A
[native-auth domain model](./native-auth/03-domain-model.md) is presented and
[intent v0.1](./native-auth/04-intent-v0.1.md) is explicitly approved under DR-033.
A [native-auth scenario catalog](./native-auth/05-scenarios.md) now drafts 83 SCN
IDs/215 expanded cases. DR-034 approves the
[v0.2 deadline addendum](./native-auth/04-intent-v0.2.md), resolving two oracles;
four IDs remain explicitly unspecified. Other recommendations remain
proposals; the Phase 3 exit and exact/numerical/tooling gates remain blocked.
No application code, executable acceptance tests or freeze manifest have been
created. Detailed setup remains unrun.

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
16. [Native-auth scoped ingestion](./native-auth/00-ingestion.md) and
    [decision recommendations](./native-auth/01-decision-proposals.md): DR-018
    prerequisite materials; no new recommendation is approved yet.
    The [frontend acceptance coverage plan](./native-auth/02-acceptance-plan.md)
    records real-browser/backend prerequisites without treating its candidates
    as scenarios or tests.
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

| Phase | Deliverable | Current disposition |
|---|---|---|
| 0 | Inventory, REQ/AMB registers, coverage plan | Prepared; user decisions outstanding |
| 1 | Pure domain model and invariants | Not started: Phase 0 blocking ambiguities unresolved |
| 2 | Versioned Mermaid intent diagrams | Not started; requires domain gate and explicit user approval |
| 3 | Concrete behavioral scenarios | Not started; must not invent unresolved values |
| 4 | Shared contracts, checklist, native quality baselines | Not started; target has no application manifests/toolchain yet |
| 5 | Shared implementation design, frontend/backend tasks | Not started; follows contracts and design review |
| 6 | User review | Pending |
| 7 | Frozen acceptance plan | Not created; freeze is one-way and prerequisites are unmet |
| 8 | Red acceptance tests and lock | Not created; no runner or resolved contracts |
| 9-12 | Implementation, verification, accessibility, as-built diagrams | Outside this preparation and not started |

This follows the [canonical workflow](../../../spec-to-test-workflow/.github/skills/spec-to-test-workflow/SKILL.md).
These documents are not a substitute for the later design, task lists, or frozen
plan. A request to prepare materials is not approval of unresolved product choices.

## Next decision

Review the [full-release recommendations](./04-decision-proposals.md) and resolve
the [ambiguities](./02-ambiguity-register.md), or explicitly approve a smaller
first development slice and identify which decisions it still needs.
Two source-supported starting scopes are:

- Integration-feasibility milestone: capability evidence for each candidate
  client/version/environment, with no production compatibility claim.
- Independent guard-engine milestone: server-side behavior with a reviewed catalog
  and synthetic inputs, with no verified client-integration claim.

Neither option silently removes the remaining Phase 1 release gates. After a scope
decision, re-evaluate the active blockers rather than marking all ambiguities
resolved. Changes to observable behavior require corresponding source-spec updates.

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
and separate frontend/backend tasks are prepared as review drafts. New API/UI
choices and candidate scenarios still require confirmation/reconciliation;
native-auth prerequisites and actual JDK/Maven/frontend/browser/DB setup remain
explicit blockers. Native-auth decision materials now cover DR-019/DR-020,
including the reset requirement, but further account decisions and all auth
design/acceptance materials remain outstanding. No freeze, red browser evidence
or application implementation has been performed. WSL remains deferred.

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
