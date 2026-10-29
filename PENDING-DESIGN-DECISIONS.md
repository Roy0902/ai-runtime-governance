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

### Confirmed review direction: 2026-10-29

- Evaluate OpenCode and VS Code Copilot, initially on Windows with WSL; require
  at least one fully verified guarded integration for release. A candidate may
  remain monitoring-only, but that does not satisfy the guarded-release gate.
  WSL setup is planned, not installed or verified by this confirmation.
- Phase 1 includes public self-service application-managed accounts and mandatory
  password plus authenticator-based 2FA. The initial usage is personal, with
  authenticated HTTPS Internet access. Google Authenticator or Microsoft
  Authenticator compatibility, offline single-use recovery codes with the password
  and controlled host-admin recovery are selected.
- Purpose-separated gateway/event/provider credentials may reside on the same demo
  host. No external identity or credential-storage service is required. Passwords
  are stored as secure salted verifier hashes; secret protection still applies.
- Confirmed follow-up: email/password registration, once-at-signup email
  verification and 2FA enrollment before protected access; private account scope
  and explicit deployment-operator grant before model-gateway use.
- Low-friction sessions survive browser restart, with 30-day absolute and 7-day
  inactivity limits. Ordinary browsing/prompt approvals need no extra factor
  while the session is valid. Sensitive password/authenticator/recovery-code
  changes use full authentication at most 10 minutes old and reuse it within
  that window. Allow password-manager autofill/paste; no routine password expiry.
- These confirmations do not approve exact email delivery/token lifecycle, scope
  provisioning, operator-grant mechanism, enrollment/recovery, session activity/
  revocation, runtime credential lifecycles, provider protocols or other numeric
  limits. Resolve
  OD-01/OD-05/OD-11 before accepting those paths. Workspace administration and the
  broader OIDC platform stay deferred.
- Authority: explicit user confirmations recorded in the
  [Phase 1 confirmation record](./spec-to-test-workflow/phase-1/05-decision-record.md).

### Confirmed client-independent first slice

- Defer WSL setup while preparing the guard decision core. WSL is required only
  for its selected live integration path, not all domain/design or Java work.
- Compose trusted findings and catalog revision for one identified message; do
  not claim detector coverage, human approval, durability or model dispatch.
- Core-specific choices are approved: connected-overlap union redaction using
  the highest-priority marker; connected-group top ties fail; six typed markers;
  at most 65,536 UTF-8 message bytes and 1,024 findings; explicit failures for
  missing policy, unknown/inconsistent rules and invalid spans.
- This narrows PD-01/PD-05 for the first slice only. Exact detector patterns,
  active-policy lifecycle, integrated approval/dispatch and other proposed
  runtime limits remain open. See DR-011/DR-012 and the scoped requirements.

### PD-01: Prompt guard and supported detection

The confirmed first frontend increment is metadata-only timeline inspection.
Approval history is read-only. Receipt-ordered siblings, unresolved-parent
visibility, separate execution/telemetry status, 50-trace/200-event response
bounds, explicit continuation/manual refresh and scoped duplicate handling are
selected in the requirements under DR-015/DR-016. Full event schemas, query
continuation, UI copy and authentication/test setup still require review.
This does not approve actionable approval, payload archives, automatic polling
or all proposed event/query requirements.

- **Status: Java gateway plus installed client integration selected;
  install-once behavior approved; capability/protocol verification pending.**
  Phase 1 guards the newly submitted user message for prompt content, sensitive
  data, and injection/safety indicators and visualizes the observable agent
  activity loop. This is product scope, not evidence that a detector or
  integration has been implemented or benchmarked.
- **Decision:** a prompt check may allow, deny, redact, or require human approval.
  The Java service is a provider-compatible model gateway for existing agents;
  it does not replace or host their agent harnesses. Route model requests to the
  gateway through a custom endpoint/base URL and gateway API key. The gateway
  uses a separate server-managed upstream provider key; the client key is not
  the model-provider credential. An install-once client extension/plugin
  manages consented setup and automatic activation for eligible sessions;
  users do not configure hooks per session. Use supported agent hooks/events
  internally for tool-call/result and other lifecycle events. OpenCode
  CLI/TUI custom providers and GitHub Copilot agent mode's BYOK custom endpoint
  are the initial candidates. Requests using the native provider path bypass
  the gateway and are not guarded.
