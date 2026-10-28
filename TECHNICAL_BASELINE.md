# Technical Baseline

This document records candidate framework, infrastructure, and hardware
choices for AI Runtime Governance, an AI-agent monitor with a prompt guard.
The product integrates with existing external agents rather than providing an
agent framework. OpenCode CLI/TUI and GitHub Copilot agent mode in VS Code are
candidate targets, not commitments; supported integration surfaces remain open. LangChain
middleware is a capability reference, not a target runtime.

The choices are deliberately conservative. The first implementation should
optimize for correctness, stability, and straightforward operations before
introducing additional distributed infrastructure.

## Assumptions

- The monitor does not host a large local model.
- Models may be local services, remote services, or cloud APIs.
- Prompt checks must run before the guarded prompt is forwarded.
- Initial prompt checks use a built-in deterministic rule catalog; user-authored,
  model-based, and ML-based rules/detectors are outside the first-release scope.
- Agent/model/tool activity is observable only through supported integrations.
- Tool-action and output-content enforcement are outside the first-release
  boundary.
- Activity persistence is required for the timeline; historical analysis is
  deferred.
- PostgreSQL is available as a concurrent client/server database.
- The first deployment may run all core components on one machine.
- The monitor must use interfaces exposed by existing agent products; it must
  not assume a hook or event surface that the product does not provide.

If a local model is hosted on the same machine, its CPU, memory, and especially
GPU requirements must be planned separately. The hardware below covers the
governance service, not model inference.

## Initial scope boundaries and deferred capabilities

This baseline describes intended architecture, not proof that a capability is
implemented or production-ready. Follow the phased development plan in the
[README](./README.md) and the detailed
[Phase 1 requirements specification](./REQUIREMENTS.md). The latter records the
confirmed scope expansion, proposed details, and unresolved release gates.
A capability mentioned for future growth must not become an implicit requirement
for the first release.

The initial implementation must stay within these boundaries:

- **Monitor agents, do not replace them.** Do not expand the service into
  an agent framework, model-training platform, or inference host. Execution
  remains with the integrated runtime and its model and tool services.
- **Support explicit integrations, not universal interception.** Start with the
  planned model and tool adapters. Do not promise compatibility with every
  provider or visibility into activity outside instrumented boundaries.
- **Distinguish observation from enforcement.** A trace is not proof that an
  action was governed. Do not describe an observation-only integration as
  enforcing policy unless it can stop the action before execution.
- **Keep analysis advisory.** Do not let trace analysis or model-generated
  reasoning automatically create or execute tools, grant approvals, or change
  active policy. Human review remains required for recommendations.
- **Visualize the observable loop.** The reasoning loop means the ordered
  activity events reported by an integration, not private hidden chain-of-
  thought. Do not make the timeline depend on reasoning text or infer hidden
  reasoning from other telemetry.
- **Target one node before distributed operation.** Do not claim high
  availability, automatic failover, regional replication, or horizontal scaling
  from the initial single-node deployment. These need separate designs and
  failure testing; portable interfaces alone do not provide them.
- **Do not imply offline enforcement is already available.** Signed cached
  policies and offline execution are later-phase capabilities. Until explicitly
  implemented and tested, unavailable policy evaluation must not become an
  implicit allow for critical actions.
- **Do not equate baseline security with enterprise readiness.** Tenant
  isolation and authorization are initial requirements, not deferred features.
  Compliance certification, tamper-evident audit storage, and advanced
  organization-wide workflows are not established by this baseline.

### Decisions still required before the affected capability is ready

These are design gaps, not permission to invent silent defaults:

- **Integration and API contracts:** evaluate OpenCode CLI/TUI and GitHub
  Copilot agent mode in VS Code; verify supported extension, hook, API, or event interfaces;
  define prompt interception, lifecycle events, ordering, duplicate handling,
  authentication, and capability reporting.
- **Prompt-guard semantics:** define supported content/sensitive-data/
  injection-safety checks, rule precedence, redaction behavior, approval
  authority and expiry, and how approval binds to the prompt being forwarded.
  Do not treat an approval event alone as authorization.
