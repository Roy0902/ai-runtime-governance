# Phase 1 Requirements Specification

## Status and purpose

This is a requirements draft for developers and coding agents, not a statement
of implemented capability or production readiness. It defines the initial
release of AI Runtime Governance as an AI-agent monitor with a prompt guard. The
[README](./README.md) describes the product direction; the
[technical baseline](./TECHNICAL_BASELINE.md) describes the selected architecture.

The release focus is prompt guarding and visualization of the observable agent
activity loop. The earlier broad service, account/workspace, BYOK, payload
archive, attachment-scanning, and offline-analysis scope is not a Phase 1
acceptance gate; those capabilities remain candidates for later product
decisions.

Requirement IDs are stable references. **Confirmed** requirements express
approved behavior; the release boundary identifies which are Phase 1 gates.
**Deferred** requirements remain outside Phase 1 and are not acceptance gates.
**Proposed** requirements and numeric targets need review and are not approved
defaults. Open decisions identify gaps that block the affected implementation
or release acceptance. MUST applies to confirmed requirements; proposed rows
describe candidate behavior only.

Each requirement below includes an observable acceptance criterion. Detailed
test implementations and physical database schemas are outside this document.

## Terms and actors

- **Workspace / tenant:** an isolated ownership and authorization boundary.
  One user may belong to multiple workspaces; a workspace may have many users.
- **User:** an account authenticated through an external OIDC provider.
- **Owner, operator, viewer:** workspace roles; not deployment administrator roles.
- **Deployment administrator:** operates the service, OIDC configuration,
  encryption keys, and secret-manager connection. Tenant-data access for this
  actor remains an open decision; deployment access is not implicitly a UI role.
- **Runtime client:** a program using workspace-bound service credentials.
- **Integration:** the supported runtime instrumentation and/or gateway
  boundary. The first boundary is not yet selected.
- **Monitored activity:** agent, model, and tool events reported by a supported
  integration. Activity outside that boundary is not visible to the monitor.
- **Reasoning loop:** the ordered observable execution sequence, including
  model calls, tool calls/results, retries, handoffs, and failures. It does not
  mean private hidden chain-of-thought.
- **Prompt guard:** configured checks applied to a prompt before it is forwarded
  to a model.
- **Ordinary payload:** prompt, model response, or tool input/output, excluding
  identified reasoning fields and integration credentials.
- **Reasoning artifact:** model/runtime-exposed reasoning telemetry; unavailable
  private reasoning is neither inferred nor reconstructed.

## Release boundary

Included: configured prompt-content, sensitive-data, and injection/safety checks;
allow, deny, redact, and human-approval outcomes; correlation of guard decisions
with observable agent activity; and a timeline of the reported model/tool
execution loop.

The first runtime/gateway integration, detector and rule mechanics, exact
approval workflow, payload retention, account/workspace model, credential
management, and deployment shape are not silently selected by this release
boundary. Workspace administration, BYOK, ordinary archives, attachment
scanning, output findings, offline analysis, and enterprise features are not
Phase 1 acceptance gates. No support is claimed for activity that bypasses the
selected integration. Tool-event observation is not tool-action authorization;
tool servers retain their own authorization responsibilities.

## Primary workflows

1. A runtime sends a prompt through the selected supported integration.
2. The prompt guard evaluates configured content, sensitive-data, and
   injection/safety checks and records the applicable rules and decision.
3. An allowed prompt is forwarded; a denied prompt is not forwarded; a redacted
   prompt is forwarded only in its guarded form; a prompt awaiting approval is
   not forwarded until approval is resolved.
4. The integration reports observable agent, model, tool, retry, handoff, and
   error activity associated with the prompt's trace.
5. A user inspects the ordered activity timeline and can distinguish observed
   events from unavailable or missing telemetry. The timeline does not require
   private reasoning text.

## Functional requirements and acceptance criteria

