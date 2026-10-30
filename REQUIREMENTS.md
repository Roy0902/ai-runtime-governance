# Phase 1 Requirements Specification

## Status and purpose

This is a requirements draft for developers and coding agents, not a statement
of implemented capability or production readiness. It defines the initial
release of AI Runtime Governance as an AI-agent monitor with a prompt guard. The
[README](./README.md) describes the product direction; the
[technical baseline](./TECHNICAL_BASELINE.md) describes the selected architecture.

The release focus is prompt guarding and visualization of the observable agent
activity loop. Public self-service native accounts with mandatory two-factor
authentication are also confirmed for Phase 1. The earlier broad service,
workspace, BYOK, payload
archive, attachment-scanning, and offline-analysis scope is not a Phase 1
acceptance gate; those capabilities remain candidates for later product
decisions.

Requirement IDs are stable references. **Confirmed** requirements express
approved behavior; the release boundary identifies which are Phase 1 gates.
**Deferred** requirements remain outside Phase 1 and are not acceptance gates.
**Proposed** requirements and numeric targets need review and are not approved
defaults. Open decisions identify gaps that block the affected implementation
or release acceptance. MUST applies to confirmed requirements; proposed rows
describe candidate behavior only.

Each requirement below includes an observable acceptance criterion. Detailed
test implementations and physical database schemas are outside this document.

## Terms and actors

- **Phase 1 principal:** an authenticated human submitter or runtime/service
  identity. The application manages human accounts with password and mandatory
  authenticator-based two-factor authentication. Runtime credentials have
  separate purposes; an external identity service is not required.
- **Authorization scope:** the access boundary resolved from authenticated
  identity/credentials for gateway requests, event ingestion, trace access, and
  approval. Each native account owns a private authorization scope; traces,
  approvals and client credentials are not shared across accounts. A caller-
  supplied scope identifier alone grants no access. Exact identifiers and
  lifecycle remain open; shared workspaces are not required.
- **Workspace / tenant (deferred platform):** an isolated ownership and authorization boundary.
  One user may belong to multiple workspaces; a workspace may have many users.
- **User:** a human principal; approval requires an authenticated identity tied
  to the submitting user. Public native registration is included in Phase 1;
  OIDC-backed platform accounts remain deferred.
- **Owner, operator, viewer:** deferred workspace roles; not deployment administrator roles.
- **Deployment administrator:** operates the service, OIDC configuration,
  encryption keys, and secret-manager connection where enabled. Data access for
  this actor remains an open decision; deployment access is not implicitly a UI role.
- **Runtime client:** a program using credentials bound to its Phase 1
  authorization scope; workspace-bound credentials are a deferred platform design.
- **Integration:** an install-once client extension/plugin that manages
  supported session activation, consented gateway routing, and supplemental
  hooks/events. Candidate clients are OpenCode CLI/TUI and VS Code Copilot agent
  mode; supported versions, APIs, and model protocols remain unverified.
- **Monitored activity:** agent, model, and tool events reported by a supported
  integration. Activity outside that boundary is not visible to the monitor.
- **Reasoning loop:** the ordered observable execution sequence, including
  model calls, tool calls/results, retries, handoffs, and failures. It does not
  mean private hidden chain-of-thought.
- **Prompt guard:** configured checks applied to the newly submitted user
  message before it is forwarded to a model. System/developer instructions,
  prior conversation history, and separately assembled or retrieved context are
  outside the Phase 1 guard's input scope.
- **Ordinary payload:** prompt, model response, or tool input/output, excluding
  identified reasoning fields and integration credentials.
- **Reasoning artifact:** model/runtime-exposed reasoning telemetry; unavailable
  private reasoning is neither inferred nor reconstructed.

## Release boundary

Included: configurable deterministic rules/patterns for prompt content,
sensitive data, and injection/safety indicators on the newly submitted user message only;
allow, deny, redact, and human-approval outcomes; correlation of guard decisions
with observable agent activity; and a timeline of the reported model/tool
execution loop.

OpenCode CLI/TUI custom providers and GitHub Copilot agent mode in VS Code using
BYOK custom endpoints are candidate integrations, not Phase 1 commitments.
Evaluate both; release acceptance requires at least one fully verified guarded
client/version/environment. A candidate may have explicitly labeled
monitoring-only support, but that does not satisfy the guarded-release gate.
The first feasibility target is Windows with WSL; missing WSL setup must be
planned and verified, not assumed available.
Model requests routed through the Java gateway are guarded and model responses
are monitored; hook/plugin events supplement tool and lifecycle visibility.
Sessions that use the agent's native provider path bypass the gateway and are
not described as guarded. VS Code BYOK custom endpoints are currently
experimental. Clients use a gateway key; the Java service uses a separate
deployment-managed upstream provider key. Exact model protocols, key
issuance/rotation, upstream provider selection, rule mechanics, payload
retention, account/workspace model, credential
management, and deployment shape are not silently selected by this release
boundary. Workspace administration and workspace-managed BYOK credential
storage, ordinary archives, attachment
scanning, output findings, offline analysis, and enterprise features are not
Phase 1 acceptance gates. No support is claimed for activity that bypasses the
selected integration. Tool-event observation is not tool-action authorization;
tool servers retain their own authorization responsibilities.

The initial deployment is a demo used by one person, but public self-service
registration and authenticated HTTPS Internet access are required. The application
manages passwords and authenticator-based 2FA, compatible with Google Authenticator
or Microsoft Authenticator; passwords are stored as secure salted verifier hashes.
Offline single-use recovery codes are used with the password, with a controlled
host-administrator recovery procedure if normal recovery options are lost.
Different gateway, event-reporting and upstream-provider credentials may be
stored on the same demo host; no separate credential-storage or identity server
is required. Secret protection and purpose separation still apply.
Registration uses email and password. Trim surrounding whitespace and case-
normalize the full email address for account identity/uniqueness. Email
verification and 2FA enrollment are required before protected account access.
Verification is a signup requirement, not a repeated login step. Return the same
generic signup confirmation for new, pending and already-verified addresses; do
not disclose whether an address is registered. Send verification through a
deployment-configured outbound SMTP relay. Verification links are single-use,
expire 24 hours after issuance and are invalidated when resent. Acceptance tests
capture outgoing messages locally; they do not send real email. Exact confirmation
copy and resend/rate-limit rules remain OD-11.

Each account owns its private scope. New accounts do not automatically receive
model-gateway access or use of the server's provider budget; an explicit
deployment-operator grant is required.
Human sessions survive browser restart for at most 30 days and expire after
7 days of inactivity, whichever comes first. Ordinary browsing and prompt approval
use a valid session without repeated authenticator challenges. Password changes,
2FA replacement and recovery-code generation require full authentication no more
than 10 minutes old; reuse that confirmation within the window. Password-manager
autofill and paste are supported; there is no mandatory periodic password change.
Detailed verification/enrollment, activity measurement, session revocation,
credential lifecycle, operator grants and recovery remain OD-05/OD-11 decisions.
Workspace administration and the broader OIDC account platform remain
deferred; public native registration does not promote those requirements.

### Client-independent guard decision core (confirmed first slice)

The first development-material slice is the guard decision core: trusted findings
for one already-identified new human message and a trusted catalog revision yield
an attributable decision and redacted message. It does not detect real secrets,
identify agent submissions, grant human approval, persist authorization or dispatch
requests. WSL is not a prerequisite for this slice; it is deferred until the
WSL-specific integration tests. Full release and client requirements remain intact.

The following refinements of GUARD-002/GUARD-003 and POL-001/POL-002/POL-006
are confirmed for this slice:

- Redaction intervals refer to the original message. Group intersecting intervals,
  including transitively connected intervals, and replace the entire group union
  with the highest-priority finding's catalog marker. Adjacent nonintersecting
  findings stay separate. More than one finding tied at a connected group's
  highest priority is an evaluation error, including transitively connected ties.
- The marker vocabulary is `[REDACTED_CREDENTIAL]`, `[REDACTED_API_TOKEN]`,
  `[REDACTED_EMAIL]`, `[REDACTED_PHONE]`, `[REDACTED_PAYMENT_CARD]` and
  `[REDACTED_FINANCIAL_ID]` for the corresponding trusted catalog categories.
  This does not select the detector patterns or permit caller-authored rules.
- Accept at most 64 KiB (65,536 bytes) of UTF-8 message text and 1,024 findings
  per evaluation. Above either bound, fail explicitly; do not truncate the message,
  discard findings or return an allow-shaped fallback.
- Missing policy identity/version, unknown catalog rules, findings inconsistent
  with the enabled catalog or invalid/empty/out-of-range redaction spans fail
  evaluation. Derive action, priority and marker from the catalog, not caller-
  asserted effects. Exact internal types, error codes and offset representation
  remain contract/design work.
