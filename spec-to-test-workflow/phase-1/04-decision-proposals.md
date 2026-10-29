# Full Phase 1: Recommended decisions for review

Version: 0.2. Prepared: 2026-10-29.
Status: **PARTIALLY REVIEWED. DP-01 support target and the revised DP-02 direction
are confirmed: public native accounts, mandatory 2FA, offline/host recovery and
same-host purpose-separated credentials. Confirmed choices are reconciled into
source specs; detailed contracts, other proposals and technical evidence remain
pending.**

**Latest confirmation:** DR-007/DR-008 additionally select 30-day absolute/
7-day-idle persistent sessions, a reusable 10-minute sensitive-change authentication
window, password-manager-friendly input without periodic expiry, once-at-signup
email verification, private account scopes and an explicit gateway grant.
These specific choices are approved; other numeric values remain proposals.

DR-012 additionally approves the bounded guard decision core, connected-union
overlap semantics, six marker names, explicit validation failure and limits of
65,536 UTF-8 message bytes / 1,024 findings for that slice. This is partial
approval within DP-03/DP-10, not approval of detector patterns or the complete
gateway/resource proposal. Its scoped domain/intent materials are separate.

The user requested recommendations for the full release after reviewing the
Phase 0 gate. That request authorized preparation, not blanket adoption.
Subsequent explicit confirmations are tracked in the
[decision record](./05-decision-record.md). The [requirements](../../REQUIREMENTS.md)
remain the oracle. Every unapproved
number, route, code, rule, authentication choice and interface description newly
introduced below is a **proposal**, not an acceptance expectation.

This is a Phase 0 decision aid, not an approved domain model, intent diagram,
API/UI contract, implementation design, task list or frozen plan. It deliberately
keeps client feasibility as an evidence gate. No external documentation or live
integration was checked for this proposal; no candidate compatibility is claimed.

## 1. Recommended release posture

Keep the complete confirmed Phase 1 scope. Start with two bounded feasibility
tracks for OpenCode and VS Code Copilot, and an independent deterministic-engine
track using synthetic inputs. These are milestones within the full release,
not replacements for it.

Require at least one client/version/environment to demonstrate the entire
guarded path before accepting the release. Claim support only for the exact
tested combinations. A second candidate may remain explicitly experimental or
monitoring-only; that status cannot satisfy its guarded-path tests or waive any
full-release requirement. Review supported-client selection after evidence.

Do not add workspace administration, workspace-managed BYOK, ordinary archives,
attachments, output analysis, tool enforcement, offline analysis, HA or a broker.
Use Java/Maven/Spring MVC virtual threads, LangChain4j where compatible,
PostgreSQL/outbox and a separate React/TypeScript/Vite timeline as the initial
technology direction.

## 2. Decision coverage and approval sheet

Only the expressly recorded parts of a proposal are approved. A user may approve
some and reject or revise others. Passing technical feasibility is separate from
approving a preferred design.

| Proposal | Resolves / narrows | Recommendation | Approval |
|---|---|---|---|
| DP-01 | AMB-runtime-governance-001 | Evidence-gated client support; explicit adapter/protocol matrix, no inferred message mapping | Support target approved; topology/details/evidence pending; see DR-001 |
| DP-02 | AMB-runtime-governance-002 | Public native email accounts/2FA, same-host purpose-bound keys, private scopes, explicit gateway grant and low-friction sessions; DR-004 through DR-008 | Selected behavior/limits approved; delivery/token, grant, enrollment/recovery, session and runtime lifecycle details pending |
| DP-03 | AMB-runtime-governance-003 | Small fixed literal/RE2-compatible catalog, explicit typed markers and deterministic redaction selection | Pending |
| DP-04 | AMB-runtime-governance-004 | Request-bound approval, immutable policy revision, no automatic upstream retry or approval resume | Pending |
| DP-05 | AMB-runtime-governance-005 | Consent/ownership ledger, supported attach or reconnect, no silent fallback/restoration | Pending |
| DP-06 | AMB-runtime-governance-006 | Shared internal typed error model with protocol-specific wire mapping | Pending |
| DP-07 | AMB-runtime-governance-007 | Metadata-only versioned events, scoped idempotency, explicit ordering uncertainty and cursor reads | Pending |
| DP-08 | AMB-runtime-governance-008 | Atomic per-request decision/outbox, durable dispatch intent, no automatic dispatch recovery | Pending |
| DP-09 | AMB-runtime-governance-009 | Required-mode protocol relay, bounded streaming, reasoning exclusion only from monitoring sinks | Pending |
| DP-10 | AMB-runtime-governance-010 | Explicit starter limits and reproducible benchmark/recovery methodology | Pending |
| DP-11 | AMB-runtime-governance-011 | Single-node Compose deployment, metadata lifecycle, measured backup/restore objectives | Pending |
| DP-12 | AMB-runtime-governance-012 | Sequential domain/diagram/scenario review after approved decisions; no retrospective approval | Pending |
| DP-13 | AMB-runtime-governance-013 | Pinned greenfield toolchain and native quality gates; no package installation during preparation | Pending |
| DP-14 | AMB-runtime-governance-014 | Separate client approval and browser timeline surfaces, accessible contract-first states/copy | Pending |

