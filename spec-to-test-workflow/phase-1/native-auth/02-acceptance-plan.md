# Native authentication prerequisite: frontend acceptance plan

Version: 0.1. Prepared: 2026-10-30.
Status: **Coverage plan only. No SCNs, locators, test code, login flow or outcome
is frozen. Resolve 00-ingestion ambiguities before Phase 2/3.**

## 1. Acceptance principle

Every native-account behavior must be exercised through the real browser and
application/backend behavior. Unit, service and security tests supplement these
frontend acceptance tests; they never replace them. Do not create a static auth
demo, forged login cookie, mock-success client or public fixture endpoint to
make acceptance appear green.

Use the approved spec and later approved intent as the only oracle. The proposal
document's values are not frozen expectations until approved and written into
requirements/SCNs.

## 2. Candidate journey map

These are coverage families, not numbered SCNs and not executable assertions.
Expected outcomes for ambiguous cases remain blocked.

| Journey family | Confirmed requirement coverage | Positive candidate | Negative/boundary candidate | Current blocker |
|---|---|---|---|---|
| Public email registration | AUTH-001, AUTH-002 | Register a new identity and verify signup email | Duplicate/case variant, malformed address, unverified/expired/replayed link | AMB-native-auth-001/002/011 |
| Mandatory 2FA enrollment | AUTH-002, AUTH-003, AUTH-008 | Verify email then enroll compatible TOTP; one valid code completes enrollment before protected read | Password/email verification alone; invalid/replayed code; current and ±1-step clock boundaries; pending enrollment expires after 24 hours | AMB-native-auth-004 |
| Fresh login | AUTH-003, AUTH-008 | Correct password plus valid six-digit/30-second TOTP; accept a 12-character passphrase | Password-only, an 11-character password, wrong/expired/replayed same-step OTP; paste/autofill; no periodic expiry | AMB-native-auth-003/004/011 |
| Persistent sessions | AUTH-005 | Browser restart inside both limits preserves access | Exactly at/after absolute and idle expiry; background-only activity; logout/revocation | AMB-native-auth-007 |
| Sensitive account changes | AUTH-006 | Password+MFA confirmation reused within ten minutes | Stale recent-auth marker; consumed OTP not replayed; changes outside the approved set | AMB-native-auth-008 |
| Offline recovery | AUTH-004, AUTH-008 | Exactly 10 random one-use codes are displayed once; password plus one unused code authenticates and leaves MFA enabled | Code alone, wrong password, invalid/consumed code, rotation revokes all old-set codes; stored values are verifiers, not retrievable codes | AMB-native-auth-005 |
| Password reset | AUTH-007 confirmed by DR-020 | Single-use verified-email link with 30-minute expiry changes password, preserves MFA and revokes existing sessions | Expired/replayed reset, old-session invalidation, fresh MFA, unknown-address privacy and delivery/rate failures | AMB-native-auth-003 |
| Host-admin recovery | AUTH-004, DR-022 | Local offline host-OS administrator resets only a named account, revokes its sessions/factors and requires new MFA | No public route; wrong account; unauthorized host operator; database unavailable; no trace/prompt/provider-secret access | AMB-native-auth-006 |
| Private account isolation | AUTH-001, AUTH-002 | Each user inspects their own authorized data | Guessed other-scope trace, credential or approval; cross-scope event | AMB-native-auth-009 |
| Gateway budget grant | AUTH-001, DR-022 | Local host-admin grant allows only an email-verified/MFA-enrolled named account to use gateway; operator gains no data/secret read | Signup alone, unverified account, cross-account, revoked grant, active call, repeat/bootstrap race; no public admin UI or trace/prompt/provider-secret readback | AMB-native-auth-010 |
| Public abuse/error behavior | AUTH-001/002/003 | Routine successful low-friction use | Rate/email floods, account enumeration, password guessing, dependency outages | AMB-native-auth-011 |
| Authentication privacy/throttling | AUTH-009 confirmed by DR-023 | Generic sign-in/reset/resend behavior; temporary progressive throttling | Unknown-vs-known address parity, repeated failures recover without permanent lockout, resend throttled per normalized address/source | AMB-native-auth-011; numeric limits pending |

## 3. Real frontend/backend fixture strategy (proposed)

Subject to tooling and security review:

1. Start the actual application, real auth/session middleware and isolated
   PostgreSQL database for each test worker.
2. Route outbound verification/reset mail to a local test-only SMTP capture
   service, not a real mailbox or external provider. Inspect the received link
   in test support without logging it.
3. Use synthetic unique addresses and generated passwords per test. A controlled
   test-only TOTP enrollment secret is generated using the actual application
   enrollment flow; the browser acceptance harness computes time codes with a
   compatible TOTP library and submits them through the real form.
4. Capture/consume recovery codes only in isolated test memory. Never print codes,
   TOTP secrets, passwords, reset links, session cookie values or QR payloads to
   stdout, Playwright traces, screenshots, failure messages or CI artifacts.
   Disable or redact recording around secret-entry/setup steps; ensure useful
   evidence remains for the resulting states without retaining secrets.
5. Access operator gateway grants only through the reviewed real host-operator
   bootstrap mechanism; acceptance tests must not impersonate operator authority
   through browser request bodies.
6. Clean only the test's own database/mail/session state. Prevent tests from
   targeting any non-test database or outbound mail configuration.

This is a candidate method, not permission to install SMTP/Playwright/database
tools, store real account secrets, expose a public test-control interface, or
bypass the user's native registration/2FA flow.

## 4. Required suite quality gates

- At least one real browser/backend positive and negative journey for each
  approved AUTH behavior; boundary cases for all confirmed numeric limits.
- No assertion based solely on a component render or intercepted successful API.
- Prove verification/MFA prerequisites before any protected page access.
- Use two accounts to prove private-scope isolation; include direct-resource
  navigation rather than only hiding links.
- Validate persistence/one-time behavior across separate requests/restarts where
  the confirmed contract requires it.
- Service tests independently inspect stored password/factor/recovery verifiers
  and rejected payload/log paths; these remain supporting tests.
- No "always green" fixture role, blanket auth stub, disabled acceptance suite,
  silent retry, or unchecked production credential may be introduced.
- Establish a failing feature-missing browser result for the correct product
  reason after the harness itself is independently proven healthy; then lock the
  protected acceptance file before implementation.

## 5. Setup and review dependencies

Current observed baseline was Java 21.0.5 on PATH, no Maven command and no
application/web/browser/database manifests. Selected target remains Java 25 with
project-local Maven Wrapper planned, not installed. Exact React/Vite/Playwright/
helper/browser, Spring, persistence, SMTP-capture and CI versions/commands require
an approved setup. Do not claim a native pass, clean install or red browser result
until those tools run against this application.

Complete the registration/security decisions, pure domain/intent approval and
exact UI/API/copy contracts first. Then create SCNs from these journey families
and apply the normal Phase 6 → freeze → red → lock workflow. Native authentication
must pass its acceptance gate before the timeline milestone uses it.