- Composition remains: apply relevant redactions; any deny wins, otherwise any
  approval effect requires approval, otherwise a transformed permitted message
  has a redact outcome, and an unchanged permitted message has an allow outcome.
  A result is not dispatch authority or a granted approval.

The [scoped register and preparation](./spec-to-test-workflow/phase-1/08-first-slice-scope.md)
identify the included portions of existing requirements. Completing this slice
must not be reported as satisfying full detector, gateway or client acceptance.

### Metadata-only activity timeline (confirmed first frontend slice)

The first frontend-acceptance increment inspects authorized incident/activity
traces, including prompt, guard and approval history plus reported agent/model/
tool events. It is not incident case management. Approval is inspection-only:
show trusted requested, approved, rejected, canceled and expired history where
reported; do not provide approve/reject controls or infer enforcement from a log.
The previously approved guard-core scope remains useful component work, not a
replacement for this real frontend acceptance journey.

- Prompt logs contain event/time/identity/guard outcome/rule metadata only. Do not
  retain or display original or redacted prompt bodies. Model/tool bodies,
  reasoning text, credentials and arbitrary payload bodies are also outside this
  metadata-only slice.
- Parent relationships determine nesting. Within each sibling group order by
  server receipt time ascending, then event ID ascending as tie-breaker, explicitly
  identified as receipt order. Keep reported source time separately; do not claim
  global causal ordering from clocks.
- Missing-parent events remain inspectable as unlinked activity. A later valid
  parent can resolve hierarchy. Reject cycles and cross-scope parent references;
  never invent parents or durations.
- Execution status is running/completed/failed/canceled/unknown. Telemetry status
  is complete/incomplete/unknown/unsupported, separate from execution. A completed
  execution may have incomplete telemetry. Complete capture requires trusted
  positive evidence, not merely absence of a loss report.
- Read at most 50 trace summaries and 200 timeline events per response, with
  explicit continuation/load-more and manual refresh. No filters, free-text search,
  automatic polling or live token stream are selected for the initial increment.
  Never silently truncate; partial loading is distinct from telemetry loss.
- Scope and reporter identity derive from authentication. Arbitrary event tokens
  cannot create authoritative guard/approval records. Identical event IDs/content
  within a scope are idempotent; conflicting duplicates fail rather than overwrite.
- Frontend acceptance exercises the actual browser and backend reads over
  persisted controlled metadata. Unit tests supplement, not replace, it. Isolated
  synthetic setup proves inspection behavior, not real agent capture, prompt
  detection or live human-approval/dispatch enforcement.

These are confirmed included refinements of MON-001/002/003, INT-008, AUTH-001,
EVT-001/004, UI-001, API-001 and ARC-002. They select only the stated portions of
the proposed event/query behavior; EVT-002/003/UI-002 remain proposed as complete
requirements. Exact schema, cursor/snapshot, HTTP/error, UI-copy, authentication
setup and test-fixture contracts remain scoped design/review gates. WSL remains
deferred to its integration tests, not a prerequisite for this preparation.

## Primary workflows

1. The user installs and connects a supported client integration once per
   environment/profile, consenting to disclosed endpoint/model/hook changes.
   The integration activates automatically for eligible new sessions without
   per-session hook editing. Existing sessions attach through supported APIs
   or show a reconnect/restart requirement; no earlier capture is implied.
2. The agent sends a model request to the gateway. The gateway validates the
   provider protocol and verified new-human-message mapping, guards that
   submission, and forwards
   only an allowed/redacted request or waits for approval.
3. The gateway returns the model response and records request/response events.
   Hooks/plugins report tool calls/results and other lifecycle events where
   supported.
4. Native-provider sessions that bypass the gateway may be monitored by hooks,
   but their prompts are not described as guarded.
5. A user inspects the ordered activity timeline and can distinguish observed
   events from unavailable or missing telemetry. The timeline does not require
   private reasoning text.
6. Approval-required requests use a supported submitter-only integration UI.
   Missing UI, cancellation, timeout, and invalid approval never authorize
   forwarding. Guard/gateway failure never silently changes to a direct provider.

The gateway uses LangChain4j for its Java-side provider integration, but it
does not replace or host the external agent runtime.

## Functional requirements and acceptance criteria

### Prompt guarding and agent-activity monitoring

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| GUARD-001 | Confirmed | The prompt guard MUST provide a built-in deterministic catalog of literal and bounded-regex rules covering common credentials/API tokens, email addresses/phone numbers, payment-card/financial identifiers, prompt-injection indicators, unsafe-content indicators, and explicit invalid/weak-prompt patterns on the newly submitted user message before model forwarding. User-authored rules and model/ML-based detectors are outside the initial scope. System/developer instructions, prior conversation history, and separately assembled or retrieved context are outside this guard's input scope. Rule coverage MUST NOT be presented as complete semantic detection or general prompt-quality grading. | Representative user-message fixtures for each category, including benign lookalikes and worst-case regex inputs, produce attributable findings or explicit bounded failures; rule-engine failures are distinct from clean results. |
| GUARD-002 | Confirmed | A prompt decision MUST support allow, deny, redact, and require-approval outcomes. Matching effects compose: apply all sensitive-data redactions; deny if any deny rule matches; otherwise require approval if any approval rule matches; otherwise allow. Redactions MUST be applied before approval, so approval forwards only the redacted message. Only the submitting user may approve, approval MUST be bound to the exact submitted message, and it expires when the originating request ends. Cancellation while pending MUST end the request immediately; canceled approvals cannot be resumed. | Tests inspect the exact upstream payload and verify all typed-marker replacements are applied before approval, denial prevents dispatch, approval is required for injection/safety matches, and expired/canceled approvals never forward. |
| GUARD-003 | Confirmed | Guard evaluation failure, timeout, or unavailable required policy MUST NOT implicitly allow prompt forwarding. A guard-capable integration MUST NOT dispatch after such a failure. | Injected detector/policy failures return structured errors; guard-capable integrations make no upstream dispatch and late results cannot authorize a request after its deadline. |
| GUARD-004 | Confirmed | The prompt-guard logic MUST run in the Java model gateway for model requests routed through a supported custom endpoint. Native-provider requests that bypass the gateway are not claimed as guarded. | Requests sent through the configured gateway receive guard decisions before upstream forwarding; direct-provider sessions are labeled as bypass paths. |
| GUARD-005 | Confirmed | Guarded forwarding MUST use a verified client contract identifying the newly submitted human message and its mapping into model requests. It MUST NOT infer this solely from the last user-role message. Missing, ambiguous, or unsupported required mapping blocks guarded forwarding. | Multi-turn, tool-result, retry, summarization, and concurrent-session fixtures verify exactly which content is inspected/transformed; missing or conflicting mappings produce an explicit error and no upstream dispatch. |
| GUARD-006 | Confirmed | Approval-capable guarding MUST provide a supported UI authenticated to the submitting user and bind approval to the exact evaluated message and redacted forwarding payload. An unavailable UI MUST NOT implicitly approve or downgrade an approval-required request. | Only the submitter can approve; changed content, replay, absent UI, cancellation, and expiry cannot authorize dispatch. Client timeout/cancellation propagates through the pending approval. |
| MON-001 | Confirmed | The system MUST correlate prompt decisions with observable agent, model, and tool activity, including available retries, handoffs, results, errors, and completion state. | A supported execution yields a trace linking the prompt decision with reported execution events; events that cannot be observed are not fabricated. |
| MON-002 | Confirmed | The timeline MUST visualize event order, hierarchy, status, and duration where available, and distinguish missing or unsupported telemetry from an empty activity sequence. | Timeline tests show ordered nested events and explicit incomplete/unsupported states without representing absence of telemetry as proof no activity occurred. |
| MON-003 | Confirmed | “Reasoning loop” in the product MUST refer to the observable execution sequence, not private hidden chain-of-thought. Private reasoning MUST NOT be inferred or reconstructed. | A trace remains useful with reasoning-text capture disabled or unavailable; UI labels activity events without claiming they are complete private reasoning. |
| MON-004 | Confirmed | The gateway and monitor MUST support concurrent sessions from configured agent integrations within documented resource limits, keeping prompt decisions, credentials, responses, and events isolated by request/trace. | Parallel sessions from supported clients produce correctly correlated traces with no cross-session prompt, response, credential, or event mixing; concurrency limits and overload behavior are explicit under OD-08. |