The authoritative issue descriptions and REQ impact lists remain in the
[ambiguity register](./02-ambiguity-register.md). Approval of a row narrows that
ambiguity only where the supporting specification and evidence are complete.

## 3. DP-01: Supported integrations and protocols

**Recommend**

- Prototype OpenCode CLI/TUI and VS Code Copilot agent mode independently, pinning
  actual client, extension/plugin, OS and local/remote/profile versions in evidence.
  Do not invent version numbers before environment discovery.
- For each, demonstrate supported configuration APIs and truthful coverage
  detection before writing a production adapter.
- Prefer one inbound protocol initially if that protocol actually satisfies the
  selected client. Do not select Chat Completions, Responses or Messages merely
  because it is documented or LangChain4j has an upstream client.
- Treat new-human-message identification as an authenticated integration contract.
  The provider body alone is insufficient. Pair a submission identity with an
  exact verified mapping into provider content blocks; handle retries, generated
  summarization and tool continuations explicitly.
- If an integration cannot prove mapping or approval delivery, offer labeled
  monitoring-only operation or exclude it from production support. Do not infer
  a last-user-role mapping, inject unsupported metadata, or substitute a new agent
  harness.

**Reason/trade-off:** a narrow demonstrated adapter is more reliable than an
unverified universal proxy. Client APIs may make a candidate impossible to guard;
that is an acceptable feasibility finding, not grounds for weakening the guard.

