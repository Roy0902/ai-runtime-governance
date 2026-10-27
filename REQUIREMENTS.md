# Phase 1 Requirements Specification

## Status and purpose

This is a requirements draft for developers and coding agents, not a statement
of implemented capability or production readiness. It defines the initial
release of AI Runtime Governance. The
[README](./README.md) describes the product direction; the
[technical baseline](./TECHNICAL_BASELINE.md) describes the selected architecture.

The Phase 1 scope was explicitly expanded beyond the original vertical slice
to include public accounts, workspace management, policy editing, both secret
storage modes, and opt-in ordinary payload archives.

Requirement IDs are stable references. **Confirmed** requirements express
approved scope or behavior. **Deferred** IDs preserve references to superseded
release requirements and are not Phase 1 acceptance gates. **Proposed** requirements and numeric targets need
review and are not approved defaults. Open decisions identify gaps that block
the affected implementation or release acceptance. MUST applies to confirmed
requirements; proposed rows describe candidate behavior only.

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
- **Integration:** the selected model API or MCP connection supported by Phase 1.
- **Governed operation:** an operation whose supported execution boundary is
  controlled by the gateway. Activity bypassing that boundary is not governed.
- **Ordinary payload:** prompt, model response, or tool input/output, excluding
  identified reasoning fields and integration credentials.
- **Reasoning artifact:** model/runtime-exposed reasoning telemetry; unavailable
  private reasoning is neither inferred nor reconstructed.

## Release boundary

Included: one direct model API integration, one MCP integration, gateway
input enforcement through deterministic allow/deny checks, event persistence,
trace timeline, OIDC public accounts, self-service workspaces, team management,
policy UI, BYOK, two secret-storage modes, bounded opt-in ordinary archives,
opt-in asynchronous advisory attachment scanning, and advisory secret/PII
findings on observed model/tool outputs.

Deferred: tool-action and output-content policy enforcement, human approvals,
quarantine and constraint/redaction decisions,
advanced/model-based content scanning, reasoning archives or live reasoning views,
subagent propagation, general-purpose adapter coverage,
offline cached enforcement, offline recommendations, high availability, and
enterprise compliance certification. No billing/subscription system is specified.

Public accounts do not imply free shared provider credits, unlimited resources,
or arbitrary network access. Proposals for limits must be reviewed explicitly.
Output delivery mode (streaming versus buffering) is unresolved, not implicitly
approved or deferred. Output analysis serves the timeline and does not gate
delivery. Built-in agent tools are outside enforcement scope; supplied telemetry
is observation-only. Tool servers retain their own authorization responsibilities.

## Primary workflows

1. A visitor registers through the configured OIDC provider, signs in, manages
   the application profile, and creates a workspace.
2. The owner invites members, assigns roles, and configures a supported model
   and MCP integration using BYOK or an authorized secret reference.
3. An authorized policy editor creates and validates a draft, then activates a
   version that explicitly permits intended input requests.
4. A runtime authenticates to the workspace gateway. The gateway checks input,
   permits or denies the input request, and records available tool/output activity.
   No per-tool action approval or output-content gate is applied in this release.
5. Members inspect trace metadata and policy results in the timeline. Ordinary
   payloads are accessible only if archived and authorized. Reasoning text is
   not archived or displayed in Phase 1.
6. The owner optionally enables ordinary payload archives after a sensitive-data
   warning, or disables future capture. Existing archives follow explicit
   retention/deletion rules, not an implied immediate purge.

## Functional requirements and acceptance criteria

