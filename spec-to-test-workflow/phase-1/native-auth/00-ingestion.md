# Native authentication prerequisite: scoped ingestion

Version: 0.4. Prepared: 2026-10-30. Feature key: `native-auth`.
Status: **DR-018 sequencing and DR-019/020/021 selected account behaviors are
confirmed. Remaining flow/intent decisions remain open. No
account/UI contract, SCN, freeze or implementation implied.**

DR-019 resolved the signup identity, duplicate-response and link lifetime/resend
choices in AMB-native-auth-001/002. DR-020 resolved the minimum 12-character,
passphrase-friendly password policy and 30-minute verified-email reset that
preserves MFA and revokes sessions in AMB-native-auth-003. Exact copy, reset/
resend limits, max password length/hash parameters and SMTP failure behavior
remain open.

DR-021 resolves TOTP timing/replay, enrollment completion/expiry, recovery-code
count/storage/rotation and the post-recovery login result in AMB-native-auth-004/005.
Secret/QR protection, code format/entropy, code display acknowledgment and
replacement/admin-recovery interactions remain open.

## 1. Source inventory

**Resumed checkpoint:** DR-024 records the previously confirmed seed encryption,
one-time QR/manual-key display and recovery-code acknowledgement. Those business
choices in AMB-native-auth-004/005 are resolved; key lifecycle, interrupted setup,
code format/entropy and exact UI/transport remain open. Source fingerprints below
identify snapshots; changing status/index documents are references, not oracles.

DR-025 resolves the session-activity, cookie-storage and settings-change
revocation choices in AMB-native-auth-007/008. Successful deliberate protected
actions, not background polling/static assets, reset inactivity. Use server-side
sessions with Secure/HttpOnly/SameSite cookie and CSRF protection, no localStorage
login token. Recent-authenticated password/factor changes revoke other sessions,
rotate/retain the current session and preserve its original absolute deadline.
Forgot-password and host recovery still revoke all sessions. Exact classification,
cookie/CSRF and concurrency contracts remain open.

| Source | Revision / authority | Sections used |
|---|---|---|
| [Requirements](../../../REQUIREMENTS.md) | SHA-256 `355909532B11C55826152DFA3A1C72E24346E96EFE27D700E11A668B007332C3`; primary oracle | 75 global rows; AUTH-001 through AUTH-009, DR-024/025 enrollment/session refinements, AT-09 and OD-11 |
| [Technical baseline](../../../TECHNICAL_BASELINE.md) | SHA-256 `CFAD34925669F6BD14626A9EB2F44F794C9D90B9C0CE4AB53F8E6A07A33E55FE` | Native TOTP/recovery, password verifier/reset, same-host demo-secret direction, SMTP relay and operator boundary |
| [Pending design decisions](../../../PENDING-DESIGN-DECISIONS.md) | SHA-256 `F00814DDEECD9FB3B43B2CDE9E3BA51EBF635A8BF3939E9657B0794AA6EBCA4D` | Confirmed review direction and remaining processing/operational limits |
| [Confirmation record](../05-decision-record.md) | SHA-256 `AA624D1DF02248110A1E446957D1E6FB0C13C1752593DE90CC8D3D60FDFD5BD6`; DR-004 through DR-008/018–025 | Confirmed account, recovery/session/scope/operator, privacy, protected enrollment and session-renewal choices |
| [Phase 1 materials index](../README.md) | SHA-256 `A16A05F40C5FF95E1243883A562062B718B964D69AFEE39A700A2168299DAA30` | Package sequencing and current native-auth status |
| [Canonical workflow](../../../../spec-to-test-workflow/.github/skills/spec-to-test-workflow/SKILL.md) | SHA-256 `6A0D84DC14A6CF9EEC068863354AD9FDE327BC2BD0F5071BB9F929685DCC916A` | Phase order, review/freeze/red gates |
| Spec-ingestion skill | SHA-256 `E9D14F318823B7DE550314BB0E76CC42849D621A7ED8EECBEBC2BE145332EF76` | Source precedence, REQ/AMB traceability and coverage gates |
| Domain-modeling skill | SHA-256 `10E164077120B902BA0BE2B6E218303921A806A8B76C8E7DCDB512132F934B1A` | Required pure domain model shape and traceability |
| Behavioral-specification skill | SHA-256 `524375FFBDB658C426650A599F0183B9AD3B44F6A8C5E6003B2CBEA2EA94669B` | Concrete scenario and frontend acceptance gates |
| Reviewed account-auth intent | Not yet produced | Requires settled behavior and explicit user approval |
| Existing login/routes/build/tests | Not present in target root | Greenfield; no existing auth pattern or API behavior is claimed |

