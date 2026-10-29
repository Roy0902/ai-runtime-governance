# Phase 0: Traceability skeleton and coverage plan

Version: 0.3. Feature: `runtime-governance`. Status: planning only.

## 1. Coverage totals and quotas

- Source requirement rows: 72. Confirmed Phase 1: 40. Proposed: 10. Deferred: 22.
- Complete active acceptance: 0 testable, 0 testable-with-assumption, 40 blocked.
  Proposed/deferred rows are not counted as approved Phase 1 acceptance obligations.
- Authored `SCN-*`: 0. Authored/locked acceptance tests: 0. Approved diagrams: 0.
- Every active REQ must eventually have a positive scenario plus a negative or
  boundary scenario where applicable. Every guard/error exit, guarded/invalid
  transition, auth level changing behavior, and domain-invariant violation needs
  coverage. Counts cannot be claimed complete until the contracts/diagram exist.
- Every selected in-scope endpoint needs API acceptance coverage; endpoint names,
  routes and schemas are unresolved. Do not invent an endpoint inventory.
- Proposed rows become scenario obligations only after explicit approval.
  Deferred rows get no Phase 1 acceptance tests.

The planned behavior columns below are coverage intentions, not concrete scenarios,
fixtures, test names, expected copy, or evidence of execution.

## 2. Traceability matrix skeleton

Every confirmed REQ is listed once here; shared scenarios may later reference more
than one REQ. All `Scenario` and `Test file` entries are pending Phase 3/8.
Test files must use reviewed paths at authoring time; no files are reserved by
this table. Suffixes refer to the [requirement register](./01-requirement-register.md).

| REQ suffix | Source | Source AT group(s) | Level | Scenario / test file | Status |
|---|---|---|---|---|---|
| 001 | GUARD-001 | AT-01 | API | Pending / Pending | Blocked |
| 002 | GUARD-002 | AT-01 | Both | Pending / Pending | Blocked |
| 003 | GUARD-003 | AT-01 | API | Pending / Pending | Blocked |
| 004 | GUARD-004 | AT-01 supplemental | Both | Pending / Pending | Blocked |
| 005 | GUARD-005 | AT-06 | Both | Pending / Pending | Blocked |
| 006 | GUARD-006 | AT-06, AT-08 | Both | Pending / Pending | Blocked |
| 007 | MON-001 | AT-02 | Both | Pending / Pending | Blocked |
| 008 | MON-002 | AT-02 | Both | Pending / Pending | Blocked |
| 009 | MON-003 | AT-02 | Both | Pending / Pending | Blocked |
| 010 | MON-004 | AT-06 supplemental | Both | Pending / Pending | Blocked |
| 017 | INT-001 | AT-03, AT-07 | Both | Pending / Pending | Blocked |
| 023 | INT-007 | AT-06 | Both | Pending / Pending | Blocked |
| 024 | INT-008 | AT-06 | Both | Pending / Pending | Blocked |
| 025 | INT-009 | AT-06, AT-08 | Both | Pending / Pending | Blocked |
| 026 | INT-010 | AT-06 | Both | Pending / Pending | Blocked |
| 027 | INT-011 | AT-06 | Both | Pending / Pending | Blocked |
| 028 | AUTH-001 | AT-08, AT-09 | Both | Pending / Pending | Blocked |
| 029 | POL-001 | AT-04 | Both | Pending / Pending | Blocked |
| 030 | POL-002 | AT-01 | API | Pending / Pending | Blocked |
| 031 | POL-003 | AT-01 | API | Pending / Pending | Blocked |
| 032 | POL-004 | AT-01 supplemental | Both | Pending / Pending | Blocked |
| 034 | POL-006 | AT-04 | Both | Pending / Pending | Blocked |
| 036 | INP-002 | AT-01 | API | Pending / Pending | Blocked |
| 040 | GW-003 | AT-03, AT-07 | API | Pending / Pending | Blocked |
| 041 | GW-004 | AT-07 | API | Pending / Pending | Blocked |
| 042 | GW-005 | AT-07 | API | Pending / Pending | Blocked |
| 049 | EVT-001 | AT-02, AT-08 | API | Pending / Pending | Blocked |
| 052 | EVT-004 | AT-03 | Both | Pending / Pending | Blocked |
| 053 | EVT-005 | AT-03 | API | Pending / Pending | Blocked |
| 054 | UI-001 | AT-02, AT-08 | Both | Pending / Pending | Blocked |
| 056 | API-001 | AT-03 | API | Pending / Pending | Blocked |
| 058 | ARC-002 | AT-07 | Both | Pending / Pending | Blocked |
| 064 | OPS-002 | AT-05 | API | Pending / Pending | Blocked |
| 065 | OPS-003 | AT-05 | API | Pending / Pending | Blocked |
| 067 | OPS-005 | AT-05 | API | Pending / Pending | Blocked |
| 068 | AUTH-002 | AT-09 | Both | Pending / Pending | Blocked |
| 069 | AUTH-003 | AT-09 | Both | Pending / Pending | Blocked |
| 070 | AUTH-004 | AT-09 | Both | Pending / Pending | Blocked |
| 071 | AUTH-005 | AT-09 | Both | Pending / Pending | Blocked |
| 072 | AUTH-006 | AT-09 | Both | Pending / Pending | Blocked |