### Prompt guarding and agent-activity monitoring

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| GUARD-001 | Confirmed | The prompt guard MUST support configured checks for prompt content rules, sensitive data, and injection/safety indicators before model forwarding. Detector mechanisms and coverage must be explicit; the system MUST NOT imply complete detection. | Representative rule fixtures produce attributable findings; unsupported checks and detector failures are surfaced distinctly from a clean result. |
| GUARD-002 | Confirmed | A prompt decision MUST support allow, deny, redact, and require-approval outcomes. Denied prompts MUST NOT be forwarded; redacted prompts MUST be forwarded only in the redacted form; approval-pending prompts MUST NOT be forwarded. | Tests inspect the exact upstream payload and verify no dispatch for denial or pending approval, and verify redaction is applied before dispatch. |
| GUARD-003 | Confirmed | Guard evaluation failure, timeout, or unavailable required policy MUST NOT implicitly allow prompt forwarding. | Injected detector/policy failures return structured errors and cause no upstream dispatch; late results cannot authorize a request after its deadline. |
| MON-001 | Confirmed | The system MUST correlate prompt decisions with observable agent, model, and tool activity, including available retries, handoffs, results, errors, and completion state. | A supported execution yields a trace linking the prompt decision with reported execution events; events that cannot be observed are not fabricated. |
| MON-002 | Confirmed | The timeline MUST visualize event order, hierarchy, status, and duration where available, and distinguish missing or unsupported telemetry from an empty activity sequence. | Timeline tests show ordered nested events and explicit incomplete/unsupported states without representing absence of telemetry as proof no activity occurred. |
| MON-003 | Confirmed | “Reasoning loop” in the product MUST refer to the observable execution sequence, not private hidden chain-of-thought. Private reasoning MUST NOT be inferred or reconstructed. | A trace remains useful with reasoning-text capture disabled or unavailable; UI labels activity events without claiming they are complete private reasoning. |

### Accounts, workspaces, and authorization (deferred platform requirements)

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| IAM-001 | Deferred | Public registration/login MUST use an external OIDC provider; the application MUST support account/profile management without implementing native passwords. | A new user can register, log in, inspect/update supported profile fields, and log out; no local password endpoint is required. Recovery is routed to the identity provider. Exact editable fields and deletion workflow are OD-02. |
| IAM-002 | Deferred | Authenticated users MUST be able to create and manage multiple workspaces without operator approval. | One account creates two distinct workspaces, renames them, and selects either using authorized membership; no implicit single-workspace restriction appears. |
| IAM-003 | Deferred | Workspaces MUST support invitations, member removal, owner/operator/viewer assignments, and safe ownership transfer. | An accepted invitation grants the assigned workspace role; removal revokes access; ownership can be transferred without leaving a workspace ownerless. Identity matching and concurrency rules are OD-02. |
| IAM-004 | Deferred | Every workspace-owned read/write MUST authorize authenticated membership or workspace-bound runtime credentials. A caller-supplied workspace ID alone MUST NOT grant access. | A member can select their own workspace but cannot read, mutate, reference, or attach resources from another workspace, including through guessed IDs and artifact links. |
| IAM-005 | Deferred | Runtime credentials MUST be workspace-bound, scope-limited, and revocable. | A credential cannot access another workspace or owner-management APIs; revoking it blocks subsequent authenticated operations. Expiry/revocation timing is OD-02. |
| IAM-006 | Deferred | Workspace deletion MUST be an explicit authorized workflow covering membership, integrations, credentials, and retained data. | After deletion begins, new governed execution is blocked; data/credential cleanup has an inspectable outcome rather than a success response with inaccessible orphaned records. Completion and backup rules are OD-07. |

#### Proposed workspace permission matrix

This is a proposal for OD-02, not an already approved permission model.
Workspace membership does not automatically grant integration provider secrets.

| Capability | Owner | Operator | Viewer |
|---|---|---|---|
| View trace metadata | Yes | Yes | Yes |
| Read archived ordinary payloads | Yes | Yes | No |
| Create/edit/activate policies | Yes | Yes | No |
| Configure integrations and stored credentials | Yes | No | No |
| Issue/revoke runtime credentials | Yes | No | No |
| Change archive settings | Yes | No | No |
| Invite/remove members and change roles | Yes | No | No |
| Transfer ownership or delete workspace | Yes | No | No |

