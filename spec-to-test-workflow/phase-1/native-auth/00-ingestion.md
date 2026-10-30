# Native authentication prerequisite: scoped ingestion

Version: 0.13. Prepared: 2026-10-30. Feature key: `native-auth`.
Status: **DR-018 sequencing and DR-019/020/021 selected account behaviors are
confirmed. DR-033 approves intent v0.1 with explicit exact/numerical and
design/tooling gates remaining. Phase 3 scenario catalog is drafted with
four explicit blockers after DR-034 deadline clarification; no scenario gate,
freeze or implementation approval is implied.**

DR-019 resolved the signup identity, duplicate-response and link lifetime/resend
choices in AMB-native-auth-001/002. DR-020 resolved the minimum 12-character,
passphrase-friendly password policy and 30-minute verified-email reset that
preserves MFA and revokes sessions in AMB-native-auth-003. DR-028 below resolves
send eligibility, mail admission/failure and atomic link behavior. Exact copy,
reset/resend limits and hash parameters remain open. DR-029 resolves the
12–128-character length-only policy below.

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

DR-026 resolves lost-display restart and replacement behavior: explicit
password-confirmed initial restart has setup-only access, invalidates the old
pending secrets and stale tabs, and starts a new 24-hour attempt. Replacement
preserves active factors until verified/acknowledged atomic completion with
DR-025 session effects; cancellation/expiry/restart affects only the pending
replacement. Starting/restarting and completing replacement require the existing
recent-auth window. Consumed recovery codes are not restored on cancellation.
Exact UI/concurrency contracts remain open.

DR-027 resolves lifecycle scope: duplicate signup preserves password/enrollment;
never-verified registrations expire seven days after creation/latest issued
verification link, not ordinary duplicate submission; verified accounts survive
setup expiry. Create the private scope once at completed first enrollment and
retain it across recovery. Host-only disable/re-enable revokes sessions, pending
auth and gateway entitlement without deleting data or reviving tokens/grants.
Deletion/data erasure/verified-email re-registration are deferred. Exact operation,
cleanup/race and in-flight gateway contracts remain open.

DR-028 resolves verification/reset eligibility, one-current-link atomic
supersession/consumption, non-consuming link opens, strict expiry and atomic
reset/session effects. Acknowledgement means bounded durable mail-work admission,
not delivery; common admission applies to ineligible addresses too, with explicit
temporary-service failure on outage. Asynchronous retry stops at expiry,
supersession/disablement; later SMTP failure is secret-safely reported to operators.
Exact UI/API, numerical limits and implementation/key-protection contracts remain.

DR-029 resolves password input: 12–128 Unicode code points, length only; no
additional character/encoding restrictions, special control-character bans or
silent transformations. Exact spaces/text, paste/autofill and consistent flow
interpretation are preserved. Malformed transport is not a password-complexity
rule. Hash design/parameters, safe rehash and measured bounds remain open.

DR-030 resolves the TOTP-key lifecycle and scoped outage: keep valid sessions
and independent password/recovery login available when other dependencies work;
fail key-dependent operations explicitly and report degraded readiness. Provider
API keys do not own human sessions. Explicit protected key provisioning, separate
backup/matched restore and versioned same-seed rotation are approved; no silent
replacement/fallback or automatic factor/session reset.

DR-031 resolves recovery-code format (128 bits, 32 hex characters/eight groups,
case/hyphen entry) and standalone regeneration: 24h pending set, recent-auth
start/restart/completion, acknowledged atomic activation, pending-only pre-commit
interruption, consumed-code permanence, stale-tab/single-use protection,
post-commit nonsecret status rather than readback/rollback, and DR-025-style
session effects. Exact key/verification/UI/API/transaction contracts remain open.

