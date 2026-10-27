# Pending Application Processing Decisions

## Purpose and status

Track application-level processing concerns that need further discussion before
the affected paths are implemented. These are candidate bottlenecks and
correctness risks, not measured performance findings or approved solutions.

Use this register alongside the
[requirements specification](./REQUIREMENTS.md) and
[technical baseline](./TECHNICAL_BASELINE.md). It expands their open decisions;
it does not replace requirements or silently approve new behavior.

Items are **pending** unless explicitly marked otherwise. Resolve each with an explicit decision,
reason, affected requirement IDs, and verification criteria. If a decision
changes observable behavior, update the requirements as well.

## Processing concerns

### PD-01: Input safeguards and supported detection

- **Status: synchronous scope resolved; attachment scanning details pending.** Supported integration schemas and broader
  operational limits remain dependent on OD-01, OD-04, and OD-08; this is a
  design decision, not an implemented or benchmarked capability.
- **Decision:** synchronous boundary checks only. Check body size, request structure,
  supported fields, authorized model/destination, and permitted request parameters.
  Individual tool calls are not authorized by these input checks.
  No new prompt-text content scanning is included; users remain responsible
  for not supplying PII. The separate attachment path below is advisory, not
  a blocking check. If prompt text matching is introduced later, the initial
  preference is literal-only matching, not an approved Phase 1 feature.
- **Reason:** establish deterministic execution boundaries with bounded
  processing, without claiming semantic threat detection.
- **Processing order:** authenticate/authorize and admit the request; enforce
  body limits during reading; strictly parse and validate the integration
  schema; check authorized targets and parameters; evaluate input policy;
  persist the required decision before upstream dispatch.
- **Approved parsing limits:** maximum body 1 MiB (1,048,576 bytes), UTF-8 JSON,
  maximum container nesting depth 32 (root container counts as 1). Reject
  duplicate object keys, unsupported encodings, and compressed request bodies.
  Reject schema-unsupported fields rather than silently dropping them.
- **Approved deadline:** 500 ms elapsed time from complete receipt of the
  bounded body, covering parsing, schema/boundary checks and input-policy
  evaluation. This is not a CPU-time budget or latency percentile. It excludes
  upload, prior authentication/admission, decision persistence, and upstream
  model/tool execution; those need separate deadlines under OD-08.
- **Failure behavior:** malformed, oversized, uninspectable, or timed-out input
  produces a structured error and no upstream dispatch. Do not truncate or skip
  checks. Cancel processing where supported and prevent a late result from
  authorizing dispatch; timeout is not proof that CPU work has stopped.
- **Risk:** safeguard cost depends on whether checks inspect metadata, scan
  large text, or call another model. A deterministic rule engine must not be
  presented as a general semantic safety detector.
- **Resolve:** which input checks Phase 1 supports; size/encoding and parser
  limits; matching complexity; CPU budgets; timeout and malformed-input behavior.
- **Candidate approach:** validate cheap bounds first, then perform explicitly
  supported bounded checks. Model-based safeguards are not implied by the
  current deterministic allow/deny scope.
- **Verification:** representative and worst-case inputs; latency/CPU
  measurements; no upstream invocation after denial or evaluation failure.
- **Boundary tests:** accept a valid permitted request at the byte/depth limits;
  reject 1,048,577-byte bodies, depth 33, duplicate keys, invalid UTF-8/JSON,
  compressed bodies, unsupported fields, and unauthorized targets. Inject
  evaluation delay to test the 500 ms deadline and ensure a late allow never
  dispatches. Distinguish timeout/validation errors from policy denial.
- **Attachment decision:** opt-in local, non-model background scanning of
  attached files only. Do not wait for findings or block prompt dispatch on
  scan results/failure. Findings may arrive after model disclosure and must
  appear on the trace without exposing raw sensitive values. Existing
  structural/authorization/policy checks remain blocking.
- **Temporary storage:** separate explicit workspace consent permits temporary
  scan copies independently of ordinary archives. Delete after completion or
  expiry; surface/retry deletion failure. Without consent, do not create the
  scan copy/job. Do not silently promote temporary copies to archives.
- **Dependency restriction:** any model/ML-based scanner must be disclosed and
  separately approved, even if it runs locally; no external detector submission.
