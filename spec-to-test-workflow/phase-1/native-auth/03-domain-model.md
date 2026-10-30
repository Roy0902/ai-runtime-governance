# Native authentication domain model

Version: 0.1. Prepared: 2026-10-30. Status: presented for review.

## 0. Sources & Traceability

- Spec: [Requirements](../../../REQUIREMENTS.md), AUTH-001 through AUTH-009 and
  OD-11 refinements; [decisions](../05-decision-record.md), through DR-032.
- Register: [scoped ingestion](./00-ingestion.md), version 0.10,
  REQ-native-auth-001 through -011. Below, `REQ-001` abbreviates
  `REQ-native-auth-001`; similarly for the other scoped IDs.
- Diagrams: none were approved as input for this model. The separately derived
  [intent v0.1](./04-intent-v0.1.md) requires its own approval.
- No unresolved core business transition is intentionally filled by assumption.
  AMB-native-auth-011 numerical limits remain open; they prevent detailed
  acceptance expectations, not identification of the concepts below. Remaining
  operational/contract ambiguities stay in the scoped register.
- Timeline delivery, actual client guarding, deletion/erasure and verified-email
  recycling are not silently included.

## 1. Ubiquitous Language

| Term | Business meaning | Trace |
|---|---|---|
| Account | One human identity with independent verification, access and enrollment standing | REQ-001/002/007 |
| Pending registration | Never-verified identity awaiting email confirmation; not a private-data or model-budget authorization | REQ-001/007 |
| Private scope | Immutable ownership boundary created at first completed enrollment and retained through recovery | REQ-007/008 |
| Confirmation link | Current single-use authority for one account and purpose, bounded by its lifetime | REQ-001/009 |
| Enrollment attempt | Time-bounded candidate authenticator and recovery set, distinct from any active factors | REQ-010 |
| Recovery code | One-use second-factor alternative used with the password, not a password replacement | REQ-002/004/010 |
| Human session | Time-bounded authority for the authenticated human, independent of provider credentials | REQ-005/008/010 |
| Recent confirmation | Full authentication still within ten minutes for one account/session | REQ-006 |
| Gateway entitlement | Explicit host-granted eligibility to spend provider budget, not permission to read another human's data | REQ-007/008 |
| Host administrator | Trusted local actor permitted scoped recovery/access changes, not implicit human impersonation | REQ-004/007/008 |
| Accepted mail request | Accepted delivery work, not assurance that mail arrived | REQ-001/009/011 |
| Authenticator unavailability | Temporary inability to perform authenticator-dependent actions, not loss of account/session ownership | REQ-005/010 |

## 2. Aggregates & Entities

- **Account** is the root for identity, access standing and factor transitions.
  - Properties/state: normalized email; never-verified or verified; enabled or
    disabled; not-enrolled, enrolled or recovery-required; optional immutable
    private scope; password credential; current factor standing.
  - These are independent dimensions: recovery does not erase verification or
    scope, and does not re-enable a disabled account.
  - Value objects: email identity, exact password value subject only to length,
    account identity, scope identity. [REQ-001/002/003/004/007/010]
- **Confirmation authority** belongs to one account and purpose.
  - State: current, consumed, superseded or expired; issuance and expiry times.
  - At most one current authority per purpose. [REQ-001/009]
- **Enrollment attempt** belongs to one account.
  - Purpose: initial enrollment, authenticator replacement or recovery enrollment.
  - State: pending, completed, cancelled, expired or superseded; candidate
    authenticator verified/not verified; recovery set acknowledged/not acknowledged.
  - Initial/recovery completion requires enabled/verified account standing.
    Replacement preserves active factors until successful completion. [REQ-004/007/010]
- **Recovery-code set** belongs to one account.
  - State: pending, active or revoked; ten codes at issuance; each active code is
    available or consumed. Standalone pending sets have a 24-hour lifetime.
  - Value objects: 128-bit code value, set identity, saved-code acknowledgement.
    Standalone regeneration preserves the active authenticator. [REQ-004/006/010]
- **Human session** is the root for one human's continuing authority.
  - State: active, logged out, revoked or expired; original creation time, last
    successful deliberate activity and optional recent-confirmation time.
  - The earlier absolute/idle deadline controls; recent confirmation cannot move
    either original absolute lifetime or its own original timestamp. [REQ-005/006]
- **Gateway entitlement** belongs to one account.
  - State: absent, granted or revoked. Admission/dispatch depends on current
    account eligibility and entitlement, not historical grant possession.
  - Already-dispatched work is distinct from authority to begin more work.
    [REQ-007/008]
- **Mail request** records accepted delivery work for an eligible purpose or a
  generic ineligible request.
  - Outcomes distinguish accepted work, delivery, delivery failure, supersession
    and expiry. Ineligible requests cause no mail or eligibility disclosure.
    [REQ-001/009/011]

## 3. Business Rules (Invariants)

1. [REQ-001/007] Trim/case-normalize full email identity. Duplicate registration
   never replaces a password or seizes enrollment; use generic acknowledgement.
2. [REQ-001] Remove only never-verified registrations seven days after creation
   or latest issued verification link, whichever is later. Ordinary duplicates
   do not extend retention; verified accounts survive enrollment-attempt expiry.
3. [REQ-001/009] New signup sends verification, duplicates do not. Explicit resend
   is enabled/never-verified only; reset is enabled/verified only, including
   incomplete first enrollment. Other states acknowledge generically without mail.
4. [REQ-001/009] A current confirmation is valid strictly before expiry, 24 hours
   for verification and 30 minutes for reset. Opening alone never consumes it.
   Explicit verification or valid password-reset completion consumes atomically;
   failed validation/rollback leaves it unconsumed.
