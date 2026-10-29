# AI Runtime Governance

## Main idea

AI Runtime Governance is an AI-agent monitoring system with a prompt guard. Its
first purpose is to:

1. **Guard prompts** before they reach a model, using configured content,
   sensitive-data, and injection/safety checks. A guard may allow, deny, redact,
   or request human approval.
2. **Visualize agent activity** as an ordered trace of the observable execution
   loop: agent steps, model calls and responses, tool calls and results, retries,
   handoffs, and failures.

Here, the “reasoning loop” means that observable sequence of execution events.
It does not mean private hidden chain-of-thought. Provider/runtime-exposed
reasoning text is not required for the monitor to show the loop.

AI Runtime Governance is a Java model-gateway and monitoring service for
existing agents; it does not replace their agent harnesses. Users install a
supported client extension/plugin and connect it once per environment/profile.
It automatically activates for eligible sessions without per-session hook
editing. Any endpoint, model, or hook changes require disclosed user consent;
automatic setup remains subject to supported client APIs. The intended model
path uses the governance gateway's custom endpoint. The client API key
authenticates to the gateway; the Java
service uses a separate upstream provider key. OpenCode supports custom
provider endpoints; VS Code Copilot agent mode can use BYOK custom endpoints,
currently an experimental capability. The installed integration manages
supported hooks/events alongside the gateway to capture tool calls and other
lifecycle events that model traffic alone cannot show.

OpenCode CLI/TUI and GitHub Copilot agent mode in VS Code are initial
integration candidates, not yet verified production targets. The Java service
uses LangChain4j for its model/provider integration; it does not run or replace
those agents. A custom endpoint URL is required in addition to an API key, and
direct use of an agent's native provider path does not pass through the gateway.

### Install-once integration contract

- Activation is automatic for eligible new sessions after onboarding. Separate
  profiles and remote environments may need their own installation.
- Existing sessions attach only through a supported API; otherwise show a
  reconnect/restart requirement. Earlier activity is not retroactively captured.
- Report input enforcement, model-response observation, and tool/lifecycle
  visibility separately. Unknown, unsupported, or bypassed coverage is explicit;
  do not claim to discover sessions the client does not expose.
- Monitoring-only operation is permitted with explicit labeling. Guard/gateway
  failures never silently switch a guarded request to a direct provider.
- A verified client contract must identify the newly submitted human message
  and correlate it with gateway traffic. Guessing from the last user-role
  message is insufficient. Missing required mapping blocks guarded forwarding.
- The integration must provide a supported submitter-only approval UI before
  approval-capable guarding is enabled. No UI, timeout, or cancellation means
  no forwarding of an approval-required request.
- Event-ingestion tokens, gateway keys, and upstream provider keys are separate.
  Tokens authenticate reports; they do not expose or grant control of a session.

These are approved product requirements, not verified capabilities of either
candidate client. Protocol support, automatic setup, prompt correlation, and
approval delivery still require end-to-end feasibility tests.

### Confirmed initial account and environment scope

Evaluate both candidate clients; at least one fully verified guarded integration
is required for release. Monitoring-only support is explicitly labeled and does
not satisfy that gate. The first target is Windows with WSL, with any missing WSL
setup planned and verified before integration claims.