**Required evidence:** per-client capability matrix from the
[coverage plan](./03-coverage-plan.md#6-feasibility-evidence-required-before-support-claims),
including no-dispatch upstream capture, concurrent identities, approval,
stream/tool-call fidelity and supported install/attach/reconnect behavior.
Record exact versions and unsupported cases. Client-specific protocol selection
remains an evidence-dependent decision after approval of this approach.

## 4. DP-02: Minimum authentication and authorization

**Review update:** the OIDC recommendation below is retained as historical
proposal context, not the selected design. DR-004 through DR-008 in the
[confirmation record](./05-decision-record.md) select public governance-native
accounts, mandatory authenticator 2FA, offline/host recovery and same-host
purpose-separated credentials, with email verification, private scopes, gateway
grants and selected low-friction session rules. AUTH-001 through AUTH-006 and
OD-11 record the confirmed scope and remaining contracts. Do not infer approval
of the original OIDC/allowlist/no-public-signup design or numeric values other
than DR-007's explicit human-authentication limits.

**Recommend**

- Use an existing external OIDC provider for browser human authentication, with
  authorization-code flow and PKCE. This is a recommended Phase 1 authentication
  choice, not adoption of IAM-001 through IAM-006 or a signup/profile platform.
  No native passwords, registration management, invitation or workspace UI.
- Configure authorization scopes in deployment-controlled configuration:
  immutable opaque scope IDs and allowlisted `(issuer, subject)` human bindings.
  A human may only select scopes already granted by that configuration.
- Authenticate gateway and event reporting with separate cryptographically random
  opaque credentials. Store only keyed digests server-side; compare safely and
  return raw values only on issuance. Never put keys in query parameters.
- Give each credential one purpose, one scope and one integration identity.
  Authenticate event tokens at ingestion only; they grant neither trace reads
  nor approval/session control. Authorize every data query from authenticated
  scope, not body/path ownership assertions.
- Pair a client to its human through authenticated browser onboarding plus a
  short-lived, single-use pairing challenge. A proposed challenge lifetime is
  5 minutes. The exact client-supported callback/polling mechanism needs DP-01
  evidence; no client-supplied human ID becomes authority.
- Bind each verified submission to that paired human identity. If a runtime
  cannot identify its submitter reliably, do not enable approval-capable guarding.
- Prefer OS-backed secure client credential storage; unsupported secure storage
  blocks that environment's support claim. Keep upstream keys in deployment
  secret files, not browser/client configuration or event records.
- Proposed runtime-key lifetime: 30 days, explicit rotation and immediate
  revocation for new operations using authoritative checks. No positive
  authentication cache in Phase 1. On revocation, cancel active requests and
  pending approvals for that credential; surface uncertainty if already dispatched.
  Provider-key replacement affects new dispatches; do not silently replay in-flight
  requests. Never expose a key version's secret value.

**Reason/trade-off:** OIDC avoids building a password system, but requires an
identity provider and approved browser/client pairing. Static scope assignment
is operationally simple but not a self-service organization model. Multiple
scopes must still be tested even for a single-user first deployment.

**Required source change:** decide AUTH-001 and OD-01/OD-05 explicitly; distinguish
Phase 1 OIDC authentication from deferred account/workspace management. Specify
issuance, revocation races, pairing and secure-storage evidence before marking
AMB-002 resolved.

## 5. DP-03: Deterministic catalog and redaction

**Recommend**

- Use literal matching and a linear-time RE2-compatible Java implementation,
  such as RE2/J, only after Java 25 compatibility and dependency review.
  Reject unsupported regex features at catalog build/validation, never fall back
  to Java backtracking regex. No user-authored expressions.
- Evaluate only the verified new-message text. Reject uninspectable/unsupported
  required content rather than skipping it; do not inspect history or separately
  retrieved context as a new submission.
- Catalog entries fix identifier, matcher, category, marker/action and priority.
  All entries start enabled. The only supported user change is enable/disable.
- Compile once per policy revision; bound input, rule count, pattern length,
  findings and execution as proposed in DP-10. Overflow is evaluation failure,
  not truncated findings or an allow decision.

### Candidate initial catalog

**Every pattern and marker in this table needs explicit review.** It is a small
indicator catalog, not comprehensive secret, PII, injection or safety detection.
Regex text is shown literally in code spans, not JSON escaped. Matching is
case-sensitive unless `(?i)` appears. Apply matchers to the original message,
not successively transformed text.

| ID | Matcher proposal | Fixed effect | Redaction priority |
|---|---|---|---|
| RG-001 | `(?i)\b(?:api_key\|api_token\|password)[ \t]{0,8}[=:][ \t]{0,8}([A-Za-z0-9_-]{16,128})\b`; redact capture group 1 only | `[REDACTED_CREDENTIAL]` | 600 |
| RG-002 | `\bAKIA[0-9A-Z]{16}\b` | `[REDACTED_API_TOKEN]` | 590 |
| RG-003 | `\bgh[pousr]_[A-Za-z0-9]{36,255}\b` | `[REDACTED_API_TOKEN]` | 580 |
| RG-004 | `\b[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,63}\b` | `[REDACTED_EMAIL]` | 400 |
| RG-005 | `\+[1-9][0-9]{7,14}\b`; E.164-shaped contiguous forms only | `[REDACTED_PHONE]` | 390 |
| RG-006 | `\b[0-9]{13,19}\b` followed by a deterministic Luhn check; only a passing candidate is a finding | `[REDACTED_PAYMENT_CARD]` | 380 |
| RG-007 | `\b[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}\b` followed by IBAN country-length validation and mod-97 check using a reviewed fixed country-length table | `[REDACTED_FINANCIAL_ID]` | 370 |
| RG-008 | Case-insensitive literal `ignore previous instructions` | Require submitter approval | Not applicable |
| RG-009 | Case-insensitive literal `reveal the system prompt` | Require submitter approval | Not applicable |
| RG-010 | Case-insensitive literal `instructions to harm a person` | Require submitter approval | Not applicable |
| RG-011 | Regex `^[ \t\r\n]*$` | Deny: empty/ASCII-whitespace-only message | Not applicable |
| RG-012 | Regex `(?i)^[ \t\r\n]*do it[ \t\r\n]*$` | Deny: explicitly selected weak-prompt indicator only | Not applicable |

The backslashes before table-delimiting pipes in RG-001 are Markdown table
escaping; the actual regex alternatives use plain `|`, not literal-pipe matching.
Do not transfer Markdown escaping into executable patterns.

Limitations must be published: examples omit many token families, spaced phone/
card/IBAN formats, Unicode email, obfuscated instructions and semantic safety
judgment. RG-008 through RG-012 can produce false positives for quoted, educational
or context-dependent text. In particular, rejecting `do it` is a product choice,
not a semantic quality assessment; reject or revise that catalog row if unwanted.
The IBAN country-length table needs its own pinned, reviewed reference before
RG-007 can be implemented. No real secrets belong in catalog fixtures.

### Proposed overlap algorithm

Collect attributed redaction intervals in the original message. Group intervals
that intersect, including transitively connected intervals. For each group:

1. Find the highest fixed priority. If more than one finding in this connected
   group shares that priority, treat it as a tie error and block dispatch,
   including when the connection is through another interval.
2. Replace the union of the group's covered interval with the highest-priority
   finding's typed marker. This conservatively removes the full sensitive span,
   even when a lower-priority finding extends beyond the winning interval.
3. Keep all matched-rule attributions, without original sensitive values.

Apply replacements right-to-left to avoid offset drift. Adjacent nonintersecting
intervals stay separate. Specify offsets at the text representation boundary and
test surrogate pairs/Unicode around matches.

**Behavior requiring approval:** union replacement and connected-group tie
handling concretize previously unspecified overlap mechanics. They may redact
extra text or reject a transitively connected tie.
A review may choose a different complete algorithm, but must preserve no partial
secret leak, explicit priority, tie failure and attributable findings.

After redaction, any deny blocks; otherwise any approval match requires approval;
otherwise forward the transformed or unchanged message. Redaction never suppresses
a deny/approval match found in the original text.

**Required evidence:** synthetic match, benign lookalike and relevant boundary per
rule; post-filter failures; every overlap/adjacency/tie case; exact transformed
payload; rules disabled; unknown rule/action/priority rejected; no-match allow;
worst-case input within proposed execution bounds.

## 6. DP-04: Approval and policy lifecycle

**Recommend**

- Approve the intent of proposed POL-005: one immutable active-policy snapshot per
  newly evaluated request; record catalog version, enabled-rule revision and
  matched-rule IDs in the decision.
- Allow an authenticated human to toggle built-ins for their configured scope
  only if explicitly granted a deployment-configured `policy.configure` permission.
  This is not a workspace role. Runtime/event keys never configure policy.
- Activate a validated revision atomically. New evaluations use it; already
  evaluated requests retain their snapshot. For an emergency revocation, cancel
  all not-yet-dispatched requests under that revision, including pending approval.
  Already-dispatched work cannot be described as undone.
- Bind an approval to scope, submitter, integration, session, submission,
  request, policy revision, original-message HMAC and redacted-payload HMAC.
  Use keyed HMACs rather than plain hashes of potentially guessable sensitive
  content. Approval authorizes this exact payload once.
- Keep original/redacted text only in bounded request memory for evaluation,
  supported submitter preview and forwarding. Do not persist it in decision,
  event, outbox, logs or metrics. The preview is available only to the submitter
  while the originating request is active and contains only the redacted content.
- Resolve approval and cancellation with one authoritative terminal transition.
  Cancellation/request expiry/revocation prevents dispatch if it wins before
  dispatch authorization; late approval cannot revive it. The exact concurrency
  boundary must appear in reviewed intent diagrams and race tests.
- Proposed approval wait is 120 seconds, capped by the remaining originating
  client/gateway request lifetime. UI absence is an explicit failure, not approval.
- Do not resume after cancellation/restart. Resubmission is a fresh request and
  evaluation. No automatic upstream model/tool retry in the initial release.

**Reason/trade-off:** bounded request memory avoids an accidental prompt archive.
Pending approval is lost on service restart and must be canceled, which is safer
and simpler than durable sensitive-payload recovery. An explicit resubmission UX
is needed; no promise of resumable approvals.

**Required evidence:** identity/content/payload/policy binding, replay, changed
content, expiry, cancellation and revocation races, unavailable UI, restart,
concurrent activation, no mixed policy versions and no stored prompt text.

## 7. DP-05: Consented client lifecycle and coverage

**Recommend**

- Maintain an ownership/consent record for integration-managed settings: prior
  value, applied value, configuration scope and consent revision. Record no secret
  values in this ledger.
- Use only supported installation/configuration APIs. Show proposed endpoint,
  model and hook changes before consent. Declining consent leaves settings alone.
- Attach existing sessions only through a demonstrated supported API; otherwise
  require reconnect/restart. Do not claim earlier capture or enumerate unexposed
  sessions.
- Report input enforcement, response observation and tool/lifecycle visibility
  independently. Proposed coverage heartbeat: every 10 seconds; after 30 seconds
  without authoritative freshness evidence, show unknown/degraded, not healthy.
  A heartbeat is not proof every request traversed the gateway.
- On withdrawal/disable: stop admitting guarded requests, cancel active pending
  approval/undispatched work and propagate in-flight cancellation. Require an
  explicit user decision before switching future sessions to native routing.
- On cleanup: remove only integration-owned settings whose current value still
  matches the applied value; preserve later user changes and report conflicts.
  Do not silently restore a direct-provider path. If safe cleanup is unsupported,
  report remaining settings and require manual review, not a success notification.
- Observation failure remains nonblocking; guarded-gateway failure remains
  fail-closed. No shared "connected" badge that conflates these guarantees.

**Evidence:** install once/new sessions, declined consent, changed settings,
disable/uninstall during approval and streaming, remote/profile boundaries,
stale heartbeat, route changes, collector/gateway outages and truthful UI labels.

## 8. DP-06: Typed errors and wire mapping

**Recommend** one internal error envelope:

`code`, `category`, `correlationId`, `retryable`, `executionState`, and a safe
catalogued message. No submitted content, regex matches, tokens, arbitrary
upstream bodies or stack traces in client-visible messages.

| Failure | Proposed management/API HTTP mapping | Proposed machine code family |
|---|---|---|
| Missing/invalid authentication | 401 | `AUTHENTICATION_REQUIRED` |
| Scope/purpose/submitter permission denied | 403 | `ACCESS_DENIED` |
| Malformed/schema-invalid input | 400 | `INVALID_REQUEST` |
| Missing/ambiguous human-message mapping | 422 | `SUBMISSION_MAPPING_INVALID` |
| Policy deny | 403 | `PROMPT_DENIED` |
| Body/new-message/decoded-output size exceeded | 413 before response starts | `PAYLOAD_LIMIT_EXCEEDED` |
| Admission/rate/queue capacity exceeded | 429 | `CAPACITY_EXCEEDED` |
| Conflicting duplicate/replayed transition | 409 | `STATE_CONFLICT` |
| Policy/evaluator/dependency unavailable | 503 | `REQUIRED_DEPENDENCY_UNAVAILABLE` |
| Evaluation/upstream deadline exceeded | 504 before response starts | `DEADLINE_EXCEEDED` |
| Uncertain external outcome | 502 before response starts | `EXECUTION_OUTCOME_UNKNOWN` |

These are recommended management/API mappings, **not an assumption that all
provider protocols accept this envelope**. Each inbound adapter must map the same
internal error into its verified protocol's error shape. After streaming headers/
bytes are sent, use the protocol's demonstrated failure representation or terminate
the transport and record partial failure; never inject an invented success-shaped
completion, change the HTTP status retroactively, or contaminate ordinary content.

No automatic retry solely because an error is marked retryable. The field refers
to safe fresh operations, never authorization to replay uncertain upstream work.
Approval-required is a pending decision, not a successful completed generation.

**Evidence:** every error class before and after applicable transport boundaries,
protocol-specific compatibility, safe correlation and inspection for synthetic
credential/message leakage. Concrete copy and protocol mappings require review.

## 9. DP-07: Events, ordering, trace reads and proposals

**Recommend approval of EVT-002/003 and the bounded-query intent of UI-002**, with
the following version-1 contract direction:

- Metadata envelope: event ID/version/type, authenticated producer/scope,
  trace/span IDs, parent ID where exposed, server-received time, optional source
  time/sequence, execution status and applicable decision/error references.
  Use explicit telemetry availability/coverage states; never fill missing values
  with fabricated timestamps/durations/parents.
- Derive producer and scope from authentication. Treat reported identity and
  parent links as claims to validate. Producers cannot create authoritative guard
  decisions; only the gateway's decision transaction does that.
- Store no ordinary prompt/response/tool bodies. Include bounded safe metadata
  such as tool name, outcome, duration and rule IDs; exclude tool arguments,
  results, unrecognized arbitrary attribute maps and reasoning text by default.
- Scoped identical event IDs are idempotent on a canonical validated envelope;
  include event type/version and content in the comparison. Conflicts reject
  rather than overwrite. The accepted receipt timestamp remains stable on retry.
- Preserve producer sequence where present. Use server receipt plus event ID for
  a deterministic display order when necessary, but label it as receipt order,
  not proof of causal/source-clock order. Source time is informational.
- Display late/missing parents as unresolved relationships; reject cycles or
  cross-scope parent references. Later valid parents may resolve hierarchy.
- Proposed trace fields distinguish execution state from telemetry completeness:
  e.g. execution running/completed/failed/canceled/unknown, and telemetry
  complete/incomplete/unknown/unsupported. A completed execution can have an
  incomplete timeline. These names need final contract review.
- Incomplete state records cause and optional known missing count/time range.
  Unknown extent stays absent. No separate gap event.
- Propose trace-list filters for time/application/status/trace ID, opaque
  integrity-protected cursors and maximum 50 records/page. Bind cursors to scope,
  filters and snapshot cutoff. Exclude new traces after that cutoff from the
  same pagination traversal; an explicit refresh starts a new traversal.
  Mutable statuses may still change: do not promise a full historical MVCC
  snapshot across requests without a separate design.
- Retrieve timeline metadata in bounded pages, proposed 200 events/page. Order
  by a stable receipt/event-ID key; allow missing parents until fetched. Do not
  advertise globally ordered complete trees from partial pages.

**Reason/trade-off:** metadata-only capture fits the current product boundary and
reduces disclosure. Users will not get archived prompt/response/tool text. Receipt
ordering is deterministic but cannot reconstruct missing causal facts.

**Evidence:** duplicates/conflicts/out-of-order/late parents/cycles, forged
authority, scope isolation, stable cursor continuation, changing trace status,
incomplete extent and useful timeline without payload/reasoning text.

## 10. DP-08: Decision durability and crash boundaries

**Recommend**

1. Persist one request's decision and corresponding outbox record atomically
   before dispatch is eligible. Keep that transaction short; no network or human
   wait inside it. Approval-required decisions alone do not authorize forwarding.
2. After valid approval if required, persist the exact final authorization
   binding and its outbox record before dispatch. Recheck request lifetime,
   cancellation/revocation and ownership in the final transition.
3. Persist a dispatch-intent/attempt record using one authoritative owner before
   upstream I/O. Enforce a unique request/attempt identity and a conditional
   transition so simultaneous workers cannot both dispatch.
4. Treat dispatch intent as possibly dispatched after a crash, never as proof
   of success. Do not automatically replay a request whose upstream outcome is
   unknown. On restart cancel pending approvals and undispatched requests; mark
   dispatch-intent work uncertain unless external evidence establishes outcome.
5. Repeated client requests with the same request identity and identical bound
   content return only inspectable request state, not another upstream invocation.
   Conflicting content is an error. Because response bodies are not archived,
   do not promise cached generation replay. Explicit resubmission uses a new ID
   and re-evaluation; uncertain work needs a warning before deliberate resubmission.
6. Publish observation/index events at least once with consumer idempotency.
   Outbox retries cannot dispatch model/tool work. Record bounded retries and
   exhausted state; do not delete failed jobs as though completed.
7. Preserve per-trace incompleteness independently of the ordinary observation
   queue. Reserve a bounded metadata journal for loss summaries; checkpoint it
   to PostgreSQL on recovery. It contains no prompts, outputs or credentials.

**Storage-failure edge:** a reserved file on the same failed disk does not make
loss reporting durable. If both PostgreSQL and the journal are unavailable,
mark service coverage unhealthy immediately and retain bounded active-trace
loss state in memory. Recovery must conservatively mark traces whose capture
window overlaps the outage as incomplete/unknown, without invented counts.
Establish how the outage interval survives restart, using durable service
lifecycle/last-checkpoint records and external operational evidence. If it cannot
be established, show unknown completeness rather than reconstructing a false pass.
Failure-injection evidence is required before approving this recovery contract.

**Reason/trade-off:** conservative interruption/uncertainty avoids unsafe replay,
but users may have to resubmit. This is not exactly-once execution. A full
dispatch-idempotency protocol can be added later with demonstrated upstream support.

**Evidence:** crash injection before/after each commit, dispatch intent, socket
write and completion persistence; canceled/expired approval; concurrent ownership;
duplicate requests; DB/queue/spool/journal failure; restarts and honest uncertainty.

## 11. DP-09: Response transport and reasoning exclusion

**Recommend**

- Implement exactly the delivery modes required by each approved client/protocol,
  including streaming if required. Do not select buffering to conceal missing
  streaming support. Use bounded incremental parsing and backpressure.
- Preserve ordinary text, tool-call identities/arguments and protocol ordering;
  monitoring must not rewrite them. Parse/model via LangChain4j only where fidelity
  is demonstrated; an explicit adapter is required for unsupported protocol detail.
- Propagate cancellation and close upstream resources where supported. Once any
  upstream work may have occurred, report partial/uncertain outcome accurately.
- Do not pre-delivery scan, redact or approve model output. Protocol parsing and
  resource bounds are infrastructure, not an output-content safeguard.
- Keep provider transport separate from a positive allowlist of monitorable
  metadata. Known reasoning fields never enter logs, queues, spools, outbox,
  exports or browser views, including nested generic response objects.
- Do not persist unknown arbitrary provider fields. Raw response diagnostics,
  HTTP wire logging and body-bearing exception messages must be disabled/redacted.
- Preserve provider response semantics toward the client; ARC-002's exclusion
  applies to monitoring/archive/display, not an unapproved modification of
  upstream ordinary content. Document supported field mappings per protocol,
  and record only reasoning availability/capture status.

**Evidence:** exact ordinary-content/tool-argument equivalence, required delivery
modes, incremental fragments, cancellation/partial failure, memory limits, nested
reasoning fields and all monitoring sinks. Unknown unstructured reasoning is
not claimed detectable; this is field-aware exclusion.

## 12. DP-10: Proposed starter limits and measurable targets

**All values below need approval and measurement.** They are a coherent starting
configuration for a single 2-vCPU/4-GiB reference host with inference elsewhere,
not measured capacity or guaranteed production defaults. Scope fairness refers
to authorization scopes, not deferred workspaces.

| Resource / behavior | Recommended initial proposal |
|---|---|
| Gateway encoded request / new-message text | 1 MiB request, 64 KiB UTF-8 new-message text; both enforced, no truncation |
| JSON boundary if selected | UTF-8 only; max nesting 32; duplicate keys rejected; explicit schema/field support per adapter; compressed request bodies rejected initially |
| Catalog | At most 64 enabled rules, 512 pattern characters/rule, 1,024 findings/message; compilation/validation before activation |
| CPU evaluation | 2 bounded evaluation workers, no waiting queue; 250 ms evaluation deadline after admission; timeout invalidates any late result |
| Live guarded request contexts | 32 deployment-wide, 8 per scope, including pending approvals; excess rejected rather than indefinitely queued |
| Upstream active calls | 8 deployment-wide, 4 per scope; no unbounded admission wait |
| Human approval / total originating request | Up to 120 seconds for approval, 300 seconds overall, always capped by demonstrated client deadline; no independent approval lifetime extension |
| Upstream idle / total wait | 30 seconds idle, 180 seconds total, both capped by remaining originating-request lifetime |
| Response decoded-byte cap / relay buffer | 16 MiB per response, 64 KiB maximum buffered per active relay, 16 KiB read chunks; protocol-frame parser state separately capped at 256 KiB |
| Tool-call argument assembly | 256 KiB per call within the total response cap; fail explicitly, never truncate arguments |
| Event ingress | 16 KiB validated metadata/event; 100 events and 2 MiB maximum per accepted batch; no arbitrary body fields |
| Observation in-memory queue | 1,000 events or 16 MiB, whichever first; nonblocking overflow handling |
| Durable observation spool | 64 MiB total, including 1 MiB reserved for bounded trace-loss summaries; no ordinary payload content |
| Observation DB batches | At most 100 records; flush within 100 ms under available capacity; not applicable to authoritative guard decisions |
| Outbox active backlog | 10,000 rows or 128 MiB accounted bytes, whichever first; block new guarded dispatch before commit if it cannot be admitted durably |
| Outbox retries | 8 delivery attempts total, initial included; after failed attempt n, full-jitter delay in `[0, min(30 seconds, 100 ms * 2^(n-1))]`; then inspectable exhausted state |
| DB connection pool | 12 connections total with bounded acquisition of 1 second; account for API, worker and administrative contention in tests |
| Trace list / timeline page | 50 traces / 200 metadata events maximum; no unbounded expansion |
| Basic request admission rate | 60 new guarded requests/minute/scope, burst 8; still subject to concurrent/CPU/upstream limits |

Backpressure must not turn observation backlog into a pause in agent execution.
Guard requests may fail closed when authoritative state cannot commit. Before a
response starts, reject over-limit work with the agreed error contract; after it
starts, terminate with explicit partial failure. Never silently switch modes.

Proposed benchmark protocol:

- Fixed reference-host resources and exact JVM/DB/container versions; documented
  JVM memory settings, no local model, bounded synthetic payloads and local
  deterministic upstream fixture. Record CPU, RSS/heap, buffers, DB waits and
  queue depths in addition to latency.
- Five-minute warmup, then 15-minute measured runs, three repeats. Publish sample
  counts and raw aggregate distributions; require at least 1,000 observations
  for each reported p95 and report failure/timeout rates, not just successful
  requests. Do not submit private data to external benchmark services.
- Guard overhead target: p95 at most 100 ms for evaluation plus authoritative
  pre-forward commit, excluding human approval and upstream model latency,
  under eight concurrent synthetic calls. Separate admission, evaluation and
  commit timings. The 250 ms deadline is a failure bound, not a latency success.
- Timeline target: p95 at most 500 ms for the first page of 50 traces over
  100,000 metadata events distributed across 1,000 traces; record authorization,
  query/index setup, warm/cold cache state and large/missing-parent cases.
- Saturation tests at and beyond every approved bound, with two competing scopes,
  slow/canceled upstreams, full storage and worker failures. Verify observed
  bounds and structured outcomes; no successful capacity claim from config alone.

The proposed original artifact quotas/compression/ordinary-payload retention
figures remain deferred; do not carry them into this Phase 1 limit set.

## 13. DP-11: Deployment, metadata lifecycle and recovery

**Recommend**

- First supported deployment: one host running Compose, governance service,
  PostgreSQL, static timeline UI/reverse proxy and bounded workers; optional
  external OIDC provider. Caddy/TLS for shared/remote access; no public insecure
  service, local-model inference, Kafka, Kubernetes or HA claim.
- Keep services logically separated and access PostgreSQL over its client/server
  interface. Prefer Spring JDBC plus Flyway initially over adding jOOQ code
  generation; explicit scoped SQL remains mandatory.
- Proposed metadata retention: 30 days for trace/event/decision metadata, 7 days
  for delivered outbox records, 30 days for exhausted-job metadata. Pending work
  is never silently deleted by TTL. Approval payload text is never persisted.
- Initial retained metadata cap: 1 GiB accounted live metadata, excluding explicit
  PostgreSQL indexes/WAL/backups. Measure physical disk separately; reserve at
  least 10 GiB for DB/WAL and surface an operational low-space condition at
  20% free. Live-data retention does not promise a physical DB-file size.
- At quota/space pressure, expire eligible data through a bounded authorized
  process; if still full, reject new guarded work and apply honest observation
  incompleteness. Never evict unexpired authoritative decisions to fabricate space.
- Proposed production recovery objectives: RPO at most 24 hours, RTO at most
  4 hours. Nightly encrypted DB/config backup to a separate failure domain;
  seven daily restore points. Keep encryption keys/IdP configuration recovery
  separate and verify access, not plaintext secrets in a DB dump.
- Restore to an isolated environment and prove authorization mappings, policy
  revisions and trace/decision consistency. Treat pending approvals as canceled,
  uncertain dispatches as uncertain, and missing post-backup telemetry as
  incomplete/unknown. Do not claim recovery of external side effects.
- Explain backup retention and deletion lag explicitly. No ordinary artifacts
  exist to restore in Phase 1; document that exclusion rather than inventing
  archive support to satisfy OPS-005 wording.

**Reason/trade-off:** a single-node starter has simple operations but no failover.
Daily backups can lose up to a day of metadata; the user must approve that risk.
Full-disk/restore tests are production gates, not inferred from hardware estimates.

## 14. DP-12: Remaining workflow prerequisites

**Recommend**

1. Review these proposals and record per-row approve/revise/reject decisions.
2. Amend affected source requirements and OD/PD statuses only after approval;
   preserve existing requirement IDs and deferred exclusions.
3. Complete feasibility-dependent decisions; maintain failed/unsupported evidence.
4. Re-run ingestion fingerprinting/impact review for changed sources and update
   testability; leave genuinely unresolved rows blocked.
5. Present a pure business domain model and invariants. Then draft a separately
   versioned Mermaid intent artifact with guards/errors/response branches and
   obtain explicit user approval.
6. Only then author concrete scenarios, shared API/UI contracts and baselines,
   shared design, independent frontend/backend tasks, and Phase 6 review.

No instruction to prepare recommendations approves a diagram, a task list, a
proposed source row or an acceptance freeze. Do not use blanket approval to
erase unresolved feasibility evidence.

## 15. DP-13: Toolchain and quality setup

**Recommend**

- Greenfield Java 25/Maven application; supported Spring Boot and LangChain4j
  versions selected and pinned after compatibility discovery, not guessed here.
  Spring JDBC, Flyway, Spring Security, JUnit 5/Testcontainers and the reviewed
  regex dependency. React/TypeScript/Vite frontend with a pinned Node LTS.
- Use Maven Wrapper, deterministic dependency versions and the frontend lockfile.
  Do not reuse the unrelated stock project's implementation or dependency versions
  merely because they share the workspace.
- Adopt formatting, static analysis, compile/build and native unit/integration
  checks through reviewed manifests/CI. Proposed Java choices: Spotless,
  compiler warnings and a reviewed static-analysis plugin compatible with Java 25.
  Proposed frontend checks: TypeScript, ESLint, formatter, native unit/component
  runner and production build. Exact commands follow the actual manifests.
- Keep Playwright/TypeScript for protected UI and API acceptance under the reusable
  guard's supported layout. Resolve `vasu-playwright-utils`, `playwright-cli`,
  helper paths and browser projects explicitly before authoring. JUnit supporting
  tests cannot silently replace the workflow's protected acceptance coverage.
- Copy only reviewed workflow adoption files when setup is approved. Keep
  supporting Java/frontend tests outside protected acceptance paths; wire
  freeze-integrity and applicable native checks into CI before freeze.
- Capture baseline command/scope/result before implementation; missing tools need
  explicit setup, failures need dispositions, and no violations may be introduced.
  Do not report absent scripts as successful checks.

**Evidence:** pinned manifests, tool compatibility, exact working directories/
commands, representative passing setup checks, reviewed exclusions and recorded
baseline failures. No application command was run or dependency installed here.

## 16. DP-14: User-facing surfaces and state handling

**Scope update:** DR-006 additionally requires public native registration, 2FA
enrollment/login and approved recovery surfaces. These are now confirmed scope,
but their exact contracts/copy remain pending. The workspace exclusions below
do not exclude these authentication surfaces.

**Recommend**

- Browser timeline UI: authorized trace list, paginated nested metadata timeline,
  independent execution/completeness status and coverage dimensions; no payload
  archive, reasoning display, output scanner or workspace administration.
- Submitter-only client integration UI: request-bound redacted preview, matched
  rule explanations, explicit approve/deny-or-cancel and expiration. The timeline
  UI is not a required component of the enforcement path; absent client approval
  capability blocks approval-capable guarding.
- Policy toggles: a small authorized scope-configuration surface only for humans
  granted `policy.configure`. All built-ins initially enabled; names/actions/
  priorities read-only, save creates a new revision. Do not add general policy
  authoring or workspace roles.
- Prefer native semantic controls, visible labels, keyboard navigation and
  accessible status announcements. Define exact role/name/copy rows before tests;
  do not rely on arbitrary DOM selectors or add `data-testid` by default.
- For each view/action, explicitly contract loading, empty, success, every API
  error, stale/degraded/unsupported data, disabled/read-only permissions,
  double-submit and navigation while pending. Canceling the submitter's
  originating request must end approval; merely leaving the separate timeline
  page must not cancel unrelated agent work.
- Initial proposal: manual refresh for trace data, no live token display. Preserve
  selected trace and expansion state on refresh; represent stale data honestly.
  Review refresh behavior and pagination before approving UI-002.

Proposed review-copy examples, **not test expectations yet**:

| Situation | Candidate visible copy / semantic intent |
|---|---|
| Telemetry empty and capture confirmed | `No activity events recorded.` |
| Missing telemetry | `Activity capture is incomplete.` followed by safe known cause |
| Unknown coverage | `Coverage is unknown.`; never `No activity` |
| Native-provider bypass | `Prompt guarding is not active for this route.` |
| Reconnect needed | `Reconnect or restart this session to activate monitoring.` |
| Approval pending | `Your approval is required before this message is sent.` |
| Approval canceled/expired | `This request ended without approval. Submit a new request to try again.` |

**Evidence:** contract-bound locators, full state/case matrix, authorization
differences, keyboard/screen-reader checks and explicit distinction among execution
completion, missing telemetry and input enforcement.

## 17. Source dispositions and review request

If these recommendations are accepted, proposed source rows POL-005, EVT-002,
EVT-003 and UI-002 would need explicit promotion with concrete amended criteria.
OPS-001's minimal deployment intent would likewise need explicit approval.
INP-001/INP-003 need the selected protocol/limits/deadline written into criteria,
not merely a configuration default. OPS-004 should be narrowed to active
metadata/worker/latency metrics, excluding deferred archive metrics.
INT-006 and ARC-005 remain proposed within deferred credential/archive contexts.

Do not change any source status based on this document alone. The following
remain evidence-dependent even after design preferences are approved:

- Exact supported client/version/environment and provider protocol.
- Secure pairing/storage, verified submission mapping and supported approval UI.
- Field-complete provider/management/event contracts and exact UI locators/copy.
- Pinned dependency compatibility and native commands.
- Measured detector/capacity/failure/recovery results.

For review, record approvals by DP ID and any amendments. Prioritize DP-01/02
(integration/authentication), DP-03/04 (catalog/approval), then DP-06 through
DP-11 (contracts/durability/bounds/recovery). These are observable product choices,
not internal implementation details an agent should silently select.
