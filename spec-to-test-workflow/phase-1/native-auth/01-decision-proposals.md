# Native authentication prerequisite: recommendations for review

Version: 0.15. Prepared: 2026-10-30. **Partially approved:** DR-019 confirms signup
email; DR-020 password/reset; DR-021 TOTP/recovery; DR-022 host-admin boundaries;
DR-023 generic responses and no-permanent-lockout throttling. Other recommendations
remain unapproved.

DR-024 additionally confirms encrypted seeds, one-time QR/manual-key display and
saved-recovery-code acknowledgement. DR-025 confirms session activity/storage and
settings revocation. DR-026 confirms interrupted enrollment/replacement below.
These decisions supersede older proposal wording that calls those choices open.

This package preserves the user-confirmed choices in
[00-ingestion](./00-ingestion.md). It recommends exact contracts for the
remaining AMBs so the authentication milestone can proceed through the same
frontend-acceptance workflow. Values called "proposed" need user review and
source/scenario reconciliation before tests treat them as expected behavior.

## 1. Recommended first native-auth increment

Public registration, one-time email verification, mandatory TOTP enrollment,
password+TOTP login, same-origin persistent human session, recovery codes,
verified-email password reset, low-friction sensitive step-up, private account
scope, deployment-operator gateway grant, and logout/revocation.

No external identity service, workspace management, social login, passkeys,
commercial vault or public admin registration. Approval history in the timeline
stays read-only. JDK/app/runtime setup does not become an alternative auth bypass.

Use the same workflow: scope/register → domain model → approved intent → browser
SCNs → shared contract and UI locator matrix → native baseline/design/tasks →
Phase 6 review → one-way freeze → genuine red browser acceptance → implementation.
Native unit/security tests are supplementary.

## 2. Proposed user flows

### Register and enroll

1. Human submits email and password.
2. Application canonicalizes according to approved email rule, creates/recognizes
   a pending registration without granting protected reads or model-gateway use,
   and returns non-enumerating confirmation.
3. Application sends a one-time verification link through the configured sender.
4. Link verifies the email once; expired/replayed links do not verify it.
5. Human enrolls TOTP in Google Authenticator, Microsoft Authenticator or a
   compatible TOTP app.
6. Only a valid verification plus completed enrollment activates protected human
   access. Initial account scope is private; gateway entitlement remains absent.
7. Human receives recovery codes once and stores them offline. The screen must
   not put codes into URLs, logs, analytics or routine trace records.

The precise intermediate states, what the user sees when resending, and recovery-
code display/acknowledgment behavior require AMB resolution.

### Login and low-friction session

1. Fresh login requires password and a valid authenticator code or an eligible
   unused recovery code.
2. Create a persistent session that survives browser restart, expires at the
   earlier of 30 days from creation or seven days idle, and does not prompt again
   for ordinary trace inspection or the user's own prompt approval.
3. Count only successful human-initiated protected requests as activity; static
   asset loads/background requests do not extend the idle deadline.
4. Logout, expiry, password reset, recovery-factor reset and explicit revocation
   terminate access as specified.

Proposed browser storage is an opaque server-validated `HttpOnly`, `Secure`,
`SameSite=Lax` cookie with CSRF protection. No bearer session token in localStorage.
Proxy/TLS/cookie behavior across Windows/WSL/reverse proxy remains environment
setup, not a bypass of authenticated HTTPS.

### Step-up and recovery

- Password changes, authenticator replacement, and recovery-code generation
  require a full-authentication confirmation no more than ten minutes old.
  Reuse the valid recent-authentication marker; never replay an already consumed
  OTP/recovery code to satisfy the gate again.
- Password reset uses a single-use verified-email link and does **not** disable
  TOTP or generate recovery codes. Proposed link lifetime: 30 minutes. Successful
  reset revokes existing sessions; signing in still requires MFA.
- Authenticator replacement needs a valid old TOTP or a password plus unused
  recovery code. A host-admin recovery is a separate offline, scoped procedure,
  not a public "lost both factors" URL.
- Host-admin recovery changes only the named account's authentication state,
  invalidates its active sessions and requires MFA re-enrollment; it does not
  grant access to that account's trace data or disclose secrets.