WSL setup is deferred and is not a prerequisite for all development. The first
client-independent slice is the guard decision core: compose trusted rule findings
into an attributable allow/deny/redact/require-approval decision and transformed
message. Approved core-specific overlap, marker and input-bound semantics are in
the [requirements](./REQUIREMENTS.md#client-independent-guard-decision-core-confirmed-first-slice).
Actual detectors, authorization/dispatch and verified client integration remain
separate work; this slice does not replace their release gates.

The initial user is one person, but Phase 1 includes public self-service native
registration and authenticated HTTPS Internet access. The governance application
manages passwords and mandatory authenticator-based 2FA, compatible with Google
Authenticator or Microsoft Authenticator. Store password verifier hashes, not
plaintext passwords. Provide offline single-use recovery codes with the password
and controlled host-administrator recovery.

The first frontend-acceptance increment is now the metadata-only incident/activity
timeline: inspect prompt/guard events, approval history and reported execution
activity, without approve/reject controls or stored prompt bodies. It uses
receipt-ordered siblings, truthful hierarchy/unknown telemetry and bounded
load-more/manual refresh. This frontend journey supersedes library-only work as
the first delivery priority; it does not remove guard-core or client release gates.
See the [confirmed timeline scope](./REQUIREMENTS.md#metadata-only-activity-timeline-confirmed-first-frontend-slice).

Registration uses email/password, with signup email verification and 2FA enrollment
before protected access. Each account owns private traces, approvals and client
credentials; an explicit deployment-operator grant is required before gateway use
can consume the server's model-provider budget.

Login is intentionally low-friction: stay signed in across browser restarts for
at most 30 days, expiring after 7 days of inactivity. A valid session browses traces
and approves its own prompts without repeated authenticator challenges. Password
changes, authenticator replacement and recovery-code generation require full
authentication no more than 10 minutes old; reuse that confirmation within the
window. Support password-manager autofill/paste and no routine periodic password
changes. Logout, revocation and expiry still end the affected session.

Separate gateway, event-reporting and server-only upstream-provider credentials
may be stored on the same demo host. No separate identity or credential-storage
server is required. Exact verification delivery/token lifecycle, scope provisioning,
operator grants, enrollment/recovery, session activity/revocation and credential
lifecycle details remain open; workspaces, public workspace
creation and the broader OIDC platform remain deferred.

## Problem

AI agent activity is difficult to understand because one user request may produce
a nested execution flow:

```text
User prompt
  -> input processing
  -> context assembly
  -> main agent model call
  -> subagent spawn
      -> subagent model call
      -> MCP/tool call
      -> tool result
  -> main agent follow-up
  -> final response
```

Existing observability can show traces without guarding the prompt, while
guardrails may make decisions without showing the execution that followed. This
project connects prompt decisions to an activity timeline so users can see what
was checked, what happened next, and where an execution failed.

## Goals

- Inspect prompt-guard decisions and the observable agent execution loop.
- Apply configured content, sensitive-data, and injection/safety checks to
  prompts before forwarding them.
- Support allow, deny, redact, and human-approval outcomes for guarded prompts.
- Record the prompt decision alongside correlated agent, model, and tool events.
- Visualize event order, hierarchy, duration, status, retries, handoffs, and
  incomplete or failed activity.
- Make unsupported or missing telemetry explicit rather than implying that the
  trace is complete.
- Support integrations with existing runtimes and tools without claiming
  universal interception.
- Keep policy decisions and monitoring evidence distinguishable: an observed
  tool call is not proof that the service authorized that action.

## Non-goals

- Capturing or reconstructing private hidden chain-of-thought that a model or
  runtime does not expose; availability cannot be guaranteed across providers.
- Treating generated explanations or a partial trace as the model's complete
  private reasoning.
- Claiming to monitor or govern integrations and execution paths that are not
  instrumented or routed through a supported boundary.
- Replacing or hosting the external agent products being monitored.
- Treating observation of a tool call as authorization of that call.
- Automatically changing guard rules or taking actions based on monitor findings.

## Scope

Phase 1 centers on prompt guarding and agent-activity visualization. The
gateway applies the guard to model-bound prompts and monitors model responses.
Agent hooks supplement this with tool-call/result and lifecycle events. Hook
coverage is product-specific; a session that uses the agent's native provider
path rather than the gateway is observation-only and must not be presented as
guarded. Exact rules, provider protocols, credential flow, and approval
lifecycle remain in the requirements. All configured supported agents should
be usable concurrently within documented capacity limits, with isolated traces
per session. Per-tool action governance and output blocking are not implied.
See the [requirements](./REQUIREMENTS.md).

### 1. Pre-processing governance

Before forwarding, the guard evaluates the newly submitted user message using a
built-in deterministic rule catalog for content rules, sensitive data, and
injection/safety indicators. Users may enable or disable built-in rules, but
their outcomes and priorities are fixed; user-authored rules are outside the
initial scope. All built-in rules are enabled on a fresh installation.
The first catalog covers common credentials/API tokens, email addresses and
phone numbers, payment-card/financial identifiers, prompt-injection indicators,
unsafe-content indicators, and explicit invalid/weak-prompt patterns.
System/developer instructions, prior conversation history, and separately
assembled or retrieved context are outside this guard's input scope. Request
structure, size, destination, and supported-field validation are separate
reliability and integration-boundary checks; they do not substitute for prompt
content guarding. These rules identify configured indicators; they do not
provide complete semantic safety detection. Model-based and ML-based detectors
are outside the initial scope. First-release built-in rules support literal
matching and bounded regular expressions; exact regex features and limits
remain open. The guard does not require a prompt template or checklist: a
message with no enabled rule match is allowed, while evaluation failures block
forwarding. Explicit invalid/weak-prompt patterns deny; sensitive-data matches
are redacted with typed markers; injection/safety indicators require the
submitting user's approval. When several rules match, all redactions are
applied; any deny blocks forwarding; otherwise any approval match pauses
forwarding; otherwise the message is allowed. Rule priority resolves overlapping
redactions, with ties failing closed. These patterns do not grade general
prompt quality.

Possible prompt-guard outcomes are:

```text
allow
deny
redact_with_typed_marker
require_approval
```

The guard must identify which rule or check produced an outcome. Detection
coverage and confidence must not be overstated. The exact rule vocabulary,
regex features, marker taxonomy, and broader retry behavior remain open. The
submitting user resolves approval, which is tied to that exact message and
expires when its originating request ends. Cancellation ends the request
immediately; resubmission requires a fresh guard decision.
Sensitive-data matches are replaced with typed markers such as
`[REDACTED_EMAIL]`; prompt-injection and unsafe-content indicator matches
require submitter approval. Redaction marker names remain to be defined.

### 2. Agent activity monitoring

The system records the observable execution lifecycle where supported:

- Prompt receipt and guard outcome, including applicable rule identifiers.
- Agent steps, model requests/responses, tool calls/results, retries, handoffs,
  errors, and final response, with timestamps and durations where available.
- Parent/child relationships and trace context where the integration exposes
  them.
- Model, tool, and runtime identity and status where available.

The sequence of these events is the activity loop shown by the monitor. It does
not require or imply capture of hidden reasoning text. Missing or unsupported
events must be identified as such.

### 3. Activity timeline

Each monitored request receives a trace. Work within that trace is represented
as ordered parent and child spans or events:

```text
Trace: request-123
|- User prompt
|- Prompt guard: redact (sensitive-data rule)
|- Main agent
|  |- Model request
|  |- Model response
|  |- Spawn subagent: research
|  |  |- Model request
|  |  |- MCP call: search
|  |  `- MCP result
|  `- Tool call completed
`- Final response
```

The timeline should show order, hierarchy, duration, status, prompt-guard
outcomes, retries, handoffs, and incomplete telemetry. Approval state is shown
when the prompt guard invokes the approval workflow. Reasoning-loop
visualization means this event sequence; provider-exposed reasoning text is not
needed and is not a Phase 1 deliverable.

### 4. Later capabilities

Historical analysis, reasoning-text archives, attachment scanning, output
content enforcement, per-tool action governance, and enterprise workspace
features are outside the first-release core. They require separate scope and
lifecycle decisions before implementation.

## Deployment architecture

```text
        Existing agent products
        +-----------------------------+
        | Custom model endpoint + key |
        | Agent hook/plugin events    |
        +-------------+---------------+
                      |
       Model requests/responses and
       supplemental agent activity
                      |
                      v
        +-----------------------------+
        | Agent monitor               |
        |                             |
        | - Java provider-compatible  |
        |   gateway and prompt guard  |
        | - event collector           |
        | - trace/timeline API and UI  |
        +-------------+---------------+
                      |
                      v
               Event storage
                      |
                      v
             Activity timeline
```

Prompt guarding and activity monitoring share trace context, but have different
reliability requirements:

```text
Prompt guard:
  synchronous, authoritative, prevent forwarding on deny/failure/awaiting approval

Activity monitoring:
  correlated, durable, searchable, explicit about missing telemetry
```

The install-once client integration manages supported activation and setup;
it must not silently edit client configuration or substitute models/providers.
Each gateway integration must implement the selected model-provider protocol,
including the streaming and tool-call features needed by the agent. Hook/plugin
events supplement model traffic with tool and lifecycle activity. Sessions
using an agent's native provider instead of the configured gateway bypass prompt
enforcement; no integration may claim visibility into such bypass paths.
Deployment may be local or hosted; choose its shape after selecting the runtime
and trust boundaries.

## Server-side persistence

PostgreSQL is the current database candidate because it supports transactions,
JSON, indexing, connection pooling, and multi-process access. The persistence
choice should be revisited against the selected integration boundary and
deployment target; it is not the product's defining capability.

Every protected event and trace must be scoped to the authorization boundary
selected for the deployment. Native public accounts and mandatory 2FA are selected;
the account-to-authorization-scope representation remains open. Workspaces and the
broader tenant platform remain deferred.

The storage design should separate:

- **Trace metadata and event records** in the server database.
- **Large payloads and artifacts**, if a later archive feature is approved, in
  object storage or an equivalent blob store referenced by durable IDs.
- **Background work state** in durable database-backed jobs or an external queue
  when the deployment grows.

The first installation may run the API, worker, web UI, and PostgreSQL on one
machine, whether that machine is a developer workstation, a VPS, or a private
cloud instance. This is still a multi-client server architecture; it is not
dependent on one process being the only writer. Components can be split across
services later without changing the event contract.

Local usage should connect to the service through the same API as remote usage. A
developer may run the complete service stack locally, connect to a shared VPS,
or use another cloud deployment.

## Core event model

Every event should support a common correlation structure:

```text
event_id
authorization_scope_id
trace_id
span_id
parent_span_id
event_type
timestamp
actor_id
application_id
deployment_id
agent_id
model_id
tool_name
status
policy_decision
policy_id
duration_ms
error_code
payload_hash
payload_reference
redaction_status
```

Important event types include:

```text
trace.started
prompt.received
policy.input_decision
prompt.guard.decision
context.assembled
model.request
model.response
agent.spawned
tool.call.started
policy.action_decision
approval.requested
tool.call.completed
command.started
command.completed
policy.output_decision
alert.triggered
agent.error
trace.completed
```

Subagents must receive the current trace context when they are spawned. A child
agent should create a new span or child trace linked to the parent agent so its
model and tool activity appears in the same timeline.

## Reliability and security principles

- Do not trust model-supplied identity, timestamps, or policy outcomes.
- Derive identity from authenticated runtime or service credentials.
- Resolve each request's authorization scope from its authenticated principal
  or credential; never trust a scope identifier supplied only in a request
  payload.
- Enforce the selected authorization scope on every read and write, including
  trace queries, guard decisions, and event access.
- Keep critical policy evaluation independent from the timeline UI.
- Fail closed for critical operations when required policy evaluation is
  unavailable.
- Use a local durable spool when the collector is temporarily unavailable.
- Do not pause agent execution for observation-event backlog; if the bounded
  spool is exhausted, mark the trace incomplete with the cause and any known
  missing count/time range; do not fabricate unknown values. A guard decision
  that cannot be durably committed before forwarding still blocks the guarded
  request.
- Observation-event writes may use bounded batches; guard-decision writes stay
  atomic per guarded request.
- Redact secrets before persistence whenever possible.
- Separate detailed audit data from ordinary application logs and alerts.
- Keep read and write permissions separate for trace data.
- Make safeguard triggers produce structured policy, error, and alert events.
- Do not let offline recommendations override safeguards automatically.
- Make retention and payload storage configurable by deployment profile.

## Initial development plan

The [Phase 1 requirements specification](./REQUIREMENTS.md) defines the initial
release and remaining decisions. Phase 1 is centered on prompt guarding and
activity monitoring; supporting platform features must not displace that core.

### Phase 1: Prompt guard and agent monitor

- Prototype install-once OpenCode and VS Code Copilot integrations, including
  consented custom-provider/BYOK routing and automatic supplemental event setup.
  Verify new/existing session activation, coverage reporting, exact human-message
  mapping, approval UI, credential separation, model protocols, streaming/tool
  calls, cancellation, and bounded resource use. Exercise concurrent sessions,
  exposed subagents, retries, reconnects, and coverage loss. VS Code BYOK agent
  support is experimental; production support selection remains open.
- Define the event model needed to correlate prompt decisions with observable
  agent, model, tool, retry, handoff, and completion events.
- Implement configured prompt checks for content rules, sensitive data, and
  injection/safety indicators, with allow, deny, redact, and approval outcomes.
- Build and test the prompt-guard engine independently of agent-specific hooks;
  only claim prompt enforcement for integrations that invoke it before forwarding.
- Ensure guard-capable integrations cannot bypass deny, redaction, or pending
  approval by forwarding the original prompt; surface unavailable or failed
  checks explicitly. Observation-only integrations must be labeled as such.
- Build a timeline that visualizes the observable execution loop and clearly
  identifies missing or unsupported telemetry.
- Keep private hidden reasoning out of scope; the timeline must work from
  activity events alone.
- Add only the authentication, persistence, and deployment capabilities needed
  to support the selected integration and initial users.

### Later phases: Platform and extended governance

- Harden durability, failure recovery, and supported runtime integrations.
- Add workspace management, BYOK, payload archives, attachment scans, and
  enterprise deployment only when validated as needed by the monitor's users.
- Consider tool-action governance, output enforcement, offline analysis,
  OpenTelemetry export, and exposed reasoning artifacts as separately scoped
  capabilities with their own safeguards and acceptance criteria.

## Guiding principle

> Govern the AI workflow before dangerous work happens, observe every meaningful
> stage through a shared service, and use historical evidence to improve agents,
> tools, and policies.

The first useful release should make prompt decisions understandable and agent
activity visible. Deployment portability and future governance capabilities
should support that purpose, not substitute for it.

## Initial technical baseline

The current technical baseline proposes:

```text
Java 25 LTS
Spring Boot
Spring MVC with virtual threads
LangChain4j
PostgreSQL
OpenTelemetry and Micrometer
PostgreSQL transactional outbox
Docker Compose
Caddy
```

The deployment target remains open pending provider protocol, credential-flow,
and initial-user decisions. Existing hardware estimates are planning references,
not Phase 1 requirements or measured capacity guarantees.

The high-throughput request path uses Java virtual threads for concurrent
I/O-bound gateway, upstream-model, hook-event, approval, and database
operations. Virtual threads do not
replace backpressure or resource limits: CPU-heavy scanning uses bounded worker
pools, while model requests, tool calls, database connections, payload sizes, and
event queues remain explicitly bounded.

See [TECHNICAL_BASELINE.md](./TECHNICAL_BASELINE.md) for the framework,
persistence, security, performance, and hardware decisions.