### Accounts, workspaces, and authorization (deferred platform requirements)

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| IAM-001 | Deferred | Public registration/login MUST use an external OIDC provider; the application MUST support account/profile management without implementing native passwords. | A new user can register, log in, inspect/update supported profile fields, and log out; no local password endpoint is required. Recovery is routed to the identity provider. Exact editable fields and deletion workflow are OD-02. |
| IAM-002 | Deferred | Authenticated users MUST be able to create and manage multiple workspaces without operator approval. | One account creates two distinct workspaces, renames them, and selects either using authorized membership; no implicit single-workspace restriction appears. |
| IAM-003 | Deferred | Workspaces MUST support invitations, member removal, owner/operator/viewer assignments, and safe ownership transfer. | An accepted invitation grants the assigned workspace role; removal revokes access; ownership can be transferred without leaving a workspace ownerless. Identity matching and concurrency rules are OD-02. |
| IAM-004 | Deferred | Every workspace-owned read/write MUST authorize authenticated membership or workspace-bound runtime credentials. A caller-supplied workspace ID alone MUST NOT grant access. | A member can select their own workspace but cannot read, mutate, reference, or attach resources from another workspace, including through guessed IDs and artifact links. |
| IAM-005 | Deferred | Runtime credentials MUST be workspace-bound, scope-limited, and revocable. | A credential cannot access another workspace or owner-management APIs; revoking it blocks subsequent authenticated operations. Expiry/revocation timing is OD-02. |
| IAM-006 | Deferred | Workspace deletion MUST be an explicit authorized workflow covering membership, integrations, credentials, and retained data. | After deletion begins, new governed execution is blocked; data/credential cleanup has an inspectable outcome rather than a success response with inaccessible orphaned records. Completion and backup rules are OD-07. |

#### Proposed workspace permission matrix

This is a proposal for OD-02, not an already approved permission model.
Workspace membership does not automatically grant integration provider secrets.

| Capability | Owner | Operator | Viewer |
|---|---|---|---|
| View trace metadata | Yes | Yes | Yes |
| Read archived ordinary payloads | Yes | Yes | No |
| Create/edit/activate policies | Yes | Yes | No |
| Configure integrations and stored credentials | Yes | No | No |
| Issue/revoke runtime credentials | Yes | No | No |
| Change archive settings | Yes | No | No |
| Invite/remove members and change roles | Yes | No | No |
| Transfer ownership or delete workspace | Yes | No | No |

### Integrations and secrets

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| INT-001 | Confirmed | Phase 1 MUST provide a Java provider-compatible model gateway configured by custom endpoint URL and gateway key for the supported agent integrations. The Java service uses a separate deployment-managed upstream provider key. OpenCode custom providers and GitHub Copilot BYOK custom endpoints in VS Code are candidates. Hooks/plugins supplement model request/response monitoring with tool/lifecycle events. | Concurrent supported agents send model traffic through the gateway; denied/redacted/approval-pending prompts are not forwarded, responses are monitored and traces remain isolated. Bypassed native-provider sessions are not claimed as guarded. |
| INT-002 | Deferred | Workspace owners MUST be able to configure their own supported model/MCP credentials in the UI. | The owner configures an integration and the workspace runtime uses it; another workspace cannot use it, and signup alone provides no shared provider credentials. |
| INT-003 | Deferred | Both encrypted server-side credential storage and an external secret-manager integration MUST be supported. | The same supported integration succeeds using each mode; unavailable keys or unauthorized references produce explicit failures with no plaintext fallback. Product/authentication selection is OD-03. |
| INT-004 | Deferred | Submitted secrets MUST be write-only in the UI/API and excluded from logs, traces, ordinary archives, and error bodies. Deployment encryption keys MUST NOT be sent to clients. | Credential-read responses expose only non-secret status/identifiers; controlled credential values do not appear in inspected persistence/log/export paths during success and failure tests. |
| INT-005 | Deferred | Tenant-configurable destinations and secret references MUST be constrained by deployment-authorized access, not trusted as arbitrary URLs or secret paths. | Attempts to reach disallowed internal destinations or another workspace's secret reference are rejected before use. Exact destination/reference rules are OD-03. |
| INT-006 | Proposed | Credential replacement, revocation, and encryption-key rotation should have explicit versions and failure behavior without exposing old values. | Rotation tests show which subsequent requests use the new credential, and unavailable credentials block invocation; rollback and in-flight behavior are specified before implementation. |
| INT-007 | Confirmed | Users MUST install/connect once per supported client environment/profile; the integration MUST activate automatically for eligible new sessions without per-session hook editing. Endpoint, model, and hook changes require disclosed consent and supported configuration APIs. Separate profiles/remote environments may require separate installation. | After onboarding, multiple new sessions activate without manual hook setup. Declined changes are not applied; unsupported automatic setup is reported rather than silently editing configuration. |
| INT-008 | Confirmed | Existing sessions MUST attach only through supported APIs or explicitly require reconnect/restart. The system MUST report input enforcement, model-response observation, and tool/lifecycle visibility separately, including unknown, bypassed, unsupported, and degraded coverage. It MUST NOT claim earlier capture or enumerate unexposed sessions. Explicitly labeled monitoring-only operation is permitted. | Tests distinguish new, attached, reconnect-required, native-provider, and unobservable sessions. Disabled hooks, route changes, and connectivity loss do not leave a false full-coverage indicator; unobservable scope remains unknown. |
| INT-009 | Confirmed | Event-ingestion credentials MUST be distinct from gateway keys and upstream provider credentials, with authenticated scope and secure provisioning, storage, and revocation. None may appear in model/event payloads, logs, or errors. A callback credential MUST NOT grant session read/control access. Exact credential lifecycle is a release decision under OD-01/OD-05. | Tests reject cross-purpose/cross-scope credential use and revoked credentials, and inspect success/failure paths for secret exposure. Required client secret storage is verified before support is claimed. |
| INT-010 | Confirmed | A guarded path MUST NOT silently fall back to a direct provider on guard/gateway failure. Observation-only telemetry failure MUST remain nonblocking and surface degraded/incomplete coverage, subject to the existing bounded delivery/recovery contract. | Gateway outage produces no automatic direct-provider dispatch. Event-collector outage does not block observation-only agent execution and does not produce a false healthy/complete trace. |
| INT-011 | Confirmed | Correlation MUST distinguish session, human submission/turn, model request, and attempt, plus parent/subagent relationships where exposed. Identifiers and content mappings MUST be scoped to authenticated integration identity; unsupported relationships remain explicit. | Parallel sessions, retries, reconnects, and exposed subagents produce no cross-session attribution or duplicate guard authorization; forged or conflicting mappings cannot authorize forwarding. |
| AUTH-001 | Confirmed | Phase 1 MUST authenticate human approval and runtime/service identities and authorize gateway use, event ingestion, trace reads, and approval actions within each account's private authorization scope. Human authentication is application-managed password plus mandatory authenticator-based 2FA, not a required external OIDC service. Approval authority MUST be tied to the submitting human, not merely possession of an event-ingestion credential. Public signup MUST NOT automatically grant model-gateway access or access to the server's provider budget; a local host-administrator command grants/revokes gateway entitlement only for an email-verified and MFA-enrolled account. Host-administrator authority MUST NOT automatically grant trace, prompt or provider-secret read permission. This does not require shared workspaces or a workspace platform. | Unauthenticated and cross-account operations are rejected; one submitter cannot approve another's request, and an event token cannot read traces or approve prompts. New accounts cannot invoke the gateway before the eligible-account grant; revocation blocks later authorized calls according to the reviewed propagation contract. Granting access does not expose another account's data or provider credentials, and host-admin entitlement does not itself permit trace/prompt/provider-secret reads. Host grant/bootstrap and active-call revocation details remain OD-11. |
| AUTH-002 | Confirmed | Phase 1 MUST provide public self-service registration using email and password for application-managed human accounts. Trim surrounding whitespace and case-normalize the full email address for account identity/uniqueness. Email verification and authenticator enrollment MUST complete before protected account access; verification occurs at signup, not each login. Return the same generic confirmation for new, pending and already-verified addresses so registration status is not disclosed. Send verification mail through a deployment-configured outbound SMTP relay; test mail is captured locally. Verification links MUST be single-use, expire 24 hours after issuance, and be invalidated when resent. This does not require public workspaces or external identity-provider integration. | A distinct address can register, verify once and enroll 2FA before protected access; incomplete verification/enrollment cannot grant protected access. Case/whitespace variants map to one account identity. New, pending and verified addresses receive the same generic signup response; only applicable verification mail is captured in tests. A valid link succeeds once within 24 hours; an expired, replayed or superseded link cannot verify an account. Later login does not repeat signup verification. Exact visible copy, resend/rate limits, SMTP failure behavior and enrollment privileges remain OD-11. |
| AUTH-003 | Confirmed | Fresh human logins MUST require a password and an authenticator-generated second factor compatible with Google Authenticator or Microsoft Authenticator, with the approved recovery-code alternative. Passwords MUST be stored as secure salted verifier hashes, never plaintext. Passwords MUST contain at least 12 characters. Passphrases, password-manager autofill and paste MUST be allowed; password composition rules and routine periodic password changes MUST NOT be required. | Enrolled accounts cannot obtain protected human access with a password alone or invalid second factor. A valid password plus enrolled authenticator code succeeds; a password below 12 characters is rejected; paste/autofill are supported and no scheduled password-expiry challenge occurs. Valid persistent sessions follow AUTH-005 rather than restarting login on each visit. Maximum length, Unicode counting, hash algorithm/parameters and enrollment/replay contracts remain OD-11. No separate identity server is required. |
| AUTH-004 | Confirmed | The native account flow MUST provide exactly 10 random offline single-use recovery codes. Codes are displayed once, stored only as verifiers, used with the password as an alternative to the authenticator factor, and rotated atomically so generation of a new set revokes all codes in the previous set. Before enrollment completes, the human MUST acknowledge that the recovery codes were saved. A recovery code cannot be used alone. A local host-OS administrator MUST be able to recover one specifically named account offline if normal options are lost; this revokes its sessions/factors and requires authenticator enrollment again. It MUST NOT be a public recovery endpoint. | One valid unused code plus the password can substitute for the second factor once and create the ordinary low-friction session while leaving MFA enabled. The same code cannot authenticate again; invalid/used codes or a code without the password cannot authenticate. Rotating codes invalidates each previous unused code. The original codes are unavailable to read back after one-time display. Protected account access remains unavailable until the human acknowledges saved codes. Host recovery is local and scoped to the named account, revokes that account's sessions/factors and requires new authenticator enrollment; it grants no trace-data access. Exact proof/audit procedure remains OD-11. |
| AUTH-005 | Confirmed | Human login sessions MUST survive browser restart, with an absolute maximum lifetime of 30 days from session creation and expiry after 7 days of inactivity, whichever occurs first. Ordinary trace browsing and prompt approvals MUST use a valid authorized session without repeated password/authenticator challenges. Logout, revocation and expiry MUST still terminate the affected session's access. | Browser restart within both limits preserves access without fresh login. At the 30-day absolute deadline or 7-day inactivity deadline the session is expired, not silently extended; terminated sessions cannot authorize later operations. Activity measurement, logout/revocation propagation and session transport details remain OD-11. Prompt approval content/submitter binding and request deadlines remain unchanged. |
| AUTH-006 | Confirmed | Changing the password, replacing the authenticator factor or generating recovery codes MUST require full password-plus-second-factor authentication no more than 10 minutes old, with the approved recovery-code alternative where applicable. A confirmation within that window MUST be reusable rather than prompting separately for every such change. This is separate from ordinary prompt approval. | Authentication exactly 10 minutes old can satisfy the recent-authentication check; older confirmation requires reauthentication before the sensitive change. Reusing the confirmation does not mean accepting replayed authenticator/recovery codes. A valid ordinary session can browse and approve its own prompts without this additional challenge. Detailed reauthentication, factor-replacement and session-revocation contracts remain OD-11. |
| AUTH-007 | Confirmed | A human MUST be able to request a password reset through their verified email without disabling or bypassing authenticator-based 2FA. A reset link MUST be single-use and expire 30 minutes after issuance. On successful password reset, all existing human sessions for that account MUST be revoked; future login still requires password and the enrolled second factor or approved recovery-code alternative. | A valid link changes the password once before its 30-minute expiry and invalidates existing sessions; replayed or expired links cannot change it. Reset does not remove MFA, issue recovery codes or authorize protected access without the second factor. Exact response privacy, resend/abuse limits, token implementation and failure behavior remain OD-11. |
| AUTH-008 | Confirmed | Authenticator enrollment MUST show the setup QR and manual-entry key once for the pending enrollment, encrypt pending/active TOTP seeds at rest with a deployment-local key kept outside source, database and logs, and MUST NOT provide later seed readback. Enrollment MUST remain incomplete and protected human access unavailable until one valid TOTP code is produced and the human acknowledges saving their recovery codes. TOTP uses six digits at 30-second intervals; accept the current step or one adjacent 30-second step in either direction for clock drift, but accept each time step at most once per account. An interrupted enrollment expires after 24 hours and must be restarted. Replacing a lost authenticator requires fresh password-plus-second-factor authentication or the password plus an unused recovery code; successful recovery-code login keeps MFA enabled and ordinary session behavior unchanged. | Only the pending enrollment can view its setup material; the QR/manual key is not available after enrollment completion. A correct setup code plus recovery-code-saved acknowledgement completes enrollment; neither alone does. Seed material is protected at rest and is not present in logs, source, database plaintext or later readback. Before completion protected access is denied. A valid current or adjacent-window code can complete enrollment once; a repeated code for an already accepted time step fails. At 24 hours of interrupted setup the pending enrollment is unusable and restarting setup creates a fresh enrollment. A recovery-code login does not remove MFA; factor replacement without required reauthentication or an unused recovery code fails. |
| AUTH-009 | Confirmed | Human sign-in and password-reset responses MUST NOT reveal whether an email address is registered. Repeated authentication failures MUST use bounded temporary throttling with progressive delay; accounts MUST NOT be permanently locked. Verification/reset-link resends MUST be throttled per normalized address and source and use generic responses. Numeric thresholds remain subject to OD-11 review. | Unknown-email and wrong-password sign-in attempts have equivalent public responses; password-reset requests for known/unknown emails do not disclose registration status. Repeated failures are temporarily throttled and eventually recover without a permanent account lockout. Verification/reset resends are bounded per address and source and do not reveal account status. Exact thresholds, recovery windows and dependency-failure responses remain OD-11. |