- Recovery codes are password-bound, one-use MFA alternatives, never a standalone
  password. Proposed issuance: ten random codes, displayed once, stored as
  verifiers, all previous codes revoked atomically when rotated.

### Gateway admission and private scope

- A verified/enrolled account owns one immutable private scope; caller-provided
  account/scope IDs never grant authority.
- Registration never grants model-gateway use. Use an offline one-time operator
  bootstrap that names an already verified/enrolled account; granting/revoking
  the model-budget entitlement does not grant trace visibility, admin recovery
  authority or provider-key readback.
- Bootstrap cannot select an unverified/publicly guessed account by submitting
  a request payload. After initialization there is no public bootstrap route.

## 3. Proposed exact values and rationale

These are recommendations except for rows explicitly confirmed in DR-019 through
DR-023. Unconfirmed rows are not defaults or acceptance oracles.

| Area | Proposed choice | Trade-off |
|---|---|---|
| Email identity — approved DR-019 | Trim surrounding whitespace and case-normalize the full email address for account identity/uniqueness | Simple consistent account identity; possible merge of a rare case-sensitive local part was presented and accepted |
| Duplicate/unverified signup — approved DR-019 | Same generic confirmation for new, pending and verified addresses; do not reveal registration status | Reduces account enumeration; exact copy, next-step guidance and which state sends mail remain open |
| Email verification — approved DR-019 | Single-use link valid 24 hours; resend invalidates the previous link | Bounds stale links with a user-selected 24-hour low-friction window |
| Email delivery/testing — approved DR-019 | Configurable SMTP relay in production; local captured mail for acceptance; no vendor chosen | Supports real browser verification without sending test email externally |
| Password input — confirmed DR-020/029 | 12–128 Unicode code points; length only, no additional character/encoding restrictions or special control-character bans; preserve exact input without trim/normalization/truncation; paste/autofill, no composition or forced expiry. Malformed transport is not a password-content rule | Consistent cross-stack counting without restricting the character repertoire; secure verifier design/parameters still require technical review and measurement |
| Password hashing | Argon2id with reviewed, versioned parameters and per-hash salt via maintained Java library; rehash on successful login when parameters advance | Strong adaptive verifier; requires compatible dependency review and capacity measurement |
| Password reset — confirmed DR-020 | Single-use link to verified email, 30-minute expiry; preserve MFA and revoke all existing sessions | Restores access without weakening MFA; reset-response privacy, abuse controls and delivery failures remain open |
| TOTP — confirmed DR-021 | Six digits, 30-second time step; accept current or adjacent step in either direction; accept each step at most once/account | Supports ordinary device drift; replay tracking is required |
| TOTP enrollment — confirmed DR-021 | Verify one generated code before protected access; interrupted enrollment expires after 24 hours and must restart | Bounds unfinished setups; exact secret/QR protection and enrollment UI remain open |
| Recovery codes — count/storage confirmed DR-021 | Exactly 10 random one-use codes; display once, store only verifiers; rotation revokes previous set | Offline recovery without readback; exact format/entropy, acknowledgement and rotation UX remain open |
| Recovery login — confirmed DR-021 | Password + unused code creates ordinary low-friction session and keeps MFA enabled | Does not silently turn MFA off; replacing a lost factor still requires fresh auth or another unused code |
| TOTP secret/QR protection | Propose encrypting pending/active seed at rest with a server-managed deployment key; restrict return to a single enrollment flow; no secret in logs, browser storage, URL or tests | Concrete encryption/storage mechanism requires Java-stack and threat-boundary review |
| Account lockout/throttling — behavior confirmed DR-023 | Bounded temporary progressive delay; never permanently lock an account; throttle resends per normalized address and request source; same generic sign-in/reset/resend response | Reduces brute-force/abuse without irreversible lockout or account enumeration; numeric thresholds, keying/source identity and recovery windows require review/measurement |
| Gateway grant | **Local host-admin command is confirmed by DR-022.** Exact command/bootstrap, audit, anti-repeat safeguards and revocation/in-flight propagation remain to design | Requires trusted host access and a reviewed operational bootstrap; no public admin UI |
| Host-admin recovery | **Offline recovery of one named account, session/factor revocation and MFA re-enrollment are confirmed by DR-022.** Proof of host authority, exact command/audit and DB outage procedure remain to design | Recovery requires host administration; no public MFA bypass |
| Email transport | Configured outbound SMTP relay adapter; local-only captured-mail service for acceptance; no real outbound provider in test | Avoid vendor lock-in and user mail during tests; production relay configuration remains setup |
| Browser acceptance | Real Playwright/browser + actual backend + isolated DB + captured email + real TOTP verification using per-test test secret | Exercises registration/login instead of forged cookies; fixture secrets never committed and test codes never emitted in CI logs |
| Auth response privacy | Generic responses for unknown account, wrong password, duplicate email and verification resend; exact human-readable copy to be approved | Reduces enumeration; UX must provide reachable next action without status leakage |

