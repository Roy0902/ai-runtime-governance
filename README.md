# AI Runtime Governance

## Main idea

AI Runtime Governance is a portable control and observability layer for AI agent
runtimes. It combines two related capabilities:

1. **Governance**: inspect and control the AI workflow before, during, and after
   model and tool execution.
2. **Observability**: record and visualize what happened across the complete
   request lifecycle, including agents, subagents, model calls, tools, MCP
   servers, policies, approvals, errors, and final responses.

The project is deployment-neutral. It must support local, VPS, private-cloud, and
managed-cloud deployments through the same service interfaces. A cheap VPS is one
possible deployment target, not a requirement.

Local development remains supported, but local clients should use the same
service and API model as cloud clients. This keeps the runtime behavior
consistent and avoids creating a separate single-user implementation.

The service should be suitable for multiple concurrent runtimes, applications,
and users while remaining deployable as a compact single-node installation.

The system should integrate with existing model runtimes, harnesses, agent
frameworks, and MCP tools without requiring every tool to implement its own
logging or policy logic.

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

Existing observability systems can help show traces, while guardrail systems can
help validate inputs or outputs. The goal of this project is to connect those
concerns through one portable lifecycle model while keeping enforcement and
visualization technically independent.

## Goals

- Inspect the AI workflow from prompt intake to final response.
- Apply safeguards before prompts, context, model calls, tool calls, and outputs
  are processed.
- Block dangerous actions or require approval before execution.
- Record policy decisions, safeguard triggers, errors, retries, and alerts.
- Visualize a nested timeline of agents, subagents, models, tools, and policies.
- Offer opt-in archiving and visualization of reasoning artifacts when a model
  or runtime explicitly exposes them.
- Support local models, cloud model APIs, and managed runtimes where telemetry
  hooks are available.
- Work with MCP, shell commands, function calls, HTTP tools, and custom skills.
- Keep tool implementations unchanged through adapters at runtime boundaries.
- Analyze historical traces asynchronously to suggest missing or improved tools.
- Export or consume portable tracing formats such as OpenTelemetry where useful.
- Accept authenticated events and policy requests from local or cloud runtimes.
- Support concurrent writers and readers through a server-side database.
- Provide a deployable service with a web UI, API, background workers, and alerts.

## Non-goals

- Capturing or reconstructing private hidden chain-of-thought that a model or
  runtime does not expose; availability cannot be guaranteed across providers.
- Treating a model-generated explanation as an authoritative policy decision.
- Automatically creating tools or changing safeguards without review.
- Replacing every existing observability platform.
- Coupling the governance engine to one model provider or agent framework.
- Making critical enforcement depend on a visualization database being available.
- Using an embedded single-writer database as the primary deployment store.

The project records observable execution evidence, such as prompts and responses
where permitted, provider/runtime-exposed reasoning artifacts, tool calls, tool
results, policy decisions, approvals, timing, errors, and final responses.

## Scope

The sections below describe the product direction. The current Phase 1 release
enforces input request boundaries only. Tool activity and outputs are observed
for the timeline; secret/PII output findings are advisory, not delivery gates.
Tool-action enforcement, human approval and output-content enforcement are
deferred. Built-in agent tools are outside enforcement scope. See the
[requirements](./REQUIREMENTS.md) for the release contract and open decisions.

### 1. Pre-processing governance

Before a request reaches the model, the system may:

- Validate the prompt and request structure.
- Detect or redact secrets and sensitive data.
- Classify data and apply tenant or project boundaries.
- Detect prompt-injection indicators.
- Evaluate the trust level of retrieved documents and other context.
- Restrict available tools based on identity, environment, or task.
- Enforce prompt size, content, and destination policies.

Possible decisions are:

```text
allow
allow_with_redaction
allow_with_restrictions
require_approval
deny
quarantine
```

### 2. Model and context observability

The system records the observable model lifecycle:

- Model request and response metadata.
- Model and deployment identity.
- Prompt and context references, hashes, or redacted payloads.
- Reasoning artifacts explicitly exposed by the model or runtime, such as
  summaries, explanations, or structured traces, only when reasoning archiving
  is enabled. Associate them with the relevant model call and label their source
  and type.
- Token usage and payload size where available.
- Latency, retries, timeouts, and provider errors.
- Context sources and tool descriptions supplied to the model.

Raw payload retention must be configurable. Large or sensitive content should be
stored by reference or omitted according to the deployment profile.
Reasoning artifacts are optional and provider-dependent. The service must not
infer hidden reasoning from other outputs or present an exposed summary as the
model's complete private reasoning. Integrations should report whether this
telemetry is supported and distinguish unavailable data from an empty artifact.