No live application/browser, source code, email provider, identity service or
observed network behavior informed expected values. Repository contains no
application manifest/authentication implementation. Current graph generation
predates these untracked specification materials; direct current reads govern.

## 2. Scope for the prerequisite increment

**In scope for review:** public email/password registration; signup verification;
mandatory authenticator enrollment; native password + authenticator login;
offline recovery-code use; controlled host recovery; private per-account scope;
low-friction persistent sessions and recent reauthentication; explicit
deployment-operator gateway-access grant; logout/revocation; and the frontend
journeys required to exercise those behaviors.

**Not silently included:** external OIDC/account platform, workspaces/invitations,
user-provided model credentials, public operator role, public TOTP bypass,
actionable timeline approval, prompt/model/tool body archives, client integration,
commercial multi-region/high-availability operation.

No actual password/API/TOTP/recovery secret may be included in this package, a
test fixture committed to source, or a chat transcript. The user chose same-host
demo credential storage; that does not approve plaintext/reversible password
storage or secret leakage.

## 3. Scoped requirement register

Scoped `REQ-native-auth-*` IDs map to existing global AUTH IDs; they do not
renumber or replace the global requirements.

| Scoped REQ | Confirmed expectation | Source | Test surface | Testability |
|---|---|---|---|---|
| REQ-native-auth-001 | Public email/password self-registration; full-address trim/case identity; generic duplicate-safe signup response; verify once and enroll 2FA before protected access; single-use 24-hour link invalidated by resend | AUTH-002, DR-006/008/019 | Browser + backend | Email identity/link lifetime confirmed; exact copy, send eligibility and delivery failure pending |
| REQ-native-auth-002 | Fresh login requires password and authenticator code; password >=12 characters; allow passphrases/paste/autofill; no composition rules or periodic expiry | AUTH-003, DR-006/007/020 | Browser + backend | Minimum/usability confirmed; max, character counting, hashing and MFA enrollment/replay pending |
| REQ-native-auth-003 | Passwords use secure salted verifier hashes, never plaintext; same-host demo storage is acceptable | AUTH-003, DR-004/005 | Supporting persistence/security + browser | Behavior confirmed; exact algorithm/configuration and proof hooks pending |
| REQ-native-auth-004 | Offline single-use recovery code with password; controlled host-admin recovery if normal options are lost | AUTH-004, DR-006 | Browser + backend / controlled operations | Blocked: recovery/reset/re-enrollment contract |
| REQ-native-auth-005 | Sessions persist across browser restarts, max 30 days and 7 days inactive, whichever first; valid session avoids repeated MFA for ordinary reading/approval | AUTH-005, DR-007 | Browser + backend | Limits confirmed; activity and token lifecycle contract pending |
| REQ-native-auth-006 | Sensitive account changes require full auth no more than 10 minutes old; reuse confirmation; no repeated challenge within that window | AUTH-006, DR-007 | Browser + backend | Limit confirmed; exact action/reauth/replay semantics pending |
| REQ-native-auth-007 | Accounts own distinct private data/credential scopes; public signup does not grant model budget; explicit operator grant is required | AUTH-001/002, DR-008 | Browser + backend | Business rule confirmed; provisioning/grant/bootstrap contract pending |
| REQ-native-auth-008 | Human approval authority is the submitting human; gateway/event/provider credentials remain purpose-separated | AUTH-001, INT-009, DR-005 | Browser + backend | Scope confirmed; integration binding/lifecycle is separately gated |
| REQ-native-auth-009 | Single-use password-reset link to verified email, 30-minute expiry; reset preserves MFA and revokes existing sessions | AUTH-007, DR-020 | Browser + backend | Reset behavior confirmed; response privacy, abuse controls and delivery failures pending |
| REQ-native-auth-011 | Sign-in/reset do not reveal registration status; temporary bounded progressive throttling, no permanent account lock; address/source resend throttling with generic responses | AUTH-009, DR-023 | Browser + backend | Behavior confirmed; exact response copy, numerical limits and source/recovery windows pending |
| REQ-native-auth-010 | TOTP six digits/30s with ±1-step clock tolerance and single use per account/time step; verified enrollment, 24-hour interrupted-setup expiry; exactly 10 random recovery-code verifiers displayed once, rotation invalidates old set, recovery login preserves MFA | AUTH-004, AUTH-008, DR-021 | Browser + backend | Behavior confirmed; secret/QR protection, code formatting/display acknowledgment and replacement UX pending |

