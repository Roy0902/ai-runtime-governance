# Remaining development preparation: cross-session handoff

Updated: 2026-10-30, after DR-025.
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
3. [Decision record](./05-decision-record.md), especially DR-018 through DR-025.
4. [Requirements](../../REQUIREMENTS.md): AUTH-001 through AUTH-009 and the
   confirmed enrollment/session refinements under OD-11.

Recommended next discussion: **interrupted registration/enrollment and factor
replacement**, followed by account lifecycle. Prepare one coherent recommendation
per topic and ask only for unresolved observable behavior. After those choices,
derive the native-auth domain model and intent for approval.

## 2. Current milestone sequence

1. Finish native-auth requirements/decisions.
2. Prepare native-auth pure domain model and versioned intent; obtain explicit
   intent approval.
3. Prepare concrete frontend acceptance scenarios, shared API/UI contracts,
   native tooling baseline, implementation design and frontend/backend tasks.
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
| First timeline journey | Read-only incident/activity timeline; metadata-only prompt log, no original/redacted prompt body; no approve/reject controls or incident case management | DR-015/016 |
| Timeline behavior | Receipt-ordered siblings; separate source time; honest missing/late parents, duration and coverage; execution/completeness independent; 50 traces/200 events per response; explicit continuation/manual refresh; duplicate/conflict rules | DR-016 |
| Acceptance | Real frontend browser + backend + persisted controlled data; no mocked successful screen, forged production session or library/subprocess replacement | DR-014/015 |
| Sequencing | Separately plan and acceptance-test native authentication before timeline delivery | DR-018 |

## 4. Native-auth leftovers

The scoped AMB register has twelve groups, many **partially resolved**. Its older
row wording may still list choices subsequently approved by DR-024/025. Apply
the decision record and source refinements; do not treat stale summary wording
as a reason to reconfirm seed encryption, acknowledgement or session policies.

| Remaining topic | Decisions/contracts still needed | Relevant AMBs |
|---|---|---|
| Pending registrations | Cleanup lifetime; duplicate pending submission cannot replace a password or seize enrollment; which address states receive mail; intermediate setup privileges | 001/002 |
| Verification delivery | Exact generic copy; resend eligibility and delivery/queue failure; atomic supersession and one-use consumption; expiry boundary expectations | 002/011/012 |
| Password details | Maximum length, Unicode counting/normalization, malformed text, hash algorithm/parameters/rehash and measured resource bounds | 003 |
| Reset details | Exact response/copy and delivery failures, multiple outstanding links/invalidation, race/one-use semantics and rate limits; do not reconsider approved 30 minutes/MFA preservation/all-session revocation | 003/011/012 |
| Interrupted one-time setup | What happens after losing the once-shown QR/key or recovery-code display, refresh/back/retry, pending-secret expiry and safe restart without protected access | 004/005/012 |
| Factor replacement | Preserve old factor until replacement verified; atomic swap/failure/cancellation behavior; fresh-auth/recovery binding and revocation races | 004/005/008 |
| Seed/key protection | Encryption/key generation, location/permissions, backup/rotation and unavailable-key behavior; no plaintext fallback | 004 |
| Recovery code details | Entropy/encoding, verifier strategy, acknowledgement UX, rotation/use concurrency, exhausted-code guidance | 005 |
| Host operations | Exact commands, proof of host authority, safe audit, scoped failure/DB outage behavior, enrollment handoff and inability to impersonate user data access | 006/010 |
| Account lifecycle | Private scope creation timing; incomplete signup; account disable/delete, pending operations, retained metadata and re-registration; do not silently add workspace features | 009 |
| Gateway entitlement | Bootstrap/repeat-command safeguards, revocation propagation and already-running calls; relation to disabled/recovering accounts | 010 |
| Session/reauth implementation | Exact deliberate-action classification, SameSite mode/cookie scope, CSRF contract, session fixation/rotation, multi-tab/concurrent revocation and recent-auth binding | 007/008 |
| Abuse limits | Numeric rates/delay progression/recovery windows, proxy/source identity and combined per-address/source bounds; user explicitly deferred numbers pending review/measurement | 011 |
| Browser/UI/API | Exact routes/shapes/statuses/copy/semantic locators, loading/errors/navigation; private account screen for auth acceptance; no actual timeline needed to prove auth | 012 |
| Real acceptance setup | Actual browser/backend/DB/mail capture and generated per-test secrets; secret-safe screenshots/traces/logs; real signup/verification/TOTP flow, not fake auth cookies | 012 and acceptance plan |

Prepared native-auth materials:
[ingestion](./native-auth/00-ingestion.md),
[recommendations](./native-auth/01-decision-proposals.md),
[frontend acceptance coverage plan](./native-auth/02-acceptance-plan.md),
[status](./native-auth/README.md).
No native-auth domain/intent/concrete SCN/API-UI matrix/design/tasks exist yet.
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
- Current document checks passed: 75 source/register mappings by stable ID and
  status; 25 unique DR records; current global/auth source fingerprints and links.
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
> Preserve DR-001 through DR-025 and the low-friction login rules. Start with
> interrupted one-time enrollment/factor replacement and remaining account
> lifecycle choices, then prepare the native-auth domain/intent for review.
> Keep real frontend acceptance mandatory. Do not install tools, freeze plans,
> implement code or reopen WSL setup yet.