AT group names/numbers come from the source. `Supplemental` identifies an explicit
coverage addition for a confirmed requirement missing from the source AT group
membership; it does not pretend the source already listed it. The source also
includes proposed POL-005 in AT-04, EVT-002/003 in AT-03, and OPS-001 in AT-05.
Those links remain conditional, not active gates.

## 3. Behavior and failure coverage obligations

| Coverage family | Confirmed expectations to preserve | Positive / negative / boundary evidence to author after decisions |
|---|---|---|
| Catalog and matching | Built-in categories only; all enabled initially; toggles only, fixed actions/priorities; deterministic indicators, no semantic-completeness claim | One synthetic match, benign lookalike and relevant boundary per approved rule; literal/regex limits; disabled rule; rejected action/priority/custom-rule edits; worst-case regex explicit bounded failure |
| Composition | Apply all redactions; deny dominates approval, approval dominates allow; no-match allow; overlap priority and top-priority tie error | Exact reviewed marker replacements; multiple nonoverlapping matches; higher-priority overlap; tied overlap -> no dispatch; redaction plus approval forwards only redacted message; deny plus redaction/approval -> no dispatch |
| Submission mapping | New human message only; history/system/developer/retrieved context not guarded as submissions | Multi-turn, tool results, retries, summarization, concurrent sessions; missing/ambiguous/forged/conflicting mapping -> explicit error/no dispatch; never last-user-role inference |
| Approval lifecycle | Only authenticated submitting human; bind exact evaluated message and redacted payload; request-bound lifetime; no UI is not allow | Valid approval; other human/event token; changed message/payload; replay; absent UI; timeout; client cancellation; late approval; canceled-request resume rejected; resubmission is fresh evaluation |
| Guard failure | Evaluation/policy failure never implicitly allows; no signed-cache or native-provider fallback | Missing policy, detector/evaluator failure, timeout, late completion and gateway outage; inspect no upstream request and structured error; separate evaluation and human-wait boundaries after approval |
| Identity and isolation | Scope derived from authentication; separate credential purposes; no secret exposure; no cross-session attribution | Unauthenticated/cross-scope/forged-scope operations, revoked/cross-purpose keys, event-token read/control/approval denied; parallel human/session/attempt/subagent traffic; inspect synthetic credential leakage across logs/events/errors |
| Client lifecycle and coverage | Consented install once; eligible sessions auto-activate; attach via supported APIs or reconnect; three independent coverage dimensions | Declined setup, multiple new sessions, supported attach versus restart, profiles/remote contexts, disabled hooks, route changes, collector connectivity loss, unknown/unexposed sessions, native bypass and labeled monitoring-only; no retroactive capture |
| Response transport | Ordinary protocol/tool-call content preserved; required modes honored; partial failure/cancellation explicit; buffers bounded | Required streaming and non-streaming fixtures, ordered deltas, split tool arguments, upstream error, midstream failure, cancellation, unsupported mode, malformed payload and resource boundary; no false completed state |
| Events and timeline | Persist authenticated correlated events; missing telemetry never implies empty/successful; no fabricated durations/parents | Nested guard/model/tool/agent events, retries/handoffs/errors, absent optional metadata, unsupported telemetry and interrupted execution; duplicate/conflict/out-of-order details only after proposal decisions |
| Observation overload | Observation collection does not pause agent execution; bounded spool; trace incomplete cause/known extent only | Collector/worker/DB outage, full/unavailable spool, known count/range versus unknown extent, reconnect/recovery; no separate gap event; durable guard write remains blocking |
| Decision durability | Atomic per-request decision/outbox before dispatch; no shared guard batches or network call in decision transaction | Pre-commit failure -> no dispatch; crash before/after commit and dispatch; failure after external effect -> incomplete/uncertain, not false success or rollback; no unsupported exactly-once claim/blind side-effect retry |
| Worker/retry bounds | Capped exponential backoff with jitter, bounded attempts, inspectable exhaustion | Approved attempt/delay/queue/batch/flush limits measured; publication failure, capped retries, exhausted/dead-letter state, persistence/recovery and no silent accepted-event loss |
| Reasoning exclusion | No private reasoning inference; recognized reasoning fields removed from monitoring before logs/queues/spools/exports/display | Reasoning absent and disabled; reasoning nested in generic response object; all selected sinks inspected; ordinary response compatibility retained; record availability status only; no universal unstructured detection claim |
| UI behavior | Authorized trace list and nested timeline show guard outcome/order/status/duration/incompleteness truthfully | Loading, empty, success, contract errors, disabled/read-only, double submit, pending navigation, roles that change behavior; each mapped to an SCN or AMB; exact copy/locators require UI contract |
| Capacity and recovery | Explicit resource limits and honest recovery; hardware/proposals not measurements | Approved dataset/workload/warmup/sample counts; saturation/admission/bounds; backups and restored authorization/policy/trace consistency, credentials/deletion treatment and agreed recovery objectives |
| Public native accounts | Public self-service registration, application-managed password/mandatory authenticator 2FA; offline single-use recovery code with password and controlled host recovery | Registration success/duplicates/invalid data/verification according to pending contract; incomplete enrollment and password-only access denied; valid/invalid/replayed authenticator codes; used/invalid/passwordless recovery; host recovery proof/reset/session revocation; account isolation |