- **Payload lifecycle:** define retention, deletion, quotas, compression and
  retrieval behavior, and explicit handling of full storage or interrupted
  capture before enabling the affected archive path.
- **Operational acceptance:** define workload and latency targets, resource
  limits, backup and restore procedures, and failure tests before claiming
  production readiness. Hardware profiles below are planning estimates, not
  measured capacity guarantees.

When implementing an affected capability, resolve its open decisions explicitly
and document the supported behavior and limits. Leave unrelated future
capabilities deferred rather than expanding scope to make the architecture
appear complete.

## Selected application stack

### Backend

| Area | Choice |
|---|---|
| Language | Java 25 LTS |
| Build | Maven |
| Main framework | Spring Boot, using the current supported release compatible with Java 25 |
| HTTP server | Spring MVC with virtual threads initially |
| Response handling | Delivery mode unresolved; bounded transport and advisory output analysis, not pre-delivery content-policy buffering |
| Database access | Spring JDBC or jOOQ for explicit SQL |
| Database migrations | Flyway |
| Authentication | Spring Security with OIDC/OAuth2 and service credentials |
| Validation | Jakarta Bean Validation plus explicit policy validation |
| Tracing | OpenTelemetry |
| Metrics | Micrometer with Prometheus-compatible export |
| Tests | JUnit 5, Mockito where appropriate, and Testcontainers |

Spring Boot is selected because the project needs a stable server framework,
security middleware, HTTP client support, database integration, configuration,
testing support, and a broad long-term ecosystem.

Spring MVC with virtual threads is the initial choice because it keeps the
request and proxy code easier to understand than a fully reactive stack while
supporting many concurrent I/O-bound requests. A WebFlux or Netty-based path
should be introduced only if measurements show that the servlet-based design
cannot meet streaming or latency requirements.

Virtual threads are part of the high-throughput request-handling baseline. They
allow the service to keep many model, MCP, approval, and database waits
concurrent without allocating one expensive platform thread per request. They
do not remove limits on CPU, memory, upstream connections, or database
connections, so resource-specific bounds remain required.

### Frontend

The first UI need is the prompt-guard decision and correlated agent-activity
timeline. Workspace/account administration, credential management, and their
specific configuration interfaces are not Phase 1 assumptions:

```text
TypeScript
React
Vite
```

The frontend is not part of the policy-critical path. It should consume the
timeline and query API and must not be required for policy enforcement.

## Persistence and event processing

### Primary database

PostgreSQL remains the selected initial database candidate for:

- Trace and span metadata
- Policy definitions and versions
- Policy decisions
- Approval requests and outcomes
- Alert records and delivery status
- Runtime identities
- Analysis results
- Timeline query indexes

Every protected record must be scoped to the authorization boundary selected
for the deployment. Authenticated identity determines that scope; request
payloads and model output cannot select or override it. Every database query
and API operation must enforce the selected scope, including artifact metadata
and storage references. The initial account/tenant model remains undecided.

Do not use SQLite as the primary deployment database. The system must support
concurrent writers and readers through a server database.

### Large payloads

The first release does not require prompt/response archives or reasoning-text
storage. If a later feature stores large prompts, model responses, tool output,
or generated artifacts, use S3-compatible object storage or a controlled
artifact volume. PostgreSQL should store:

```text
artifact_id
trace_id
content_hash
content_type
size_bytes
redaction_status
storage_reference
```

Reasoning-text capture, archiving, and display are not first-release
requirements. The monitor visualizes the observable activity sequence and does
not infer or reconstruct private reasoning. If a future integration exposes
reasoning artifacts, handling them requires a separate product, privacy, and
retention decision; it must not be required for ordinary trace collection.

### Initial event delivery

Start with a PostgreSQL transactional outbox:

```text
request
  -> policy decision
  -> transactionally record decision and outbox event
  -> background publisher/worker
  -> alerts, indexing, analysis, and exports
```