Later DR-024–029 supersede earlier table/prose gaps for seed protection,
acknowledgement, sessions, interrupted setup, account lifecycle, mail/link behavior
and password input. Key/code lifecycle, bootstrap/operation contracts, exact
UI/API, hash design/measurement and numerical abuse/delivery limits remain open.
Do not copy an unapproved recommendation into test assertions.

## 4. Candidate acceptance outline—not SCNs

Candidate frontend journeys after decisions:

1. Signup happy path through captured verification email and mandatory TOTP
   enrollment; incomplete verification/enrollment cannot open protected pages.
2. Existing/pending address submits use indistinguishable confirmation behavior;
   verify/resend expiry, invalidation and email service outage.
3. Correct password+TOTP succeeds; password-only/invalid/replayed code does not.
   Password-manager paste/autofill work; no periodic expiry prompt appears.
4. Offline recovery code requires password, succeeds once, then fails on reuse;
   recovery exhaustion/rotation behavior.
5. Password reset preserves MFA, expires/replays safely and revokes sessions.
6. Browser restart preserves session; test 30-day absolute and seven-day idle
   boundaries; background activity does not reset idle; logout/revocation closes
   protected reads. Ordinary reads/own prompt approval do not add step-up prompts.
7. Sensitive settings at exactly ten minutes of recent authentication can reuse
   it; older state requires full auth. The OTP itself is never reusable.
8. Two accounts cannot read each other's traces, scopes, approvals or client
   credentials; account registration does not grant provider-budget access;
   explicit operator grant does, but not trace/admin/secret access.
9. Host recovery is inaccessible over public surfaces, scoped to the named
   account, audited, session/factor-revoking and requires new enrollment.

These become scenarios only after AMB decisions and a pure domain model/approved
intent. No fake auth cookie or successful mocked login can satisfy them.

## 5. Approved interrupted enrollment/replacement (DR-026)

- Lost QR/key or recovery-code displays are never redisplayed. Initial setup
  offers explicit password-confirmed restart for the verified account, with
  setup-only access. Invalidate old pending secrets and stale tabs and start a
  new 24-hour attempt; valid new TOTP and saved-code acknowledgement are required
  before protected access.
- Replacement preserves current authenticator/recovery codes until the new
  authenticator is verified and its new recovery codes acknowledged.
  Cancellation, expiry or lost-display restart discards only pending replacement.
- Commit the factor/code swap and DR-025 session effects atomically. Check the
  existing ten-minute recent-auth window at start/restart and final completion,
  reusing valid confirmation. Authentication-consumed recovery codes stay
  consumed on cancellation.
- Exact UI/API, acknowledgement transport, key/code details and concurrency
  contracts are still pending. This approval is not an intent or freeze.

## 6. Approved account lifecycle boundary (DR-027)

- Duplicate signup never replaces password/enrollment. The verified email owner
  may use approved reset without bypassing MFA/incomplete setup.
- Remove never-verified registrations after seven days from creation/latest
  issued verification link, whichever is later. Ordinary duplicates do not extend
  retention; issued resends do. Verified accounts survive enrollment-attempt expiry.
- Create the immutable private scope at first fully completed enrollment, not
  email verification alone. Recovery/replacement preserves ownership. Before
  completion permit required verification/setup/reset only, no protected data
  or gateway use. This supersedes section 2's earlier provisioning proposal.
