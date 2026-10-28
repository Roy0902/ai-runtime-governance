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

### PD-01: Prompt guard and supported detection

- **Status: core behavior established; integration and detection design pending.**
  Phase 1 guards prompt content, sensitive data, and injection/safety indicators
  and visualizes the observable agent activity loop. This is product scope, not
  evidence that a detector or integration has been implemented or benchmarked.
- **Decision:** a prompt check may allow, deny, redact, or require human approval.
  Denied, redacted, or approval-pending prompts must not be forwarded unchanged.
  The monitor's “reasoning loop” is the ordered sequence of observable agent,
  model, and tool events, not private hidden chain-of-thought.
- **Processing order:** authenticate and admit through the selected boundary;
  enforce applicable request-size and structural limits; run configured prompt
  checks; resolve the decision; persist the authoritative decision as required;
  then forward only an allowed or correctly redacted prompt, or wait for the
  resolved approval outcome.
- **Not selected:** runtime instrumentation versus gateway versus both; rule
  vocabulary and precedence; detector methods/packages; prompt/context coverage;
  redaction semantics; approval authority, expiry, and action binding; and
  latency/resource budgets. Resolve these under OD-01, OD-04, and OD-08.
- **Failure behavior:** malformed, uninspectable, denied, timed-out, or
  unevaluated prompts must not be forwarded. Do not truncate or skip required
  checks. Return structured errors for failures and prevent late results from
  authorizing dispatch.
- **Risk:** prompt-injection and safety detection may have false positives and
  false negatives. The product must document supported checks and limitations
  rather than claim complete detection. Do not assume a model-based detector or
  external content submission.
- **Candidate approach:** keep deterministic request-boundary validation
  distinct from content checks. Use explicit, attributable rule outcomes and
  only add detectors after their method, data path, resource use, and coverage
  are reviewed.
- **Verification:** use bounded synthetic prompts covering each configured
  rule, benign lookalikes, redaction, approval, timeout, and detector failure.
  Verify exact upstream payloads and confirm no forwarding on deny, failure, or
  pending approval. Measure latency and resource use for the selected methods.
- **Deferred attachment path:** attachment scanning is not a Phase 1 gate. If
  reconsidered, define its separate consent, temporary storage, scanner methods,
  file limits, deletion, and nonblocking behavior under OD-09 before enablement.
- **Links:** GUARD-001 through GUARD-003, MON-001 through MON-003, INP-001
  through INP-003, POL-002 through POL-004; OD-01, OD-04, OD-08.

### PD-02: Output buffering and processing

- **Status: purpose and enforcement scope resolved; processing details pending.**
- **Decision:** output processing serves timeline visualization and advisory
  secret/credential and PII findings on model responses/tool results. No blocking
  output-content or response-schema validation, redaction, or approval gate.
  Mandatory pre-delivery buffering is superseded; streaming versus buffering is
  still undecided, not an implicitly approved streaming feature.
- **Related scope:** prompt guarding is the Phase 1 enforcement path, including
  prompt-level approval when configured. Per-tool action governance and output
  enforcement are deferred. Agent built-in tool activity is observation-only;
  tool telemetry is not authorization.
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
- **Current boundary:** these are prompt-guard decisions; per-tool action and
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