The proposed auth package must add negative and boundary acceptance coverage only
after the corresponding choices are confirmed. This is not a claim that full
global AUTH requirements or integration gates are already testable.

## 4. Explicitly resolved behavior (do not ask the user to reconfirm)

- Native application-managed accounts; no required external identity provider.
- Public self-service **email + password** registration.
- Verify email once at signup; complete authenticator enrollment before
  protected account access; do not repeat signup verification at each login.
- Mandatory authenticator-based second factor at fresh login, compatible with
  Google Authenticator or Microsoft Authenticator.
- Single-use offline recovery code is used **with the password**, not by itself.
  Controlled host-administrator recovery if normal recovery options are lost.
- Password-manager autofill/paste allowed; no periodic forced password changes.
- Persistent session survives browser restart, max 30 days and 7 days idle.
- No extra authenticator prompt for trace browsing or own prompt approval during
  a valid authorized session.
- Password change, authenticator replacement and recovery-code generation use
  full auth no more than 10 minutes old; reuse the recent confirmation window.
- Private scope per account; no cross-account data; no workspace model.
- Public signup does not grant model-provider budget; an explicit deployment
  operator grant is required. Operators do not implicitly gain trace-data access.
- Distinct gateway/event/provider credential purposes may be stored on the same
  demo host. Same-host does not mean plaintext passwords/secrets or source-control
  storage.
- DR-018 sequence: native-auth materials and frontend acceptance before the
  incident timeline. No fake production login or cookie stub.
- DR-019: trim/case-normalize full email identity, generic duplicate-safe signup
  response, 24-hour single-use verification links invalidated by resend, outbound
  SMTP relay plus local acceptance-mail capture.
- DR-020: minimum 12-character passphrase-friendly passwords without composition
  or periodic expiry; verified-email single-use password reset expires at
  30 minutes, preserves MFA and revokes sessions. Other password/reset parameters
  remain proposals/open decisions.
- DR-021: TOTP six-digit/30-second, ±1 step and replay prevention; enrollment
  requires one valid code and expires after 24 hours; ten one-time verifier-stored
  recovery codes, rotation invalidates old set; recovery login preserves MFA.
- DR-022: host-OS offline recovery is scoped to one named account and revokes its
  sessions/factors, requiring re-enrollment; a local host-admin command grants/
  revokes gateway use only for verified/enrolled accounts, without trace/prompt/
  provider-secret access. Proof/audit/bootstrap and active-call propagation remain open.
- DR-023: generic sign-in/reset/resend responses and bounded temporary progressive
  throttling without permanent account lock; resend throttling by normalized
  address/source. Numerical thresholds and recovery windows remain open.

## 5. Ambiguity register

`AMB-native-auth-*` values require an explicit owner decision or approved
testable contract before Phase 2/3 expectations use them.