### Integrations and secrets

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| INT-001 | Confirmed | Phase 1 MUST support a selected agent integration boundary that can apply prompt decisions before forwarding and report the supported activity events. The boundary may use runtime instrumentation, a gateway, or both; selection is OD-01. | A prompt denied or awaiting approval is not forwarded, and supported model/tool activity appears in its trace. Unsupported integration operations return explicit errors; bypassed activity is not claimed as monitored. |
| INT-002 | Deferred | Workspace owners MUST be able to configure their own supported model/MCP credentials in the UI. | The owner configures an integration and the workspace runtime uses it; another workspace cannot use it, and signup alone provides no shared provider credentials. |
| INT-003 | Deferred | Both encrypted server-side credential storage and an external secret-manager integration MUST be supported. | The same supported integration succeeds using each mode; unavailable keys or unauthorized references produce explicit failures with no plaintext fallback. Product/authentication selection is OD-03. |
| INT-004 | Deferred | Submitted secrets MUST be write-only in the UI/API and excluded from logs, traces, ordinary archives, and error bodies. Deployment encryption keys MUST NOT be sent to clients. | Credential-read responses expose only non-secret status/identifiers; controlled credential values do not appear in inspected persistence/log/export paths during success and failure tests. |
| INT-005 | Deferred | Tenant-configurable destinations and secret references MUST be constrained by deployment-authorized access, not trusted as arbitrary URLs or secret paths. | Attempts to reach disallowed internal destinations or another workspace's secret reference are rejected before use. Exact destination/reference rules are OD-03. |
| INT-006 | Proposed | Credential replacement, revocation, and encryption-key rotation should have explicit versions and failure behavior without exposing old values. | Rotation tests show which subsequent requests use the new credential, and unavailable credentials block invocation; rollback and in-flight behavior are specified before implementation. |

### Policy management and enforcement

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| POL-001 | Proposed | The prompt-guard rule configuration mechanism should support validation and activation; a workspace policy-editing UI is not a Phase 1 assumption. | Invalid rules are rejected without replacing the active configuration; runtime decisions identify the configuration version. The interface and activation semantics are OD-04. |
| POL-002 | Confirmed | Prompt-guard decisions MUST support allow, deny, redact, and require approval. Rule precedence, unmatched behavior, and the exact approval contract are OD-04. | Each decision identifies its matched rules; deny prevents forwarding, redact forwards only the transformed prompt, approval-pending waits, and an approved prompt proceeds only under the resolved approval contract. |
| POL-003 | Confirmed | Prompt forwarding MUST wait for successful required evaluation; unavailable or erroneous evaluation MUST NOT implicitly allow it. | Evaluation timeout, missing policy, detector failure, and evaluator failure produce structured errors and no forwarding. Signed cached fallback is not used. |
| POL-004 | Confirmed | Phase 1 enforcement MUST apply to prompts at the supported integration boundary. Tool/output telemetry MUST NOT be presented as enforced action/output policy. | Guard decisions are enforced before prompt forwarding; observed tool actions and output events are labeled as monitoring evidence, not service authorization or output approval. |
| POL-005 | Proposed | Each governed input request should use an immutable active-policy snapshot. | Concurrent policy activation cannot mix undocumented rule versions; decisions retain version and matched-rule identifiers. Snapshot and revocation semantics are OD-04. |
| POL-006 | Confirmed | Policy decisions MUST include an explicit outcome, policy identity/version, and machine-readable explanation code without treating model rationale as authority. | The timeline/API identifies why an operation was denied and which version decided it; fabricated model-supplied outcomes cannot authorize execution. |

### Prompt processing and integration boundaries

The prompt guard evaluates configured prompt content, sensitive-data, and
injection/safety checks before forwarding. Structural parsing, request-size
limits, supported-field validation, and destination checks remain necessary
boundary controls but are not substitutes for content checks. Detector coverage,
failure behavior, and approval details are documented explicitly; no check is
represented as complete safety detection.

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| INP-001 | Proposed | If the selected integration accepts JSON requests, it should define explicit encoding, size, nesting, duplicate-key, and schema limits and reject malformed or unsupported input before dispatch. | Boundary tests cover the selected integration's documented limits. Exact wire format and limits depend on OD-01 and OD-08. |
| INP-002 | Confirmed | The selected integration MUST validate the request boundary and run configured prompt-guard checks before forwarding. Malformed or uninspectable input MUST NOT be truncated, forwarded, or accepted by skipping required checks. This is not authorization of individual tool calls. | Invalid boundary inputs and triggered guard rules produce explicit outcomes. Validation errors remain distinguishable from guard decisions. Supported boundary, rules, and detectors are OD-01 and OD-04. |
| INP-003 | Proposed | Prompt-guard evaluation should have a bounded deadline appropriate to the selected integration; expiry must prevent dispatch and late results must not authorize execution. | Injected processing delay causes a structured timeout and no upstream invocation. Exact deadline and measurement boundary are OD-01 and OD-08. |

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| GW-001 | Deferred | The earlier mandatory pre-delivery output-policy buffering requirement is superseded. No blocking output-content/schema validation is required in Phase 1. | Not a release gate. Delivery and transport/resource bounds remain OD-10 and GW-004; necessary protocol parsing/error handling is not a content safeguard. |
| GW-002 | Deferred | Per-tool action governance and human approvals are outside current enforcement scope, including agent built-in tools. | Not a release gate. Observation must not claim execution was authorized by this service; MCP/tool servers retain their own permissions. |
| GW-003 | Confirmed | Upstream errors, deadlines, cancellation, and uncertain side-effect outcomes MUST be surfaced without reporting success or blindly retrying tool execution. | Cancellation is propagated where supported; an interrupted side-effecting call is marked with an uncertain outcome when completion cannot be established, not automatically repeated. |
| GW-004 | Confirmed | Requests, output buffers, queues, connections, and CPU processing MUST have explicit bounds and overload behavior. | Limit tests reject or backpressure excess work with structured errors without unbounded buffer growth; concrete limits are proposed in the targets section. |