### Confirmed login/registration follow-up coverage

DR-007/DR-008 add these obligations, without authoring Phase 3 scenarios:

- Browser restart preserves a still-valid session. Test expiry at the 30-day
  absolute and 7-day inactivity boundaries; confirm background-activity semantics
  before choosing the fixture that advances inactivity.
- Browsing and prompt approval do not ask for another factor while the session
  is valid. An expired/revoked session still cannot approve, and the original
  prompt request's content binding/cancellation/deadline is unchanged.
- Test sensitive changes with full authentication exactly 10 minutes old versus
  older; reuse authenticated confirmation, not a previously consumed code.
  Autofill/paste works and there is no routine password-expiry challenge.
- Unverified email or incomplete 2FA enrollment does not yield full account
  access. Later login does not repeat signup email verification. Token lifecycle,
  resend, duplicates/normalization and email failures need explicit contracts.
- Two accounts cannot read, approve or use each other's traces/credentials.
  Public signup does not grant model-gateway/provider-budget use; a deployment
  operator must grant it explicitly, without thereby exposing another account's
  data or the provider secret. Exact provisioning/grant controls remain open.

## 4. Endpoint and actor coverage inventory

Surface families to resolve in Phase 4, not assumed REST routes:

- Public native registration, login and mandatory authenticator enrollment;
  offline-code recovery and a controlled nonpublic host-admin recovery procedure.
