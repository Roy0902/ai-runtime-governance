# Technical Baseline

This document records candidate framework, infrastructure, and hardware
choices for AI Runtime Governance, a Java model gateway and agent monitor. The
product does not replace existing agent harnesses. OpenCode custom providers
and GitHub Copilot BYOK custom endpoints in VS Code are candidate clients.
LangChain4j is selected for Java-side model/provider integration; supported
inbound protocols and upstream credential flow remain open.

The choices are deliberately conservative. The first implementation should
optimize for correctness, stability, and straightforward operations before
introducing additional distributed infrastructure.

## Assumptions

- The monitor does not host a large local model.
- Models may be local services, remote services, or cloud APIs.
- Agents must route model requests through the configured custom endpoint for
  prompt guarding and model-request/response monitoring to apply.
- Prompt checks run in the gateway before upstream forwarding.
- Initial prompt checks use a built-in deterministic rule catalog; user-authored,
  model-based, and ML-based rules/detectors are outside the first-release scope.
- Agent/model/tool activity is observable through gateway traffic plus
  supplemental supported hooks/events.
- Tool-action and output-content enforcement are outside the first-release
  boundary.
- Activity persistence is required for the timeline; historical analysis is
  deferred.
- PostgreSQL is available as a concurrent client/server database.
- The first deployment may run all core components on one machine.
- Native-provider paths that bypass the custom endpoint are not guarded; hooks
  may provide observation there but must not imply enforcement.

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

- **Integration and API contracts:** evaluate OpenCode custom providers and
  GitHub Copilot BYOK custom endpoints in VS Code; select provider protocols,
  model/tool-call/streaming behavior, custom endpoint and client credential
  setup, upstream provider-key flow, and supplemental hook/event interfaces.
  BYOK in VS Code's Copilot harness is experimental.
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
| Model/provider integration | LangChain4j for Java-side upstream provider calls; explicit inbound protocol adapters remain required |
| Response handling | Delivery mode unresolved; bounded transport and advisory output analysis, not pre-delivery content-policy buffering |
| Database access | Spring JDBC or jOOQ for explicit SQL |
| Database migrations | Flyway |
| Authentication | Spring Security with application-managed password/authenticator 2FA and separate purpose-bound runtime credentials; external OIDC not required |
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

The first UI needs are the prompt-guard decision, correlated activity timeline,
public native registration, mandatory authenticator enrollment/login and recovery.
Workspace administration and workspace-managed credential interfaces remain
deferred:

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
and storage references. Native public accounts are selected; their exact
authorization-scope representation remains undecided. The workspace/tenant
platform remains deferred.

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
OpenCode / VS Code Copilot
       |
       | custom model endpoint + client credential
       v
Java provider-compatible gateway
       |
       +--> prompt guard --> selected upstream model API
       |                    (LangChain4j client where compatible)
       |
       +--> model request/response monitoring

Agent hook/plugin events --> event collector --> trace/timeline
       (tool calls/results, subagents, lifecycle where exposed)
```

An install-once client extension/plugin manages automatic activation for
eligible sessions and consented endpoint/model/hook setup through supported
APIs. No per-session hook editing is required. Separate profiles and remote
environments may need separate installation. Existing sessions attach only via
supported APIs or display a reconnect/restart requirement; past capture is not
implied. These are required integration capabilities, not verified client APIs.

The model gateway is the prompt-enforcement boundary; it is configured as the
agent's custom provider endpoint, not as a replacement agent runtime. Hooks add
tool and lifecycle visibility that the provider protocol does not carry. A
session using the native provider endpoint bypasses prompt enforcement and is
not described as guarded. The client API key authenticates the gateway request;
the gateway uses a separate deployment-managed upstream provider key.
Provisioning and rotation remain open; client provider-key forwarding is not
the selected credential model.

Before guarding, a verified client contract must correlate authenticated
integration identity with session, human submission/turn, model request, and
attempt, plus parent/subagent links where exposed. It must map the exact new
human submission into the provider request without treating history, tool
results, or summarization as a new submission. Missing or ambiguous required
mapping blocks guarded forwarding; the last user-role message is not sufficient
evidence. Exact contracts, replay handling, and reconnect semantics remain open.

Approval-capable integration requires a supported submitter-only UI and a
binding to both the exact evaluated message and redacted forwarding payload.
Timeout, cancellation, unavailable UI, or invalid approval cannot authorize
dispatch. The transport and authentication mechanism remain to be verified.

Report input enforcement, model-response observation, and tool/lifecycle
visibility independently. Unknown, unsupported, bypassed, and degraded states
must remain explicit, including when a client cannot enumerate other sessions.
Monitoring-only operation is permitted with explicit labeling. Guard/gateway
failure never silently falls back to a direct provider; observation-only
telemetry failure remains nonblocking with bounded recovery and incomplete
status. Coverage freshness/detection contracts remain open.

```text
authenticate client and parse the provider request
  -> identify the newly submitted user message
  -> run enabled built-in deterministic checks
  -> apply all sensitive-data redactions
  -> deny if any deny rule matches; otherwise await approval if required
  -> forward only permitted, transformed requests to the selected model API
  -> monitor the model response
