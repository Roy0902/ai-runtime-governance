# Phase 0: Ambiguity and decision register

Version: 0.2. All ambiguities below remain **open**. Partial user confirmations
are recorded in the [decision record](./05-decision-record.md); DR-001 approves
the client-support target, not technical feasibility. Unconfirmed choices remain
pending; no default behavior is approved.
For each decision record: owner, date, approved choice and reason, source updates,
affected REQ IDs, verification criteria, and evidence reference.

**Current confirmation update:** DR-004 through DR-008 select public native
registration, mandatory authenticator 2FA, offline/host recovery and same-host
purpose-separated credentials, plus low-friction human sessions and email-verified
signup. Accounts own private scopes; gateway use requires an operator grant.
Human-session values of 30 days absolute/7 days inactivity and a 10-minute
recent-authentication window are approved, not merely proposed. These choices
supersede the original OIDC proposal.
AMB-002 now concerns remaining OD-11 delivery/token, normalization/duplicate,
scope-provisioning/grant, enrollment/recovery, session activity/revocation and
runtime-lifecycle contracts, not selection of OIDC or those session values.
It additionally affects REQ-runtime-governance-068 through
REQ-runtime-governance-072. AMB-014 also covers these public authentication
surfaces. Neither ambiguity is closed by choosing the overall direction.

**Scoped guard-core update:** DR-012 approves overlap/marker/validation semantics
and the 65,536-byte/1,024-finding limits for the first decision-core slice.
See its [scoped register](./guard-core/00-ingestion.md). Detector patterns and
other full-release ambiguities remain open; selected source requirements are
only partially included, not globally completed.

## Ambiguity register