This avoids operating Kafka during the initial single-node deployment while
preserving a reliable asynchronous boundary.
Observation events may be written in bounded batches; authoritative guard
decisions and their outbox records remain atomic per guarded request.

Kafka, Redpanda, or another event broker can be added later if event volume,
multiple consumers, or multi-node deployment requires it.

### Background work

Use application workers for:

- Alert delivery
- Timeline indexing
- Artifact processing
- Offline trace analysis
- Tool recommendations
- OpenTelemetry or external export

This is the architectural worker inventory, not a Phase 1 feature checklist.
Offline analysis, recommendations, and external export follow the roadmap.

All worker queues must be bounded and must expose retry, failure, and dead-letter
behavior. Outbox retries use capped exponential backoff with jitter and bounded
attempts. Observation-event overflow must not pause agent execution; if the
bounded spool is exhausted, mark the affected trace incomplete with the cause
and any known missing count/time range, without fabricating unknown values.
Authoritative guard-decision persistence remains a pre-forward hard gate.

## Prompt-guard and monitoring architecture

```text
Existing external agent product --> Supported event interface --> Monitor --> Timeline
                |
                +--> Verified guard hook --> Guard API --> Internal guard module
                                             ^                    |
                                             +---- decision -------+

No verified guard hook: monitor-only integration; do not expose a standalone
guard API/service.
```

The guard logic is an internal Phase 1 module, testable independently of agent
adapters. Expose it through an authenticated API only when an enabled agent hook
can call it before forwarding. The API returns a decision and transformed
message; the hook must honor the result. Observation-only integrations do not
invoke the guard, and no separate input-guard service is deployed without a
compatible hook.

```text
validate the newly submitted user message
  -> run enabled built-in deterministic checks
  -> apply all sensitive-data redactions
  -> deny if any deny rule matches; otherwise await approval if required
  -> return the decision and transformed message to the caller
```

The following should normally be asynchronous:

- Full audit indexing
- Alert delivery
- Timeline materialization
- Payload compression
- Offline reasoning analysis
- Tool recommendation generation

For a guarded invocation, unavailable required prompt evaluation blocks
forwarding; signed cached/offline fallback is not implemented. An observation-
only adapter does not invoke the guard and must expose that limitation.
Per-tool action governance and output enforcement are deferred. The activity
timeline shows reported tool events as observations, not service authorization.
Product-specific interface, transport, and resource limits remain open.

### Concurrency model

Use virtual threads for request and proxy operations that spend time waiting on
network or database I/O:

```text
virtual thread per request
  -> prompt guard
  -> permitted model/agent I/O
  -> correlated activity-event capture
  -> bounded event persistence
```

Use bounded platform-thread executors or bounded worker pools for CPU-heavy work:

```text
bounded CPU workers
  -> secret scanning
  -> large-payload redaction
  -> compression
  -> offline analysis
  -> recommendation generation
```

Virtual threads must not be used as an excuse for unbounded concurrency. The
service must limit:

- Active model requests.
- Active MCP/tool calls.
- Database connections.
- Payload-processing jobs.
- Event queue depth.
- Per-client and per-authorization-scope request rates.

Backpressure, upstream timeouts, cancellation propagation, and bounded buffers
are required. Future streaming support must preserve enforcement guarantees.
A virtual thread can still
consume excessive memory if it retains a large prompt, response, or tool result.

## Security baseline

- Human-user authentication model to be selected; OIDC/OAuth2 remains a candidate.
- Short-lived service credentials for runtime clients.
- Account/workspace management and BYOK are later product decisions, not
  first-release assumptions.
- Optional mTLS for trusted service-to-service deployments.
- Role and scope checks before trace access or action approval.
- TLS termination at Caddy or the cloud load balancer.
- Secrets supplied through deployment secret management, not source control.
- Redaction before persistence when possible.
- Separate operational logs from detailed audit payloads.
- No model-supplied identity or policy result is trusted.
- Every read and write must enforce the authorization scope selected for the
  deployment. Do not assume a workspace/tenant model before product and
  integration requirements establish it.