```

The following should normally be asynchronous:

- Full audit indexing
- Alert delivery
- Timeline materialization
- Payload compression
- Offline reasoning analysis
- Tool recommendation generation

Unavailable required prompt evaluation blocks gateway forwarding; signed
cached/offline fallback is not implemented. Native-provider bypasses are not
guarded. Per-tool action governance and output enforcement are deferred. The
activity timeline shows reported tool events as observations, not service
authorization. Provider protocol, credential, and transport/resource limits
remain open.

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
are required. Response delivery and any streaming/tool-call features required
by the selected clients are Phase 1 compatibility gates, not deferred advisory
scanning work. They must preserve enforcement guarantees.
A virtual thread can still
consume excessive memory if it retains a large prompt, response, or tool result.

## Security baseline

- Application-managed native accounts with public self-service registration and
  mandatory password/authenticator 2FA; Google Authenticator or Microsoft
  Authenticator compatibility is required. Store passwords as secure salted
  verifier hashes, not plaintext. External OIDC is not required for Phase 1.
- Offline single-use recovery codes with the password and a controlled
  host-administrator recovery procedure; enrollment, reset and abuse
  contracts remain OD-11 decisions.
- Require verified authenticator enrollment before protected access. Confirmed
  TOTP behavior: six digits/30-second step, current step ±1 clock-drift window,
  at most one acceptance per account/time step, and expire interrupted enrollment
  after 24 hours. Issue 10 random recovery codes once, store only verifiers, and
  invalidate the old set on rotation. An unused code plus password may establish
  the normal MFA-authenticated session without removing MFA; factor replacement
  requires fresh authentication or an unused recovery code.
- Email/password public registration requires once-at-signup email verification
  and 2FA enrollment before protected access. Trim and case-normalize the full
  email identity; use a generic duplicate-safe signup confirmation and single-use
  24-hour links invalidated by resend. Production sends through a configured
  SMTP relay; acceptance tests capture mail locally. Exact copy/resend/abuse and
  relay-failure behavior remain OD-11 decisions. Each account owns a private scope;
  no automatic model-gateway access is granted by signup. A local host-admin
  command grants/revokes gateway entitlement only for email-verified, MFA-enrolled
  accounts; operators gain no trace/prompt/provider-secret read permission.
  Exact bootstrap, host-authority proof/audit and revocation propagation remain
  OD-11 decisions. This does not create shared workspaces or implicitly grant
  operators trace-data access.
- If a human loses normal MFA and recovery, a host-OS administrator performs
  offline recovery for one named account, revokes that account's sessions/factors
  and requires new authenticator enrollment. No public host-recovery endpoint is
  selected. Exact authority proof/audit and database-outage procedure remain OD-11.
- Low-friction human sessions persist across browser restarts for at most 30 days
  from creation and expire after 7 days of inactivity. Ordinary trace browsing and
  prompt approvals do not repeat authentication while the session is valid.
  Logout, revocation and expiry still terminate access. Activity measurement,
  session transport and revocation details remain OD-11.
- Password changes, authenticator replacement and recovery-code generation require
  full authentication no more than 10 minutes old, reusable during that window.
  Password-manager autofill/paste is supported; no routine periodic password
  change is required. Fresh logins still require both factors.
- Passwords contain at least 12 characters; passphrases are allowed and password
  composition rules are not imposed. Password reset uses a single-use verified-
  email link with a 30-minute expiry, preserves mandatory 2FA and revokes existing
  sessions. Exact password maximum/hash parameters, reset privacy and abuse
  controls remain OD-11 decisions.
- Short-lived service credentials for runtime clients.
- Gateway client keys and deployment-managed upstream provider keys are
  separate credentials; neither may be logged or exposed in model/event data.
- Event-ingestion credentials are a third, separate credential purpose, scoped
  to the authenticated integration. Define secure onboarding, client storage,
  expiry/revocation, and rejection of cross-purpose use before release.
  Event tokens authenticate reports; they do not grant session access/control.
- The initial demo may store purpose-separated credentials on the same host;
  no separate secret-storage or identity server is required. Protect authenticator
  seeds and provider secrets; same-host storage does not permit source-control,
  log or model/event exposure.
- Workspace management, OIDC platform accounts and workspace-managed BYOK remain
  deferred. Native registration/2FA is an explicit Phase 1 scope addition.
- Optional mTLS for trusted service-to-service deployments.
- Role and scope checks before trace access or action approval.
- TLS termination at Caddy or the cloud load balancer.
- Secrets supplied through protected deployment-local storage/configuration,
  not source control; an external vault is not a Phase 1 requirement.
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
LangChain4j
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