- Host-only disable revokes sessions, pending auth operations and gateway
  entitlement while retaining data. Re-enable restores authentication/setup
  eligibility, not tokens/grants; a new eligible-account gateway grant is needed.
- Defer deletion, erasure and verified-email re-registration. No public admin UI,
  self-service deletion or recycling of a disabled verified email. Exact command,
  cleanup/race and in-flight gateway semantics remain open.

## 7. Approved verification/reset and delivery behavior (DR-028)

- New signup sends verification; duplicates preserve password/enrollment and
  send none. Explicit resend is enabled/unverified-only. Reset is enabled/
  verified-only, including incomplete first enrollment, without MFA/setup bypass.
  Other address states receive the same generic acknowledgement without mail.
- One current link per account/purpose; durable issuance atomically supersedes,
  failed issuance preserves the old link. Opening alone never consumes:
  verification requires explicit confirmation; reset a valid new password.
- Server time must be strictly before expiry. Atomic consumption/state changes
  prevent two concurrent successes; validation failure/rollback does not consume.
  Issuance does not log out; successful reset atomically changes password and
  revokes sessions while preserving MFA/setup.
- Acknowledge bounded durable mail-work admission, not delivery, using the same
  admission step for ineligible requests. Outage is a generic temporary-service
  failure, not success. Asynchronous retries stop at expiry/supersession/disable;
  recheck eligibility before send. Surface later SMTP failure to operators
  without secrets, not address-specific public status. Old mail may arrive but
  superseded links fail; guide users to the newest link. Retry cannot revive expiry.
- Exact copy/routes/statuses and numerical abuse/retry/queue limits remain open.

## 8. Approved length-only password input (DR-029)

- 12–128 characters inclusive, counted as Unicode code points, not bytes/UTF-16
  units. Counting is not a character-set or user encoding restriction.
- No extra character/encoding exclusions, allowed-character lists or special
  bans on spaces, symbols or control characters. The initial proposed
  NUL/line-break exclusions were rejected; do not reinstate them.
- Preserve exact input, including leading/trailing spaces: no trim,
  normalization, case folding, truncation or silent substitution. Keep
  paste/autofill/no periodic expiry and consistent password-flow interpretation.
- Login failures stay generic; creation forms may explain validation errors.
  Malformed requests use ordinary explicit transport/parse errors, not extra
  password-strength rules.
- Secure verifier hashing is still required. Algorithm/library/parameters,
  rehash and measured memory/concurrency bounds remain a technical gate.

## 9. Approved TOTP-key lifecycle and scoped degradation (DR-030)

- Name the key explicitly: server-side TOTP seed-encryption key, not provider
  API key or human session key. Provider-key changes affect model calls, not
  human session validity; no new provider-key-management UI is implied.
- Permit explicitly degraded operation if the TOTP key is unavailable. Otherwise-
  valid sessions and password/unused-recovery-code login can continue when
  independent verifiers and other dependencies work. Fail key-dependent
  operations explicitly as unavailable; no wrong-code disguise, plaintext/MFA
  fallback, silent replacement or automatic session/factor reset.
- Explicit protected local provisioning; separate protected key backup/matched
  database restore; versioned rotation re-encrypts the same seeds without
  re-enrollment. Retain backup-required keys. Correct-key restore recovers
  capability; unrecoverable loss uses scoped offline host recovery.
- The original blanket startup-blocking recommendation was revised, not approved.
  Exact encryption, permissions/commands/reload, rotation/restore failure and
  health/UI/API contracts remain design work.

## 10. Approved recovery-code format/regeneration (DR-031)

- Ten codes, each 128 random bits/32 hex characters/eight groups of four; accept
  upper/lower case and optional grouping hyphens; store only verifiers.
- Standalone generation preserves the old set until saved-code acknowledgement
  and atomic activation. Check recent-auth at start/restart/completion; 24h
  pending lifetime. Cancellation/expiry/lost display before commit discards
  pending only; consumed authentication codes stay consumed.
- Stale tabs cannot activate obsolete sets; concurrent use of a code succeeds
  once. A lost commit response uses nonsecret completion status/fresh generation,
  never rollback or secret redisplay.