Reasoning archiving is **off by default**. Authorized users may enable or disable
it within tenant policy; user preferences cannot override a tenant prohibition.
When disabled, retain only reasoning availability and capture-status metadata,
not reasoning text. Do not capture reasoning text for live visualization or
persist it in databases, artifact storage, logs, queues, spools, or exports.
Adapters must filter any reasoning text supplied by an upstream runtime before
it enters those paths. This setting does not disable model reasoning or ordinary
trace metadata collection.

Enabling archiving permits storage and timeline retrieval subject to tenant
authorization, redaction, and retention policy. Disabling it stops subsequent
capture; previously archived artifacts remain subject to their retention and
deletion policies.

### 3. Action governance

Before a model-generated action is executed, the system evaluates:

- Tool or command identity.
- Arguments and target resource.
- User, service, and deployment identity.
- Environment and data classification.
- Requested operation and risk level.
- Previous approvals and trace state.

The action may be allowed, constrained, denied, or paused for human approval.
MCP servers and tools should continue to enforce their own authorization rules as
a second line of defense.

### 4. Post-processing governance

After model or tool execution, the system may:

- Validate structured model outputs.
- Inspect tool results for sensitive information.
- Scan generated files or artifacts.
- Redact secrets before returning results.
- Check output size and content policies.
- Prevent unsafe final responses from being delivered.

### 5. Activity timeline

Each user request receives a trace. Work within that trace is represented as
parent and child spans or events:

```text
Trace: request-123
|- User prompt
|- Input policy: allow with redaction
|- Main agent
|  |- Model request
|  |- Model response
|  |- Spawn subagent: research
|  |  |- Model request
|  |  |- MCP call: search
|  |  `- MCP result
|  |- Tool policy: require approval
|  `- Tool call completed
|- Output policy: allow
`- Final response
```

The timeline should show order, hierarchy, duration, status, policy outcomes,
approvals, retries, available reasoning artifacts with their source/type, and
links to available redacted payloads. It must not imply that an artifact is
complete hidden chain-of-thought. Show when reasoning archiving is disabled,
rather than presenting the absence of archived text as an empty reasoning result.

### 6. Offline analysis

Reasoning interpretation is not required in the real-time path. Historical traces
can be analyzed later to find:

- Repeated requests without a suitable tool.
- Failed or repeated tool-selection attempts.
- Manual workarounds.
- Commonly repeated tool chains.
- Tools with high failure or correction rates.
- Missing data sources or capabilities.

The analysis produces recommendations for human review, for example:

```json
{
  "recommendation_type": "new_tool",
  "name": "search_build_artifacts",
  "evidence": {
    "trace_count": 184,
    "failed_attempts": 62,
    "common_request_pattern": "find previous build logs"
  },
  "confidence": 0.87,
  "requires_review": true
}
```

## Deployment architecture

```text
        Local or cloud runtime clients
        +-----------------------------+
        | Harness adapters            |
        | Model/MCP/tool integrations |
        +-------------+---------------+
                      |
             Authenticated HTTPS/API
                      |
                      v
        +-----------------------------+
        | AI Runtime Governance       |
        |                             |
        | - policy and approval API   |
        | - event collector           |
        | - timeline/query API        |
        | - web UI                    |
        | - alert dispatcher          |
        | - offline analysis workers  |
        +-------------+---------------+
                      |
          +-----------+------------+
          v                        v
   Server database          Artifact storage
   (concurrent access)      (large payloads)
          |
          +----------------------+
                                 v
                        Timeline and analysis
```

The governance path and observability path share trace context, but they have
different reliability requirements:

```text
Governance:
  synchronous, authoritative, fail-safe

Observability:
  durable, searchable, visual, asynchronously exportable

Offline analysis:
  asynchronous, advisory, reviewable