| ID | Open decision | Recommended starting point (proposal, not approved) | Impact / gate |
|---|---|---|---|
| AMB-native-auth-001 | Email normalization, account identity and pending/verified account lifecycle | DR-019 resolves trim + full-address case normalization and a generic response for new/pending/verified addresses. Pending-state cleanup, exact send eligibility and response copy remain open. | Partially resolved; remaining registration lifecycle blocks |
| AMB-native-auth-002 | Verification message/link lifetime, resend/invalidation, expiry and delivery failure | DR-019 resolves single-use 24-hour link, resend invalidation, configurable SMTP and local mail capture. Exact copy, resend limits and relay-failure behavior remain open. | Partially resolved; email contract blocks |
| AMB-native-auth-003 | Password policy and reset when password is forgotten | DR-020 resolves minimum 12 characters, passphrase/paste/autofill, no composition/expiry and 30-minute verified-email reset preserving MFA/revoking sessions. Maximum length/Unicode counting, hash algorithm/parameters, generic reset response, token replay/rate limits and mail failure remain open | Partially resolved; password/auth-reset contract blocks |
| AMB-native-auth-004 | MFA enrollment secret/QR protection, implementation of confirmed TOTP clock drift/replay, and factor replacement | DR-021 resolves six-digit/30-second TOTP, ±1 step, one acceptance/account/step and 24-hour pending-enrollment expiry. Secret/QR protection and factor replacement/re-enrollment UX remain open | Partially resolved; secret/factor lifecycle blocks |
| AMB-native-auth-005 | Recovery-code encoding/entropy/acknowledgment/rotation UX and authenticator-loss journey | DR-021 resolves exactly 10 random one-use codes, verifier-only storage, one-time display, old-set invalidation and ordinary MFA-preserving recovery login. Code format, offline-storage acknowledgment and replacement UX remain open | Partially resolved; remaining recovery acceptance blocked |
| AMB-native-auth-006 | Host-admin recovery procedure and authority/audit boundary | DR-022 confirms offline host recovery for one named account, revoking sessions/factors and requiring re-enrollment, with no public endpoint. Proof of host authority, exact command, audit and DB-outage behavior remain open | Partially resolved; operational recovery contract blocks |
| AMB-native-auth-007 | What constitutes “activity” for the 7-day inactivity expiry; persistent-session transport/logout/revocation/CSRF | Count successful human-initiated protected requests, not background polling or anonymous static assets; absolute and idle deadlines enforced server-side; opaque HttpOnly/Secure/SameSite cookie over HTTPS with CSRF defense; logout/revoke invalidates immediately | High; preserves low-friction rule |
| AMB-native-auth-008 | Reauth for sensitive changes, validity window and consumed factor handling | Reuse a server-recorded recent authentication until 10 minutes after password+second-factor verification; do not reuse the OTP code itself; define which operations are sensitive and require same-human/session binding | High; step-up contract |
| AMB-native-auth-009 | Private scope creation/deletion, account disablement/deletion and retained timeline records | One immutable private scope per account created only after verified signup; public account cannot select scope; define explicit disable/delete behavior and metadata retention before account deletion is accepted; no workspace sharing | High; account lifecycle/privacy |
| AMB-native-auth-010 | Initial operator bootstrap and grant/revoke of gateway access | DR-022 confirms local host-admin grant/revoke only for verified/enrolled accounts, no public admin UI and no operator trace/prompt/provider-secret read permission. Bootstrap proof, repeat grant protections, audit and revocation/in-flight-call propagation remain open | Partially resolved; gateway entitlement contract blocks |
| AMB-native-auth-011 | Public registration/login/reset/enrollment abuse limits, delay progression, lockout and email throttling | DR-023 resolves generic sign-in/reset/resend behavior, bounded temporary progressive throttling and no permanent account lock; resend throttles per normalized address/source. Numeric thresholds, keying/source identity and recovery windows remain open | Partially resolved; public abuse contract/limits block |
| AMB-native-auth-012 | Exact frontend copy, accessible controls, pending navigation, rate-limit/error states and auth/test bootstrap | Declare accessible semantic locators and exact copy from approved behavior; real browser/backend tests use isolated SMTP capture, per-test identities and real TOTP verification; no forged production login cookie | High; Phase 4/6/8 readiness |

## 6. Coverage and workflow plan

No auth intent diagram or SCN is authored in this Phase 0 package because
AMB-native-auth-001 through -012 include material branch behavior. Proposed
eventual journey coverage:

1. Public registration → generic confirmation → signup email verification →
   mandatory authenticator enrollment → first protected login.
2. Fresh email/password/TOTP login, password-manager compatibility, bad/expired
   factors, logout, persistent-session restart and expiry boundaries.
3. Own-account private data authorization versus cross-account guessed IDs.
4. Gateway grant absent/present/revoked, without granting provider-secret or
   another account's trace access.
5. Sensitive-change step-up at/below/above 10 minutes, reusable recent auth,
   consumed authenticator/recovery code and session revocation.
6. Lost-password, lost-authenticator, recovery-code single-use/exhaustion, and
   offline host-admin recovery with no public bypass.
7. Duplicate email, invalid/expired/replayed verification, email delay/unavailable,
   rate limits and account-enumeration protections.
8. Real-browser tests against the actual auth backend, isolated persistence and
   local SMTP capture; JUnit/integration tests supplement, not replace frontend
   acceptance. No successful frontend or authentication result is claimed yet.

After decisions, produce a pure domain model, approved versioned intent, concrete
SCNs, shared UI/API contracts, exact toolchain/baseline and design/frontend/backend
tasks. Then review in Phase 6, freeze, author red browser tests, and only then
implement. Timeline stays downstream. Java 25/Maven/browser/database setup is
currently absent and needs a separate reviewed setup gate.