5. [REQ-001/009] New issuance supersedes old authority only on successful issuance.
   Acceptance means accepted mail work, not delivery; admission failure is explicit.
   Delivery retries are bounded and cannot revive expired/superseded authority.
6. [REQ-002/003] Password content is restricted only to 12-128 Unicode code
   points, preserving exact text. No extra character/encoding/composition rules,
   silent transforms or periodic forced change. Credentials are not recoverable
   as plaintext. Ordinary malformed requests are not password-complexity rules.
7. [REQ-002/004/010] Fresh enrolled-account authentication requires password plus
   valid authenticator or unused recovery code. A recovery code alone is not
   authority; recovery login does not remove mandatory MFA.
8. [REQ-010] TOTP uses six digits/30 seconds, current step plus/minus one;
   accept each account/time step at most once.
9. [REQ-001/007/010] Protected access requires verified email and completed MFA.
   Completion needs a valid candidate code and saved-recovery-code acknowledgement.
   Create the private scope only at first full completion; never reassign it.
10. [REQ-010] One-time setup values are not redisplayed. Explicit password-confirmed
    initial restart has setup-only authority and invalidates previous pending
    values/stale attempts. Pending enrollment lasts 24 hours.
11. [REQ-006/010] Replacement retains active factors until verified/acknowledged
    atomic completion; pending cancellation/expiry/restart does not revoke them.
    Consumed authentication codes never return to availability.
12. [REQ-006/010] Ten recovery codes contain 128 random bits each, represented by
    32 hex characters/eight groups of four; accept case variants/optional hyphens.
    Standalone generation preserves old codes until acknowledged atomic activation.
    Obsolete attempts cannot activate; concurrent code use has one success only.
13. [REQ-006/010] Standalone generation checks recent confirmation at start,
    restart and completion. Pre-completion interruption discards pending only.
    Lost completion acknowledgement does not undo completion or allow readback;
    nonsecret completion standing permits a fresh regeneration.
14. [REQ-005/006/010] Signed-in password/factor changes and standalone regeneration
    revoke other sessions and rotate/retain current authority without extending
    its absolute deadline. Reset and host recovery revoke all affected sessions.
15. [REQ-005/006] Sessions end exactly at the earlier 30-day absolute/seven-day
    idle deadline. Only successful deliberate protected navigation/manual refresh/
    authorized changes renew inactivity; polling/prefetch/static activity does not.
16. [REQ-006] Recent full authentication is reusable through ten minutes inclusive,
    same account/session only. Shared-session tabs share it; other sessions do not.
    Sensitive completion rechecks current account/session/factor standing.
    Retained confirmation keeps its original time; stale authority cannot win.
17. [REQ-004/007/008] Host changes target one exact account with reason/confirmation
    and atomic secret-free audit. Failure means no claimed success. Repeated
    grant/revoke/disable is safe. Host authority grants no human/data impersonation.
18. [REQ-004/007] Recovery retains email/password/scope, revokes sessions/factors/
    pending authentication/grant, creates no session and never re-enables a
    disabled account. Password or approved reset leads to setup-only re-enrollment.
19. [REQ-007/008] Gateway grant requires enabled/verified/enrolled standing.
    Revocation blocks later admissions/undispatched work. Already-dispatched work
    may finish without follow-on authority or protected reads by revoked sessions.
    Recovery/re-enable never resurrects entitlement.
20. [REQ-005/008/010] Provider credentials do not own human sessions. Authenticator
    unavailability permits valid sessions/independent recovery login when other
    requirements hold; affected actions fail explicitly, without MFA bypass or
    automatic factor/session reset.
21. [REQ-009] Reset issuance does not log out. Successful reset atomically changes
    password/revokes sessions, preserves active MFA and incomplete-setup restrictions.
22. [REQ-011] Public responses do not disclose account eligibility; temporary
    progressive throttling never permanently locks the account. Address/source
    bounds and delivery limits remain explicit numerical review gates.

## 4. Domain Events

These are conceptual business outcomes, not a promise of an emitted event format.

| Past-tense event | Meaning | Trace |
|---|---|---|
| RegistrationAccepted | A new pending identity was admitted without protected authority | REQ-001 |
| VerificationIssued / EmailVerified | Current verification authority was issued/consumed successfully | REQ-001 |
| ConfirmationSuperseded / ConfirmationExpired | Earlier confirmation authority ceased to be usable | REQ-001/009 |
| MailWorkAccepted / MailDeliveryFailed | Work was accepted or delivery later failed, without conflating them | REQ-001/009/011 |
| EnrollmentRestarted / EnrollmentCompleted | Pending setup was replaced or its full requirements completed | REQ-001/010 |
| PrivateScopeEstablished | First enrollment established immutable ownership | REQ-007 |
| AuthenticatorReplaced | Verified candidate and acknowledged codes replaced prior factors | REQ-006/010 |
| RecoveryCodeConsumed / RecoveryCodesRegenerated | One code was spent or a new acknowledged set activated | REQ-004/006/010 |
| HumanAuthenticated / SessionExpired / SessionRevoked | Full authentication succeeded or continuing authority ended | REQ-002/005 |
| RecentAuthenticationConfirmed | Full authentication established a same-session reusable confirmation | REQ-006 |
| PasswordResetCompleted | Password changed and all sessions were revoked with MFA preserved | REQ-009 |
| AccountDisabled / AccountReenabled | Host action changed access standing without erasing ownership | REQ-007 |
| HostRecoveryCompleted | Scoped factor/session/grant revocation required re-enrollment | REQ-004/007 |
| GatewayAccessGranted / GatewayAccessRevoked | Explicit budget eligibility changed | REQ-007/008 |
| AuthenticationCapabilityDegraded / AuthenticationCapabilityRestored | Authenticator-dependent actions became unavailable/available without transferring ownership | REQ-005/010 |
