# Native authentication intent v0.2: deadline addendum

Version: 0.2. Prepared: 2026-10-30.
Approval status is recorded in the [confirmation record](../05-decision-record.md),
not by rewriting this versioned artifact. Submission is not approval.

## 1. Composition and authority

This version consists of the behavior and six diagrams in
[intent v0.1](./04-intent-v0.1.md), plus the two deadline clarifications below.
The immutable base has raw SHA-256
`5AB84C0B99BDCAB8BF9C419AF6E55C958D1B159E8FFB155F7DE926EA042E6981`
and was approved under DR-033. Do not copy over or edit that base.

The addendum addresses SCN-native-auth-005 and SCN-native-auth-037 in the
[scenario catalog](./05-scenarios.md), under AMB-native-auth-001/004/005.
All other [requirements](../../../REQUIREMENTS.md), domain concepts, permission
boundaries and approved behaviors remain unchanged.

## 2. Pending-registration cleanup equality

For a never-verified registration, let R be the later of account creation and
its latest actually issued verification link. Let D = R + seven days.

- At server time t < D, time alone does not make the registration eligible
  for removal.
- At t >= D, the never-verified registration is eligible for removal. A cleanup
  evaluation that commits removal at t = D therefore removes it, just as at
  t > D.
- This defines eligibility when cleanup evaluates the registration, not a promise
  that a background process runs at the exact deadline.
- The existing approved rules still apply: ordinary duplicate signup does not
  extend retention; actually issued resend does; verified accounts are not
  removed by pending-registration cleanup.
- Concrete cleanup scheduling and cleanup-versus-issuance/verification race
  mechanisms remain design/contract work. No stale-state permission is added.

## 3. Pending-enrollment and code-set equality

For a pending enrollment attempt or standalone pending recovery-code set,
let P be its creation time and E = P + 24 hours.

- A current attempt may complete only while server time t < E and all other
  approved account, factor, acknowledgement and recent-auth guards hold.
- At t >= E, the pending attempt is expired. Completion exactly at E fails
  without activating its candidate factors or codes.
- Expiry does not turn incomplete initial enrollment into protected access.
  For replacement or standalone regeneration, expiry discards pending authority
  only: existing active factors/codes remain subject to the already approved
  rules, and consumed authentication codes remain consumed.

These clarify the existing expiry guards in v0.1 section 3; no lifetime,
one-time-display, factor-replacement or session-revocation policy is changed.

## 4. Remaining gates and version integrity

Approval, if granted, settles only these two exact-equality oracles. It does not
settle SCN-native-auth-012/024/079/080, numerical abuse/delivery limits, verifier/
evidence/resource contracts, native setup or measured results. Phase 3 remains
blocked until its remaining unspecified oracles are resolved.

No installation, application implementation, freeze or test execution is
authorized by this addendum. Concrete measurements still require reviewed
prerequisites. After approval, preserve both approved files byte-for-byte;
material changes require a further version and explicit review.