- Provider-compatible guarded model request/response transport.
- Authenticated supplemental observation-event ingestion.
- Authorized trace listing and timeline/detail reads.
- Submitter-only approval delivery and resolution through supported integration UI.
- Built-in-rule toggling/policy attribution interface; exact authority and
  configuration surface unresolved, not automatically a new management API.
- Credential provisioning/revocation and coverage reporting where supported;
  transport and packaging unresolved.

Actors needing distinguishable cases: submitting human, different authenticated
human in the same scope where supported, cross-scope human/runtime, gateway-key
runtime, event-only reporter, unauthenticated caller, deployment operator if
data access is approved. Do not substitute deferred owner/operator/viewer roles.
Scope and purpose checks apply even if the first deployment has one user.

## 5. Transition inventory for later intent diagrams

This is a checklist of confirmed outcomes, not an approved state model:

- Validation/mapping failure -> explicit failure and no dispatch.
- Evaluation failure/timeout/unavailable required policy -> failure and no dispatch.
- Evaluated deny -> no dispatch.
- Evaluated redaction -> transformed message, subject to deny/approval composition.
- Approval required -> no dispatch until valid submitter approval for exact payload.
- Pending approval + cancellation/request end/unavailable UI/invalid approval ->
  no dispatch; canceled approval cannot resume.
- Permitted prompt + failed authoritative commit -> no dispatch.
- Permitted prompt + successful authoritative commit -> eligible for dispatch,
  not proof that dispatch or completion occurred.
- Upstream cancellation/partial failure/unknown side effect -> explicit truthful
  outcome, no blind replay.
- Observation failure -> agent continues; coverage/trace incomplete, known extent only.
- Observation recovery -> recovery semantics pending; never silently assert that
  lost observations were recovered.

Numeric transition deadlines, race linearization, policy revocation and crash
recovery semantics remain ambiguity decisions; no invented states are frozen.

## 6. Feasibility evidence required before support claims

For **each** prototyped client/version/environment, record installation/profile/
remote scope, supported APIs, consent behavior, automatic activation, existing
session attach/reconnect, exact authenticated submission mapping, concurrent
correlation, exposed subagents, approval binding/cancellation, credential storage
and separation, inbound/upstream protocol, response modes/tool calls, bounded
resources, bypass and coverage-loss behavior. Use bounded synthetic data, not
real credentials or private repository content.

Classify each capability as demonstrated, failed, unsupported, or not tested with
actual evidence references. Documentation alone is not a live pass. Monitoring-only
is a valid feasibility outcome but does not satisfy the full guarded release.

## 7. Later artifact and validation handoff

After Phase 0 decisions, produce domain invariants, then versioned intent Mermaid
diagrams and obtain user approval before scenarios. Shared API/UI matrices and
native baseline evidence precede the shared implementation design and separate
frontend/backend file-level task lists.

The target currently has no application manifests or test runners. Commands,
dependency versions, Playwright project/helper paths, protected acceptance paths,
supporting-test locations and CI adoption must be approved/discovered later.
Do not install packages or copy the reusable workflow wholesale as an ingestion
side effect.

Phase 7's frozen plan belongs at `specs/runtime-governance.md` under the reviewed
acceptance root. Phase 8 test paths must follow the workflow guard's supported
layout under that same root. No such plan or test is created now. Supporting
unit/integration tests remain outside protected acceptance paths. Select an
external execution-evidence file before freeze; red runs and subsequent changing
status must never be written into a frozen plan.
