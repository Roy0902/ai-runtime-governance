# Native authentication prerequisite: recommendations for review

Version: 0.6. Prepared: 2026-10-30. **Partially approved:** DR-019 confirms signup
email; DR-020 password/reset; DR-021 TOTP/recovery; DR-022 host-admin boundaries;
DR-023 generic responses and no-permanent-lockout throttling. Other recommendations
remain unapproved.

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
| Password — partly confirmed DR-020 | Minimum 12 characters; allow passphrases, paste and autofill; no composition rules or forced expiry. Proposed maximum 128 characters; Unicode counting and malformed-input policy remain open | Easier passphrases/password managers; maximum/counting and verifier parameters still need technical review |
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

Maximum password length/Unicode counting, reset response privacy/abuse limits,
failed-login limits, TOTP seed/QR handling, recovery-code format/entropy,
bootstrap procedure and hash parameters need explicit approval. DR-019 email,
DR-020 password/reset and DR-021 TOTP/recovery behavior are approved; other
table rows are proposals. Do not copy an unapproved row into test assertions.

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

## 5. Bounded review sequence

Resolve the decisions in this order:

1. Registration identity/verification and production/test email behavior.
2. Password setup/reset and native MFA enrollment/TOTP/replay.
3. Recovery-code and host-admin recovery lifecycle.
4. Private account bootstrap/scope provisioning and operator grant.
5. Session activity/revocation/CSRF and ten-minute reauthentication operations.
6. Abuse controls, exact copy/accessibility and real browser test fixture strategy.

Then update the normative AUTH requirements/OD-11 with only approved choices;
preserve source IDs. Generate the scoped REQ/AMB register, pure domain model and
versioned intent, seek explicit approval, then write concrete browser scenarios,
shared UI/API contracts, design and tasks. Timeline remains downstream until
the native-auth acceptance prerequisite is actually implemented and verified.