### Policy management and enforcement

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| POL-001 | Confirmed | The initial prompt guard MUST use a built-in rule catalog for credentials/API tokens, email/phone, payment-card/financial identifiers, prompt-injection indicators, unsafe-content indicators, and explicit invalid/weak-prompt patterns. Sensitive-data rules use typed-marker redaction; injection/safety indicator rules require submitter approval; explicit invalid/weak-prompt rules deny. User-authored rules are outside Phase 1. All built-ins are enabled by default; users may toggle them, but each rule's priority and outcome are fixed by the catalog. | A fresh installation starts with every built-in enabled; the supported categories and every rule's identifier, matching behavior, fixed priority/outcome, and toggle state are documented; unsupported configuration changes are rejected explicitly. |
| POL-002 | Confirmed | Prompt-guard effects MUST compose: apply all matching sensitive-data redactions; deny if any deny rule matches; otherwise require approval if any approval rule matches; otherwise allow. If no enabled rule matches, the prompt is allowed. Fixed rule priorities resolve overlapping redaction matches; ties among top-priority overlapping redactions are evaluation errors and MUST block forwarding. Approval is performed by the submitting user, bound to the exact message, and expires when the originating request ends. Cancellation ends the request immediately; broader retry behavior is OD-04. | Tests verify composed redactions and gate outcomes, priority selection for overlapping redactions, tie errors with no dispatch, allow on no match, and each outcome's forwarding behavior. |
| POL-003 | Confirmed | Prompt forwarding MUST wait for successful required evaluation; unavailable or erroneous evaluation MUST NOT implicitly allow it. | Evaluation timeout, missing policy, detector failure, and evaluator failure produce structured errors and no forwarding. Signed cached fallback is not used. |
| POL-004 | Confirmed | Prompt enforcement MUST be claimed only for model traffic routed through the Java gateway. Hooks that only observe native-provider prompts MUST NOT be presented as prompt enforcement. | Gateway-routed prompts obey guard decisions; direct-provider prompts and tool/output hooks are labeled accurately as enforcement or observation according to their actual path. |
| POL-005 | Proposed | Each governed input request should use an immutable active-policy snapshot. | Concurrent policy activation cannot mix undocumented rule versions; decisions retain version and matched-rule identifiers. Snapshot and revocation semantics are OD-04. |
| POL-006 | Confirmed | Policy decisions MUST include an explicit outcome, policy identity/version, and machine-readable explanation code without treating model rationale as authority. | The timeline/API identifies why an operation was denied and which version decided it; fabricated model-supplied outcomes cannot authorize execution. |

### Prompt processing and integration boundaries