- **Still pending:** file contracts/formats, scanner packages and rule coverage,
  safe extraction, file/expanded-size bounds, worker limits, expiry/deletion,
  encryption and overload handling under OD-09. The synchronous 500 ms deadline
  and 1 MiB JSON-body bound do not define these attachment limits.
- **Attachment verification:** delayed scans do not hold permitted execution;
  late findings appear after trace completion; unsupported/failure states do
  not imply a clean scan; consent, deletion, isolation and non-model processing
  are tested before enablement.
- **Links:** INP-001 through INP-003, FIL-001 through FIL-004,
  POL-002 through POL-004, GW-004; OD-01, OD-04, OD-08, OD-09.

### PD-02: Output buffering and processing

- **Status: purpose and enforcement scope resolved; processing details pending.**
- **Decision:** output processing serves timeline visualization and advisory
  secret/credential and PII findings on model responses/tool results. No blocking
  output-content or response-schema validation, redaction, or approval gate.
  Mandatory pre-delivery buffering is superseded; streaming versus buffering is
  still undecided, not an implicitly approved streaming feature.
- **Related scope correction:** Phase 1 enforces input boundary rules only.
  Tool-action policy and human approvals are deferred. Agent built-in tools are
  outside enforcement; supplied telemetry is observation-only. MCP privileges
  were an example, not an approved service-side permission/approval design.
- **Retained reliability responsibilities:** protocol parsing, upstream error
  handling, cancellation and bounded resource use are infrastructure, not
  user-facing content safeguards.
- **Risk:** parsing/copying and advisory scans may consume substantial memory or
  lag behind execution. Finding records can themselves leak sensitive data.
- **Still pending:** delivery mode, byte/decoded-size bounds, scan packages/rules,
  memory/temporary-storage choice and consent, deadlines, scheduling, and
  incomplete/skipped/failure behavior under overload. Archive-off does not imply
  consent to store output for scanning. No model-based scanner is approved.
- **Verification:** findings do not block or alter delivery, timeline status
  distinguishes inspection from execution, findings omit raw sensitive values,
  and workspace isolation holds. Test resource/transport bounds after selection.
- **Links:** OUT-001, OUT-002, GW-003, GW-004; OD-08, OD-10.

### PD-03: Database access and durable decision writes

- **Risk:** synchronous decision persistence adds latency. Workers, timeline
  queries, and execution requests compete for database connections and locks.
- **Resolve:** transaction boundaries, pool allocation, indexes, query bounds,
  decision/outbox atomicity, and behavior when authoritative writes fail.
- **Candidate approach:** short transactions and no database transaction held
  across a model/tool network call. Keep authoritative writes distinct from
  asynchronous indexing.
- **Verification:** contention and pool-exhaustion tests; database failure
  injection; no invocation when the required pre-execution write fails.
- **Links:** POL-006, OPS-002, OPS-003; OD-05, OD-06, OD-08.

### PD-04: Upstream model and MCP resource control

- **Risk:** slow upstream services retain connections and request state;
  virtual threads do not make those resources unlimited.
- **Resolve:** connection reuse, concurrency limits, queue/admission behavior,
  deadlines, cancellation propagation, and supported retry boundaries.
- **Candidate approach:** bound upstream work separately from request threads.
  Never blindly retry a side-effecting tool after an uncertain result.
- **Verification:** slow/unresponsive upstreams, cancellation, connection
  exhaustion, and bounded resource use under overload.
- **Links:** INT-001, GW-003, GW-004; OD-01, OD-06, OD-08.

### PD-05: Policy loading, evaluation, and activation

- **Risk:** per-call policy reads or expensive matching can add latency; stale
  caches or mixed rule versions can produce incorrect decisions.
- **Resolve:** snapshot lifetime, rule representation, evaluation bounds,
  activation/cache invalidation, and in-flight revocation semantics.
- **Candidate approach:** immutable versioned policy snapshots with explicit
  attribution for every decision; caching is not permission to serve stale
  authorization indefinitely.
- **Current boundary:** these are input-policy decisions; per-tool action and
  output-policy enforcement are deferred.
- **Verification:** concurrent activation/evaluation, worst-case matching,
  cache freshness, and deterministic deny precedence/default deny.
- **Links:** POL-001, POL-002, POL-005, POL-006; OD-04.

### PD-06: Credential retrieval and lifecycle

- **Risk:** fetching external secrets on every invocation adds latency and can
  hit rate limits; caching can delay rotation or revocation.