```

The service-oriented deployment model is the default architectural model. The
service may run locally, on a VPS, in a private cloud, or as a managed cloud
deployment. Runtime integrations may run as a library, middleware layer,
sidecar, or gateway near the harness. They send trace events to the service and
request synchronous policy decisions before critical actions.

The model and tool traffic does not always need to pass through the governance
service. A local or cloud runtime can keep payload traffic in its existing path
while sending metadata, redacted content, hashes, and policy requests to the
service. When centralized inspection is required, model and MCP traffic may
instead be routed through a gateway deployment.

For a critical action, the runtime adapter must not execute until it receives an
allow or approval decision. If the governance service is unavailable, the
configured policy determines whether the action fails closed, uses a signed
cached policy, or is allowed only for explicitly low-risk operations.

## Server-side persistence

Every shared or service deployment must use a client/server database that
supports concurrent writers and readers. PostgreSQL is the initial reference
choice because it supports transactions, JSON data, indexing, connection
pooling, and reliable multi-process access. A local installation may run
PostgreSQL in a container or use another compatible server database, but an
embedded single-writer database is not the primary storage model.

For data isolation, a **tenant** is a customer, organization, or workspace
boundary. An application is a resource within a tenant, not a substitute for
the tenant identity. Every tenant-owned record, including events, traces,
policies, approvals, alerts, analysis results, and artifact metadata, must be
associated with its tenant.

The storage design should separate:

- **Trace metadata and event records** in the server database.
- **Large prompts, responses, tool outputs, and artifacts** in object storage or
  an equivalent blob store, referenced by durable IDs.
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
tenant_id
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
- Resolve each request's tenant from its authenticated principal or credential;
  never trust a tenant identifier supplied only in a request payload.
- Enforce tenant authorization on every read and write, including trace queries,
  approvals, policies, and artifact access. Cross-tenant access must be denied.
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
release, confirmed decisions, proposed details, acceptance criteria, and
remaining release blockers. Phase 1 has been expanded from the original minimal
vertical slice; later phases below describe capabilities not included in it.

### Phase 1: Service vertical slice

- Define the event and trace schema, including `tenant_id` on tenant-owned data.
- Implement tenant identity binding and tenant-scoped authorization and queries
  for ingestion, persistence, APIs, and artifact references.
- Add public OIDC accounts, self-service workspaces, owner/operator/viewer roles,
  invitations, member management, and safe ownership transfer.
- Implement authenticated runtime ingestion.
- Implement one direct model API and one MCP integration through a gateway.
- Support workspace-owned integration credentials through both encrypted
  server-side storage and an external secret-manager integration.
- Add a policy editing UI and deterministic allow/deny input checks, with deny
  precedence and unmatched input requests denied.
- Observe tool/output activity without action approvals or output-content gates.
  Add advisory local non-model secret/PII output findings to the timeline.
  Resolve delivery mode and scan-storage/resource bounds before implementation;
  mandatory output-policy buffering is no longer a Phase 1 requirement.
- Store events in PostgreSQL.
- Render a basic nested timeline from the server API.
- Add bounded ordinary payload archives, off by default, with lifecycle controls
  required before enablement. Reasoning text archiving/viewing remains deferred.
- Add opt-in asynchronous advisory attachment scans using local non-model
  scanners, separately consented temporary storage, and timeline findings.
  Scan results do not hold or block prompts; detection coverage and lifecycle
  details must be resolved before enablement.
- Package the service for a single-node deployment that can run locally or in
  the cloud.

### Phase 2: Safeguards and reliability

- Extend payload handling with redaction and additional artifact capabilities.
- Extend allow/deny with constraint and approval decisions.
- Design tool-action and output-content enforcement separately; neither is
  implied by Phase 1 observation or advisory findings.
- Extend baseline structured errors with richer safeguard and alert events.
- Extend basic failure handling with durable client spooling and supported
  retries; do not blindly retry side-effecting tools.
- Add subagent context propagation.
- Add optional reasoning archives only after resolving their capture, storage,
  and visualization lifecycle; keep them off by default.

### Phase 3: Portable integrations and cloud clients

- Add OpenTelemetry-compatible export.
- Add adapters for shell, HTTP/function tools, and custom skills.
- Support local and cloud model providers.
- Make storage and visualization backends replaceable.
- Support multiple applications and concurrent runtime clients.
- Add signed policy distribution and configurable offline behavior.

### Phase 4: Offline improvement workflows

- Add trace replay and comparison.
- Detect recurring tool failures and missing capabilities.
- Generate reviewed tool recommendations.
- Add policy tuning suggestions without automatic enforcement changes.

### Phase 5: Scaled and enterprise deployment

- Extend authenticated collection for distributed deployments.
- Extend baseline workspace roles with enterprise access-management capabilities.
- Add append-only or tamper-evident storage options.
- Extend basic archive retention/deletion with classification and compliance
  controls.
- Add centralized alert routing and approval workflows.
- Move high-volume artifacts and events to independently scalable services.

## Guiding principle

> Govern the AI workflow before dangerous work happens, observe every meaningful
> stage through a shared service, and use historical evidence to improve agents,
> tools, and policies.

The project should be deployable locally or on a cheap VPS from the first useful
release, compatible with private and managed cloud environments through the same
interfaces, and capable of growing into a larger multi-client governance service
later.

## Initial technical baseline

The first implementation will use:

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

The initial target is a portable single-node deployment that can run locally, on
a VPS, or in a cloud instance. A recommended personal deployment is
approximately 2 vCPU, 4 GB RAM, and 40-80 GB SSD. A 4 vCPU, 8 GB deployment is
reserved for heavier analysis or future growth, assuming model inference is
hosted elsewhere.

The high-throughput request path uses Java virtual threads for concurrent
I/O-bound model, MCP, approval, and database operations. Virtual threads do not
replace backpressure or resource limits: CPU-heavy scanning uses bounded worker
pools, while model requests, tool calls, database connections, payload sizes, and
event queues remain explicitly bounded.

See [TECHNICAL_BASELINE.md](./TECHNICAL_BASELINE.md) for the framework,
persistence, security, performance, and hardware decisions.