### Accounts, workspaces, and authorization

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| IAM-001 | Confirmed | Public registration/login MUST use an external OIDC provider; the application MUST support account/profile management without implementing native passwords. | A new user can register, log in, inspect/update supported profile fields, and log out; no local password endpoint is required. Recovery is routed to the identity provider. Exact editable fields and deletion workflow are OD-02. |
| IAM-002 | Confirmed | Authenticated users MUST be able to create and manage multiple workspaces without operator approval. | One account creates two distinct workspaces, renames them, and selects either using authorized membership; no implicit single-workspace restriction appears. |
| IAM-003 | Confirmed | Workspaces MUST support invitations, member removal, owner/operator/viewer assignments, and safe ownership transfer. | An accepted invitation grants the assigned workspace role; removal revokes access; ownership can be transferred without leaving a workspace ownerless. Identity matching and concurrency rules are OD-02. |
| IAM-004 | Confirmed | Every workspace-owned read/write MUST authorize authenticated membership or workspace-bound runtime credentials. A caller-supplied workspace ID alone MUST NOT grant access. | A member can select their own workspace but cannot read, mutate, reference, or attach resources from another workspace, including through guessed IDs and artifact links. |
| IAM-005 | Confirmed | Runtime credentials MUST be workspace-bound, scope-limited, and revocable. | A credential cannot access another workspace or owner-management APIs; revoking it blocks subsequent authenticated operations. Expiry/revocation timing is OD-02. |
| IAM-006 | Confirmed | Workspace deletion MUST be an explicit authorized workflow covering membership, integrations, credentials, and retained data. | After deletion begins, new governed execution is blocked; data/credential cleanup has an inspectable outcome rather than a success response with inaccessible orphaned records. Completion and backup rules are OD-07. |

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
| INT-001 | Confirmed | Phase 1 MUST support one selected direct model API and one selected MCP integration with documented input-enforcement and observation boundaries. | A permitted model request produces a response and selected MCP activity appears in its trace; no claim is made of per-tool policy enforcement. Unsupported integration operations return explicit errors. Selection/transport is OD-01. |
| INT-002 | Confirmed | Workspace owners MUST be able to configure their own supported model/MCP credentials in the UI. | The owner configures an integration and the workspace runtime uses it; another workspace cannot use it, and signup alone provides no shared provider credentials. |
| INT-003 | Confirmed | Both encrypted server-side credential storage and an external secret-manager integration MUST be supported. | The same supported integration succeeds using each mode; unavailable keys or unauthorized references produce explicit failures with no plaintext fallback. Product/authentication selection is OD-03. |
| INT-004 | Confirmed | Submitted secrets MUST be write-only in the UI/API and excluded from logs, traces, ordinary archives, and error bodies. Deployment encryption keys MUST NOT be sent to clients. | Credential-read responses expose only non-secret status/identifiers; controlled credential values do not appear in inspected persistence/log/export paths during success and failure tests. |
| INT-005 | Confirmed | Tenant-configurable destinations and secret references MUST be constrained by deployment-authorized access, not trusted as arbitrary URLs or secret paths. | Attempts to reach disallowed internal destinations or another workspace's secret reference are rejected before use. Exact destination/reference rules are OD-03. |
| INT-006 | Proposed | Credential replacement, revocation, and encryption-key rotation should have explicit versions and failure behavior without exposing old values. | Rotation tests show which subsequent requests use the new credential, and unavailable credentials block invocation; rollback and in-flight behavior are specified before implementation. |

### Policy management and enforcement

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| POL-001 | Confirmed | Authorized members MUST be able to create, edit, validate, and activate workspace policies through a UI. | A valid draft becomes active; invalid policy is rejected without replacing the active policy. Runtime evaluation reports the policy version actually used. |
| POL-002 | Confirmed | Input-policy results MUST be allow or deny; deny MUST override matching allows, and unmatched input requests MUST be denied. | Matching deny+allow yields deny, explicit allow without deny permits the input request, and no match prevents its forwarding. Tool/output findings are not evaluated as blocking decisions. |
| POL-003 | Confirmed | Input forwarding MUST wait for successful required evaluation; unavailable or erroneous evaluation MUST NOT implicitly allow it. | Evaluation timeout, missing policy, and evaluator failure produce structured errors and no forwarding of that input. Signed cached fallback is not used; advisory scan failures are not input-policy failures. |
| POL-004 | Confirmed | Enforcement MUST apply only at the supported input boundary in Phase 1. Tool/output telemetry and advisory findings MUST NOT be presented as enforced action/output policy. | Denied input is not forwarded; observed tool actions and output findings are labeled as observation/advisory, not approval or denial. Built-in tools are not intercepted for enforcement. |
| POL-005 | Proposed | Each governed input request should use an immutable active-policy snapshot. | Concurrent policy activation cannot mix undocumented rule versions; decisions retain version and matched-rule identifiers. Snapshot and revocation semantics are OD-04. |
| POL-006 | Confirmed | Policy decisions MUST include an explicit outcome, policy identity/version, and machine-readable explanation code without treating model rationale as authority. | The timeline/API identifies why an operation was denied and which version decided it; fabricated model-supplied outcomes cannot authorize execution. |