### Advisory output analysis

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| OUT-001 | Deferred | Advisory secret/credential and PII findings on model responses and tool results are not a Phase 1 requirement. If added later, findings must not block, redact, or hold output. | Not a Phase 1 release gate. Scope and processing behavior require a separate decision under OD-10. |
| OUT-002 | Deferred | Output scan status and findings are not a Phase 1 requirement. Any future findings must be authorization-scoped and must not expose sensitive values. | Not a Phase 1 release gate. |

This feature is for timeline visualization and advisory detection, not response
schema/content enforcement. Ordinary protocol parsing, upstream error reporting
and resource limits remain necessary for service reliability. Scan access,
retention/consent, scheduling and overload behavior are unresolved: enabling
analysis must not silently enable output archives or temporary storage.

### Asynchronous advisory attachment scanning (deferred)

This path does not hold a prompt for scanning, redact its contents, or undo
disclosure. An attachment may reach the model before a finding exists.
Synchronous authentication, structural checks, destination restrictions and
configured allow/deny policies still apply. The 500 ms INP-003 deadline does
not include background scanning.

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| FIL-001 | Deferred | Attached-file scanning is not a Phase 1 requirement. If introduced later, it must be advisory and must not delay prompt dispatch while awaiting scan results. | Not a Phase 1 release gate. |
| FIL-002 | Deferred | Attachment scan storage and consent are not a Phase 1 requirement. Any later scan copy must have an explicit lifecycle and must not silently become an archive. | Not a Phase 1 release gate. |
| FIL-003 | Deferred | Attachment scan findings and statuses are not a Phase 1 requirement. Any future findings must be linked to the correct trace and must not expose raw sensitive data. | Not a Phase 1 release gate. |
| FIL-004 | Deferred | Attachment scanner dependencies and processing restrictions are not a Phase 1 requirement. Any later scanner selection requires review of local processing, model use, and external data submission. | Not a Phase 1 release gate. |

Supported file types, extractors, detection rules and scan-storage/worker bounds
are OD-09. No claim is made to inspect every format or detect every sensitive
value or attack. Files are untrusted input; local scanning does not make them
trusted or replace execution-boundary controls. Upload/reference contracts
must be defined separately; the 1 MiB JSON-body limit is not an implicit
attachment-file size limit or approval for arbitrary file retrieval.

### Events, timeline, and APIs

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| EVT-001 | Confirmed | Authenticated ingestion MUST persist events within the configured authorization scope and correlate prompt decisions with reported agent/model/tool activity by trace and span. | A supported execution produces a reconstructable activity timeline; forged identity or policy authority is rejected. |
| EVT-002 | Proposed | Events should be versioned and include event ID, authorization-scope ID where applicable, trace/span/parent IDs, type, source time when available, server receipt time, producer identity, status, and applicable guard/error/payload references. | Unknown required versions fail explicitly; missing applicable fields are rejected; absent optional telemetry is not fabricated. Detailed optionality is OD-05. |
| EVT-003 | Proposed | Duplicate event IDs with identical content should be idempotent within the authorization scope; conflicting duplicates should be rejected. Out-of-order and missing-parent events should remain inspectable. | Retrying an identical event does not duplicate the timeline; conflicting content raises an error; late parents can restore hierarchy without pretending timestamps are globally ordered. |
| UI-001 | Confirmed | The UI MUST provide an authorized trace list and nested activity timeline showing prompt-guard outcomes, event order, duration, status, and explicit missing/incomplete telemetry. | Users locate a trace and expand its guard, agent, model, and tool events; an interrupted trace is distinguishable from a successful completed trace. |
| UI-002 | Proposed | Trace listing should support bounded pagination and filters for time range, application, status, and trace ID; running traces should be refreshable without live token streaming. | Pagination has deterministic continuation; applying filters excludes nonmatching traces; refreshing reveals newly persisted events. Query contract is OD-05. |
| API-001 | Confirmed | API errors MUST be structured and distinguish authentication, authorization, validation, policy denial, limits, dependency failure, and execution uncertainty without leaking secrets. | Each failure class has an inspectable machine code and correlation identifier; no failure returns a success-shaped payload. HTTP mappings are OD-05. |