DR-032 resolves core host/gateway/session behavior: local exact-account authority
with reason/confirmation and atomic safe audit; recovery revokes authentication/
grant without changing identity/ownership or enabling disabled accounts. Gateway
revocation blocks later admissions/undispatched calls, not already-dispatched
work. Deliberate activity, exact expiry/recent-auth boundaries, same-session
confirmation and commit-time current-state checks are approved. Remaining
AMB groups below concern design/contracts/measurements, not a reason to reopen
approved behavior. Domain/intent may be drafted; detailed acceptance/freeze
still requires the outstanding numerical and concrete contract decisions.

DR-033 explicitly approves intent v0.1 at raw SHA-256
`5AB84C0B99BDCAB8BF9C419AF6E55C958D1B159E8FFB155F7DE926EA042E6981`.
Keep its bytes unchanged; approval status is external. Next prepare concrete
scenarios with exact/numerical gaps visibly blocked, then contracts/design/tasks.

| Source | Revision / authority | Sections used |
|---|---|---|
| [Requirements](../../../REQUIREMENTS.md) | SHA-256 `E426ECF7A941347378AF185A372903C0A07614C30D7B705038F1D19A78889AD7`; primary oracle | 75 global rows; AUTH-001 through AUTH-009 and refinements through DR-034 deadline equality; verifier/evidence/numerical proposals remain unapproved |
| [Technical baseline](../../../TECHNICAL_BASELINE.md) | SHA-256 `09C0C8213A7165F7486C6C48BB349434EAB304901D2F9D47DE015BC60AA49A16` | Native TOTP/recovery, password/reset, same-host secrets, SMTP/operator boundary; DR-030/031 scoped key degradation and code regeneration |
| [Pending design decisions](../../../PENDING-DESIGN-DECISIONS.md) | SHA-256 `F00814DDEECD9FB3B43B2CDE9E3BA51EBF635A8BF3939E9657B0794AA6EBCA4D` | Confirmed review direction and remaining processing/operational limits |
| [Confirmation record](../05-decision-record.md) | SHA-256 `E7D82E64F70AD81365D909A2F43190EC85BF1C06718BE5BBCEC138C4A3A8AD97`; DR-004 through DR-008/018–034 | Exact composed intent v0.2 approval, immutable v0.1 base and four remaining oracle blockers |
| [Phase 1 materials index](../README.md) | SHA-256 `A502A5C1B074B50D9CA640FF4C92E7198B971B048887DAEAB1AD4FEE4A1386EA` | Package sequencing, approved composed intent and blocked Phase 3 scenario v0.2 status |
| [Canonical workflow](../../../../spec-to-test-workflow/.github/skills/spec-to-test-workflow/SKILL.md) | SHA-256 `6A0D84DC14A6CF9EEC068863354AD9FDE327BC2BD0F5071BB9F929685DCC916A` | Phase order, review/freeze/red gates |
| Spec-ingestion skill | SHA-256 `E9D14F318823B7DE550314BB0E76CC42849D621A7ED8EECBEBC2BE145332EF76` | Source precedence, REQ/AMB traceability and coverage gates |
| Domain-modeling skill | SHA-256 `10E164077120B902BA0BE2B6E218303921A806A8B76C8E7DCDB512132F934B1A` | Required pure domain model shape and traceability |
| Behavioral-specification skill | SHA-256 `524375FFBDB658C426650A599F0183B9AD3B44F6A8C5E6003B2CBEA2EA94669B` | Concrete scenario and frontend acceptance gates |
| [Domain model](./03-domain-model.md) | Version 0.1, presented | Core vocabulary, aggregates, invariants and events derived through DR-032 |
| [Account-auth intent](./04-intent-v0.1.md) | Version 0.1, approved DR-033; raw SHA-256 `5AB84C0B99BDCAB8BF9C419AF6E55C958D1B159E8FFB155F7DE926EA042E6981` | Bounded behavior approved; outstanding exact/numerical contracts remain blocking where applicable |
| [Intent v0.2 addendum](./04-intent-v0.2.md) | Approved DR-034; raw SHA-256 `7FD646D33431671BED907282FE7735DA1F1E6427BECF0A9AD8B019B8A368EE99` | Composes with unchanged approved v0.1; cleanup and pending-attempt equality now explicit |
| [Acceptance scenarios](./05-scenarios.md) | Version 0.2, Phase 3 draft | SCN-native-auth-001 through -083; 215 outline-expanded cases; four unspecified IDs remain blocked |
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
| REQ-native-auth-001 | Public email/password signup; normalized identity and generic duplicate safety; new signup sends verification, duplicates do not; explicit resend only enabled/unverified; 24h one-current-link, atomic supersession/explicit-confirmation consumption and strict expiry; common durable mail admission, explicit outage failure and bounded asynchronous delivery; verification/MFA before protected access | AUTH-002/009, DR-006/008/019/028 | Browser + backend | Behavior confirmed; exact UI/API, numerical queue/retry/abuse limits and concrete implementation contracts pending |
| REQ-native-auth-002 | Fresh login requires password and authenticator/recovery factor; password length 12–128 Unicode code points only, no additional character/encoding restrictions; exact text/no silent transforms; passphrases/paste/autofill and no composition or periodic expiry; generic login failures | AUTH-003, DR-006/007/020/029 | Browser + backend | Input policy confirmed; hash design/parameters/measurements and exact UI/API pending |
| REQ-native-auth-003 | Passwords use secure salted verifier hashes, never plaintext; same-host demo storage is acceptable | AUTH-003, DR-004/005 | Supporting persistence/security + browser | Behavior confirmed; exact algorithm/configuration and proof hooks pending |
| REQ-native-auth-004 | Password plus single-use recovery code; exact-account local host recovery with reason/confirmation and atomic safe audit; preserve identity/ownership, revoke sessions/factors/pending auth/grant, no session creation or silent re-enable; password/reset leads to setup-only re-enrollment and explicit regrant | AUTH-004, DR-006/022/032 | Browser + backend / controlled operations | Core behavior confirmed; concrete commands, authority/audit and handoff contracts pending |
| REQ-native-auth-005 | Persistent sessions, 30-day absolute/seven-day idle deadlines fail exactly at expiry; successful deliberate protected navigation/manual refresh/changes renew idle, not polling/prefetch/static assets; ordinary activity needs no extra MFA; revocation enforced on later authorization | AUTH-005, DR-007/025/032 | Browser + backend | Core behavior confirmed; exact transport/action mapping and mechanism contracts pending |
| REQ-native-auth-006 | Sensitive changes reuse full auth through ten minutes inclusive, same account/current session only; shared-session tabs share confirmation, distinct sessions do not; recheck current account/session/factor at commit; valid confirmation carried on current rotation with original timestamp/deadline only | AUTH-006, DR-007/025/026/031/032 | Browser + backend | Core behavior confirmed; concrete binding/commit contracts pending |
| REQ-native-auth-007 | Create one immutable private scope at first completed enrollment; preserve ownership across factor replacement/host recovery; no gateway budget without explicit eligible-account grant; host-only disable revokes sessions/pending auth/entitlement but retains data; re-enable revives neither tokens nor grants; defer deletion and verified-email recycling | AUTH-001/002/004, DR-008/027 | Browser + backend / controlled operations | Lifecycle scope confirmed; exact operation/race and grant/bootstrap contracts pending |
| REQ-native-auth-008 | Human approval authority is the submitting human; gateway/event/provider credentials remain purpose-separated | AUTH-001, INT-009, DR-005 | Browser + backend | Scope confirmed; integration binding/lifecycle is separately gated |
| REQ-native-auth-009 | Single-use 30-minute reset only for enabled verified accounts, including incomplete setup; one current link, strict expiry, atomic consumption/password/session revocation; no consume-on-open or failed validation/rollback; issuance does not log out; preserve MFA/setup; generic responses/common durable admission and bounded asynchronous delivery | AUTH-007/009, DR-020/028 | Browser + backend | Behavior confirmed; exact UI/API, numerical limits and concrete worker/transaction contracts pending |
| REQ-native-auth-011 | Sign-in/reset do not reveal registration status; temporary bounded progressive throttling, no permanent account lock; address/source resend throttling with generic responses | AUTH-009, DR-023 | Browser + backend | Behavior confirmed; exact response copy, numerical limits and source/recovery windows pending |
| REQ-native-auth-010 | TOTP six digits/30s, ±1-step tolerance/replay prevention; encrypted seeds, one-time setup and acknowledged completion; 24h pending expiry and DR-026 safe restart/atomic replacement. DR-030: explicit key lifecycle/scoped outage, valid sessions/independent recovery login preserved. DR-031: ten 128-bit grouped-hex verifier-stored codes, atomic acknowledged standalone regeneration with recent-auth/session effects, pending-only interruption, single-use/stale-tab protection and post-commit nonsecret status | AUTH-002/004/005/006/008, DR-021/024/025/026/030/031 | Browser + backend / controlled operations | Behavior confirmed; concrete encryption/verifier/commands and exact UI/API/concurrency contracts pending |

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
| AMB-native-auth-001 | Exact registration/cleanup UI and operation contracts | DR-019/027/028 resolve identity, duplicate/password safety, unverified cleanup, verified-account retention and send eligibility. Exact copy and cleanup/issuance race/failure implementation remain open | Partially resolved; remaining registration contracts block |
| AMB-native-auth-002 | Exact verification UI/API, numerical delivery limits and implementation contracts | DR-019/028 resolve 24h lifetime, eligibility, explicit non-open consumption, atomic supersession/one-use, strict expiry, durable common admission and explicit outage failure, bounded asynchronous SMTP delivery/local capture. Copy/routes/statuses, numeric retry/queue/abuse limits and implementation/key protection remain open | Partially resolved; remaining email contracts block |
| AMB-native-auth-003 | Hash design/measurements and exact password/reset UI/API/implementation contracts | DR-020/028/029 resolve 12–128-code-point length-only exact input, usability/no periodic expiry, enabled-verified 30min reset, atomic one-use/password/session effects, strict expiry, preserved MFA/setup and eligibility-safe delivery/failure. Hash design/parameters/measurements, exact UI/API and numerical limits remain open | Partially resolved; remaining password/reset contracts block |
| AMB-native-auth-004 | Concrete TOTP-key provisioning/rotation/restore, clock/replay and enrollment/replacement contracts | DR-021/024/026 resolve TOTP, encrypted seeds, one-time setup and atomic replacement. DR-030 resolves explicit provisioning/backup/rotation and scoped key-outage degradation without invalidating otherwise-valid sessions or independent recovery login. Encryption/commands/reload/restore failure and exact UI/concurrency remain open | Partially resolved; remaining key/factor implementation contracts block |
| AMB-native-auth-005 | Concrete recovery verifier and acknowledgement/status/transaction contracts | DR-021/024/026/031 resolve ten one-use 128-bit codes, 32 hex digits/eight groups, case/hyphen entry, verifier-only storage, once-only display, acknowledgement and MFA-preserving recovery login. Standalone 24h pending regeneration commits atomically with recent-auth/session effects; pending-only interruption, consumed-code permanence, stale-tab/single-use protection and post-commit status without readback. Exact verifier/UI/concurrency remain open | Partially resolved; remaining recovery contracts block |
| AMB-native-auth-006 | Concrete local authority/commands/audit and recovery handoff | DR-022/032 resolve scoped host recovery, exact account/reason/confirmation, atomic safe audit/failure, no session/data disclosure and no silent re-enable. Identity/ownership retained; auth/grant revoked, setup-only handoff. Concrete mechanism/contracts remain open | Core behavior resolved; operational design/review blocks implementation |
| AMB-native-auth-007 | Concrete session/action/transport/logout/CSRF contracts | DR-025/032 resolve deliberate activity, polling/prefetch exclusion, exact expiry and later-authorization revocation; server-side Secure/HttpOnly/SameSite cookie/CSRF, no localStorage login token. Exact action mapping and transport mechanisms remain open | Core behavior resolved; contract/design gate remains |
| AMB-native-auth-008 | Concrete recent-auth/session/commit binding mechanism | DR-007/025/026/031/032 resolve ten-minute-inclusive same-account/session binding, shared vs distinct sessions, commit-time current-state checks and preserved valid confirmation timestamp on rotation. Concrete mechanism/contracts remain open | Core behavior resolved; contract/design gate remains |
| AMB-native-auth-009 | Exact scope-provisioning and disable/re-enable operation contracts | DR-027 resolves private scope at completed first enrollment, stable ownership through recovery, host-only disable with sessions/pending auth/gateway revocation and retained data, and no token/grant revival on re-enable. Deletion/erasure/verified-email recycling deferred. Exact commands, concurrency and failure semantics remain open | Partially resolved; lifecycle operation contracts block |
| AMB-native-auth-010 | Concrete host grant/dispatch authorization and revocation mechanism | DR-022/032 resolve local enabled/verified/enrolled grant, no public/bootstrap admin account or data/secret read authority, atomic safe audit/repeated operations; revocation blocks later admission/undispatched calls, dispatched work may finish without follow-on or revoked-session read authority. Concrete commands/ordering/contracts remain open | Core behavior resolved; contract/design gate remains |
| AMB-native-auth-011 | Public registration/login/reset/enrollment abuse limits, delay progression, lockout and email throttling | DR-023 resolves generic sign-in/reset/resend behavior, bounded temporary progressive throttling and no permanent account lock; resend throttles per normalized address/source. Numeric thresholds, keying/source identity and recovery windows remain open | Partially resolved; public abuse contract/limits block |
| AMB-native-auth-012 | Exact frontend copy, accessible controls, pending navigation, rate-limit/error states and auth/test bootstrap | Declare accessible semantic locators and exact copy from approved behavior; real browser/backend tests use isolated SMTP capture, per-test identities and real TOTP verification; no forged production login cookie | High; Phase 4/6/8 readiness |