- **Resolve:** retrieval/caching for both storage modes, secret-manager
  permissions, cache lifetime, rotation/revocation, and unavailable-key behavior.
- **Candidate approach:** reuse connections; consider bounded secret caching
  only with explicit lifecycle semantics. Never log or archive credential values.
- **Verification:** both storage modes, secret-manager outages/rate limits,
  rotation/revocation, cross-workspace denial, and absence of secret readback.
- **Links:** INT-003 through INT-006; OD-03.

### PD-07: Event and ordinary archive pipeline

- **Risk:** serialization, compression, and writes can fall behind ingestion,
  exhaust queues, or retain sensitive text in unintended intermediate paths.
- **Resolve:** batching, backpressure, job limits, retry/dead-letter behavior,
  full-storage handling, archive quotas, compression and retrieval strategy.
- **Candidate approach:** bounded asynchronous processing where consistent with
  durability requirements. Filter reasoning fields and credentials before any
  retained/logged/queued archive path; archives remain opt-in.
- **Verification:** sustained ingestion, worker failure, queue/storage
  exhaustion, duplicate delivery, compression round-trip and resource limits,
  and explicit capture status without silent loss.
- **Links:** EVT-001 through EVT-003, ARC-001 through ARC-006, OPS-003;
  OD-05, OD-07, OD-08.

### PD-08: Timeline query and browser rendering

- **Risk:** large traces can make SQL queries, payload transfer, and browser
  rendering expensive even if event ingestion is fast.
- **Resolve:** query indexes, pagination, span-detail loading, hierarchy handling,
  refresh behavior, and whether large timelines need virtualized rendering.
- **Candidate approach:** bounded metadata queries and on-demand details/artifacts
  rather than transferring and rendering every span and body at once.
- **Verification:** representative large traces, missing/late parents, stable
  pagination, query latency, transfer size, and browser responsiveness.
- **Links:** EVT-002, EVT-003, UI-001, UI-002, ARC-006; OD-05, OD-08.

### PD-09: Workspace fairness and abuse controls

- **Risk:** one busy workspace can consume shared connections, CPU, queues, or
  storage and degrade every other workspace.
- **Resolve:** deployment-wide and per-workspace admission limits, scheduling,
  creation/rate limits, quota accounting, and overload responses.
- **Candidate approach:** enforce workspace-aware bounds alongside global limits;
  self-service creation does not imply unlimited resource entitlement.
- **Verification:** competing workspaces under load, bounded resource use,
  explicit rejection/backpressure, and continued service for other workspaces.
- **Links:** IAM-002, GW-004, ARC-004; OD-08.

### PD-10: Authorization-to-execution crash boundaries

- **Scope note:** current enforcement concerns input-to-model forwarding.
  Per-tool policy/approval state machines are future work; any current tool
  integration must still report uncertain outcomes and avoid blind side-effect
  retries. Observation is not authorization.
- **Risk:** a crash can occur after an allow decision, before dispatch, after
  external execution, or before outcome persistence. These states are not
  equivalent.
- **Resolve:** execution state machine, action/attempt identifiers, dispatch
  ownership, duplicate requests, idempotency support, and recovery of uncertain
  outcomes. Define what evidence can establish external completion.
- **Candidate approach:** distinguish allowed, dispatched, completed, failed,
  and outcome-unknown states. A stored allow is not proof of execution; a
  missing result is not permission to repeat a side effect.
- **Verification:** crash/failure injection at every boundary, no false success,
  no unsupported exactly-once claim, and no blind side-effect retry.
- **Links:** POL-003, POL-004, GW-003, OPS-002; OD-01, OD-06.

## Suggested discussion order

1. **Governed execution:** PD-01 through PD-06 and PD-10. Establish enforcement
   and failure semantics before optimizing throughput.
2. **Data pipeline:** PD-03 and PD-07. Define durability, optional archive
   processing, and overload behavior together.
3. **Read path:** PD-08. Design timeline queries and on-demand retrieval.
4. **Cross-cutting limits and recovery:** PD-09 and the failure cases above.
   Review the specification's proposed numeric targets before accepting them.

Measure each stage separately: authentication, policy load/evaluation, decision
commit, upstream wait, output processing, event/archive work, and timeline reads.
Separate upstream latency from service overhead and report workload, concurrency,
payload sizes, memory, queue depth, and latency percentiles. Do not select a
bottleneck based on intuition alone.
