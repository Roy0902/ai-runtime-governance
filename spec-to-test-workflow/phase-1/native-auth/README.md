# Native-auth prerequisite materials

Status: **Preparation started per DR-018. Existing account/session behavior,
DR-019 signup email, DR-020 password/reset, DR-021 TOTP/recovery, DR-022
host-operator boundaries and DR-023 generic responses/throttling are confirmed;
other OD-11 decisions remain open.
No native-auth behavior has been implemented or frozen.**

- [Scoped ingestion](./00-ingestion.md): existing AUTH-001–009, source inventory,
  scope boundary and twelve explicit OD-11 decision groups.
- [Decision recommendations](./01-decision-proposals.md): coherent starter flow
  and remaining MFA, recovery, session, scope and operator-bootstrap proposals.
  Only rows marked DR-019 through DR-023 are approved; other recommendations
  remain proposals.
- [Frontend acceptance plan](./02-acceptance-plan.md): candidate real-browser/
  backend journeys and secret-safe test setup. It is not a scenario file or test.

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
true-browser fixture/setup contracts need decisions. No Phase 1 domain model,
intent, concrete SCN, API/UI contract or file-level implementation tasks are
created for native auth yet; the package deliberately stops at Phase 0 decision
materials.

Start with password policy/reset and mandatory-MFA enrollment/replay in
[01-decision-proposals.md](./01-decision-proposals.md). Confirm or revise each
package; then update the decision record and source requirements before domain modeling.