### Payload archives and reasoning exclusion

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| ARC-001 | Deferred | Ordinary prompt/response/tool payload archives are not a Phase 1 requirement. | Not a Phase 1 release gate; future archive behavior requires explicit consent and lifecycle decisions. |
| ARC-002 | Confirmed | Reasoning text MUST NOT be archived or displayed in Phase 1, including reasoning embedded in generic model-response objects. | Supported reasoning fields are filtered before logs, queues, spools, exports, or ordinary archives; only availability/capture status is recorded. No claim is made to detect every unstructured explanation. |
| ARC-003 | Deferred | Archive toggle and retention behavior are not a Phase 1 requirement. | Not a Phase 1 release gate. |
| ARC-004 | Deferred | Archive size, quota, retention, deletion, and storage-failure behavior are not a Phase 1 requirement. | These decisions are required before any later archive path is enabled. |
| ARC-005 | Proposed | Retained text artifacts should use lossless compression where beneficial, with encoding/version, stored and original byte counts, and integrity metadata; sensitive data requires separate protection. | A compressed artifact round-trips exactly, size savings are measured on representative data, and corrupt/oversized decoded data fails explicitly. Codec is OD-07; no fixed compression ratio is promised. |
| ARC-006 | Deferred | On-demand retrieval of archived bodies is not a Phase 1 requirement. | Not a Phase 1 release gate. |

## Reliability and operational requirements

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| OPS-001 | Proposed | The release should provide a documented deployment for the selected integration and initial users. | A clean installation completes the prompt-guard and activity-timeline workflow; deployment targets and authentication model are selected before acceptance. |
| OPS-002 | Confirmed | Authoritative policy/decision storage MUST be distinguished from asynchronous indexing/UI/export. Failures MUST not silently erase decisions or authorize execution. | UI/indexing outage does not become an allow decision; decision transaction/outbox failure prevents the associated new governed invocation. Post-execution write failure is surfaced as incomplete/uncertain, never a rollback of external side effects. |
| OPS-003 | Confirmed | Background processing MUST be bounded and expose retries, exhausted attempts, and dead-letter/failure state. | A failed job is observable, retries respect configured limits, and exhaustion remains inspectable instead of being silently dropped. |
| OPS-004 | Proposed | Operational metrics should expose policy latency, gateway failures, queue depth, archive bytes/ratio, rejected requests, and worker failures without sensitive payload labels. | Representative requests increment expected metrics; provider secrets and message text do not appear in metric labels. |
| OPS-005 | Confirmed | Production acceptance MUST include documented backup/restore and failure tests, not infer durability or capacity from hardware estimates. | Restore recovers a consistent workspace/policy/trace dataset under the agreed recovery objectives, including explicit treatment of artifacts, keys, and deletion state. Objectives are OD-08. |

## Proposed limits and measurable targets

These are review candidates, not approved defaults or measured results.
Use the baseline's 2 vCPU/4 GB reference host with inference hosted elsewhere.
Payload-sensitive tests must use bounded synthetic data, not real secrets.
The input body/parsing limits and 500 ms deadline in INP-001 through INP-003
are confirmed separately and are not proposals in this table.

| Candidate | Proposed value / method |
|---|---|
| Output processing | No approved delivery/buffer limit yet; define transport and advisory scan bounds under OD-10 |
| Concurrent upstream calls | 8 deployment-wide initially, with per-workspace admission control still to define |
| Policy overhead | p95 <= 100 ms for local deterministic evaluation under the agreed 8-call workload; exclude upstream model/tool latency |
| Timeline query | p95 <= 500 ms for first page of 50 traces over 100,000 stored events |
| Ordinary artifact archive | 2 MiB original size per artifact; 1 GiB stored-byte workspace quota |
| Retention | 7 days ordinary payloads; 30 days trace metadata |
| Compression evaluation | Report original/stored bytes and CPU cost on the same representative corpus; verify lossless recovery, not a promised ratio |