- **Initial feasibility evidence:** VS Code documents BYOK custom endpoints for
  Chat Completions, Responses, and Anthropic Messages; BYOK in Copilot agent
  sessions is experimental and requires user configuration. OpenCode supports
  custom provider base URLs. Its plugins and Copilot hooks can supplement model
  proxy traffic with tool and lifecycle events. Copilot's `userPromptSubmitted`
  hook remains observational and does not replace gateway interception.
  Prototype both routes in parallel; supported protocols, authentication, and
  tool-call/streaming compatibility remain to be verified.
  Sources: [VS Code BYOK/custom endpoints](https://code.visualstudio.com/docs/agent-customization/language-models),
  [VS Code agent hooks](https://code.visualstudio.com/docs/agent-customization/hooks),
  [Copilot hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference),
  [OpenCode custom providers](https://opencode.ai/docs/providers/),
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
- **Java model integration:** LangChain4j is selected as a Java-side library
  for provider/model integration, not as the external agent runtime. The gateway
  still needs explicit inbound protocol adapters; LangChain4j alone does not
  establish API compatibility with every client protocol.
  Source: [LangChain4j introduction](https://docs.langchain4j.dev/intro).
- **Processing order:** authenticate the client and parse the provider request;
  validate the integration's new-human-message mapping and correlation;
  inspect that submission; run enabled built-in checks; apply
  redactions; deny or await approval when required; forward only permitted
  requests upstream; return and monitor the model response; ingest supplemental
  hook events.
- **Not selected:** exact provider protocols and supported client versions,
  including streaming/tool-call compatibility; gateway-key issuance/rotation
  and deployment-managed upstream key provisioning/rotation; exact patterns and coverage within
  selected categories, including the definition of invalid/weak-prompt
  indicators; regex syntax/features and matching limits; exact marker
  identifiers and mapping; supplemental hook event contract; broader request
  retry behavior;
  and latency/resource budgets. Resolve these under OD-01, OD-04, and OD-08.
- **Failure behavior:** malformed, uninspectable, denied, timed-out, or
  unevaluated prompts must not be forwarded. Do not truncate or skip required
  checks. Return structured errors for failures and prevent late results from
  authorizing dispatch. Missing/ambiguous human-message mapping also blocks
  guarded forwarding. No silent fallback to a direct model provider is allowed.
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
  user-facing content safeguards. Response delivery and required streaming/
  tool-call compatibility are Phase 1 gates; deferred advisory scanning does
  not defer the gateway's response transport.
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

### PD-11: Install-once activation and integration coverage

- **Status: product contract approved; client feasibility and wire contracts
  pending.** This supersedes manual per-session hook setup as a user workflow;
  it does not remove supported hooks as an internal integration mechanism.
- **Approved setup:** install/connect once per supported environment/profile,
  then activate automatically for eligible new sessions. Disclose and obtain
  consent for endpoint, model, and hook changes; use supported configuration
  APIs, not silent configuration edits. Remote environments/separate profiles
  may require separate installation.
- **Existing sessions:** attach only through supported APIs or show a
  reconnect/restart requirement. Do not imply earlier activity was captured.
- **Coverage:** report input enforcement, model-response observation, and
  tool/lifecycle visibility separately. Unknown, bypassed, unsupported, and
  degraded states are explicit. Do not claim to enumerate sessions the client
  does not expose. Explicitly labeled monitoring-only operation is approved;
  it must never be presented as guarded.
- **Message identity:** require a verified mapping from the exact new human
  submission to provider traffic, scoped to authenticated integration identity.
  Distinguish session, turn, request, and attempt, plus subagent/parent links
  where exposed. Do not guess from the last user-role message. Missing or
  ambiguous required mapping blocks guarded forwarding.
- **Approval:** provide a supported submitter-only integration UI, bound to the
  exact evaluated message and redacted forwarding payload. No UI, timeout,
  cancellation, or invalid/replayed approval means no authorization to forward.
- **Credentials:** event-ingestion tokens are separate from gateway and
  upstream provider keys. Define secure provisioning/storage, scope, and
  revocation. A callback token authenticates reporting, not session access.
- **Failure boundary:** never silently fall back from guarded routing to a
  direct provider. Observation-only telemetry failures remain nonblocking
  with degraded/incomplete status and the existing bounded recovery contract.
- **Still pending:** installation/package APIs; supported versions and
  profile/remote scope; consent/change lifecycle, disable/uninstall behavior
  and ownership-safe configuration cleanup; supported activation/discovery and
  coverage freshness signals; authenticated correlation/content mapping;
  approval channel and bounded human wait versus guard-evaluation deadline
  within client request limits; credential lifecycle. These require prototypes, not
  assumptions about extension or hook permissions.
- **Verification:** onboard once, open multiple sessions without hook editing,
  test supported attach versus reconnect, and exercise concurrent turns,
  retries, tool results, summarization, subagents, and reconnects. Verify exact
  upstream content, isolation, credential rejection, unavailable approval UI,
  disabled hooks, route changes, collector/gateway outages, honest unknown
  coverage, and no silent direct-provider fallback.
- **Links:** GUARD-005, GUARD-006, INT-007 through INT-011, MON-004, AT-06;
  OD-01, OD-05, OD-06, OD-08.

## Suggested discussion order

1. **Integration and governed execution:** PD-11, PD-01 through PD-06, and
   PD-10. Verify install-once coverage and establish enforcement/failure
   semantics before optimizing throughput.
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