- Critical policy and audit decisions are independently authenticated.

The request context should carry only request-scoped information such as:

```text
trace_id
request_id
authenticated principal
authorization scope resolved from authenticated credentials
application identity within that scope
authorization scopes
deadline and cancellation
```

Access tokens, large payloads, mutable global state, and database connections
must not be placed in request context.

## Deployment baseline

### Local development

Use Docker Compose with:

```text
governance-service
postgres
caddy or a local TLS substitute
optional object storage
```

Run the same service API locally that remote runtimes use. Do not create a
separate SQLite-only development architecture.

### Single-node VPS or cloud instance

Run the following on one host:

```text
Caddy
Java governance service
PostgreSQL
background workers
optional S3-compatible artifact storage
```

Use Docker Compose initially. The components should remain logically separated
so the service, database, workers, and artifact storage can move to separate
managed services later.

### Larger deployment

Split components when needed:

```text
Gateway instances
  -> PostgreSQL
  -> object storage
  -> event broker
  -> worker instances
  -> timeline/API instances
```

No code should assume that the service and database share a machine.

## Hardware profiles

### Development workstation

Minimum practical setup:

```text
4 CPU cores
16 GB RAM
50 GB available SSD
```

Recommended setup:

```text
8 CPU cores
32 GB RAM
100 GB available SSD
```

The recommended setup is useful when running the Java service, PostgreSQL,
frontend tooling, containers, integration tests, and a local model client at the
same time.

### Personal single-node deployment

Minimum for low-volume use:

```text
1-2 vCPU
2 GB RAM
40 GB SSD
```

Recommended:

```text
2 vCPU
4 GB RAM
40-80 GB SSD
```

The recommended profile is sufficient for one user or a small number of runtime
clients when models are hosted elsewhere. It leaves reasonable room for
PostgreSQL, Java, background workers, payload processing, and temporary
deployment overhead.

A 4 vCPU, 8 GB RAM instance is a comfortable growth profile for heavier
timeline queries, larger payload processing, multiple runtime clients, or
offline analysis running on the same host.

### Larger team deployment

Start with separate resources when concurrent use grows:

```text
Gateway: 2-4 vCPU, 4-8 GB RAM
Database: 2-4 vCPU, 8-16 GB RAM
Workers: 2-4 vCPU, 4-8 GB RAM
Object storage: managed or independently backed up
```

The actual size should be based on trace volume, payload retention, model
traffic, and timeline query patterns.

## JVM and performance defaults

Start with G1GC and measure before changing collectors. For a small host where
PostgreSQL shares memory with Java, leave sufficient memory for the operating
system and database rather than assigning most RAM to the JVM.

Use:

- Container-aware heap sizing.
- Explicit request and connection timeouts.
- Bounded event and worker queues.
- Bounded response transport; no mandatory pre-delivery output-policy buffering.
- Payload size limits.
- Connection pooling sized to the database.
- JFR and GC logging during performance testing.
- Virtual threads for I/O-bound request handling.
- Bounded executors for CPU-heavy scanning and analysis.

Evaluate ZGC only if measurements show that G1 pauses materially affect p95 or
p99 proxy latency on the target workload.

## Initial decision

The initial technology candidate is:

```text
Java 25 LTS
Spring Boot
Spring MVC with virtual threads
PostgreSQL
Flyway
Spring Security
OpenTelemetry and Micrometer
Maven
JUnit 5 and Testcontainers
React/TypeScript/Vite for the timeline UI
Docker Compose
Caddy
PostgreSQL transactional outbox
```

The deployment target and its workload profile must be selected after the
integration boundary and initial users are defined. The hardware figures above
are planning estimates, not Phase 1 acceptance criteria.

This baseline intentionally does not include Kafka, Kubernetes, a managed
database, or a local inference GPU. Those are later scaling or deployment
choices, not prerequisites for the first useful version.