OD-08 must specify benchmark duration, dataset distribution, warmup, sample count,
timeouts, overload responses, storage layout, and memory accounting before
performance acceptance is meaningful. Workspace/account creation limits,
decompressed-size limits, and backup recovery objectives remain open.

## Acceptance scenario traceability

Every requirement has a criterion above. The following cross-feature scenarios
provide a release review checklist; proposed requirements become mandatory only
after approval.

| Scenario | Requirements exercised | Expected evidence |
|---|---|---|
| AT-01 Prompt guard outcomes | GUARD-001, GUARD-002, GUARD-003, POL-002, POL-003, INP-002 | Configured checks, attributable outcomes, exact forwarded payload, no dispatch on deny/failure/pending approval |
| AT-02 Observable agent activity loop | MON-001, MON-002, MON-003, EVT-001, UI-001 | Correlated prompt decision and ordered model/tool/agent events; missing telemetry is explicit; no private reasoning required |
| AT-03 Integration and trace reliability | INT-001, EVT-002, EVT-003, GW-003, API-001 | Selected-boundary behavior, duplicate/out-of-order events, typed errors, cancellation and uncertain outcomes |
| AT-04 Guard policy lifecycle | POL-001, POL-005, POL-006 | Rule validation, activation, attribution, and safe behavior across policy changes |
| AT-05 Deployment and recovery | OPS-001, OPS-002, OPS-003, OPS-005 | Documented selected deployment, failure injection, no implicit allow, recovery evidence |

## Open decisions and release gates

An open decision blocks readiness of its affected path; it does not permit an
implementation agent to silently pick behavior. The full Phase 1 release cannot
be accepted until its required paths have resolved decisions and passing tests.

| ID | Decision needed | Affected gate |
|---|---|---|
| OD-01 | First integration boundary (runtime instrumentation, gateway, or both), first supported runtime, event hooks, prompt interception/forwarding contract, compatibility, authentication, and bypass limitations | Prompt enforcement and activity monitoring end to end |
| OD-02 | OIDC provider, profile/account deletion, verified invitation matching, role matrix, owner cardinality/transfer, session and runtime credential expiry/revocation | Accounts, workspace lifecycle, authorization |
| OD-03 | External secret manager, service identity and permitted references, encryption key lifecycle, rotation, allowed destinations/redirect behavior | Both credential modes and safe BYOK invocation |
| OD-04 | Prompt-rule vocabulary and precedence; supported content, sensitive-data, and injection/safety checks; detector approach and limits; redaction behavior; allow/deny/approval semantics; policy snapshot/activation/revocation | Prompt-guard decisions and safe forwarding |
| OD-05 | Versioned API/event shapes, field optionality, timestamps/sequence, duplication/conflicts, status transitions, filtering, pagination and HTTP error mapping | Ingestion, gateway clients, timeline |
| OD-06 | Behavior when guard decisions or required activity events cannot be durably recorded; exact decision, dispatch, retry, and uncertain-result boundaries | Reliable prompt enforcement and trace integrity |
| OD-07 | Archive consent granularity, in-flight cutoff, encryption, codec/chunking, quotas, expiry/deletion and backups, storage failure behavior | Deferred archive enablement |
| OD-08 | Review proposed numeric limits; define workload, admission fairness, timeouts, abuse controls, capacity and backup/recovery targets | Performance and production acceptance |
| OD-09 | Attachment upload/reference contract and authorization, supported formats/extractors, scanner methods, safe parsing/isolation, file/expanded-size limits, scan concurrency/time limits, temporary storage lifecycle and overload handling | Deferred attachment-scanning enablement |
| OD-10 | Output delivery mode and protocol/resource bounds; any future output scanner's methods, consent/retention, scheduling, and overload behavior independent of archives | Deferred advisory output analysis; no mandatory buffering or scan-storage choice is implied |

## Consistency rules for future work

Do not treat deployment credentials as workspace member credentials, timestamps
as trusted ordering, tracing as proof of enforcement, compression as redaction,
or output denial as reversal of a tool side effect. Do not promise complete
reasoning or governance for unsupported providers and bypass paths.

Resolve affected decisions explicitly, preserve deferrals, and update the
blueprint when approved requirements change. A finished draft can still contain
release blockers; it is not evidence that the project is implementation-ready.
