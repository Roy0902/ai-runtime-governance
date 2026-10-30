# Native-auth prerequisite materials

Status: **Core behavior approved through DR-032. Domain model v0.1 is presented;
intent v0.1 is explicitly approved under DR-033. Exact contracts, measured limits,
tooling/design review and acceptance gates remain open. DR-034 approves the
composed intent v0.2 deadline addendum. Phase 3 has 83 draft scenario IDs/215
expanded cases, four explicitly unspecified IDs; its exit gate is not passed.
No native-auth behavior has been implemented or frozen.**

- [Scoped ingestion](./00-ingestion.md): existing AUTH-001–009, source inventory,
  scope boundary and twelve explicit OD-11 decision groups.
- [Decision recommendations](./01-decision-proposals.md): coherent starter flow
  and remaining MFA, recovery, session, scope and operator-bootstrap proposals.
  Decisions through DR-032 supersede older proposal wording; unapproved
  engineering recommendations remain proposals.
- [Frontend acceptance plan](./02-acceptance-plan.md): candidate real-browser/
  backend journeys and secret-safe test setup. It is not a scenario file or test.
- [Domain model v0.1](./03-domain-model.md): vocabulary, aggregates, invariants
  and conceptual events; presented for review.
- [Intent v0.1](./04-intent-v0.1.md): six bounded Mermaid diagrams with explicit
  guards/failures and outstanding gates; approved under DR-033 at the fingerprint
  in the [decision record](../05-decision-record.md). Do not rewrite it.
- [Intent v0.2 deadline addendum](./04-intent-v0.2.md): approved under DR-034,
  composed with the unchanged approved v0.1; do not rewrite either file.
- [Scenario catalog v0.2](./05-scenarios.md): SCN-native-auth-001 through -083,
  outline examples, requirement/invariant/intent-exit mappings and explicit
  oracle/execution blockers. Not executable tests or a frozen plan.

## Confirmed already (DR-004–008/018)

Native public email/password registration; once-at-signup verification; mandatory
authenticator 2FA with approved single-use recovery codes and host-admin recovery;
private account scope; explicit operator grant before gateway-budget use;
purpose-separated same-host demo credentials; 30-day absolute/7-day inactive
sessions, ten-minute reusable recent-authentication for selected changes,
password-manager autofill/paste and no periodic forced password expiry; authenticated
HTTPS; native authentication is a separately planned/tested prerequisite before
the timeline.

DR-019 additionally confirms full-email trim/case normalization, generic
duplicate-safe signup confirmation, single-use 24-hour verification links
invalidated by resend, configurable SMTP relay and local captured mail in
acceptance. Exact copy, resend limits and relay-failure behavior remain open.

DR-020 confirms a minimum 12-character password, passphrases/paste/autofill,
no composition rules or periodic expiry, and a single-use verified-email reset
link expiring after 30 minutes that preserves MFA and revokes sessions. Other
password/reset contract details remain open.

DR-021 confirms six-digit/30-second TOTP with ±1-step clock tolerance and
per-step replay prevention; a 24-hour incomplete-enrollment expiry; exactly 10
one-use recovery-code verifiers displayed once and revoked as a set on rotation;
and ordinary login after recovery while MFA remains enabled. Secret/QR protection,
code format/acknowledgment and factor-replacement UX remain open.

DR-022 confirms host-OS-only recovery for one named account, revoking its
sessions/factors and requiring fresh authenticator enrollment. Local host-admin
commands grant/revoke gateway access only for verified/enrolled accounts;
operators gain no automatic trace/prompt/provider-secret read permission.
Bootstrap proof/audit, active-call revocation and host-outage behavior remain open.

DR-023 confirms generic sign-in/reset/resend responses that do not reveal
registration status, bounded temporary progressive throttling without permanent
account lockout, and resend throttling by normalized address/source. Numerical
thresholds, keying semantics and recovery windows remain open.

## Still blocking

