# Activity timeline Phase 6 readiness review

Reviewed: 2026-10-30. Reviewer: assistant. Scope: timeline materials 00–07,
approved intent, source requirements and current target-root readiness.
Verdict: **Changes and explicit decisions required; not ready to freeze or code.**

This is a requirements/design/acceptance-readiness review, not a vulnerability
assessment or a test of implemented capability. No application exists yet.
Document integrity is not behavioral correctness.

## 1. Findings

| ID | Priority | Evidence | Finding and consequence | Disposition |
|---|---|---|---|---|
| R-TL-001 | High | [Checklist cursor/query proposal](./04-shared-checklist.md#cursorquery-proposal), [SCN-023/024](./03-scenarios.md) | A maximum receipt-key cutoff does not define immutable traversal membership. An event received before the cutoff but committed later, or received later with a clock/tie-break key below it, can enter a later response unpredictably or be skipped after its position was traversed. Existing no-concurrent-change tests do not catch this. | Original cutoff withdrawn from checklist/design. Replacement membership/expiry/cap/deletion semantics need approval and concurrent-arrival acceptance cases. |
| R-TL-002 | High | [BE-TL-001 and prerequisites](./07-backend-tasks.md), [SCN-002/027/028](./03-scenarios.md) | Real native login/2FA/private-scope sessions are essential to browser acceptance, but BE-TL-001 is explicitly only a dependency check and not an implementation plan. There are no account/session endpoints, setup tasks or tested authentication module. Timeline cannot be declared independently runnable. | DR-018 selects a separately planned/tested native-auth prerequisite. Sequencing resolved; actual dependency remains open. No fake production login/cookie workaround. |
| R-TL-003 | High | [SCN-011/019/020/021/022](./03-scenarios.md), [BE-TL-007](./07-backend-tasks.md) | Metadata rejection/deduplication/producer authority are asserted, but only production read routes are proposed. A retained-data seed alone cannot prove attempted invalid writes were rejected or that a real reporter lacks authority. The harness must exercise the actual service boundary, then the browser must inspect the real retained result. | Test-only in-process/service harness proposal required, without public seed/write endpoint. Record exact assertion ownership and real-versus-synthetic credential classification. A passed service test alone is not frontend acceptance or proof of a real agent integration. |
| R-TL-004 | High | [Scenario blocked candidates](./03-scenarios.md), [frontend case matrix](./06-frontend-tasks.md) | Essential proposed cursor, navigation-race, refresh-failure, pending-button and accessible interaction behaviors have no concrete reviewed SCNs. An all-REQ coverage count can be true while these user-visible failure paths remain untested. | Approve exact contracts/copy, append cases and update task coverage before freeze. No renumbering or weakening of existing SCNs. |
| R-TL-005 | Medium | [Checklist shared shapes](./04-shared-checklist.md#single-source-shared-shapes), SCN-009 identifiers | UUID-only proposed IDs conflict with concrete `evt-001`/`evt-002` fixture IDs; identity/kind-specific fields, enums, timestamp rules and allowed producer permissions are also not complete executable schemas. Frontend and backend could implement incompatible shapes. | Review one machine-readable contract; either revise the UUID proposal or explicitly translate fixture aliases to approved UUIDs with updated expectations. Do not silently normalize a frozen test. Schema/copy approval remains AMB-004/005. |
| R-TL-006 | Medium | [Design structure](./05-implementation-design.md), [frontend/backend tasks](./06-frontend-tasks.md) | Initial task lists omitted explicit runnable app bootstrap/entry/configuration work, making greenfield execution depend on unassigned files. | Corrected in draft: FE-TL-007 and BE-TL-010 plus design owners. Still subject to setup/design review, not implemented. |
| R-TL-007 | Medium | [SCN-012 and partial loading](./03-scenarios.md) | Only missing duration was tested, not a valid zero/positive duration. Genuinely missing parents were tested, but retained-yet-unloaded parents had no dedicated acceptance case. These can expose incorrect zero/unknown and pagination/loss rendering. | Corrected with SCN-029/030 from approved behavior. Existing SCN-001–028 and intent unchanged; now 30 scenario IDs. |
| R-TL-008 | High readiness gate | [Baseline register](./04-shared-checklist.md#6-native-baseline-and-setup-gaps), [quality commands](./05-implementation-design.md#6-quality-baseline-and-commands) | Commands/dependency versions and runner/project/helper paths are proposals, not executable verified setup. Java 25 was not established on PATH, Maven unavailable in the recorded probe, and no frontend/DB/browser manifests exist. | Resolve approved toolchain versions and test environment; establish build/runner/auth prerequisites before genuine feature-missing red. No package installation or clean baseline claimed by this review. |

### Why receipt order and traversal membership are separate

Receipt time plus event identity remains the approved display order among
siblings. Fixing traversal membership must not silently change that user-visible
ordering. A stable traversal needs a membership mechanism based on committed
records, rather than assuming receipt keys imply commit order.

Recommended direction: server-managed bounded traversal records whose membership
is fixed from committed IDs at the first successful read. Reauthorize every
continuation and do not hold a long-lived database transaction. Specify traversal
expiry, per-account/global caps, retention/deletion treatment and error outcomes.
Alternative mechanisms are acceptable only if concurrent-commit tests establish
the same guarantee. This recommendation is not yet a selected implementation.

## 2. Corrections made during review

- Updated stale ingestion inventory/status: intent approval and prepared artifacts
  now agree with DR-017. Removed obsolete domain-decision blocker wording.
- Withdrew the misleading receipt-only stable-traversal proposal; did not silently
  approve a replacement or edit the approved intent.
- Added SCN-029 (reported zero/positive duration) and SCN-030 (retained/unloaded
  parent), with checklist/design/task traceability.
- Added runnable frontend/backend bootstrap responsibilities. Task counts are now
  seven frontend and ten backend/acceptance tasks.
- Preserved all approved intent bytes, existing scenario IDs and source requirement
  fingerprints. No product behavior change, dependency install or freeze occurred.

## 3. What is sound in the current package

- User-selected metadata-only/read-only scope is consistent with the journey.
  No hidden prompt archive, active approval or incident case-management feature.
- Private-scope reads, independent execution/completeness/coverage evidence and
  missing-versus-unloaded data are explicit design boundaries.
- Real browser/backend/persisted-data acceptance remains mandatory. Unit/API tests
  supplement rather than replace frontend acceptance.
- Pure domain/business rules, read orchestration, persistence and React rendering
  have separate responsibilities without requiring separate deployed services.
- WSL and live agent compatibility are not falsely made prerequisites for all
  preparation. Synthetic histories are not presented as live agent evidence.

## 4. Decision order recommended to the user

**Decision recorded:** DR-018 (2026-10-30) selects a separately planned and
acceptance-tested native-auth prerequisite before timeline delivery. R-TL-002's
sequencing question is resolved; its actual dependency is not yet implemented.
All approved login/session/public-registration choices remain in force.

1. Decide authentication sequencing first (R-TL-002). Recommend a separately
   planned/tested native-account prerequisite, preserving all already-approved
   low-friction session and public-registration choices.
2. Resolve one complete read/event schema and cursor membership contract,
   including safe metadata rejection and trusted producer boundaries.
3. Confirm UI copy/interactions, then append exact cursor/race/accessibility cases.
4. Approve isolated fixture/harness and native toolchain setup. Define exactly
   which checks are frontend acceptance and which are supporting integrity checks.
5. Review the revised design/tasks and all baseline dispositions. Only then freeze,
   establish runnable prerequisites, author/run genuine failing acceptance and lock.

An authentication prerequisite needs its own reviewed acceptance/design gate; do
not implement it untested merely to make timeline tests pass. Neither milestone
is permission to ship a password-only or fake-session demo.

## 5. Review limits and validation

The target worktree was clean at initial review; repository HEAD was
`ec49f69fd021ecedabec5df8542d012f8e33d0e9`. Current source/intent fingerprints
matched the inventory. The graph remains at generation `2026-10-27T05:00:43Z`
and cannot attest these newer Markdown artifacts; direct source reads were used.

No staged/committed user changes were reverted. No application, browser,
PostgreSQL, authentication, failure-injection or live-client tests ran. Link,
ID/count and fingerprint validation is recorded separately in the materials
index and must not be interpreted as a pass of these review findings.

No freeze is authorized while unresolved High findings/readiness gates remain.

Document validation after corrections passed: all original 28 scenario blocks
were compared with repository HEAD and remained unchanged; SCN-029/030 append
approved-rule coverage. All 30 scenarios map to checklist/tasks, seven frontend
and ten backend/acceptance tasks cover nine checklist responsibilities, 189 local
links/fragments resolve and 43 Markdown tables are structurally consistent.
Current source and approved-intent fingerprints remain unchanged. No timeline
freeze manifest exists. These checks do not resolve the open review findings.