AMB IDs are local traceability keys, not replacements for the source OD/PD IDs.
REQ suffixes below refer to [REQ-runtime-governance-###](./01-requirement-register.md).
`Hold` is a workflow disposition, not a runtime fallback.

| ID | Question / decision required | Sources / conflict | Default assumption | Impact | Blocking | Decision / affected REQ suffixes |
|---|---|---|---|---|---|---|
| AMB-runtime-governance-001 | Which client versions/environments and inbound/upstream protocols can demonstrate install-once guarded integration, exact new-message mapping, approval delivery, streaming and tool calls? Record each candidate's demonstrated, failed and unsupported capabilities. | OD-01, OD-10; PD-01, PD-11; client candidates explicitly unverified | Hold full integration; monitoring-only is labeled and does not satisfy guarding. No protocol inferred from a library. | High | Yes: full client path | Pending; 001, 004-006, 010, 017, 023-025, 027, 032, 035, 036, 042, 063 |
| AMB-runtime-governance-002 | Select human/runtime authentication, authorization-scope representation, submitter binding, secure gateway/event-key provisioning/storage/expiry/revocation and upstream-key rotation; define authenticated session/turn/request/attempt and exposed parent links. | OD-01/OD-05; AUTH-001; baseline OIDC/workspace references are not approval | Hold protected operations; no trust in payload IDs/event tokens; no implicit workspace or OIDC platform. | High | Yes: protected Phase 1 paths | Pending; 002, 005-007, 010, 017, 025, 027, 028, 049, 054 |
| AMB-runtime-governance-003 | Approve exact built-in rule IDs/patterns, benign/worst-case fixtures, regex syntax/features and bounds, typed-marker taxonomy/mapping, fixed priorities and overlap selection. | OD-04; GUARD-001/002, POL-001/002; marker examples are illustrative | Hold production catalog; preserve confirmed category actions, enabled-by-default toggles, no-match allow and tie failure. Do not invent patterns or marker strings. | High | Yes: guard-engine path | Pending; 001, 002, 029, 030, 036 |
| AMB-runtime-governance-004 | Define approval authentication/channel/content binding/replay and reconnect/retry behavior, request lifetime and cancellation races; select policy toggling authority/interface, versioning, activation/revocation and whether POL-005 is approved. | OD-04/OD-05; GUARD-006; POL-005 proposed versus POL-006 confirmed attribution | Hold affected paths; only submitter, redacted exact payload, expiry at request end, immediate cancellation and no resume remain fixed. No invented reviewer/admin role. | High | Yes: approval/policy lifecycle | Pending; 002, 006, 028-030, 033, 034 |
| AMB-runtime-governance-005 | Define onboarding consent/withdrawal, disable/uninstall, ownership-safe configuration cleanup preserving user changes, in-flight handling, attach/reconnect and coverage-freshness/loss detection. | OD-01/OD-05; PD-11; INT-007/008/010 | Hold client lifecycle promises; no silent config edits or restoration to native provider; unexposed sessions remain unknown. | High | Yes: install-once path | Pending; 004, 023, 024, 026, 032 |
| AMB-runtime-governance-006 | Approve API/provider error schema, machine codes, correlation identifier, HTTP mappings and partial-response failure representation for every required failure class. | OD-05/OD-10; API-001 and GW-003/005 | Hold exact wire assertions; errors remain distinct and secret-safe, never success-shaped. No guessed status codes or messages. | High | Yes: executable API acceptance | Pending; 003, 031, 034, 036, 040-042, 056 |
| AMB-runtime-governance-007 | Define event versions, field optionality, ordering/sequence/time semantics, duplicate/conflict/replay handling, late/missing parents, trace states/incomplete cause and known extent; approve or reject EVT-002/003/UI-002 proposals and query contract. | OD-05/OD-06; PD-07/08; proposed schemas versus confirmed ingestion/timeline obligations | Hold wire/UI expectations; never trust source time as global order or fabricate telemetry. Use trace incompleteness, not an invented separate gap event. | High | Yes: event/timeline path | Pending; 007, 008, 024, 027, 034, 049-055, 058, 064, 065 |
| AMB-runtime-governance-008 | Specify atomic decision/outbox write and dispatch ownership, request/attempt identity, idempotency/retry boundaries, crash states and recovery of incomplete/uncertain status including storage outage. | OD-06; PD-03/07/10; OPS-002 | Hold affected implementation; commit before dispatch, no transaction across upstream wait, no exactly-once claim or blind side-effect retry. | High | Yes: durable guarding/recovery | Pending; 026, 027, 040, 049, 052, 053, 064, 065, 067 |
| AMB-runtime-governance-009 | Select required response delivery modes and protocol/tool-call fixtures; define cancellation, partial output, bounded buffers and recognized reasoning-field exclusion from every monitoring sink without altering ordinary upstream content. | OD-01/OD-10; GW-005, ARC-002; PD-02 still describes deferred advisory findings | Hold transport claims; no output-content gate/scanner or reasoning archive. Preserve ordinary protocol content; reasoning-exclusion scope is monitoring/storage/display. | High | Yes: response compatibility/privacy | Pending; 009, 017, 040, 042, 058 |
| AMB-runtime-governance-010 | Approve concrete request/parsing/regex/CPU/connection/upstream/queue/spool/batch/flush/retry/admission limits, overload behavior, separate evaluation/approval waits, workload/latency methodology and recovery objectives. Resolve proposed limits explicitly. | OD-08 plus OD-01/04/10; INP-001/003 and numeric table proposed | Hold numeric assertions; 8 calls, 100 ms, 500 ms, 50 traces, retention/quota examples are not defaults. No 500 ms guard deadline approved. | High | Yes: bounded execution and production acceptance | Pending; 003, 010, 031, 035-037, 040-042, 052, 053, 065-067 |
| AMB-runtime-governance-011 | Select deployment/trust boundary and recoverable Phase 1 dataset, backup/restore procedures, key/deletion treatment and recovery objectives without reinstating deferred workspaces/artifacts. Define minimal metadata lifecycle/storage bounds without enabling ordinary archives. | OD-08; OPS-001 proposed, OPS-005 confirmed uses workspace wording; README deployment open | Hold production readiness; hardware is not measured capacity. No implied HA, archive retention, workspace platform or chosen recovery target. | High | Yes: deployment/recovery path | Pending; 063, 067; storage lifecycle supports 049, 052, 064 |
| AMB-runtime-governance-012 | Record current input fingerprints and later obtain a reviewed domain model, versioned intent diagram approval and reviewed development task list at their proper phases. | Ingestion inputs absent; README sketches not approved Mermaid | Use recorded working-tree fingerprints now. Do not manufacture approval or execute later phases out of order. | Medium | No for ingestion; Yes for Phase 3/freeze prerequisites | Pending; all active rows need downstream traceability |
| AMB-runtime-governance-013 | Approve target structure and version-pinned native quality/acceptance tooling: Java/Maven/Spring/LangChain4j, SQL access choice, frontend commands, Playwright/helpers/CLI prerequisites, guard adoption and CI checks. | Baseline gives direction; target currently has no manifests/source; workflow assumes Playwright/TypeScript and project helpers | Hold command/version claims and package installation. Discover or approve setup in Phase 4; absent tools are not clean baselines. | High | No for ingestion; Yes for design/execution readiness | Pending; all executable paths |
| AMB-runtime-governance-014 | Specify authorized trace/policy/approval interface surfaces, roles/labels/copy/locators and loading/empty/error/disabled/read-only/double-submit/pending-navigation behavior. Distinguish client approval UI from timeline UI. | UI-001; GUARD-006; frontend planning rules; UI-002 remains proposed | Hold exact UI assertions; no invented copy, permission model, filters, live refresh or locators. | High | Yes: UI scenarios/contracts/tasks | Pending; 008, 009, 024, 029, 032, 054, 055, 058 |

## Deferred decisions, not Phase 1 blockers

| Source decision | Preserve exclusion |
|---|---|
| OD-02 / PD-09 workspace aspects | Workspace/OIDC platform and owner/operator/viewer roles remain deferred. Public native registration and mandatory 2FA/recovery are active under OD-11 and AMB-002/014; minimum scope limits remain AMB-002/010. |
| OD-03 / PD-06 | Workspace-managed BYOK and external secret-manager modes. Deployment-managed upstream keys are still active under AMB-002. |
| OD-07 | Ordinary archives, consent, compression, retrieval, quotas and deletion. This does not remove minimum metadata recovery/storage-bound decisions. |
| OD-09 | Attachment upload/scanning/storage/consent. No attachment scanner or format support selected. |
| OD-10 advisory-analysis portion / PD-02 | Output findings, scanner storage and scheduling are deferred. Response transport itself remains active. |

## Resolution order and evidence

1. Decide whether this material set targets the complete Phase 1 release or a
   bounded feasibility/guard-engine slice. Source approval of prototypes is not
   approval of their missing contracts.
2. For integration feasibility, resolve AMB-001/002/005/009 through explicit
   prototype contracts and actual per-client/version evidence. A failed
   guarded-capability check may produce monitoring-only status, not a waiver.
3. For an independent guard engine, resolve AMB-003/004/010 and the relevant
   AMB-006 error vocabulary; do not claim client authentication or durable
   gateway behavior from an isolated engine.
4. Resolve data/dispatch/recovery contracts (AMB-007/008/011), UI behavior
   (AMB-014) and setup (AMB-013) for whichever paths are included.
5. Reconcile requirements after approved behavioral decisions. Then re-evaluate
   the Phase 0 gate, present the domain model, and seek intent-diagram approval
   in sequence. Do not mass-close unaffected ambiguities.

No blocking ambiguity has a recorded user decision at preparation time.
