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

The integration boundary is not yet selected. Runtime instrumentation, a
gateway, or a combination may be evaluated; the project must not claim visibility
into or enforcement over activity that does not pass through a supported
integration. Deployment and hosting choices should follow that decision rather
than define the product.

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
- Treating observation of a tool call as authorization of that call.
- Automatically changing guard rules or taking actions based on monitor findings.

## Scope

Phase 1 centers on prompt guarding and agent-activity visualization. Prompt
content checks are in scope; their concrete rules, detectors, integration
boundary, and approval workflow still require design decisions. Tool and output
events are monitored where the chosen integration can observe them, but
per-action tool governance and output blocking are not implied. See the
[requirements](./REQUIREMENTS.md) for the release contract and open decisions.

### 1. Pre-processing governance

Before a prompt reaches the model, the guard evaluates configured rules for
prompt content, sensitive data, and injection/safety indicators. Request
structure, size, destination, and supported-field validation are separate
reliability and integration-boundary checks; they do not substitute for prompt
content guarding.

Possible prompt-guard outcomes are:

```text
allow
deny
redact
require_approval
```

The guard must identify which rule or check produced an outcome. Detection
coverage and confidence must not be overstated. The exact rule vocabulary,
detector approach, redaction behavior, and approval semantics remain open.

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
        Supported agent runtime integration
        +-----------------------------+
        | Runtime hooks and/or gateway|
        | (integration boundary TBD)  |
        +-------------+---------------+
                      |
       Authenticated events/policy calls
                      |
                      v
        +-----------------------------+
        | Agent monitor + prompt guard|
        |                             |
        | - prompt checks and decisions|
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

The integration boundary is not selected. Runtime instrumentation and gateway
approaches must be evaluated for their ability to stop a denied, redacted, or
approval-pending prompt from being forwarded and to report the activity needed
for the timeline. Do not promise visibility into bypass paths. Deployment may
be local or hosted; choose its shape after selecting the integration and trust
boundaries.

## Server-side persistence

PostgreSQL is the current database candidate because it supports transactions,
JSON, indexing, connection pooling, and multi-process access. The persistence
choice should be revisited against the selected integration boundary and
deployment target; it is not the product's defining capability.

Every protected event and trace must be scoped to the authorization boundary
selected for the deployment. The initial account, workspace, and tenant model
is not yet decided.

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

- Select and document the first supported agent integration boundary; do not
  claim universal interception.
- Define the event model needed to correlate prompt decisions with observable
  agent, model, tool, retry, handoff, and completion events.
- Implement configured prompt checks for content rules, sensitive data, and
  injection/safety indicators, with allow, deny, redact, and approval outcomes.
- Ensure deny, redaction, or pending approval cannot be bypassed by forwarding
  the original prompt; surface unavailable or failed checks explicitly.
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
PostgreSQL
OpenTelemetry and Micrometer
PostgreSQL transactional outbox
Docker Compose
Caddy
```

The deployment target remains open pending selection of the integration
boundary and initial users. Existing hardware estimates are planning references,
not Phase 1 requirements or measured capacity guarantees.

The high-throughput request path uses Java virtual threads for concurrent
I/O-bound model, MCP, approval, and database operations. Virtual threads do not
replace backpressure or resource limits: CPU-heavy scanning uses bounded worker
pools, while model requests, tool calls, database connections, payload sizes, and
event queues remain explicitly bounded.

See [TECHNICAL_BASELINE.md](./TECHNICAL_BASELINE.md) for the framework,
persistence, security, performance, and hardware decisions.