The prompt guard evaluates configured prompt content, sensitive-data, and
injection/safety checks before forwarding. Structural parsing, request-size
limits, supported-field validation, and destination checks remain necessary
boundary controls but are not substitutes for content checks. Detector coverage,
failure behavior, and approval details are documented explicitly; no check is
represented as complete safety detection.

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| INP-001 | Proposed | If the selected integration accepts JSON requests, it should define explicit encoding, size, nesting, duplicate-key, and schema limits and reject malformed or unsupported input before dispatch. | Boundary tests cover the selected integration's documented limits. Exact wire format and limits depend on OD-01 and OD-08. |
| INP-002 | Confirmed | The Java gateway MUST validate the selected provider protocol and run configured prompt-guard checks before forwarding. Malformed or uninspectable input MUST NOT be truncated, forwarded, or accepted by skipping required checks. This is not authorization of individual tool calls. | Invalid boundary inputs and triggered guard rules produce explicit outcomes before upstream forwarding. Validation errors remain distinguishable from guard decisions. Supported protocols and limits are OD-01 and OD-08. |
| INP-003 | Proposed | Prompt-guard evaluation should have a bounded deadline appropriate to the selected integration; expiry must prevent dispatch and late results must not authorize execution. | Injected processing delay causes a structured timeout and no upstream invocation. Exact deadline and measurement boundary are OD-01 and OD-08. |

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| GW-001 | Deferred | The earlier mandatory pre-delivery output-policy buffering requirement is superseded. No blocking output-content/schema validation is required in Phase 1. | Not a release gate. Delivery and transport/resource bounds remain OD-10 and GW-004; necessary protocol parsing/error handling is not a content safeguard. |
| GW-002 | Deferred | Per-tool action governance and human approvals are outside current enforcement scope, including agent built-in tools. | Not a release gate. Observation must not claim execution was authorized by this service; MCP/tool servers retain their own permissions. |
| GW-003 | Confirmed | Upstream errors, deadlines, cancellation, and uncertain side-effect outcomes MUST be surfaced without reporting success or blindly retrying tool execution. | Cancellation is propagated where supported; an interrupted side-effecting call is marked with an uncertain outcome when completion cannot be established, not automatically repeated. |
| GW-004 | Confirmed | Requests, output buffers, queues, connections, and CPU processing MUST have explicit bounds and overload behavior. | Limit tests reject or backpressure excess work with structured errors without unbounded buffer growth; concrete limits are proposed in the targets section. |
| GW-005 | Confirmed | The gateway MUST preserve the selected provider protocol's ordinary response content and tool-call semantics while observing responses. It MUST support the streaming/non-streaming modes required by the supported client, propagate cancellation where supported, and explicitly report partial-response failures without false completion. Reasoning-text exclusion from monitoring remains governed by ARC-002; no output-content guard is introduced. | End-to-end fixtures verify required delivery modes, ordered stream assembly, tool-call argument integrity, ordinary response equivalence, partial failure, cancellation, and bounded buffering. Unsupported modes fail explicitly rather than silently changing semantics. Exact protocols, modes, and limits remain OD-01/OD-10. |

### Advisory output analysis

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| OUT-001 | Deferred | Advisory secret/credential and PII findings on model responses and tool results are not a Phase 1 requirement. If added later, findings must not block, redact, or hold output. | Not a Phase 1 release gate. Scope and processing behavior require a separate decision under OD-10. |
| OUT-002 | Deferred | Output scan status and findings are not a Phase 1 requirement. Any future findings must be authorization-scoped and must not expose sensitive values. | Not a Phase 1 release gate. |

This feature is for timeline visualization and advisory detection, not response
schema/content enforcement. Ordinary protocol parsing, upstream error reporting
and resource limits remain necessary for service reliability. Scan access,
retention/consent, scheduling and overload behavior are unresolved: enabling
analysis must not silently enable output archives or temporary storage.

### Asynchronous advisory attachment scanning (deferred)

This path does not hold a prompt for scanning, redact its contents, or undo
disclosure. An attachment may reach the model before a finding exists.
Synchronous authentication, structural checks, destination restrictions and
configured allow/deny policies still apply. Background scanning is separate
from the guard-evaluation deadline, whose value remains open under OD-01/OD-08.

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| FIL-001 | Deferred | Attached-file scanning is not a Phase 1 requirement. If introduced later, it must be advisory and must not delay prompt dispatch while awaiting scan results. | Not a Phase 1 release gate. |
| FIL-002 | Deferred | Attachment scan storage and consent are not a Phase 1 requirement. Any later scan copy must have an explicit lifecycle and must not silently become an archive. | Not a Phase 1 release gate. |
| FIL-003 | Deferred | Attachment scan findings and statuses are not a Phase 1 requirement. Any future findings must be linked to the correct trace and must not expose raw sensitive data. | Not a Phase 1 release gate. |
| FIL-004 | Deferred | Attachment scanner dependencies and processing restrictions are not a Phase 1 requirement. Any later scanner selection requires review of local processing, model use, and external data submission. | Not a Phase 1 release gate. |

Supported file types, extractors, detection rules and scan-storage/worker bounds
are OD-09. No claim is made to inspect every format or detect every sensitive
value or attack. Files are untrusted input; local scanning does not make them
trusted or replace execution-boundary controls. Upload/reference contracts
must be defined separately. JSON-body and attachment-file size limits are not
interchangeable; neither a numeric limit nor arbitrary file retrieval is
approved here. Input boundary limits remain open under OD-01/OD-08.

### Events, timeline, and APIs

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| EVT-001 | Confirmed | Authenticated ingestion MUST persist events within the configured authorization scope and correlate prompt decisions with reported agent/model/tool activity by trace and span. | A supported execution produces a reconstructable activity timeline; forged identity or policy authority is rejected. |
| EVT-002 | Proposed | Events should be versioned and include event ID, authorization-scope ID where applicable, trace/span/parent IDs, type, source time when available, server receipt time, producer identity, status, and applicable guard/error/payload references. | Unknown required versions fail explicitly; missing applicable fields are rejected; absent optional telemetry is not fabricated. Detailed optionality is OD-05. |
| EVT-003 | Proposed | Duplicate event IDs with identical content should be idempotent within the authorization scope; conflicting duplicates should be rejected. Out-of-order and missing-parent events should remain inspectable. | Retrying an identical event does not duplicate the timeline; conflicting content raises an error; late parents can restore hierarchy without pretending timestamps are globally ordered. |
| EVT-004 | Confirmed | Observation-event backlog or spool exhaustion MUST NOT pause agent execution. The system MUST set a trace-level incomplete status with the cause and any known extent (such as missing count or time range); unknown values MUST NOT be fabricated. This does not relax the durable pre-forward guard-decision requirement. | Saturate the bounded event path and verify the agent continues, the affected trace is marked incomplete with an accurate cause and known extent, and guard-capable requests still fail closed if their authoritative pre-forward decision cannot be committed. |
| EVT-005 | Confirmed | Observation-event writes MAY be collected into bounded batches with a size and flush interval. Guard decisions MUST remain transactionally committed per guarded request and MUST NOT be batched across unrelated requests. | Batch-size and flush bounds are measured and documented; injected batch failure does not erase accepted events silently; guard decision and its outbox record remain atomic per request. |
| UI-001 | Confirmed | The UI MUST provide an authorized trace list and nested activity timeline showing prompt-guard outcomes, event order, duration, status, and explicit missing/incomplete telemetry. | Users locate a trace and expand its guard, agent, model, and tool events; an interrupted trace is distinguishable from a successful completed trace. |
| UI-002 | Proposed | Trace listing should support bounded pagination and filters for time range, application, status, and trace ID; running traces should be refreshable without live token streaming. | Pagination has deterministic continuation; applying filters excludes nonmatching traces; refreshing reveals newly persisted events. Query contract is OD-05. |
| API-001 | Confirmed | API errors MUST be structured and distinguish authentication, authorization, validation, policy denial, limits, dependency failure, and execution uncertainty without leaking secrets. | Each failure class has an inspectable machine code and correlation identifier; no failure returns a success-shaped payload. HTTP mappings are OD-05. |

### Payload archives and reasoning exclusion

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| ARC-001 | Deferred | Ordinary prompt/response/tool payload archives are not a Phase 1 requirement. | Not a Phase 1 release gate; future archive behavior requires explicit consent and lifecycle decisions. |
| ARC-002 | Confirmed | Reasoning text MUST NOT be archived or displayed in Phase 1, including reasoning embedded in generic model-response objects. | Supported reasoning fields are filtered before logs, queues, spools, exports, or ordinary archives; only availability/capture status is recorded. No claim is made to detect every unstructured explanation. |
| ARC-003 | Deferred | Archive toggle and retention behavior are not a Phase 1 requirement. | Not a Phase 1 release gate. |
| ARC-004 | Deferred | Archive size, quota, retention, deletion, and storage-failure behavior are not a Phase 1 requirement. | These decisions are required before any later archive path is enabled. |
| ARC-005 | Proposed | Retained text artifacts should use lossless compression where beneficial, with encoding/version, stored and original byte counts, and integrity metadata; sensitive data requires separate protection. | A compressed artifact round-trips exactly, size savings are measured on representative data, and corrupt/oversized decoded data fails explicitly. Codec is OD-07; no fixed compression ratio is promised. |
| ARC-006 | Deferred | On-demand retrieval of archived bodies is not a Phase 1 requirement. | Not a Phase 1 release gate. |

## Reliability and operational requirements