## 6. Coverage and workflow plan

Core behavior is now sufficient to derive a pure domain model and draft intent.
Concrete contracts and numerical AMB-native-auth-011 limits still block detailed
SCNs/freeze. Proposed eventual journey coverage:

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

## 7. Scenario checkpoint and remaining exact oracles

[Scenario catalog v0.2](./05-scenarios.md) derives 83 SCN IDs from the approved
requirements/composed intent. Outline expansion describes 215 independent cases, not
executed tests. No scenario has run, passed, been frozen or locked.

The following are specific subitems of existing AMB groups, not newly approved
behavior or new top-level ambiguity IDs:

| AMB | Concrete gap | Affected SCNs |
|---|---|---|
| AMB-native-auth-003 | Reviewed verifier/versioned parameters, rehash and measured bounds | 024/079 |
| AMB-native-auth-011 | Numerical mail/queue/retry and authentication/delay/source/recovery limits | 012/080 |
| AMB-native-auth-003/004/012 | Complete verifier/randomness/secret-safe evidence contract | 079 |

DR-034 resolves exact equality for SCN-005/037 without changing their IDs.
Cleanup scheduling/race mechanisms remain design prerequisites, not unspecified
equality oracles.

The four remaining `@unspecified` IDs are 012/024/079/080. Every other SCN still depends on
reviewed frontend/shared contracts and a real harness, plus applicable crypto/
scope/limit prerequisites; a concrete business oracle is not execution readiness.
Phase 3 has not passed and Phase 4 has not been entered. Review the
[verifier/evidence candidate and measurement prerequisites](./01-decision-proposals.md#13-verifierevidence-closure-candidate-and-measurement-prerequisites).
No candidate value or public guidance is an approved oracle or measured result. Record new
observable choices before using them as test oracles. If a clarification
materially changes intent, create/review a new version instead of editing either
approved intent file.
