# Remaining development preparation: cross-session handoff

Updated: 2026-10-30, after DR-034 and native-auth scenario catalog v0.2.
Status: **Preparation in progress. Full Phase 1 is NOT ready for implementation,
acceptance freeze or release. No application code or executable acceptance tests
have been produced in this work.**

## 1. Resume here

Continue the **native-auth prerequisite materials**, then return to the timeline
review blockers. Do not start again with WSL, reopen approved product choices,
or mistake an approved diagram for approval of all contracts/design/tasks.

Read this file first, then only the documents relevant to the next unresolved
decision:

1. [Native-auth scoped register](./native-auth/00-ingestion.md).
2. [Native-auth recommendations](./native-auth/01-decision-proposals.md):
   recommendations are not automatically approved.
3. [Decision record](./05-decision-record.md), especially DR-018 through DR-034.
4. [Requirements](../../REQUIREMENTS.md): AUTH-001 through AUTH-009 and the
   confirmed enrollment/session refinements under OD-11.

**Next gate:** consolidated oracle closure for the
[scenario catalog v0.2](./native-auth/05-scenarios.md). It drafts 83 SCN IDs/215
expanded cases, including four `@unspecified` IDs: 012/024/079/080. Phase 3 is NOT passed;
Phase 4 has not been entered. Preserve the [domain model](./native-auth/03-domain-model.md)
and [intent v0.1](./native-auth/04-intent-v0.1.md), explicitly approved under DR-033.
Approved raw SHA-256:
`5AB84C0B99BDCAB8BF9C419AF6E55C958D1B159E8FFB155F7DE926EA042E6981`.
[Intent v0.2](./native-auth/04-intent-v0.2.md), approved under DR-034, incorporates
that unchanged base plus deadline equality. Addendum raw SHA-256:
`7FD646D33431671BED907282FE7735DA1F1E6427BECF0A9AD8B019B8A368EE99`.
Do not rewrite either approved file. SCN-005/037 are resolved; next review the
[verifier/evidence candidate and measurement prerequisites](./native-auth/01-decision-proposals.md#13-verifierevidence-closure-candidate-and-measurement-prerequisites).
Candidate crypto parameters are NOT approved/measured. Remaining missing oracles
remain blocked, never assumed or marked green. Use the
[consolidated proposal](./native-auth/01-decision-proposals.md), not repeated
small engineering preference forms.
Exact contracts, crypto/hash mechanisms, native setup/measurements and numerical
abuse/delivery limits remain open before scenario/review/freeze gates. Respect
DR-029 length-only passwords and DR-030 scoped TOTP-key degradation.

## 2. Current milestone sequence

1. Core native-auth behavior is settled through DR-032; remaining exact/numerical
   contract and measurement decisions stay explicit.
2. Domain model presented; intent v0.1 approved DR-033 and composed v0.2 addendum
   approved DR-034. Preserve both fingerprints.
3. Scenario catalog drafted; close its explicit oracle gaps for Phase 3 exit,
   then shared API/UI contracts, native baseline, design and task lists.
4. Review the native-auth package, resolve blockers, then freeze the acceptance
   plan; author genuine failing browser tests and lock them before implementing.
5. Implement and verify the native-auth prerequisite through the workflow.
6. Resolve remaining timeline review findings, finish its review/freeze/red
   acceptance gates, then implement the timeline using real authentication.
7. Later verify actual guard/client integrations and remaining full-release gates.

Do not implement authentication as an untested helper merely to unblock timeline
tests. Unit/service tests supplement, never replace, frontend acceptance.

## 3. Already confirmed: do not ask again

| Area | Confirmed behavior | Authority |
|---|---|---|
| Client target | Evaluate OpenCode and VS Code Copilot; at least one fully verified guarded integration required for release; monitoring-only support must be labeled | DR-001 |
| WSL | Intended integration environment is Windows with WSL, but installation is user-performed and deferred; it does not block unrelated preparation/Java/frontend work | DR-010/011 |
| Human auth | Application-managed public native accounts; not a required external OIDC service; personal demo initially, authenticated HTTPS Internet access | DR-002/004/006 |
| Credentials | Distinct gateway/event/provider keys with different purposes, same-host storage allowed; upstream key stays server-side; event token cannot read traces or approve | DR-005 |
| Signup | Email/password; full-address trim/case-normalized identity; same generic confirmation for new/pending/verified addresses | DR-008/019 |
| Verification mail | Single-use 24-hour signup link; resend invalidates previous link; configurable SMTP relay in production and local captured mail in acceptance; no vendor selected | DR-019 |
| Passwords | Minimum 12 characters; passphrases/paste/autofill allowed; no composition rules or periodic forced changes; secure salted verifier hashes | DR-020 and AUTH-003 |
| Password reset | Single-use verified-email link, 30-minute expiry; preserve MFA and revoke all existing sessions | DR-020 |
| TOTP | Six digits, 30-second step, current step plus/minus one adjacent step; each step accepted at most once/account | DR-021 |
| Enrollment | Verify one code; interrupted enrollment expires after 24 hours; QR plus manual key shown once; no later seed readback; acknowledgement of saved recovery codes required before completion | DR-021/024 |
| Seed storage | Pending/active TOTP seeds encrypted at rest using deployment-local key outside source/database/logs; no separate vault server required | DR-024 |
| Recovery codes | Exactly ten random one-use codes; show once/store only verifiers; rotation revokes old set; password plus unused code creates ordinary session without disabling MFA | DR-021 |
| Host recovery | Local offline host-OS administrator procedure for one named account; revoke sessions/factors and require new MFA enrollment; no public recovery endpoint | DR-022 |
| Gateway grant | Local host-admin grant/revoke only for verified-email/MFA-enrolled accounts; no public admin UI; no implicit operator trace/prompt/provider-secret read permission | DR-022 |
| Login privacy/abuse | Generic sign-in/reset/resend responses; bounded temporary progressive throttling, never permanent account lockout; resend throttling per normalized address/source | DR-023 |
| Session lifetime | Survive browser restart; 30-day absolute and 7-day inactivity expiry, whichever first; ordinary browsing/own prompt approval needs no repeated MFA | DR-007 |
| Sensitive actions | Password change, authenticator replacement and recovery-code generation use full authentication no more than ten minutes old; reuse confirmation, not consumed OTP | DR-007 |
| Idle renewal | Only successful deliberate protected actions reset inactivity; no background polling/static-asset renewal | DR-025 |
| Session storage | Server-side sessions with Secure/HttpOnly/SameSite cookie and CSRF protection; no login token in localStorage | DR-025 |
| Settings revocation | Signed-in password/factor changes revoke other sessions, rotate/retain current session without extending original absolute deadline; forgot-password/host recovery still revoke all sessions | DR-025 |
| Interrupted setup | No lost-display readback; explicit password-confirmed initial restart for verified account, setup-only access, new 24h attempt, prior pending secrets/stale tabs invalidated | DR-026 |
| Factor replacement | Preserve active factor/codes until verified/acknowledged atomic swap with DR-025 session effects; cancellation/expiry/restart discards pending only; recent-auth at start/restart/completion; consumed authentication codes stay consumed | DR-026 |
| Registration lifecycle | Duplicate signup preserves password/enrollment; remove never-verified registrations seven days after creation/latest issued verification link, not ordinary duplicates; verified accounts survive setup expiry | DR-027 |
| Scope/account lifecycle | Private scope at first completed enrollment, stable through recovery; host-only disable revokes sessions/pending auth/gateway entitlement and retains data; re-enable revives no tokens/grants; deletion/erasure/verified-email recycling deferred | DR-027 |
| Verification/reset mail | New signup sends, duplicate signup does not; explicit resend only enabled/unverified; reset only enabled/verified including incomplete setup; generic eligibility-safe acknowledgement; common durable admission with explicit outage failure, asynchronous bounded delivery | DR-028 |
| One-use links | One current per account/purpose, atomic supersession/consumption, no consume-on-open, strict expiry, failed issuance preserves old link; reset issuance does not log out, successful reset atomically changes password/revokes sessions and preserves MFA/setup | DR-028 |
| Password input | Length only, 12–128 Unicode code points; no additional character/encoding restrictions or special control-character bans; exact text/no trim/normalization/truncation; paste/autofill; transport parse errors are not password rules | DR-029 |
| TOTP-key lifecycle | Explicit protected provisioning, separate backup/matched restore, versioned same-seed rotation and backup-required old-key retention; missing key permits explicit degradation with otherwise-valid sessions/independent recovery login, not plaintext/MFA fallback or blanket shutdown; provider-key changes do not revoke human sessions | DR-030 |
| Code format/regeneration | Ten 128-bit codes, 32 hex characters/eight groups, case/hyphen entry; standalone 24h pending set, recent-auth start/restart/commit, acknowledged atomic activation, pending-only pre-commit interruption, consumed-code permanence, stale-tab/single-use protection, post-commit nonsecret status and other-session revocation/current rotation | DR-031 |
| Host/gateway/session core | Exact-account trusted local operations with reason/confirmation/atomic safe audit; recovery preserves identity/disabled standing, revokes auth/grant and creates no session; gateway revocation blocks later admission/undispatched work but cannot retract dispatched cost; exact session/recent-auth boundaries, deliberate activity, same-session binding and current-state commit checks | DR-032 |
| Auth intent | Native-auth intent v0.1 explicitly approved at the fingerprint above; exact/numerical contracts, tooling and design remain open; no freeze or implementation approval | DR-033 |
| Deadline equality | Cleanup of still-never-verified accounts is eligible at seven-day equality; pending enrollment/standalone code completion fails at 24-hour equality; composed intent v0.2 approved at its fingerprint above | DR-034 |
| First timeline journey | Read-only incident/activity timeline; metadata-only prompt log, no original/redacted prompt body; no approve/reject controls or incident case management | DR-015/016 |
| Timeline behavior | Receipt-ordered siblings; separate source time; honest missing/late parents, duration and coverage; execution/completeness independent; 50 traces/200 events per response; explicit continuation/manual refresh; duplicate/conflict rules | DR-016 |
| Acceptance | Real frontend browser + backend + persisted controlled data; no mocked successful screen, forged production session or library/subprocess replacement | DR-014/015 |
| Sequencing | Separately plan and acceptance-test native authentication before timeline delivery | DR-018 |

## 4. Native-auth leftovers

The scoped AMB register has twelve groups, many **partially resolved**. Its older
row wording may still list choices subsequently approved by DR-024–032. Apply
the decision record and source refinements; do not treat stale summary wording
as a reason to reconfirm seed encryption, acknowledgement or session policies.

| Remaining topic | Decisions/contracts still needed | Relevant AMBs |
|---|---|---|
| Pending registrations | DR-027/028 resolve cleanup, duplicate safety, setup-only privileges and send eligibility; exact cleanup/issuance race/failure implementation and UI/API remain | 001/002 |
| Verification delivery | DR-028 resolves eligibility, durable common admission/outage and asynchronous failure, atomic supersession/consumption and strict expiry; exact copy/UI/API, numerical queue/retry/abuse bounds and implementation/key protection remain | 002/011/012 |
| Password details | DR-029 resolves length-only exact-input/counting without extra character/encoding restrictions; hash algorithm/library/parameters, safe rehash, measured resource bounds and exact UI/API remain | 003 |
| Reset details | DR-028 resolves eligibility/privacy, delivery failure, one-current-link/atomic one-use/strict expiry and reset-session effects; exact copy/UI/API, numerical limits and concrete transaction/worker contracts remain | 003/011/012 |
| Interrupted one-time setup | DR-026 resolves explicit restart, pending invalidation and setup-only access; exact UI/API, lost-response and concurrent completion contracts remain | 004/005/012 |
| Factor replacement | DR-026 resolves old-factor preservation, verified/acknowledged atomic swap, cancellation/expiry and recent-auth checkpoints; exact binding/revocation race contracts remain | 004/005/008 |
| Seed/key protection | DR-030 resolves explicit provisioning, backup/rotation and scoped unavailable-key behavior; concrete encryption, paths/permissions/commands/reload, rotation/restore failure and health/UI/API contracts remain | 004 |
| Recovery code details | DR-031 resolves format/entropy, pending/acknowledged atomic regeneration, session effects, interruption/races and exhausted-code guidance; exact verifier, UI/API/ack/status and concrete transaction binding remain | 005 |
| Host operations | DR-032 resolves core authority/reason/confirmation/atomic audit/failure, safe repeats and recovery handoff; draft concrete commands, authority proof and audit/transaction contracts for review | 006/010 |
| Account lifecycle | DR-027 resolves scope timing/ownership, host-only disable/re-enable and deletion/erasure/verified-email-recycling deferral; exact commands, concurrent revocation/provisioning and failure contracts remain | 009 |
| Gateway entitlement | DR-032 resolves eligibility, no public/bootstrap admin, safe repeats, admission/dispatch ordering and already-dispatched work; concrete host/dispatch consistency mechanism and contracts remain | 010 |
| Session/reauth implementation | DR-032 resolves deliberate activity, exact expiry/recent-auth, shared/distinct sessions and current-state commit; draft exact action/transport/cookie/CSRF/rotation mechanisms for review | 007/008 |
| Abuse limits | Numeric rates/delay progression/recovery windows, proxy/source identity and combined per-address/source bounds; user explicitly deferred numbers pending review/measurement | 011 |
| Browser/UI/API | Exact routes/shapes/statuses/copy/semantic locators, loading/errors/navigation; private account screen for auth acceptance; no actual timeline needed to prove auth | 012 |
| Real acceptance setup | Actual browser/backend/DB/mail capture and generated per-test secrets; secret-safe screenshots/traces/logs; real signup/verification/TOTP flow, not fake auth cookies | 012 and acceptance plan |

Prepared native-auth materials:
[ingestion](./native-auth/00-ingestion.md),
[recommendations](./native-auth/01-decision-proposals.md),
[frontend acceptance coverage plan](./native-auth/02-acceptance-plan.md),
[scenario catalog](./native-auth/05-scenarios.md),
[status](./native-auth/README.md).
The [domain model](./native-auth/03-domain-model.md) and
[approved intent v0.1](./native-auth/04-intent-v0.1.md) now exist. The scenario
catalog drafts 83 IDs/215 cases; no reviewed API/UI matrix or implementation design/tasks
yet. Intent approvals are DR-033/034,
not approval of those downstream deliverables.
The acceptance coverage plan is not a frozen plan or executable test suite.

## 5. Timeline leftovers after native-auth planning

See [Phase 6 review](./timeline/08-review.md) for evidence and exact dispositions.

- **R-TL-001:** replace withdrawn receipt-key-only cursor cutoff; define stable
  traversal membership under concurrent commits, bounded resources, expiry,
  deletions/status/relinking behavior and acceptance cases. Receipt display
  order remains approved; membership strategy is not yet approved.
- **R-TL-002:** sequencing resolved by DR-018, but native-auth dependency must
  actually pass its own workflow before timeline can rely on it.
- **R-TL-003:** define nonproduction harness that exercises actual metadata
  rejection/duplicate/authority services, then inspect real persisted results
  through the browser; mere seeding cannot prove rejection.
- **R-TL-004:** add reviewed concrete cursor, navigation-race, refresh-error,
  duplicate-pending-action, focus/keyboard and accessibility scenarios.
- **R-TL-005:** reconcile UUID-only proposal with `evt-001` fixture expectations;
  finalize machine-readable event/read/identity/error schemas and producer
  authority. Preserve the one shared frontend/backend contract.
- **R-TL-006/007:** draft corrections already made: explicit app bootstrap tasks,
  positive/zero-duration and retained-but-unloaded-parent cases. Still need final
  review/implementation, not a passed behavioral result.
- **R-TL-008:** establish pinned compatible setup and genuine baselines.

Timeline currently has 30 draft SCN IDs, seven frontend tasks and ten backend/
acceptance tasks. Intent v0.1 is approved under DR-017:
raw SHA-256 `5EF1378360CFC7A5F282568AB3EBEDDD058A487EDA1953A0E64960F7B836248C`.
Do not overwrite it; material intent changes require a new version/review.

## 6. Environment and execution status

- Working folder: `D:\Personal\ai-runtime-governance`.
- Target is specifications/preparation only; no application manifests or working
  auth/timeline server have been established.
- Recorded discovery: Java 21.0.5 on PATH, no Maven command; selected target
  remains Java 25 with project-local Maven Wrapper planned. Node/npm are available.
  Recheck only at relevant setup stage; do not assume installed versions changed.
- React/TypeScript/Vite, Spring/PostgreSQL/Flyway, browser/helpers/projects and
  exact dependency versions/commands remain setup decisions. No dependency
  installation is authorized by this handoff.
- WSL 2.5.10 was present but no distro registered; user requested manual setup,
  later deferred. This blocks WSL live tests only.
- DR-034/scenario checkpoint checks passed: both approved intent fingerprints unchanged;
  75 stable global/eleven scoped mappings, unchanged 43/10/22 source statuses,
  34 sequential decisions and current fingerprints; 83 SCN IDs expanding to
  215 planned cases, four unspecified IDs blocked, six feature blocks with bound
  Examples and all eleven REQs/22 invariants mapped; 205 local links across
  fifteen documents and `git diff --check`. These are documentation checks,
  not application test results or a passed Phase 3 gate.
  The prior model/intent check covered five pure-domain sections/all eleven traces
  and six labeled Mermaid blocks with defined nodes; diagrams were not rendered.
  Earlier checkpoints remain historical, not current oracles.
- No application/browser/auth/email/DB/live-agent tests have passed or run in
  this work. No frozen acceptance manifests or locked test suite were produced.
- Existing changes are uncommitted; preserve them. Do not stage/commit or revert
  unrelated user work as part of resuming.

## 7. Workflow and resumption safeguards

- Follow the [canonical workflow](../../../spec-to-test-workflow/.github/skills/spec-to-test-workflow/SKILL.md).
  Preserve domain → approved intent → scenarios → contracts/design/tasks →
  review → freeze → genuine red acceptance → lock → implementation order.
- Ask for user decisions only on unresolved observable behavior/permissions/
  contracts, not on ordinary private implementation naming.
- Requirements/register rows are not in source order: newer workflow IDs were
  appended intentionally. Validate by stable source ID/status; never renumber
  existing REQ IDs to satisfy an order-based checker.
- Do not repeatedly rewrite long one-line tables from memory. Read the exact
  affected row, batch coherent edits and validate only the changed surface.
- Keep original approved diagrams and earlier scenarios intact. New findings
  are not permission to weaken an oracle or manufacture approval.
- Recheck mutable source fingerprints before relying on snapshot claims. Earlier
  guard-core/timeline inventories describe historical source generations.
- Record each new decision once under the next unused DR number, then reconcile
  source requirements and affected scoped materials. Some old status summaries
  are historical; the explicit decision record wins over unapproved proposals.
- Keep checkpoints concise and visible. If blocked by a real user decision,
  present that decision rather than continuing an editing/validation loop.

## Suggested next-session prompt

> Resume native-auth prerequisite preparation from REMAINING-WORK-HANDOFF.md.
> Preserve DR-001 through DR-034 and both exact approved intent fingerprints.
> Continue scenario catalog v0.2: four unspecified IDs (012/024/079/080) remain
> blocked. Review the verifier/evidence candidate and measurement prerequisites,
> not the already approved deadline equalities. Phase 3 has not passed. Only then
> shared contracts and design in coherent batches;
> numeric limits, exact contracts and tooling still block freeze. Avoid repeated
> preference forms for routine technical details. TOTP-key outage is scoped
> degradation; password content is restricted only by length.
> Keep real frontend acceptance mandatory. Do not install tools, freeze plans,
> implement code or reopen WSL setup yet.