| ID | Status | Requirement | Acceptance criterion |
|---|---|---|---|
| OPS-001 | Proposed | The release should provide a documented deployment for the selected integration and initial users. | A clean installation completes the prompt-guard and activity-timeline workflow; deployment targets and authentication model are selected before acceptance. |
| OPS-002 | Confirmed | Authoritative policy/decision storage MUST be distinguished from asynchronous indexing/UI/export. Failures MUST not silently erase decisions or authorize execution. | UI/indexing outage does not become an allow decision; decision transaction/outbox failure prevents the associated new governed invocation. Post-execution write failure is surfaced as incomplete/uncertain, never a rollback of external side effects. |
| OPS-003 | Confirmed | Background processing MUST be bounded and expose retries, exhausted attempts, and dead-letter/failure state. Outbox retries MUST use capped exponential backoff with jitter and a bounded attempt count. | A failed job is observable, retries respect documented caps, and exhaustion becomes inspectable dead-letter/failure state rather than silent loss. |
| OPS-004 | Proposed | Operational metrics should expose policy latency, gateway failures, queue depth, archive bytes/ratio, rejected requests, and worker failures without sensitive payload labels. | Representative requests increment expected metrics; provider secrets and message text do not appear in metric labels. |
| OPS-005 | Confirmed | Production acceptance MUST include documented backup/restore and failure tests, not infer durability or capacity from hardware estimates. | Restore recovers a consistent workspace/policy/trace dataset under the agreed recovery objectives, including explicit treatment of artifacts, keys, and deletion state. Objectives are OD-08. |

## Proposed limits and measurable targets

These are review candidates, not approved defaults or measured results.
Use the baseline's 2 vCPU/4 GB reference host with inference hosted elsewhere.
Payload-sensitive tests must use bounded synthetic data, not real secrets.
Input body/parsing limits and the guard-evaluation deadline remain proposed
under INP-001 and INP-003; no 500 ms deadline is approved. Required validation
and no-forwarding-on-failure behavior under INP-002 remain confirmed.

| Candidate | Proposed value / method |
|---|---|
| Output processing | No approved delivery/buffer limit yet; define transport and advisory scan bounds under OD-10 |
| Concurrent upstream calls | 8 deployment-wide initially, with per-workspace admission control still to define |
| Policy overhead | p95 <= 100 ms for local deterministic evaluation under the agreed 8-call workload; exclude upstream model/tool latency |
| Timeline query | p95 <= 500 ms for first page of 50 traces over 100,000 stored events |
| Ordinary artifact archive | 2 MiB original size per artifact; 1 GiB stored-byte workspace quota |
| Retention | 7 days ordinary payloads; 30 days trace metadata |
| Compression evaluation | Report original/stored bytes and CPU cost on the same representative corpus; verify lossless recovery, not a promised ratio |

OD-08 must specify benchmark duration, dataset distribution, warmup, sample count,
timeouts, overload responses, storage layout, and memory accounting before
performance acceptance is meaningful. Workspace/account creation limits,
decompressed-size limits, and backup recovery objectives remain open.

## Acceptance scenario traceability

Every requirement has a criterion above. The following cross-feature scenarios
provide a release review checklist; proposed requirements become mandatory only
after approval.

| Scenario | Requirements exercised | Expected evidence |
|---|---|---|
| AT-01 Prompt guard outcomes | GUARD-001, GUARD-002, GUARD-003, POL-002, POL-003, INP-002 | Configured checks, attributable outcomes, exact forwarded payload, no dispatch on deny/failure/pending approval |
| AT-02 Observable agent activity loop | MON-001, MON-002, MON-003, EVT-001, UI-001 | Correlated prompt decision and ordered model/tool/agent events; missing telemetry is explicit; no private reasoning required |
| AT-03 Integration and trace reliability | INT-001, EVT-002, EVT-003, EVT-004, EVT-005, GW-003, API-001 | Selected-boundary behavior, bounded observation batches, duplicate/out-of-order events, explicit telemetry gaps, typed errors, cancellation and uncertain outcomes |
| AT-04 Guard policy lifecycle | POL-001, POL-005, POL-006 | Rule validation, activation, attribution, and safe behavior across policy changes |
| AT-05 Deployment and recovery | OPS-001, OPS-002, OPS-003, OPS-005 | Documented selected deployment, failure injection, no implicit allow, recovery evidence |
| AT-06 Install-once activation and coverage | INT-007, INT-008, INT-009, INT-010, INT-011, GUARD-005, GUARD-006 | Consented onboarding; automatic eligible-session activation; honest existing-session/bypass coverage; isolated credentials and correlation; supported approval; no silent direct-provider fallback |
| AT-07 Response transport compatibility | GW-003, GW-004, GW-005, INT-001, ARC-002 | Required streaming/non-streaming modes, ordinary response and tool-call integrity, partial-response errors, cancellation, bounded buffering, and reasoning-text exclusion from monitoring |
| AT-08 Minimum Phase 1 authorization | AUTH-001, INT-009, GUARD-006, EVT-001, UI-001 | Authenticated identities and scope isolation across gateway, events, trace reads, and submitter-only approval without assuming OIDC/workspaces |
| AT-09 Public native accounts and 2FA | AUTH-001, AUTH-002, AUTH-003, AUTH-004, AUTH-005, AUTH-006, AUTH-007, AUTH-008, AUTH-009 | Email-verified public registration, mandatory 2FA enrollment and TOTP replay rules, 10 single-use recovery codes and host recovery; private scope and explicit gateway grant; persistent 30-day/7-day-idle sessions; reusable 10-minute sensitive-change authentication; verified-email password reset preserves MFA/revokes sessions; generic auth responses and bounded nonpermanent throttling; remaining contracts are OD-11 |

## Open decisions and release gates

An open decision blocks readiness of its affected path; it does not permit an
implementation agent to silently pick behavior. The full Phase 1 release cannot
be accepted until its required paths have resolved decisions and passing tests.

### Development readiness and feasibility milestone

The approved product direction permits bounded feasibility prototypes; it is
not evidence that either candidate client can support the complete experience.
Before committing to full client integration, produce an end-to-end capability
report for each prototyped client/version/environment covering:

- Install-once consented setup and automatic activation for eligible sessions,
  including supported attachment versus reconnect/restart for existing sessions.
- Authenticated human-submission mapping, concurrent-session/request/attempt
  correlation, and parent/subagent links where exposed.
- Submitter-only approval delivery, content binding, timeout, and cancellation.
- Separate gateway/event credentials, server-side provider credentials, secure
  client storage, and the minimum authorization boundary.
- Required model protocols, response delivery/streaming, tool calls, errors,
  cancellation, resource bounds, and bypass/coverage-loss behavior.

Record demonstrated capabilities, limitations, and failed/unsupported cases;
documentation evidence alone is not a passing live integration test. Explicitly
labeled monitoring-only operation is a valid outcome for a candidate that
cannot support guarding. It does not satisfy the guarded-path requirements or
silently remove them from release scope. Independent guard-engine or server
prototypes may proceed without claiming a verified client integration.

Full implementation of an affected path requires its contracts and open
decisions to be resolved. Release acceptance additionally requires passing
applicable scenarios, including failure/recovery tests; prototype completion
alone is not Phase 1 completion.