### Gateway execution and output handling

Phase 1 synchronous input safeguards validate execution boundaries, not message
meaning. New prompt-text content scanning is not included; users remain
responsible for not supplying PII. Attachments have a separate opt-in advisory
scan path below, not a blocking semantic safety check. See the
[PD-01 processing decision](./PENDING-DESIGN-DECISIONS.md#pd-01-input-safeguards-and-supported-detection).

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| INP-001 | Confirmed | Input MUST be UTF-8 JSON, at most 1 MiB (1,048,576 bytes), with maximum container depth 32 including the root container. Enforce size during reading; reject duplicate keys, compressed bodies, unsupported encodings and schema-unsupported fields. | Valid schema-conforming requests at byte/depth limits pass validation; limit+1, invalid UTF-8/JSON, duplicate keys, compressed bodies and unsupported fields fail explicitly without dispatch or silent field removal. |
| INP-002 | Confirmed | Input safeguards MUST validate request structure, supported fields, authorized model/destination and permitted request parameters before forwarding. Malformed or uninspectable input MUST NOT be truncated, forwarded, or accepted by skipping checks. This is not authorization of individual tool calls. | Unsupported/unauthorized model destinations and invalid request parameters are rejected. Validation errors remain distinguishable from policy denies; no semantic threat-detection or per-tool enforcement claim is made. Supported schemas/rules remain OD-01 and OD-04. |
| INP-003 | Confirmed | Local input processing MUST have a 500 ms elapsed-time deadline starting after full receipt of the bounded body, including parsing, schema/boundary checks and input-policy evaluation. Expiry MUST prevent dispatch and return a structured timeout; late results MUST NOT authorize execution. | Injected processing delay expires at the configured deadline with no upstream invocation even if evaluation later returns allow. Cancel work where supported; no assumption is made that elapsed-time timeout forcibly stops CPU work. Upload, prior authentication/admission, decision persistence and upstream calls require separate deadlines under OD-08. |

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| GW-001 | Deferred | The earlier mandatory pre-delivery output-policy buffering requirement is superseded. No blocking output-content/schema validation is required in Phase 1. | Not a release gate. Delivery and transport/resource bounds remain OD-10 and GW-004; necessary protocol parsing/error handling is not a content safeguard. |
| GW-002 | Deferred | Per-tool action governance and human approvals are outside current enforcement scope, including agent built-in tools. | Not a release gate. Observation must not claim execution was authorized by this service; MCP/tool servers retain their own permissions. |
| GW-003 | Confirmed | Upstream errors, deadlines, cancellation, and uncertain side-effect outcomes MUST be surfaced without reporting success or blindly retrying tool execution. | Cancellation is propagated where supported; an interrupted side-effecting call is marked with an uncertain outcome when completion cannot be established, not automatically repeated. |
| GW-004 | Confirmed | Requests, output buffers, queues, connections, and CPU processing MUST have explicit bounds and overload behavior. | Limit tests reject or backpressure excess work with structured errors without unbounded buffer growth; concrete limits are proposed in the targets section. |

### Advisory output analysis

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| OUT-001 | Confirmed | Observed model responses and tool results MUST support advisory secret/credential and PII findings using explicitly supported local non-model rules. Findings MUST NOT block, redact, or hold output awaiting analysis, or trigger action approval. | A finding is associated with its trace/span in the timeline without changing delivery into a policy denial. Coverage is documented, not represented as complete detection. Packages/rules remain OD-10. |
| OUT-002 | Confirmed | Output scan status and findings MUST remain workspace-scoped and MUST NOT expose detected secret/PII values in finding metadata. Unsupported, failed, skipped or incomplete inspection MUST NOT imply a clean scan. | Timeline tests distinguish scan completion from execution success and show safe finding descriptions without synthetic sensitive values. |

This feature is for timeline visualization and advisory detection, not response
schema/content enforcement. Ordinary protocol parsing, upstream error reporting
and resource limits remain necessary for service reliability. Scan access,
retention/consent, scheduling and overload behavior are unresolved: enabling
analysis must not silently enable output archives or temporary storage.

### Asynchronous advisory attachment scanning

This path does not hold a prompt for scanning, redact its contents, or undo
disclosure. An attachment may reach the model before a finding exists.
Synchronous authentication, structural checks, destination restrictions and
configured allow/deny policies still apply. The 500 ms INP-003 deadline does
not include background scanning.

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| FIL-001 | Confirmed | When enabled, attached-file scanning MUST run asynchronously and be advisory only. Pending scans, findings and scan failures MUST NOT independently block or delay prompt dispatch awaiting a scan result. | A deliberately delayed or failed scan does not hold an otherwise permitted prompt; a later finding appears on its trace without retroactively marking execution denied. Ordinary authorization/limit violations can still reject the request. |
| FIL-002 | Confirmed | Scan storage MUST require explicit workspace opt-in separate from ordinary archive consent, and MUST be temporary, workspace-authorized, and deleted after scan completion or expiry. | With archives disabled, consenting to scanning permits only the temporary scan copy; without scan consent no such copy/job is created. Completion and expiry trigger deletion, with deletion failures surfaced and retried. No temporary copy silently becomes an archive. |
| FIL-003 | Confirmed | The timeline MUST associate scan status/findings with the correct trace and attachment, including disabled, pending, completed, failed, skipped/unsupported and expired states as applicable. Findings MUST NOT expose raw PII, secret values or file excerpts containing them. | A late finding remains visible after trace completion; unsupported or failed scans are not displayed as clean results. Cross-workspace reads are denied and synthetic sensitive values do not appear in findings. |
| FIL-004 | Confirmed | Scanners MUST run locally without model inference or external content submission. Dependencies that use ML/model inference, including locally hosted models, MUST be disclosed and separately approved before adoption. | Dependency review documents each scanner's processing method; the approved path neither loads an inference model nor sends file contents to an external detector. |

Supported file types, extractors, detection rules and scan-storage/worker bounds
are OD-09. No claim is made to inspect every format or detect every sensitive
value or attack. Files are untrusted input; local scanning does not make them
trusted or replace execution-boundary controls. Upload/reference contracts
must be defined separately; the 1 MiB JSON-body limit is not an implicit
attachment-file size limit or approval for arbitrary file retrieval.

### Events, timeline, and APIs

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| EVT-001 | Confirmed | Authenticated ingestion MUST persist workspace-scoped events and correlate model/tool/policy activity by trace and span. | A supported execution produces a reconstructable nested timeline, while forged workspace identity or policy authority is rejected. |
| EVT-002 | Proposed | Events should be versioned and include event ID, workspace ID, trace/span/parent IDs, type, source time when available, server receipt time, producer identity, status, and applicable policy/error/payload references. | Unknown required versions fail explicitly; missing applicable fields are rejected; absent optional telemetry is not fabricated. Detailed optionality is OD-05. |
| EVT-003 | Proposed | Duplicate event IDs with identical content should be idempotent within a workspace; conflicting duplicates should be rejected. Out-of-order and missing-parent events should remain inspectable. | Retrying an identical event does not duplicate the timeline; conflicting content raises an error; late parents can restore hierarchy without pretending timestamps are globally ordered. |
| UI-001 | Confirmed | The UI MUST provide a workspace-scoped trace list and nested timeline showing order, duration, status, policy outcomes, and explicit missing/incomplete telemetry. | Users locate a trace and expand its model/tool/policy spans; an interrupted trace is distinguishable from a successful completed trace. |
| UI-002 | Proposed | Trace listing should support bounded pagination and filters for time range, application, status, and trace ID; running traces should be refreshable without live token streaming. | Pagination has deterministic continuation; applying filters excludes nonmatching traces; refreshing reveals newly persisted events. Query contract is OD-05. |
| API-001 | Confirmed | API errors MUST be structured and distinguish authentication, authorization, validation, policy denial, limits, dependency failure, and execution uncertainty without leaking secrets. | Each failure class has an inspectable machine code and correlation identifier; no failure returns a success-shaped payload. HTTP mappings are OD-05. |

### Ordinary archives and reasoning exclusion

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| ARC-001 | Confirmed | Ordinary payload archives MUST be off by default and explicitly enabled by an authorized owner within tenant policy after a sensitive-data warning. | A fresh workspace execution retains metadata but no archived prompt/response/tool bodies; enabling it records eligible bounded artifacts. Warning does not claim redaction is implemented. |
| ARC-002 | Confirmed | Reasoning text MUST NOT be archived or displayed in Phase 1, including reasoning embedded in generic model-response objects. | Supported reasoning fields are filtered before logs, queues, spools, exports, or ordinary archives; only availability/capture status is recorded. No claim is made to detect every unstructured explanation. |
| ARC-003 | Confirmed | Disabling ordinary archives MUST stop subsequent capture; prior artifacts MUST follow explicit retention/deletion policy. Transient governance inspection MUST remain independent of archive settings. | Turning archiving off stops new eligible archive records but does not stop policy inspection; prior artifacts show their retained/deleted state according to the agreed lifecycle. In-flight cutoff is OD-07. |
| ARC-004 | Confirmed | Archive size, workspace quota, retention, deletion, and storage-failure behavior MUST be defined before this path is enabled. | Boundary tests do not exceed approved quotas silently; expired/deleted artifacts cannot be retrieved; full/unavailable storage produces explicit capture status. Values and backup handling are OD-07. |
| ARC-005 | Proposed | Retained text artifacts should use lossless compression where beneficial, with encoding/version, stored and original byte counts, and integrity metadata; sensitive data requires separate protection. | A compressed artifact round-trips exactly, size savings are measured on representative data, and corrupt/oversized decoded data fails explicitly. Codec is OD-07; no fixed compression ratio is promised. |
| ARC-006 | Confirmed | Large archived bodies MUST be referenced separately from timeline metadata and retrieved only on demand under workspace authorization. | Initial trace listing does not transfer full bodies; authorized expansion fetches the selected artifact; expired, unavailable, and disabled capture states are distinct. |

## Reliability and operational requirements

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| OPS-001 | Confirmed | The release MUST support the same authenticated API model on local and remote single-node installations using the selected baseline stack. | A documented installation completes the governed model/tool and timeline workflow through the same interfaces; no single-user authorization bypass is needed. |
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
| AT-01 Account and workspace lifecycle | IAM-001, IAM-002, IAM-003, IAM-006 | Registration, two workspaces, invitation, transfer, deletion state |
| AT-02 Cross-workspace and role isolation | IAM-004, IAM-005, INT-002, INT-005, ARC-006 | Denials across direct IDs, credentials, references, and artifact reads |
| AT-03 BYOK in both storage modes | INT-001, INT-003, INT-004, INT-006 | Successful authorized calls; unavailable/rotated secret failure tests |
| AT-04 Policy activation and precedence | POL-001, POL-002, POL-005, POL-006 | Invalid-draft rejection, default deny, deny override, version attribution |
| AT-05 Input enforcement and execution observation | INP-001, INP-002, INP-003, POL-003, POL-004, GW-003, GW-004 | Input boundaries, 500 ms deadline and late-result rejection, no denied input forwarding, observation-only tool/output labels, explicit failures |
| AT-06 Event ingestion and timeline | EVT-001, EVT-002, EVT-003, UI-001, UI-002, API-001 | Nested trace, duplicates/conflicts, late parent, pagination, typed errors |
| AT-07 Archives and reasoning exclusion | ARC-001, ARC-002, ARC-003, ARC-004, ARC-005, ARC-006 | Defaults, toggle cutoff, quota/expiry, round-trip, no retained reasoning fields |
| AT-08 Dependency failure and recovery | OPS-001, OPS-002, OPS-003, OPS-004, OPS-005 | Portable deployment, failure injection, worker exhaustion, restore evidence |
| AT-09 Advisory attachment scanning | FIL-001, FIL-002, FIL-003, FIL-004 | Nonblocking dispatch, independent consent, temporary-copy deletion, late findings, explicit unsupported/failure states and non-model dependency evidence |
| AT-10 Advisory output findings | OUT-001, OUT-002 | Secret/PII findings without delivery gating, safe metadata, workspace isolation and explicit scan status |

## Open decisions and release gates

An open decision blocks readiness of its affected path; it does not permit an
implementation agent to silently pick behavior. The full Phase 1 release cannot
be accepted until its required paths have resolved decisions and passing tests.

| ID | Decision needed | Affected gate |
|---|---|---|
| OD-01 | Model provider/API, MCP server/tool, transport/authentication, compatibility and tool-call ownership contract | Integration and governed end-to-end execution |
| OD-02 | OIDC provider, profile/account deletion, verified invitation matching, role matrix, owner cardinality/transfer, session and runtime credential expiry/revocation | Accounts, workspace lifecycle, authorization |
| OD-03 | External secret manager, service identity and permitted references, encryption key lifecycle, rotation, allowed destinations/redirect behavior | Both credential modes and safe BYOK invocation |
| OD-04 | Input-policy rule vocabulary and supported request attributes, validation, snapshot/activation/revocation semantics | Policy UI and input-only enforcement |
| OD-05 | Versioned API/event shapes, field optionality, timestamps/sequence, duplication/conflicts, status transitions, filtering, pagination and HTTP error mapping | Ingestion, gateway clients, timeline |
| OD-06 | Audit behavior when policy/decision storage is unavailable; exact transaction, dispatch, retry, and uncertain-result boundaries | Durable enforcement and side-effect reliability |
| OD-07 | Archive consent granularity, in-flight cutoff, encryption, codec/chunking, quotas, expiry/deletion and backups, storage failure behavior | Opt-in archive enablement and workspace deletion |
| OD-08 | Review proposed numeric limits; define workload, admission fairness, timeouts, abuse controls, capacity and backup/recovery targets | Performance and production acceptance |
| OD-09 | Attachment upload/reference contract and authorization, supported formats/extractors, non-model packages and detection rules, safe parsing/isolation, file/expanded-size limits, scan concurrency/time limits, temporary storage encryption/expiry/deletion and backup exclusion, overload handling without waiting for scans | Attachment scanning enablement; no detector coverage or lifecycle implementation is implied yet |
| OD-10 | Output delivery mode, protocol/resource bounds, local non-model secret/PII packages and rules, scan access/consent/retention, scheduling and overload behavior independent of archives | Advisory output analysis; no mandatory buffering or scan-storage choice is implied |

## Consistency rules for future work

Do not treat deployment credentials as workspace member credentials, timestamps
as trusted ordering, tracing as proof of enforcement, compression as redaction,
or output denial as reversal of a tool side effect. Do not promise complete
reasoning or governance for unsupported providers and bypass paths.

Resolve affected decisions explicitly, preserve deferrals, and update the
blueprint when approved requirements change. A finished draft can still contain
release blockers; it is not evidence that the project is implementation-ready.