- Completion revokes other sessions and rotates/retains current without extending
  its absolute deadline or replacing active TOTP. Exhaustion uses authenticator
  login/regeneration or offline host recovery if all second factors are lost.
- Initial enrollment/replacement follows DR-026, not the standalone flow.
  Verifier algorithm and exact UI/API/transaction binding remain open.

## 11. Consolidated host/gateway/session approval (DR-032)

- Trusted local exact-account authority, reason/confirmation, atomic secret-free
  audit and explicit dependency/rollback failure; repeated grant/revoke/disable
  safely reports already-in-state.
- Recovery preserves email/password/private ownership, revokes sessions/factors/
  pending auth/grant, creates no session and never silently re-enables disabled
  accounts. Password or approved reset leads to setup-only re-enrollment and
  later explicit eligible-account regrant. No public/bootstrap admin account.
- Grant only enabled/verified/enrolled accounts. Revocation/disable/recovery
  blocks later admissions and undispatched upstream work with consistent ordering,
  not stale caches. Already-dispatched work may finish without follow-on authority
  or protected reads by revoked human sessions; no grant resurrection.
- Deliberate protected navigation/manual refresh/authorized changes renew idle;
  polling/prefetch/static assets do not. Exact session expiry denies access;
  recent full auth is valid through ten minutes inclusive, same account/session
  only. Shared-session tabs share confirmation, different sessions do not.
- Recheck current account/session/factor at sensitive commit; preserve only still-
  valid confirmation with its original timestamp when rotating/retaining current
  session, never extending its original absolute deadline.
- Routine implementation choices belong in the design for review, not repeated
  preference forms. Numerical abuse/delivery limits remain deferred for measurement.

## 12. Bounded review sequence

Resolve the decisions in this order:

**Current next gate:** close the explicit oracle gaps in
[scenario catalog v0.2](./05-scenarios.md) as one consolidated review. Its 83 SCN
IDs now include four `@unspecified` cases: 012/024/079/080. DR-034 approves
[intent v0.2](./04-intent-v0.2.md) composed with unchanged
[v0.1](./04-intent-v0.1.md), resolving the two deadline cases. Phase 3 is not passed.
Only after scenario-gate closure proceed to shared contracts and subsequent
engineering design in workflow order.
Numerical abuse/delivery limits, exact contract and tooling/measurement gates
remain open before acceptance freeze. Approval status is in the decision record;
DR-033 is not approval of unspecified expectations or an implementation design.

### Consolidated oracle-closure work, not new approvals

1. **Completed under DR-034:** seven-day cleanup eligibility includes equality;
   24-hour pending completion excludes equality. SCN-005/037 now use those
   approved oracles. Preserve both approved intent files.
2. Prepare verifier/rehash and cryptographic/evidence contracts with supported
   library compatibility and a benchmark method. No algorithm/cost/performance
   result is approved merely because a recommendation exists.
3. Keep numerical mail/queue/retry and authentication/source/delay/recovery limits
   deferred until the reviewed measurement/setup prerequisites can be met;
   never invent numbers to make SCN-012/080 appear complete.
4. Declare the actual browser/backend/mail/persistence/clock/concurrency and
   secret-safe supporting evidence surfaces. No installation or privileged
   public test interface is authorized by this preparation.
5. Obtain approval of observable additions, reconcile source/register/scenarios
   and assess intent-version impact. Material changes require a new version;
   approved v0.1 remains byte-for-byte unchanged.

## 13. Verifier/evidence closure candidate and measurement prerequisites

**Technical proposal only, not an approved oracle, installed dependency or
measured result.** DR-034 approves deadline equality, not this section. Ordinary
engineering choices are drafted here for one review, not separate preference
questions. SCN-024/079 remain blocked until the complete contracts are reviewed.

### Public reference basis, retrieved 2026-10-30