| ID | Decision needed | Affected gate |
|---|---|---|
| OD-01 | Prototype install-once OpenCode and VS Code Copilot integrations, initially targeting Windows with WSL: consented endpoint/model/event setup, activation, client versions and remote/profile scope, coverage detection, verified new-human-message mapping, approval UI, protocol/streaming/tool-call behavior and separate gateway/event/upstream credential lifecycle. Require at least one fully verified guarded client for release; monitoring-only support cannot satisfy that gate. Bind runtime submissions to the selected native human account/2FA model without assuming workspaces. Resolve consent withdrawal, disable/uninstall, in-flight handling and ownership-safe cleanup without silent direct-provider restoration. Verify WSL prerequisites and experimental BYOK limits; exact contracts and lifecycle remain pending | Automatic integration, prompt enforcement, and activity monitoring end to end |
| OD-02 | OIDC provider, profile/account deletion, verified invitation matching, role matrix, owner cardinality/transfer, session and runtime credential expiry/revocation | Accounts, workspace lifecycle, authorization |
| OD-03 | Deferred workspace-managed BYOK and external secret-manager design: service identity, permitted references, encryption-key lifecycle, rotation, and allowed destinations/redirect behavior. This is separate from the deployment-managed upstream provider key needed by the Phase 1 gateway | Deferred workspace credential modes |
| OD-04 | Exact rule patterns/coverage and the definition of invalid/weak-prompt indicators; regex syntax and limits for the newly submitted user message; typed-marker taxonomy and rule mapping; broader approval retry behavior; separate bounded guard-evaluation and human-approval waits within the client request lifetime; policy snapshot/activation/revocation | Prompt-guard decisions and safe forwarding |
| OD-05 | Versioned provider and event contracts; exact account-private scope representation and human-to-submission identity binding; authenticated session/turn/request/attempt identity, exposed parent/subagent links, new-message-to-model mapping, replay/conflict rules and reconnect behavior; approval channel and payload binding; coverage freshness, field optionality, timestamps/sequence, trace-incomplete cause and known extent, filtering, pagination and HTTP errors | Gateway, event ingestion, agent clients, timeline |
| OD-06 | Exact transaction/outbox atomicity, dispatch/attempt identity, idempotency and retry boundaries, crash recovery after dispatch, and recovery/persistence of incomplete or uncertain trace status | Reliable prompt enforcement and trace integrity |
| OD-07 | Archive consent granularity, in-flight cutoff, encryption, codec/chunking, quotas, expiry/deletion and backups, storage failure behavior | Deferred archive enablement |
| OD-08 | Review proposed numeric limits; define workload, admission fairness, timeouts, abuse controls, capacity and backup/recovery targets | Performance and production acceptance |
| OD-09 | Attachment upload/reference contract and authorization, supported formats/extractors, scanner methods, safe parsing/isolation, file/expanded-size limits, scan concurrency/time limits, temporary storage lifecycle and overload handling | Deferred attachment-scanning enablement |
| OD-10 | Phase 1 response delivery/streaming, protocol/tool-call compatibility, cancellation, and resource bounds; separately, any future output scanner's methods, consent/retention, scheduling, and overload behavior independent of archives | Response transport is a Phase 1 gate; advisory scanning remains deferred, with no implicit buffering or scan-storage choice |
| OD-11 | Complete the selected email/password, once-at-signup verification and mandatory-2FA flow. Confirmed: trim/case-normalize full signup email identity; generic duplicate-safe signup confirmation; configurable outbound SMTP relay; single-use 24-hour verification links invalidated by resend/local test-mail capture; minimum 12-character passphrase-friendly passwords without composition/periodic expiry; one-time verified-email password-reset link with 30-minute expiry, MFA preserved and all sessions revoked; six-digit/30-second TOTP with ±1-step clock tolerance, one acceptance per account/time step, 24-hour incomplete-enrollment expiry; exactly 10 one-time recovery-code verifiers displayed once, old set revoked on rotation, recovery login preserves MFA; offline host-OS admin recovery for one named account revokes sessions/factors and requires re-enrollment; offline host-admin grant/revoke of gateway entitlement after email verification and MFA enrollment, without trace/prompt/provider-secret read permission; generic sign-in/reset responses and bounded temporary progressive throttling without permanent account lockout; resend throttling per normalized email/source. Still decide exact copy, numeric abuse/resend thresholds and recovery windows, SMTP outage behavior; max password length/Unicode counting/hash parameters; TOTP secret/QR protection and code format/acknowledgment; factor-replacement UX; host-procedure proof/audit; active grant revocation propagation; setup privileges; activity measurement, session transport/logout/revocation/reauthentication; account lifecycle and verification/recovery limits. Preserve same-host secret protection; no external OIDC/workspace platform is required | Public registration, native authentication, low-friction sessions, abuse-resistant public access, 2FA/recovery and account isolation |

### OD-11 confirmed enrollment refinements

DR-024 resolves the seed-protection, setup-display and recovery-acknowledgement
choices previously listed as open in OD-11. AUTH-004/AUTH-008 govern: pending and
active TOTP seeds are encrypted with a deployment-local key outside source,
database and logs; QR/manual setup key is shown once with no later seed readback;
one valid code and acknowledgement of saved recovery codes are required before
enrollment completes. Key generation/rotation/recovery, encryption algorithm,
exact UI/transport contracts remain open. DR-026 resolves interrupted display
and authenticator-replacement behavior as follows.

If a once-shown QR/manual key or recovery-code display is lost through refresh,
back navigation, a closed tab or an interrupted response, do not redisplay it.
Offer an explicit initial-enrollment restart after confirming the password for
the verified account, with setup-only access. Invalidate the previous pending
seed/codes and create a new 24-hour attempt. Stale tabs cannot complete an
invalidated attempt. Protected access remains blocked until a valid new
authenticator code and acknowledgement of saved recovery codes complete setup.

During authenticator replacement, keep the current authenticator and recovery
codes usable until the new authenticator is verified and its new recovery codes
are acknowledged. Cancellation, expiry and lost-display restart discard only
the pending replacement. Final completion atomically replaces the factor and
recovery-code set and applies DR-025 session revocation/rotation below.
Starting/restarting and final completion require full authentication within the
existing ten-minute window, reusing a valid confirmation without replaying an
OTP. A recovery code consumed to authenticate remains consumed even if the
replacement is cancelled. These refine AUTH-002/004/006/008; no IDs are added.

### OD-11 confirmed session refinements

DR-025 refines AUTH-005/AUTH-006. Only successful deliberate protected actions,
such as opening or refreshing traces and changing account settings, reset the
7-day inactivity timer. Background polling and anonymous static-asset requests
do not reset it. Keep the 30-day absolute deadline anchored to the original
session creation time; activity and session-token rotation do not extend it.

Use an opaque server-validated human session in a Secure, HttpOnly, SameSite
cookie with CSRF protection. Do not store the login token in localStorage.
Exact SameSite mode, cookie scope, action classification, CSRF transport and
revocation concurrency behavior remain contract/design decisions.

After a signed-in password change or authenticator replacement authorized by
recent full authentication, revoke other sessions and rotate/retain the current
session without extending its original absolute deadline. This is not a
forgot-password exception: AUTH-007 password reset and host-admin recovery still
revoke all affected account sessions. No extra factor prompt is introduced for
ordinary activity while the current session is valid.

### OD-11 confirmed account lifecycle refinements

DR-027 refines AUTH-001/002/004/007/008 without adding requirement IDs.
Duplicate signup must never replace a stored password or take over enrollment.
The verified email owner may use the approved password-reset flow, which does
not bypass MFA or incomplete enrollment.

Remove only never-verified registrations after seven days from creation or the
latest issued verification link, whichever is later. Ordinary duplicate signup
does not extend retention; an actually issued resend does. Verified accounts
remain when an incomplete 24-hour enrollment attempt expires.

Create one immutable private data scope only when initial enrollment fully
completes. Before that, permit only required verification/setup/reset operations,
not protected application data or gateway use. Later factor replacement and
host recovery retain that scope and ownership.

The first increment includes host-admin-only disable/re-enable, with no public
admin UI. Disable denies further account access and revokes sessions, pending
authentication operations and gateway entitlement, while retaining scope/data.
Re-enable restores eligibility to authenticate/setup, not old tokens or gateway
entitlement; a new explicit grant requires the approved verified/enrolled
eligibility. Already-running gateway-call behavior remains an unresolved contract.

Account deletion, data erasure and verified-email re-registration are deferred
to a separately specified increment. Do not provide self-service deletion or
automatically recycle a disabled verified email. Retention is not an implemented
erasure policy; deferred deletion must be specified before it is offered.

### OD-11 confirmed mail and one-use-link refinements

DR-028 refines AUTH-002/007/009. New signup issues verification mail; duplicate
signup preserves password/enrollment and sends none. Explicit resend issues a
new verification link only for an enabled, never-verified registration. Reset
sends only to an enabled, verified account, including incomplete initial MFA
enrollment, without bypassing MFA/setup. Unknown, verified-for-resend,
unverified-for-reset and disabled addresses receive the same generic public
acknowledgement without mail.

Keep one current link per account/purpose. Durable issuance atomically supersedes
the previous link; failed issuance preserves it. Opening a link alone does not
consume it: email verification requires explicit confirmation, and reset requires
a valid new-password submission. Server time must be strictly before expiry;
exactly at expiry fails. Consumption and its state changes are atomic, so
concurrent submissions cannot both succeed. Failed validation or rollback does
not consume it. Keep the approved 24-hour verification/30-minute reset lifetimes.

Issuing a reset link does not log the user out. Successful reset changes the
password and revokes sessions atomically, preserving active MFA and incomplete-
setup restrictions.

Acknowledge only after a bounded durable mail-work request has been accepted;
acknowledgement is not confirmation of delivery. Use the same admission step for
ineligible addresses so a queue outage cannot reveal account status. Admission
failure returns a generic temporary-service error, never success. Delivery is
asynchronous, with bounded retries stopping at expiry/supersession/disablement;
workers recheck eligibility before sending. Surface later SMTP failures to the
operator without secrets, not as address-specific public status. Old delivered/
in-flight mail cannot be recalled, but superseded links fail; guide users to
the newest link. Retry must never revive an expired link.

Exact copy/routes/statuses, numerical abuse/retry/queue limits and concrete
transaction/worker/key-protection contracts remain open.

### OD-11 confirmed password input refinement

DR-029 refines AUTH-003: passwords contain 12 through 128 characters inclusive,
counted as Unicode code points, not bytes or UTF-16 storage units. Counting is
not a restriction on characters or an encoding choice required from the user.
Length is the only password-content restriction: no allowed-character list,
composition rule or special ban on spaces, symbols or control characters.

