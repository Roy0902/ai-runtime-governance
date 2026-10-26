# Technical Baseline

This document records the initial framework, infrastructure, and hardware
choices for AI Runtime Governance. The baseline is intended for a single-user
or small-team deployment that can run locally, on a VPS, or in a private or
managed cloud environment.

The choices are deliberately conservative. The first implementation should
optimize for correctness, stability, and straightforward operations before
introducing additional distributed infrastructure.

## Assumptions

- The governance service does not host a large local model.
- Models may be local services, remote services, or cloud APIs.
- The service must proxy or observe model and MCP/tool activity.
- Policy decisions for critical actions are synchronous.
- Trace persistence and analysis are asynchronous where possible.
- PostgreSQL is available as a concurrent client/server database.
- The first deployment may run all core components on one machine.

If a local model is hosted on the same machine, its CPU, memory, and especially
GPU requirements must be planned separately. The hardware below covers the
governance service, not model inference.

## Selected application stack

### Backend

| Area | Choice |
|---|---|
| Language | Java 25 LTS |
| Build | Maven |
| Main framework | Spring Boot, using the current supported release compatible with Java 25 |
| HTTP server | Spring MVC with virtual threads initially |
| Streaming | Servlet streaming or asynchronous response handling |
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

The initial timeline UI may use:

```text
TypeScript
React
Vite
```

The frontend is not part of the policy-critical path. It should consume the
timeline and query API and must not be required for policy enforcement.

## Persistence and event processing

### Primary database

Use PostgreSQL for:

- Trace and span metadata
- Policy definitions and versions
- Policy decisions
- Approval requests and outcomes
- Alert records and delivery status
- Runtime identities
- Analysis results
- Timeline query indexes

Do not use SQLite as the primary deployment database. The system must support
concurrent writers and readers through a server database.

### Large payloads

Store large prompts, model responses, tool output, and generated artifacts in
S3-compatible object storage or a controlled artifact volume. PostgreSQL should
store:

```text
artifact_id
trace_id
content_hash
content_type
size_bytes
redaction_status
storage_reference
```

### Initial event delivery

Start with a PostgreSQL transactional outbox:

```text
request
  -> policy decision
  -> transactionally record decision and outbox event
  -> background publisher/worker
  -> alerts, indexing, analysis, and exports
```

This avoids operating Kafka during the first single-user deployment while
preserving a reliable asynchronous boundary.

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

All worker queues must be bounded and must expose retry, failure, and dead-letter
behavior. No background failure should be silently discarded.

## Request and policy architecture

```text
Runtime client or harness
          |
          v
  Governance gateway
          |
          +-- authenticate and establish trace context
          +-- pre-input/context policy
          +-- model proxy or forwarding
          +-- output and tool-call inspection
          +-- action policy and approval
          +-- event/outbox write
          |
          +--> local or cloud model
          +--> MCP/tool service
```

The critical path should contain only the work required to make a safe decision:

```text
authenticate
  -> validate
  -> load policy snapshot
  -> evaluate deterministic rules
  -> allow, deny, constrain, or require approval
```

The following should normally be asynchronous:

- Full audit indexing
- Alert delivery
- Timeline materialization
- Payload compression
- Offline reasoning analysis
- Tool recommendation generation

If the governance service is unavailable, the configured policy decides whether a
critical action fails closed, uses a signed cached policy, or is allowed only for
an explicitly low-risk operation.

### Concurrency model

Use virtual threads for request and proxy operations that spend time waiting on
network or database I/O:

```text
virtual thread per request
  -> input policy
  -> model/MCP I/O
  -> response streaming
  -> compact event enqueue
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
- Per-client and per-tenant request rates.

Streaming, backpressure, upstream timeouts, cancellation propagation, and
bounded buffers are required for high throughput. A virtual thread can still
consume excessive memory if it retains a large prompt, response, or tool result.

## Security baseline

- OIDC/OAuth2 for human users.
- Short-lived service credentials for runtime clients.
- Optional mTLS for trusted service-to-service deployments.
- Role and scope checks before trace access or action approval.
- TLS termination at Caddy or the cloud load balancer.
- Secrets supplied through deployment secret management, not source control.
- Redaction before persistence when possible.
- Separate operational logs from detailed audit payloads.
- No model-supplied identity or policy result is trusted.
- Trace and event data is tenant/application scoped.
- Critical policy and audit decisions are independently authenticated.

The request context should carry only request-scoped information such as:

```text
trace_id
request_id
authenticated principal
tenant/application identity
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
- Streaming model responses where possible.
- Payload size limits.
- Connection pooling sized to the database.
- JFR and GC logging during performance testing.
- Virtual threads for I/O-bound request handling.
- Bounded executors for CPU-heavy scanning and analysis.

Evaluate ZGC only if measurements show that G1 pauses materially affect p95 or
p99 proxy latency on the target workload.

## Initial decision

The initial development baseline is:

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

The first target deployment is a single-node local or cloud installation using
approximately 2 vCPU, 4 GB RAM, and 40-80 GB SSD. A 1-2 vCPU, 2 GB instance may
work for low-volume use with strict payload and worker limits. A 4 vCPU, 8 GB
instance is reserved for comfortable growth.

This baseline intentionally does not include Kafka, Kubernetes, a managed
database, or a local inference GPU. Those are later scaling or deployment
choices, not prerequisites for the first useful version.