- [OWASP password-storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
  recommends Argon2id with at least 19 MiB, two iterations and one lane. Its
  warning against fast password hashes applies to passwords; a random 128-bit
  recovery code is not a human-chosen password.
- [Spring Security password-storage guidance](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)
  calls for adaptive hashing tuned on the actual system, describing approximately
  one-second verification as guidance rather than a measured result for this
  application. Framework defaults are not assumed to be the selected cost.

### Candidate mechanisms to review together

| Surface | Candidate | Still required before an acceptance oracle is complete |
|---|---|---|
| Password verifier | Maintained Java Argon2id implementation, initial candidate 64 MiB/three passes/one lane, fresh 16-byte salt and 32-byte result; versioned algorithm/parameters per verifier | Java 25/library compatibility, exact pins/format, bounded concurrency/queue, latency/memory budget and target-host measurement |
| Rehash | After successful full authentication, advance obsolete reviewed parameters only while the same credential revision remains current; never overwrite a concurrent reset/change or silently claim a failed update | Exact revision/transaction/failure contract and downgrade prevention |
| Recovery verifier | Account/set-bound, domain-separated SHA-256 verifier of the canonical generated 128-bit code; never use fast SHA-256 as the password verifier | Exact canonical framing/version/comparison and one-use transaction contract; no extra TOTP-key dependency |
| Seed encryption | Deployment-local versioned AES-256-GCM; unique 96-bit nonce per key, 128-bit tag, authenticated account/stable-seed identity/schema metadata | Key/nonce uniqueness design, framing, permissions, rotation/restore/corruption contracts; no plaintext or wrong-key fallback |
| Random generation | Maintained Java cryptographic generator for actual 16-byte recovery-code inputs, salts and key material | Exact provider/configuration review and supporting generation evidence; formatting alone does not prove entropy |

These mechanisms do not add password character/encoding restrictions, a
72-byte truncation limit or a new provider/session-key dependency. They must
support the exact length-only password policy and scoped TOTP-key degradation.
The proposed costs are benchmark candidates, not a claim that the host can
sustain a particular number of logins or meet a latency objective.

### Candidate secret-safe evidence boundary

1. Exercise the real browser/backend flows with per-case generated values.
   Keep secrets in isolated live test memory/runtime only; never commit them.
2. Before any secret-bearing step, disable trace/HAR, screenshot, video and DOM/
   request-body recording for that interval. Resume only at an established
   nonsecret state. Evidence may record SCN/correlation IDs and approved state/
   outcome metadata, not passwords, QR payloads, seeds, links, codes or cookies.
3. Inventory exported browser/test/report attachments, console/exception output,
   backend/access/audit logs and metrics labels. Use an allowlist for exported
   fields and verify generated secret values plus reviewed encoded forms are
   absent. A missing capture or empty artifact is not by itself proof.
4. Captured local mail and live fixture state necessarily contain some sensitive
   runtime values. Isolate/access-control them and exclude them from exported
   artifacts; clean only explicitly resolved per-case resources. Do not mistake
   an ephemeral mail runtime for permission to export a mailbox or database dump.
5. Add supporting checks of verifier-only password/recovery representation,
   encrypted seeds, generator input size/source and safe failure paths. These
   supplement, never replace, real browser acceptance.
6. Preserve observable negative/failure evidence without leaking secrets; do not
   hide a product failure, turn off an assertion or substitute forged authority.

The exact artifact inventory, recorder transitions, schema allowlist and
negative-secret checks still need review before SCN-079 can lose its blocker.

### Prerequisite measurement gate

Prepare a pinned, project-local Java 25/tool/library manifest and bounded
measurement procedure for review before downloading/installing anything.
No global Java/PATH changes, WSL work, production credentials, real outbound
email or application implementation is authorized here. Start with sequential
hash timing/memory observation; any concurrency/capacity experiment needs its
own explicit bounds suitable for this shared host. Record actual versions,
host/resources, configuration, sample counts, observed latency/memory and errors.

Do not treat a different-language benchmark, published numbers, one successful
hash, empty mail queue or source-code inspection as target-stack capacity
evidence. Numerical login/mail/queue/delay/recovery limits remain deferred under
DR-023 until the reviewed evidence and observable policy are agreed. Keep
SCN-012/024/080 blocked rather than manufacturing measured bounds.

After the remaining oracle gaps are closed, continue shared contracts, design
and task planning in workflow order. Do not reopen the settled account/session
choices. Timeline stays downstream until native authentication is implemented
and verified through genuine frontend acceptance.