Preserve exact input without trimming, normalization, case folding, truncation
or silent substitution; leading/trailing spaces are significant. Use consistent
interpretation for signup, change/reset, login and reauthentication. Preserve
paste/autofill and no periodic forced changes. Login failures remain generic;
password-creation forms may explain validation errors.

Malformed network requests are ordinary transport/parse errors, not additional
password-content rules. Secure salted verifier hashing remains mandatory;
algorithm/library/parameters, rehashing and measured memory/concurrency bounds
remain technical-design gates. Do not reinstate the rejected password-specific
NUL/line-break/encoding exclusions or claim hashing performance without evidence.

### OD-11 confirmed TOTP-key lifecycle and availability

DR-030 refines AUTH-003/004/005/008. The server-side TOTP seed-encryption key is
not a provider API key or session key. Changing/disabling a provider API key
does not revoke human sessions; affected model calls may become unavailable.
This does not add provider-key-management UI or change selected server-side
provider-key ownership.

If the TOTP key is unavailable, the application may run explicitly degraded.
Otherwise-valid sessions continue, and password plus an unused recovery code
may sign in when its independent verifier and other required services are
available. TOTP verification/enrollment/replacement requiring that key fail
explicitly as temporarily unavailable, not incorrect-code errors. Report the
degraded state to the operator without claiming full authentication readiness.
Never bypass MFA, use plaintext fallback, automatically reset factors/sessions,
or silently generate a replacement key.

Provision protected local key material explicitly through host administration,
outside source/database/logs. Keep protected key backup separate from database
backup and verify a matched restore. Controlled versioned rotation re-encrypts
the same seeds without user re-enrollment; retain old keys while retained backups
need them. Correct-key restoration restores affected capability; irrecoverable
loss requires explicit scoped offline host recovery, never a public bypass.
Exact encryption/key/restore/rotation/health contracts remain design work.

### OD-11 confirmed recovery-code format and standalone regeneration

DR-031 refines AUTH-004/006/008. Each of the ten codes contains 128 random bits,
displayed as 32 hexadecimal characters in eight groups of four. Accept upper/
lower case and optional grouping hyphens; store only verifiers, never retrievable
codes. This is separate from the length-only password policy.

Standalone regeneration preserves the current set until the newly once-shown
set is acknowledged as saved, then atomically activates the new set and revokes
the old. Check the existing ten-minute recent-auth confirmation at start/restart
and final completion, reusing valid confirmation. Pending code sets have the
existing 24-hour setup lifetime. Cancellation/expiry/lost display before
completion discards only pending codes; authentication-consumed codes stay
consumed. Stale tabs cannot activate obsolete sets; concurrent use of one
recovery code can succeed only once.

A lost response after completion does not roll back or redisplay codes: expose
nonsecret completion status and allow fresh regeneration. Completion revokes
other sessions and rotates/retains the current session without extending its
original absolute deadline. Initial setup/replacement interruption remains
governed by DR-026; standalone regeneration preserves the active authenticator.

When codes are exhausted, sign in with the existing authenticator to regenerate.
If all second factors are lost, use approved offline host recovery. Exact verifier,
acknowledgement/status, race/failure and session-binding contracts remain open.

### OD-11 confirmed host operations, gateway ordering and session concurrency

DR-032 refines AUTH-001/004/005/006/008. Host operations require trusted local
host administration, one exact account, explicit reason and confirmation.
Commit state change and secret-free audit atomically; unavailable database/audit
commit fails explicitly without claimed success. Repeated grant/revoke/disable
is safe and reports already-in-state. No public/bootstrap administrator account.

Host recovery preserves email/password/private ownership but revokes sessions,
factors, pending authentication and gateway entitlement. It creates no signed-in
session or data/secret disclosure. The human returns using their password or
approved email reset for setup-only re-enrollment; gateway access needs a new
explicit grant. Recovery never silently re-enables a disabled account.

Grant only enabled, verified, fully enrolled accounts. After revocation/disable/
recovery commits, block later gateway admissions and calls not yet dispatched
upstream. Dispatch authorization and revocation must have consistent ordering,
not depend on stale cached grants. Already-dispatched calls may finish; upstream
work/cost cannot be retracted. They grant no follow-on authority, and revoked
human sessions cannot read protected results. Never automatically restore grants.

Only successful deliberate protected navigation, manual refresh and authorized
changes renew inactivity, not polling/prefetch/static assets. Sessions fail
exactly at their 30-day absolute or seven-day idle deadline. Recent full auth
is reusable through ten minutes inclusive, bound to the same account/current
session; tabs sharing that session share confirmation, different sessions do not.

Enforce logout/revocation on later authorization checks. Sensitive changes
recheck current account/session/factor state at commit; stale tabs cannot undo
revocation or activate obsolete pending factors. A retained/rotated current
session carries only still-valid recent-auth confirmation, preserving its
original timestamp and absolute session deadline; other sessions do not inherit it.

Concrete host/dispatch/audit/transport mechanisms require design/review. Ordinary
engineering details may be drafted without separate preference questions;
numerical abuse/delivery limits remain deferred for review/measurement. No
installation, implementation or acceptance freeze is authorized by this decision.

### OD-11 confirmed cleanup and pending-setup equality

DR-034 and composed native-auth intent v0.2 refine AUTH-002/008. For a still-
never-verified registration, let R be the later of creation and latest actually
issued verification link, D = R + seven days. Time alone does not permit removal
at t < D; at t >= D the registration is eligible. A cleanup evaluation committing
removal exactly at D removes it. This does not require the background process to
run at the exact instant. Duplicate signup still does not extend retention;
actually issued resend does; verified accounts remain protected from this cleanup.
Concrete cleanup scheduling and issuance/verification race mechanisms need design.

For pending enrollment and standalone pending recovery-code sets, let E be
creation + 24 hours. Completion requires t < E and all other current account/
factor/acknowledgement/recent-auth guards. At t >= E the pending attempt is
expired and cannot activate candidate factors/codes. Existing active factors/
codes and already-consumed authentication codes retain their approved standing;
initial enrollment still grants no protected access before full completion.

These are deadline clarifications, not lifetime changes. Intent v0.2 incorporates
the unchanged v0.1 plus its approved addendum; neither approved file is rewritten.
Remaining verifier/evidence/resource/numerical-limit contracts are not approved.

### OD-11 approved initial verifier, admission and evidence profile

DR-037 incorporates [native-auth intent v0.3](./spec-to-test-workflow/phase-1/native-auth/04-intent-v0.3.md)
as the normative exact profile for AUTH-003/004/008/009 and their supporting
evidence. Its raw SHA-256 is
`C78BDBA0B2839F9D907159D4C60391B85EBFC119ADC5CF531629F9B4662A7F67`;
it composes with the unchanged approved v0.1/v0.2 behavior.

The approved profile fixes Argon2id verifier/upgrade parameters, bounded hash
work/deadlines, a narrowly defined native reference check, recovery verifiers,
seed encryption/randomness, rolling-window source/address admission, progressive
temporary cooldown, finite counter/mail state, retry/send limits, trusted-proxy
identity and the exported-evidence secrecy contract. Use that single definition,
not older proposal values or framework defaults. New passwords retain the
length-only exact-input policy; TOTP-key outages retain scoped degradation.

This resolves the auth-specific numerical deferral, not the global guard/
gateway/event/transport resource proposals. Sequential native observations are
not end-to-end authentication capacity or a production percentile. Concrete
shared contracts, design/tool baselines, native whole-application verification,
freeze/red/lock and implementation gates still apply.

### OD-11 approved browser password compatibility refinement

DR-038 and [native-auth intent v0.4](./spec-to-test-workflow/phase-1/native-auth/04-intent-v0.4.md),
raw SHA-256 `40761C1AD0C1233339B301F17DF6D483B4D6078D6B2CA4D5AB3BC4E62F1622EE`,
narrow the earlier length-only rule only for CR/LF browser compatibility.
Passwords remain 12-128 Unicode code points; other valid Unicode, spaces,
symbols and controls including NUL remain allowed. No new strength/composition/
encoding-choice or periodic-change requirement is imposed.

Reject CR/LF when received by the application, including raw direct submissions
and raw paste before native sanitization when observable. Never silently trim,
normalize, case-fold, truncate, substitute or strip permitted input. Ordinary
passphrase paste/autofill remains supported. Native controls may already have
sanitized unsupported external text; do not claim recovery of an unobservable
original or universal password-manager support for unusual characters. Exact
validation/authentication wire/copy must preserve account privacy and undergo
the shared contract review.

## Consistency rules for future work

Do not treat deployment credentials as workspace member credentials, timestamps
as trusted ordering, tracing as proof of enforcement, compression as redaction,
or output denial as reversal of a tool side effect. Do not promise complete
reasoning or governance for unsupported providers and bypass paths.

Resolve affected decisions explicitly, preserve deferrals, and update the
blueprint when approved requirements change. A finished draft can still contain
release blockers; it is not evidence that the project is implementation-ready.
