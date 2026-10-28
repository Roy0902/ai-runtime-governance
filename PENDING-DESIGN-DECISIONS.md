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

- **Status: prompt-guard behavior established; external-agent integration
  selection and rule-design details pending.**
  Phase 1 guards the newly submitted user message for prompt content, sensitive
  data, and injection/safety indicators and visualizes the observable agent
  activity loop. This is product scope, not evidence that a detector or
  integration has been implemented or benchmarked.
- **Decision:** a prompt check may allow, deny, redact, or require human approval.
  The product monitors and guards existing agents; it does not host or replace
  them. OpenCode CLI/TUI and GitHub Copilot agent mode in VS Code are
  candidates only.
  The integration mechanism and feasibility of intercepting prompts and
  receiving activity events must be verified for each product before it is
  selected. The prompt-guard engine remains Phase 1 scope independently of
  adapter feasibility. Observation-only integrations may ship; they must
  explicitly report that prompt enforcement is unavailable and must not imply
  that the monitor guarded their prompts. The guard logic is an internal module
  tested independently. Expose a guard API/service only when an enabled agent
  hook can invoke it; without a compatible hook, do not deploy a standalone
  guard service and allow a monitoring-only release.
- **Initial feasibility evidence:** VS Code's Copilot hook documentation lists
  `userPromptSubmitted` for observing a prompt, but says command-hook output is
  ignored for that event; `preToolUse` can make a tool-call decision, not a
  prompt-forwarding decision. The Chat Participant API is deprecated and not
  supported by the Copilot harness. OpenCode's plugin docs list message/session
  events and `tool.execute.before`, which can modify or reject a tool call, but
  do not document a general pre-model user-prompt gate. These interfaces may
  support observation or tool controls, but the reviewed documentation does
  not establish prompt deny/redact/approval behavior for OpenCode CLI/TUI or
  Copilot in VS Code. Treat both surfaces as monitoring candidates; verify guard capability
  separately and label an integration observation-only if it cannot block or
  transform a prompt before model forwarding. Prototype both candidates in
  parallel; production support selection remains open.
  Sources: [VS Code agent hooks](https://code.visualstudio.com/docs/agent-customization/hooks),
  [Copilot hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference),
  [VS Code AI extensibility](https://code.visualstudio.com/api/extension-guides/ai/ai-extensibility-overview),
  [OpenCode plugins](https://opencode.ai/docs/plugins/).
  Denied, redacted, or approval-pending prompts must not be forwarded unchanged.
  Initial detection uses a built-in deterministic rule catalog only; user-
  authored rules are outside the initial scope. No model-based or ML-based
  detector is included. Injection and safety rules report configured indicators;
  they do not provide comprehensive semantic threat detection.
  Rules detect configured invalid/weak-prompt indicators; there is no required
  prompt format or checklist. If no enabled rule matches, the prompt is allowed.
  Users may enable or disable built-in rules. Each rule's outcome and priority
  are fixed by the catalog and are not user-configurable. All built-in rules
  are enabled by default on a fresh installation.
  The first catalog covers common credentials/API tokens, email addresses and
  phone numbers, payment-card/financial identifiers, prompt-injection indicator
  patterns, unsafe-content indicator patterns, and explicit invalid/weak-prompt
  patterns.
  Sensitive-data matches are replaced with typed markers and forwarded.
  Prompt-injection and unsafe-content indicator matches require approval by the
  submitting user before forwarding. These are fixed category actions; users
  can toggle rules but cannot change actions or priorities. Explicit
  invalid/weak-prompt patterns deny the message; this is not general semantic
  prompt-quality grading.
  Rule matching supports literal strings and bounded regular expressions.
  Regex syntax, allowed features, and execution limits remain to be specified.
  Redaction replaces a match with a type-specific marker, such as
  `[REDACTED_EMAIL]` or `[REDACTED_API_TOKEN]`. Exact marker identifiers and
  rule-to-marker mapping remain to be specified.
  The submitting user resolves a require-approval decision. Approval is bound
  to the exact submitted message; changing the message requires a new guard
  evaluation and approval. A pending approval expires when its originating
  request ends; no decision by that point means the prompt is not forwarded.
  If the submitter cancels while approval is pending, the request ends
  immediately and the prompt is never forwarded. A canceled approval cannot be
  resumed; resubmission is a new request requiring fresh evaluation.
  Matching effects compose: apply all sensitive-data redactions; deny if any
  deny rule matches; otherwise require approval if any approval rule matches;
  otherwise allow. Explicit priorities resolve overlapping redaction matches
  only; a tie among top-priority overlapping redactions is an evaluation error
  and blocks forwarding.
  The guard inspects only the newly submitted user message; system/developer
  instructions, prior conversation history, and separately assembled or
  retrieved context are outside this guard's input scope.
  The monitor's “reasoning loop” is the ordered sequence of observable agent,
  model, and tool events, not private hidden chain-of-thought.
- **LangChain reference comparison:** official Python and JavaScript middleware
  docs describe parallel lifecycle hooks (`before_agent`/`beforeAgent`,
  `before_model`/`beforeModel`, after hooks) and wrappers around model and tool
  calls. Both wrappers can short-circuit by not invoking the underlying handler,
  which provides a useful reference for the desired guard/monitor capabilities.
  LangChain is not a target runtime, and its middleware APIs do not prove that
  OpenCode or GitHub Copilot expose equivalent hooks. Verify each product's
  supported interface directly.
  Sources: [Python middleware](https://docs.langchain.com/oss/python/langchain/middleware/custom),
  [JavaScript middleware](https://docs.langchain.com/oss/javascript/langchain/middleware/custom).
- **Processing order:** the independent guard validates the newly submitted
  message, runs enabled built-in checks, applies redactions, and returns a
  decision; a guard-capable integration persists the decision as required and
  forwards only the permitted redacted message, or waits for approval.
  Observation-only integrations do not invoke this enforcement path.
- **Not selected:** first supported external agent product and its supported
  integration surface; exact patterns and coverage within the selected
  categories, including the
  definition of invalid/weak-prompt indicators; regex syntax/features and
  matching limits; exact marker identifiers and rule-to-marker mapping;
  conditional hook-to-guard API request/response and authentication contract;
  broader request retry behavior;
  and latency/resource budgets. Resolve these under OD-01, OD-04, and OD-08.
- **Failure behavior:** malformed, uninspectable, denied, timed-out, or
  unevaluated prompts must not be forwarded. Do not truncate or skip required
  checks. Return structured errors for failures and prevent late results from
  authorizing dispatch.
- **Risk:** prompt-injection and safety detection may have false positives and
  false negatives. The product must document supported checks and limitations
  rather than claim complete detection. Do not assume a model-based detector or
  external content submission.
- **Deferred alternatives:** local non-model detectors and model-assisted
  detection are not part of the initial scope. Reconsider them only if tests
  show a material detection gap that deterministic rules cannot address and a
  separate decision approves their privacy, latency, cost, and operational
  trade-offs.
- **Candidate approach:** keep deterministic request-boundary validation
  distinct from content checks. Ship a curated built-in catalog with literal
  and bounded regex rules, explicit identifiers and fixed priorities/actions;
  allow users to enable or disable built-in rules, but do not expose
  user-authored rules in the initial scope. Explicit invalid/weak-prompt
  indicators deny; sensitive-data matches use type-specific redaction markers;
  injection/safety indicators require submitter approval. Apply redactions
  before a pending approval is resolved so an approved prompt forwards only its
  redacted form. Define the exact patterns, marker mapping, supported regex
  features, and limits before implementation.
- **Verification:** use bounded synthetic prompts covering each built-in rule,
  benign lookalikes, typed-marker redaction, approval, timeout, and
  rule-engine failure, including worst-case regex inputs. Verify exact upstream
  payloads and confirm no forwarding on deny, failure, pending, expired, or
  canceled approval.
  Verify only the submitting user can resolve approval and that changing the
  message invalidates the approval. Measure false positives/negatives, latency,
  and resource use without claiming detection beyond the tested rule coverage.
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

- **Status: authoritative decision boundaries established; capacity details pending.**
- **Decision:** for a guard-capable integration, atomically persist the guard
  decision and its outbox event before allowing prompt forwarding. A failure
  to commit means no forwarding. Keep the transaction short and never hold it
  across an agent/model network call. After external execution, a failed event
  write is surfaced as incomplete/uncertain; it cannot roll back external work
  or be reported as success.
- **Still pending:** connection-pool allocation, indexes, query bounds,
  outbox batch sizing, retry attempt/backoff caps, and overload response.
- **Verification:** contention and pool-exhaustion tests; database failure
  injection before and after dispatch; no invocation on pre-dispatch commit
  failure; accurate incomplete/uncertain state on post-execution write failure.
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
  cache freshness, composed actions, priority-based overlapping redaction
  selection, tie errors, allow when no rule matches, and fail-closed behavior
  on evaluation errors.
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

- **Status: event transport and overload policy established; limits pending.
  Archives are deferred.**
- **Decision:** use the PostgreSQL transactional outbox for the initial
  single-node event pipeline; keep indexing, alerts, and timeline materialization
  asynchronous and bounded. Observation events may be written in bounded
  batches; never batch a guard decision across requests. Ordinary payload
  archives are not Phase 1 work.
- **Overload behavior resolved:** observation-only events must not pause agent
  execution. Buffer/retry them through a bounded spool; if it is exhausted or
  unavailable, continue execution and set the affected trace to incomplete with
  the cause and any known missing count/time range; do not fabricate unknown
  extent. Do not add a separate gap event. Guard-decision persistence remains
  a pre-forward hard gate.
- **Risk:** event bursts or worker/database failures can exhaust bounded queues
  or leave activity traces incomplete.
- **Still pending:** queue/spool limits, batch size/flush interval,
  maximum attempts and backoff cap values,
  and the exact trace-incomplete cause codes and persistence contract.
- **Retry policy resolved:** retry outbox publication with capped exponential
  backoff and jitter; dead-letter after the bounded attempt count. Numeric
  attempt and delay limits remain OD-08.
- **Verification:** sustained ingestion, worker failure, queue/storage
  exhaustion, duplicate delivery, and resource limits; no silent event loss or
  success-shaped trace completeness.
- **Links:** EVT-001 through EVT-005, ARC-001 through ARC-006, OPS-003;
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
