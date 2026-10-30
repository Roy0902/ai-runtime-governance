# Phase 0: Requirement register

Version: 0.6. Feature: `runtime-governance`.
Source revision: [inventory](./00-source-inventory.md).

## Reading this register

`REQ-runtime-governance-###` is the workflow identity; the existing source ID
remains stable and is never replaced. Each row represents the complete source
requirement and its acceptance criterion, not a narrowed paraphrase. The linked
source controls all details; the statement column is a navigational summary.
Compound criteria must be split into individual cases in Phase 3.

Types: Rule, Flow, Data, Contract. Levels identify planned coverage surfaces, not
available runners. `Both` means UI/client plus service acceptance; isolated guard
logic also needs supporting unit tests. Operational rows need failure/load/recovery
evidence in addition to API acceptance.

**Testability:** all 43 confirmed rows are `blocked` for complete executable
acceptance because at least one referenced contract, value, or integration is
unresolved. This does not mean every subassertion is ambiguous: no-dispatch,
composition, submitter-only authority and honest coverage are confirmed.
No row is currently `testable-with-assumption`; no default is invented.
Proposed rows are `blocked: approval`; deferred rows are `blocked: out of scope`,
not release blockers. AMB suffixes refer to the [ambiguity register](./02-ambiguity-register.md).

## Requirement register