**Resumed progress:** DR-024 records the approved encrypted seeds, once-only QR/
manual-key display and recovery-code acknowledgement. DR-025 records deliberate-
activity-only idle renewal, server-side cookie/CSRF sessions and revocation of
other sessions on signed-in password/factor changes while rotating the current
one without extending its absolute deadline. Forgot-password/host recovery
continue to revoke all sessions. These decisions refine existing requirements;
implementation and exact contracts are still pending.

**Resumed checkpoint (DR-024):** encrypted pending/active TOTP seeds using a
deployment-local key, one-time QR/manual-key display and saved-recovery-code
acknowledgement are confirmed. The earlier references to these choices as open
are superseded. Key lifecycle, interrupted setup and exact contracts remain open.

The public registration, email verification, factor enrollment/replacement,
password reset, recovery lifecycle, host recovery, abuse/rate controls, scope
creation, operator bootstrap/grant, session transport/activity/revocation and
true-browser fixture/setup contracts still require design/review. The domain
model, approved intent and scenario draft now exist; no reviewed API/UI contract
or file-level implementation tasks have been created. Numerical abuse/delivery limits remain
deferred rather than invented.

**Current checkpoint (DR-026):** interrupted one-time displays require explicit
restart, not readback. Initial restart is password-confirmed/setup-only and
invalidates pending secrets/stale tabs. Replacement preserves active factors
until verified/acknowledged atomic completion, applies DR-025 session effects,
and uses recent-auth at start/restart/completion. Cancelling never restores a
recovery code consumed for authentication.

**Current checkpoint (DR-027):** duplicate signup preserves password/enrollment;
unverified-only seven-day cleanup uses creation/latest issued verification link,
not ordinary duplicates. Verified accounts survive setup expiry. Private scope
starts at first completed enrollment and persists through recovery. Host-only
disable revokes sessions/pending auth/gateway entitlement but retains data;
re-enable revives no tokens/grants. Deletion/erasure/verified-email recycling are
deferred.

**Current checkpoint (DR-028):** verification/reset send eligibility, explicit
non-open link consumption, atomic supersession/consumption, strict expiry,
reset-session effects and durable eligibility-safe admission/asynchronous
delivery failures are approved. Exact UI/API and numerical limits remain open.

**Current checkpoint (DR-029):** 12–128-character passwords, counted as Unicode
code points, with length as the only content restriction. No additional character/
encoding rules or special control-character bans; preserve exact input without
silent transformations. Hash design/measurements remain open.

**Current checkpoint (DR-030):** TOTP encryption keys are not provider API keys
or session keys. Explicit provisioning/protected separate backup/versioned
same-seed rotation and scoped outage degradation are approved: otherwise-valid
sessions/independent recovery login may continue, key-dependent operations fail
explicitly. Blanket startup denial was revised, not approved.

**Current checkpoint (DR-031):** ten 128-bit grouped-hex codes and standalone
24h pending regeneration with recent-auth checkpoints, acknowledged atomic commit,
pending-only interruption, post-commit nonsecret status and other-session
revocation/current rotation are approved. Initial setup still follows DR-026.

**Current checkpoint (DR-033):** intent v0.1 is explicitly approved and immutable
at raw SHA-256 `5AB84C0B99BDCAB8BF9C419AF6E55C958D1B159E8FFB155F7DE926EA042E6981`.
**Current checkpoint (DR-034):** intent v0.2 adds approved deadline equality:
seven-day pending cleanup eligibility includes equality; pending 24-hour
completion excludes equality. SCN-005/037 now have exact expected outcomes.
Four unspecified IDs remain: 012/024/079/080. Next review the source-backed
verifier/evidence candidate and measurement prerequisites in the recommendations;
these are proposals, not measured/approved contracts. Shared contracts/design
follow the scenario gate in workflow order. No scenario has run or passed.
See [recommendations](./01-decision-proposals.md); do not reopen DR-019 through
DR-034. Do not infer approval of open exact/numerical contracts from intent approval.