| Workflow ID | Source | Status | Requirement statement / acceptance focus | Type | Level | Testability / AMB suffix |
|---|---|---|---|---|---|---|
| REQ-runtime-governance-001 | [GUARD-001](../../REQUIREMENTS.md#prompt-guarding-and-agent-activity-monitoring) | Confirmed | Built-in literal/bounded-regex catalog on the new human message only; representative categories, benign lookalikes, bounded failures; no semantic-completeness claim. | Rule | API | blocked: 001, 003 |
| REQ-runtime-governance-002 | [GUARD-002](../../REQUIREMENTS.md#prompt-guarding-and-agent-activity-monitoring) | Confirmed | Compose redactions, deny, approval, then allow; inspect exact forwarded payload; only submitter approval, request-lifetime expiry, immediate cancellation and no resume. | Flow | Both | blocked: 002, 003, 004 |
| REQ-runtime-governance-003 | [GUARD-003](../../REQUIREMENTS.md#prompt-guarding-and-agent-activity-monitoring) | Confirmed | Required evaluation/policy failure or timeout prevents dispatch; structured errors; late results cannot authorize forwarding. | Rule | API | blocked: 006, 010 |
| REQ-runtime-governance-004 | [GUARD-004](../../REQUIREMENTS.md#prompt-guarding-and-agent-activity-monitoring) | Confirmed | Java custom-endpoint gateway evaluates before forwarding; native-provider bypass is not guarded. | Contract | Both | blocked: 001, 005 |
| REQ-runtime-governance-005 | [GUARD-005](../../REQUIREMENTS.md#prompt-guarding-and-agent-activity-monitoring) | Confirmed | Verified new-human-message mapping, never last-user-role guessing; multi-turn/tool/retry/summarization/concurrent cases; invalid mapping blocks. | Contract | Both | blocked: 001, 002 |
| REQ-runtime-governance-006 | [GUARD-006](../../REQUIREMENTS.md#prompt-guarding-and-agent-activity-monitoring) | Confirmed | Supported authenticated submitter approval binds evaluated message and redacted payload; missing UI, replay, changes, timeout/cancellation never authorize. | Flow | Both | blocked: 001, 002, 004 |
| REQ-runtime-governance-007 | [MON-001](../../REQUIREMENTS.md#prompt-guarding-and-agent-activity-monitoring) | Confirmed | Correlate guard decision with reported agent/model/tool events, retries, handoffs, errors and completion; never fabricate unavailable events. | Data | Both | blocked: 002, 007 |
| REQ-runtime-governance-008 | [MON-002](../../REQUIREMENTS.md#prompt-guarding-and-agent-activity-monitoring) | Confirmed | Show ordered nested events, status and available duration; distinguish missing/unsupported telemetry from empty activity. | Contract | Both | blocked: 007, 014 |
| REQ-runtime-governance-009 | [MON-003](../../REQUIREMENTS.md#prompt-guarding-and-agent-activity-monitoring) | Confirmed | Observable loop works without reasoning text; never infer or claim complete private reasoning. | Rule | Both | blocked: 009, 014 |
| REQ-runtime-governance-010 | [MON-004](../../REQUIREMENTS.md#prompt-guarding-and-agent-activity-monitoring) | Confirmed | Concurrent supported sessions isolate prompts, decisions, credentials, responses and events within documented limits. | Data | Both | blocked: 001, 002, 010 |
| REQ-runtime-governance-011 | [IAM-001](../../REQUIREMENTS.md#accounts-workspaces-and-authorization-deferred-platform-requirements) | Deferred | OIDC registration/login, supported profile fields and provider recovery; no native passwords. | Flow | Both | blocked: out of scope |
| REQ-runtime-governance-012 | [IAM-002](../../REQUIREMENTS.md#accounts-workspaces-and-authorization-deferred-platform-requirements) | Deferred | Multiple self-managed workspaces without operator approval. | Flow | Both | blocked: out of scope |
| REQ-runtime-governance-013 | [IAM-003](../../REQUIREMENTS.md#accounts-workspaces-and-authorization-deferred-platform-requirements) | Deferred | Invitations, member removal, roles and safe ownership transfer. | Rule | Both | blocked: out of scope |
| REQ-runtime-governance-014 | [IAM-004](../../REQUIREMENTS.md#accounts-workspaces-and-authorization-deferred-platform-requirements) | Deferred | Workspace-owned operations authorize membership or scoped credentials, including guessed IDs/artifacts. | Rule | API | blocked: out of scope |
| REQ-runtime-governance-015 | [IAM-005](../../REQUIREMENTS.md#accounts-workspaces-and-authorization-deferred-platform-requirements) | Deferred | Workspace runtime credentials are scoped, limited and revocable. | Contract | API | blocked: out of scope |
| REQ-runtime-governance-016 | [IAM-006](../../REQUIREMENTS.md#accounts-workspaces-and-authorization-deferred-platform-requirements) | Deferred | Explicit workspace deletion blocks new execution and reports cleanup outcomes. | Flow | Both | blocked: out of scope |
| REQ-runtime-governance-017 | [INT-001](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Provider-compatible Java gateway with separate client/upstream keys; supplemental hooks, isolated concurrent traces, no unchanged deny/redact/pending dispatch. | Contract | Both | blocked: 001, 002, 009 |
| REQ-runtime-governance-018 | [INT-002](../../REQUIREMENTS.md#integrations-and-secrets) | Deferred | Owners configure workspace model/MCP credentials. | Flow | Both | blocked: out of scope |
| REQ-runtime-governance-019 | [INT-003](../../REQUIREMENTS.md#integrations-and-secrets) | Deferred | Encrypted server credentials and external secret-manager modes, without plaintext fallback. | Contract | API | blocked: out of scope |
| REQ-runtime-governance-020 | [INT-004](../../REQUIREMENTS.md#integrations-and-secrets) | Deferred | Workspace secrets are write-only and excluded from logs/archives/errors; encryption keys stay server-side. | Rule | Both | blocked: out of scope |
| REQ-runtime-governance-021 | [INT-005](../../REQUIREMENTS.md#integrations-and-secrets) | Deferred | Constrain tenant destinations and secret references before use. | Rule | API | blocked: out of scope |
| REQ-runtime-governance-022 | [INT-006](../../REQUIREMENTS.md#integrations-and-secrets) | Proposed | Explicit credential replacement/revocation/encryption-key versions and in-flight failure behavior. | Flow | API | blocked: approval; deferred workspace-credential context |
| REQ-runtime-governance-023 | [INT-007](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Install/connect once per environment/profile; consented supported configuration; automatic eligible-new-session activation, no per-session editing. | Flow | Both | blocked: 001, 005 |
| REQ-runtime-governance-024 | [INT-008](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Supported existing-session attach or reconnect requirement; independent coverage dimensions and honest unknown/bypass/degraded states, no retroactive capture. | Contract | Both | blocked: 001, 005, 007, 014 |
| REQ-runtime-governance-025 | [INT-009](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Separate gateway/event/upstream credentials; secure scoped provisioning/storage/revocation, no secret exposure or callback session-control authority. | Rule | Both | blocked: 001, 002 |
| REQ-runtime-governance-026 | [INT-010](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | No silent direct-provider fallback; observation outage stays nonblocking with truthful incomplete/degraded status. | Rule | Both | blocked: 005, 007, 008 |
| REQ-runtime-governance-027 | [INT-011](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Authenticated session/turn/request/attempt correlation plus exposed parent/subagent links; no cross-attribution or duplicated guard authority. | Data | Both | blocked: 001, 002, 007, 008 |
| REQ-runtime-governance-028 | [AUTH-001](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Native password/2FA and purpose-bound runtime identities; private account scope and submitter-only approval; explicit operator grant before gateway/provider-budget use, no event-token read/approval. | Rule | Both | blocked: 002, 004 |
| REQ-runtime-governance-029 | [POL-001](../../REQUIREMENTS.md#policy-management-and-enforcement) | Confirmed | Built-in category actions/priorities fixed, all rules initially enabled, toggles only; document catalog and reject unsupported edits. | Rule | Both | blocked: 003, 004, 014 |
| REQ-runtime-governance-030 | [POL-002](../../REQUIREMENTS.md#policy-management-and-enforcement) | Confirmed | Apply composed effects; no-match allows; overlapping redactions use fixed priorities and top ties fail closed; approval remains request/submitter bound. | Rule | API | blocked: 003, 004 |
| REQ-runtime-governance-031 | [POL-003](../../REQUIREMENTS.md#policy-management-and-enforcement) | Confirmed | Wait for successful evaluation; missing policy/detector/evaluator/timeout fails closed, no signed-cache fallback. | Rule | API | blocked: 006, 010 |
| REQ-runtime-governance-032 | [POL-004](../../REQUIREMENTS.md#policy-management-and-enforcement) | Confirmed | Claim enforcement only on routed gateway model traffic; native/tool/output hooks remain observations. | Contract | Both | blocked: 001, 005, 014 |
| REQ-runtime-governance-033 | [POL-005](../../REQUIREMENTS.md#policy-management-and-enforcement) | Proposed | Immutable active-policy snapshot per request with attributable versions during activation/revocation. | Rule | API | blocked: approval; 004 |
| REQ-runtime-governance-034 | [POL-006](../../REQUIREMENTS.md#policy-management-and-enforcement) | Confirmed | Explicit decision outcome, policy identity/version and machine explanation; model rationale cannot authorize. | Data | Both | blocked: 004, 006, 007 |
| REQ-runtime-governance-035 | [INP-001](../../REQUIREMENTS.md#prompt-processing-and-integration-boundaries) | Proposed | If JSON is selected, define encoding/body/nesting/duplicate-key/schema limits before dispatch. | Contract | API | blocked: approval; 001, 010 |
| REQ-runtime-governance-036 | [INP-002](../../REQUIREMENTS.md#prompt-processing-and-integration-boundaries) | Confirmed | Validate selected provider boundary and guard before dispatch; no truncation/skipped checks/uninspectable forwarding; validation differs from denial. | Contract | API | blocked: 001, 003, 006, 010 |
| REQ-runtime-governance-037 | [INP-003](../../REQUIREMENTS.md#prompt-processing-and-integration-boundaries) | Proposed | Bounded evaluation deadline; timeout/late results cannot dispatch. | Rule | API | blocked: approval; 010 |
| REQ-runtime-governance-038 | [GW-001](../../REQUIREMENTS.md#prompt-processing-and-integration-boundaries) | Deferred | Mandatory pre-delivery output-policy buffering is superseded; transport limits still apply separately. | Contract | API | blocked: out of scope |
| REQ-runtime-governance-039 | [GW-002](../../REQUIREMENTS.md#prompt-processing-and-integration-boundaries) | Deferred | Per-tool action authorization/approval is not current enforcement; tool servers retain permissions. | Rule | API | blocked: out of scope |
| REQ-runtime-governance-040 | [GW-003](../../REQUIREMENTS.md#prompt-processing-and-integration-boundaries) | Confirmed | Surface upstream errors, deadline/cancellation and uncertain side effects; never false success or blind tool retries. | Flow | API | blocked: 006, 008, 009, 010 |
| REQ-runtime-governance-041 | [GW-004](../../REQUIREMENTS.md#prompt-processing-and-integration-boundaries) | Confirmed | Explicit bounds/overload for requests, buffers, queues, connections and CPU; structured rejection/backpressure without unbounded growth. | Rule | API | blocked: 006, 010 |
| REQ-runtime-governance-042 | [GW-005](../../REQUIREMENTS.md#prompt-processing-and-integration-boundaries) | Confirmed | Preserve ordinary responses/tool-call semantics and required delivery modes; cancellation/partial failure explicit, bounded buffers, reasoning excluded from monitoring. | Contract | API | blocked: 001, 006, 009, 010 |
| REQ-runtime-governance-043 | [OUT-001](../../REQUIREMENTS.md#advisory-output-analysis) | Deferred | Advisory output PII/credential findings are not Phase 1 and must not become an output gate later. | Rule | Both | blocked: out of scope |
| REQ-runtime-governance-044 | [OUT-002](../../REQUIREMENTS.md#advisory-output-analysis) | Deferred | Output findings/status are not Phase 1; future records must be scoped and omit sensitive values. | Data | Both | blocked: out of scope |
| REQ-runtime-governance-045 | [FIL-001](../../REQUIREMENTS.md#asynchronous-advisory-attachment-scanning-deferred) | Deferred | Attachment scans are not Phase 1; any future scans must not hold dispatch. | Flow | API | blocked: out of scope |
| REQ-runtime-governance-046 | [FIL-002](../../REQUIREMENTS.md#asynchronous-advisory-attachment-scanning-deferred) | Deferred | Future scan-copy consent/lifecycle must not silently enable archives. | Rule | Both | blocked: out of scope |
| REQ-runtime-governance-047 | [FIL-003](../../REQUIREMENTS.md#asynchronous-advisory-attachment-scanning-deferred) | Deferred | Future scan findings/status correlate to traces without raw sensitive values. | Data | Both | blocked: out of scope |
| REQ-runtime-governance-048 | [FIL-004](../../REQUIREMENTS.md#asynchronous-advisory-attachment-scanning-deferred) | Deferred | Future scanner dependencies/local processing/model or external submission require review. | Contract | API | blocked: out of scope |
| REQ-runtime-governance-049 | [EVT-001](../../REQUIREMENTS.md#events-timeline-and-apis) | Confirmed | Authenticated scoped durable event ingestion reconstructs trace/span activity; reject forged identity/policy authority. | Data | API | blocked: 002, 007, 008 |
| REQ-runtime-governance-050 | [EVT-002](../../REQUIREMENTS.md#events-timeline-and-apis) | Proposed | Versioned events with defined applicable/optional fields, identity, times, status and references. | Contract | API | blocked: approval; 007 |
| REQ-runtime-governance-051 | [EVT-003](../../REQUIREMENTS.md#events-timeline-and-apis) | Proposed | Scoped identical duplicates idempotent, conflicts rejected; missing/late parents inspectable without trusted global time ordering. | Data | Both | blocked: approval; 007 |
| REQ-runtime-governance-052 | [EVT-004](../../REQUIREMENTS.md#events-timeline-and-apis) | Confirmed | Observation backlog/spool exhaustion never pauses agent; trace incomplete with cause/known extent only; durable guard decision remains mandatory. | Flow | Both | blocked: 007, 008, 010 |
| REQ-runtime-governance-053 | [EVT-005](../../REQUIREMENTS.md#events-timeline-and-apis) | Confirmed | Optional bounded observation batches have measured flush/size limits; per-request guard decision/outbox atomic, never cross-request batched. | Data | API | blocked: 007, 008, 010 |
| REQ-runtime-governance-054 | [UI-001](../../REQUIREMENTS.md#events-timeline-and-apis) | Confirmed | Authorized trace list and expandable nested guard/agent/model/tool timeline; order/duration/status and incomplete versus successful completion distinct. | Contract | Both | blocked: 002, 007, 014 |
| REQ-runtime-governance-055 | [UI-002](../../REQUIREMENTS.md#events-timeline-and-apis) | Proposed | Bounded trace pagination and time/application/status/ID filters with deterministic continuation and refresh. | Contract | Both | blocked: approval; 007, 014 |
| REQ-runtime-governance-056 | [API-001](../../REQUIREMENTS.md#events-timeline-and-apis) | Confirmed | Secret-safe typed authentication/authorization/validation/denial/limits/dependency/uncertainty errors with machine code and correlation ID, never success-shaped. | Contract | API | blocked: 006 |
| REQ-runtime-governance-057 | [ARC-001](../../REQUIREMENTS.md#payload-archives-and-reasoning-exclusion) | Deferred | Ordinary prompt/response/tool archives are not Phase 1. | Data | Both | blocked: out of scope |
| REQ-runtime-governance-058 | [ARC-002](../../REQUIREMENTS.md#payload-archives-and-reasoning-exclusion) | Confirmed | No reasoning text stored/displayed, including generic objects; filter before all monitoring sinks, record availability only; no universal unstructured detection claim. | Rule | Both | blocked: 007, 009, 014 |
| REQ-runtime-governance-059 | [ARC-003](../../REQUIREMENTS.md#payload-archives-and-reasoning-exclusion) | Deferred | Archive toggle/retention are not Phase 1. | Flow | Both | blocked: out of scope |
| REQ-runtime-governance-060 | [ARC-004](../../REQUIREMENTS.md#payload-archives-and-reasoning-exclusion) | Deferred | Archive quotas/size/deletion/failure lifecycle is required only before future enablement. | Rule | API | blocked: out of scope |
| REQ-runtime-governance-061 | [ARC-005](../../REQUIREMENTS.md#payload-archives-and-reasoning-exclusion) | Proposed | Future beneficial lossless text compression with integrity/byte metadata, exact round-trip and corruption/oversize errors. | Data | API | blocked: approval; deferred archive context |
| REQ-runtime-governance-062 | [ARC-006](../../REQUIREMENTS.md#payload-archives-and-reasoning-exclusion) | Deferred | Archived-body retrieval is not Phase 1. | Contract | Both | blocked: out of scope |
| REQ-runtime-governance-063 | [OPS-001](../../REQUIREMENTS.md#reliability-and-operational-requirements) | Proposed | Document selected deployment/authentication and clean install of guard plus timeline. | Flow | Both | blocked: approval; 001, 002, 011 |
| REQ-runtime-governance-064 | [OPS-002](../../REQUIREMENTS.md#reliability-and-operational-requirements) | Confirmed | Authoritative decision storage separate from async UI/index/export; failed decision/outbox commit prevents dispatch, post-execution failure is incomplete/uncertain. | Flow | API | blocked: 007, 008 |
| REQ-runtime-governance-065 | [OPS-003](../../REQUIREMENTS.md#reliability-and-operational-requirements) | Confirmed | Bounded jobs, capped exponential-backoff/jitter retries, bounded attempts, inspectable exhausted/dead-letter state. | Flow | API | blocked: 007, 008, 010 |
| REQ-runtime-governance-066 | [OPS-004](../../REQUIREMENTS.md#reliability-and-operational-requirements) | Proposed | Operational latency/failure/queue/storage/rejection/worker metrics without sensitive labels. | Data | API | blocked: approval; 010 |
| REQ-runtime-governance-067 | [OPS-005](../../REQUIREMENTS.md#reliability-and-operational-requirements) | Confirmed | Production acceptance needs documented backup/restore and failure evidence for consistent selected-scope policy/trace data with explicit artifact/key/deletion treatment. | Flow | API | blocked: 008, 010, 011 |
| REQ-runtime-governance-068 | [AUTH-002](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Public email/password signup; trim/case-normalize full address; generic duplicate-safe response; 2FA before protected access; one-use 24h verification, SMTP/local test capture. DR-028: new signup sends, duplicates do not; explicit resend only enabled/unverified; atomic supersession/consumption, explicit confirmation, strict expiry and common durable admission with explicit outage error. Exact UI/API and numerical limits remain open. | Flow | Both | blocked: 002, 010, 014 |
| REQ-runtime-governance-069 | [AUTH-003](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Password/authenticator 2FA at fresh login, recovery alternative and secure salted verifiers; DR-029: 12–128 Unicode-code-point length only, no additional character/encoding restrictions; preserve exact input/paste/autofill, no composition or routine expiry. Malformed requests are transport errors, not extra password rules. Hash design/parameters/measurements and exact UI/API remain open. | Rule | Both | blocked: 002, 006, 014 |
| REQ-runtime-governance-070 | [AUTH-004](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Offline single-use recovery code with password, plus controlled host-admin recovery; no unauthenticated public bypass. | Flow | Both | blocked: 002, 006, 014 |
| REQ-runtime-governance-071 | [AUTH-005](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Persistent human sessions: 30-day absolute/7-day inactivity expiry, survive browser restart; no extra factor for routine browsing/prompt approval; logout/revocation/expiry end access. | Flow | Both | blocked: 002, 006, 014 |
| REQ-runtime-governance-072 | [AUTH-006](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Password/authenticator/recovery-code changes require full authentication at most 10 minutes old; reuse confirmation within window without OTP replay; ordinary prompt approval has no extra step-up. | Rule | Both | blocked: 002, 006, 014 |
| REQ-runtime-governance-073 | [AUTH-007](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Single-use 30-minute reset for enabled verified accounts, including incomplete setup; generic eligibility-safe responses. DR-028: one current link, strict expiry, atomic password/consumption/session revocation, no consumption on open/validation failure/rollback; issuance does not log out. Preserve MFA/setup restrictions; common durable mail admission with explicit outage error and bounded asynchronous delivery. Exact UI/API and numerical limits remain open. | Flow | Both | blocked: 002, 006, 014 |
| REQ-runtime-governance-074 | [AUTH-008](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | TOTP six digits/30s, current ±1 step, one acceptance/account/step; encrypted seeds, once-shown QR/key, valid code and saved-code acknowledgement before completion; 24h pending expiry; ten verifier-stored recovery codes, rotation revokes old set, recovery login preserves MFA. DR-026: explicit password-confirmed setup-only restart invalidates pending secrets/stale tabs; replacement preserves active factors until verified/acknowledged atomic swap with DR-025 sessions and recent-auth checks. Exact UI/concurrency/key/code contracts remain open. | Rule | Both | blocked: 002, 006, 014 |
| REQ-runtime-governance-075 | [AUTH-009](../../REQUIREMENTS.md#integrations-and-secrets) | Confirmed | Generic sign-in/reset/email-resend responses don't reveal account status; repeated failures use temporary progressive throttling, never permanent account lock; resends throttled per normalized address/source. Numeric thresholds/recovery windows remain OD-11. | Rule | Both | blocked: 002, 006, 014 |

AUTH-002 through AUTH-004 were added by explicit confirmation on 2026-10-29.
AUTH-005/AUTH-006 and related verification/ownership refinements were confirmed
later the same day. AUTH-007 was added by explicit confirmation on 2026-10-30.
AUTH-008/AUTH-009 were added by later explicit confirmations. The original 72
workflow IDs remain unchanged; AUTH-007 through AUTH-009 are appended rather
than renumbering any existing row to match its location in the source.

## Supplementary normative statements

These are refinements of existing rows, not new independent requirements:

- PD-01: no-match allows; overlap top-priority ties fail closed; exact markers are
  not approved by example. Covered by REQ-runtime-governance-001, -002, -029, -030.
- PD-03: short atomic decision/outbox transaction before dispatch, no network wait
  held in that transaction. Covered by REQ-runtime-governance-053 and -064.
- PD-07: bounded spool, incomplete trace cause/known extent and **no separate gap
  event**; capped exponential backoff/jitter and bounded attempts. Covered by
  REQ-runtime-governance-052, -053 and -065.
- PD-11 and primary workflows: supported consent lifecycle, ownership-safe cleanup
  and no silent native-provider restoration. Covered by REQ-runtime-governance-023,
  -024, -026; unresolved under AMB-runtime-governance-005.
- Release boundary: deferred platforms and scans do not become gates through
  examples or architecture inventories. Preserve the deferred/proposed classifications.
- DR-027 / OD-11: duplicate signup preserves password/enrollment; unverified-only
  cleanup after seven days from creation/latest issued verification link, not
  ordinary duplicates; verified accounts survive setup expiry. Create one private
  scope at first completed enrollment and preserve it across recovery. Host-only
  disable revokes sessions/pending auth/gateway entitlement and retains data;
  re-enable does not restore tokens/grants. Defer deletion/verified-email
  recycling. Covered by REQ-runtime-governance-028, -068, -070, -073 and -074.
- DR-030 / OD-11: TOTP encryption keys are not provider/session keys. Provider-key
  changes do not sign out humans; unavailable TOTP keys permit explicitly degraded
  operation with valid sessions/independent recovery login, while key-dependent
  operations fail explicitly without MFA/plaintext fallback. Explicit protected
  provisioning, separate backup/matched restore and versioned same-seed rotation;
  retain backup-required keys, no silent replacement. Covered by
  REQ-runtime-governance-069, -070, -071 and -074.
- DR-031 / OD-11: ten 128-bit/32-hex-character codes, eight groups of four;
  case/hyphen entry, verifier-only storage. Standalone pending sets last 24h and
  replace old codes only at acknowledged atomic commit with recent-auth checks
  and other-session revocation/current rotation. Pre-commit cancellation/expiry/
  lost display discards pending only; consumed codes stay consumed, obsolete
  tabs cannot activate and concurrent use succeeds once. Post-commit response
  loss uses nonsecret status/fresh regeneration, not readback/rollback.
  Covered by REQ-runtime-governance-070, -072 and -074.
- DR-032 / OD-11: exact-account local host authority, reason/confirmation,
  atomic secret-free audit and explicit rollback/failure; safe repeated changes.
  Recovery preserves identity/ownership, revokes auth/grant, creates no session
  and does not re-enable disabled accounts. Regrant requires completed setup.
  Revocation blocks later admission/undispatched calls; already-dispatched work
  may finish without follow-on or revoked-session read authority. Deliberate
  activity only; exact session-expiry/recent-auth boundaries, same-session binding,
  commit-time state checks and preserved recent-auth timestamps on rotation.
  Covered by REQ-runtime-governance-028, -070, -071, -072 and -074.
- DR-034 / OD-11: never-verified cleanup eligibility starts at the seven-day
  creation/latest-issued-link deadline, without promising exact scheduling;
  pending enrollment/code-set completion fails exactly at and after 24 hours.
  Existing verified-account and pending-only active-factor protections remain.
  Covered by REQ-runtime-governance-068 and -074; no source IDs changed.
- DR-037 / OD-11: approved immutable auth intent v0.3 defines exact verifier/
  upgrade/hash bounds, recovery/seed protection, auth/mail admission/cooldown/
  state/queue/retry/source policies and complete exported-evidence secrecy.
  Auth numerical oracles are no longer deferred; unrelated global capacity
  proposals remain unapproved. Covered by REQ-runtime-governance-069, -070,
  -074 and -075. Narrow native observations are not whole-service capacity.
- DR-038 / OD-11: browser compatibility excludes CR/LF without treating it as a
  strength rule; 12-128 code points, permitted exact text including NUL, ordinary
  paste/autofill and account privacy remain. Covered by
  REQ-runtime-governance-069; exact wire/copy remains in shared contract review.

The nine AT groups and candidate numeric targets are retained in the coverage
plan; none is silently promoted to a new approved requirement or concrete SCN.
