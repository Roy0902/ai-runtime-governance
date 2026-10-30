# Phase 1 confirmation record

Version: 0.3. Started: 2026-10-29.
Authority: explicit user responses during guided decision review.

This records only the choices actually confirmed, not blanket approval of the
[decision proposals](./04-decision-proposals.md). Preferences, resolved product
decisions and demonstrated technical capabilities are separate states.

## DR-001: Client-support target

- **Date / decision owner:** 2026-10-29 / user.
- **Proposal / ambiguity:** DP-01 / AMB-runtime-governance-001.
- **Status:** support target approved; environment topology and technical
  feasibility remain open.
- **Approved choice:** evaluate both OpenCode and VS Code Copilot; the first
  release requires at least one fully verified guarded integration. Do not claim
  guarding for an unverified client/version/environment.
- **Approved fallback classification:** a candidate that cannot safely guard
  may have clearly labeled monitoring-only support. It does not satisfy the
  guarded-release requirement.
- **Selected first environment:** Windows with WSL, explicitly reconfirmed after
  read-only discovery found no installed WSL distribution. This is the intended
  target, not a description of a working environment. Plan the missing WSL setup;
  do not replace the target with Windows-local. Exact execution locations for
  OpenCode, VS Code's extension host and the service remain to be finalized.
- **Reason / trade-off presented:** assess both candidates without allowing one
  candidate's limitations to block a release supported by the other; preserve the
  full guarding requirements for every client claimed as guarded.
- **Affected requirements:** GUARD-004 through GUARD-006, INT-001, INT-007 through
  INT-011, MON-004, GW-005; source decisions OD-01/OD-05/OD-10.
- **Verification criteria:** record exact client/version/environment; demonstrate
  consented setup and activation, authenticated submission mapping, submitter-only
  approval, no dispatch on denial/failure/pending approval, protocol/tool-call/
  response fidelity, concurrency isolation and truthful coverage loss.
- **Evidence:** user selected the three corresponding options in the guided
  confirmation form. No integration test evidence exists yet.
- **Source disposition:** final supported-client/protocol matrix remains pending.
  The approved support target and planned Windows/WSL environment are now
  reconciled into OD-01 and the release boundary. Updated fingerprints record
  this source amendment, not technical evidence or closure of the ambiguity.

## Remaining confirmations

DP-02's usage context, governance-native account/2FA direction and same-host
credential-purpose separation are confirmed below. DR-004 supersedes DR-003's
earlier OIDC direction. DR-006 adds public registration and confirms mandatory
2FA/recovery direction. DR-007 selects low-friction session/recent-authentication
limits and password usability; DR-008 selects signup verification, private scopes
and explicit gateway grants. Exact implementation contracts remain open.
DP-03 through DP-14 remain unapproved.
DP-01's detailed protocol, client versions,
authenticated mapping and approval channel remain evidence-dependent. No catalog
rule, numeric limit, authentication mechanism, diagram, contract or freeze has
been approved by DR-001.

The earlier records describe their state at confirmation time. DR-007 later
approves the specific 30-day, 7-day and 10-minute human-authentication limits;
it does not approve any proposed runtime-key lifetime or other resource limit.

## Environment discovery: 2026-10-29

Read-only checks on the current Windows tool host found:

- The assistant tools run on Windows in `D:\Personal`, with no WSL distribution
  reported by that process. Windows VS Code processes are running.
- `wsl.exe` is present, but `wsl.exe --list --verbose` reports no installed
  distributions for the current Windows user and exits with code -1.
- OpenCode is not on this Windows tool process's PATH. This does not prove it
  is absent from another account, environment or installation location.

These observations support Windows-local as the simplest current-host feasibility
target, not a global claim about every VS Code window or remote host. The user
instead explicitly retained Windows with WSL and requested a plan for the missing
setup. No WSL distribution was installed/started and no client settings changed.

### Planned WSL preparation (not executed)

1. Check WSL version/readiness and virtualization prerequisites without changing
   Windows features; identify any required administrator action or restart.
2. Select a supported Linux distribution/version and obtain approval before
   installation. Pin it in the feasibility environment record.
3. Proposed topology for review: Windows VS Code UI connected through Remote WSL,
   OpenCode inside WSL. Verify actual Copilot extension/hook execution locations;
   do not assume Windows and Linux share credentials, paths or client APIs.
4. Choose how the existing Windows project is accessed from WSL without moving or
   duplicating the repository automatically. Plan filesystem performance and
   Windows/Linux path handling explicitly.
5. Install only reviewed prerequisites at the approved setup milestone. Keep
   production client credentials in verified secure storage; do not copy Windows
   tokens into Linux files as a convenience.
6. Test Windows/WSL gateway connectivity, browser-based human authentication/
   approval callbacks, supported secret storage and consented client setup.
   Record exact versions, limitations and unsupported cases.

Service placement and exposure depend on the authentication/deployment decisions.
This plan does not authorize installation, Windows feature changes, a restart,
repository relocation or client configuration changes.

## DR-002: Initial audience and connectivity

- **Date / decision owner:** 2026-10-29 / user.
- **Proposal / ambiguities:** input to DP-02 and DP-11 /
  AMB-runtime-governance-002 and AMB-runtime-governance-011.
- **Approved context:** only the user and their own agent sessions need access in
  the first release. Remote Internet access with authenticated HTTPS is required.
- **Implication:** do not assume loopback-only trust merely because there is one
  human. Internet-facing authentication, TLS, scoped runtime credentials,
  submitter-only approval and safe remote onboarding remain required.
- **Not selected:** human authentication mechanism/provider, public domain,
  service hosting location, reverse proxy, firewall/tunnel topology, key
  lifetimes, recovery targets or deployment configuration.
- **Source disposition:** capture this deployment audience/access boundary when
  reconciling OD-01/OD-05/OD-08 and the selected-deployment documentation.
- **Evidence:** user selected personal use and authenticated HTTPS Internet
  access in the guided confirmation form; no deployed endpoint was tested.

## DR-003: OIDC direction; account/MFA and credential clarification needed

- **Date / decision owner:** 2026-10-29 / user.
- **Proposal / ambiguity:** DP-02 / AMB-runtime-governance-002.
- **Explicit selection:** approve external OIDC login restricted to the user's
  allowlisted identity, without public signup or a workspace platform.
- **Additional stated preference:** "Combine both if possible such that 2FA is
  enabled with local account and google or microsoft authenticator."
- **Interpretation not yet approved:** a local account at a separately operated
  identity provider with password plus TOTP, then OIDC login to governance, could
  meet this preference without implementing passwords in governance. Clarify
  whether "local account" means that, or a governance-native password account.
  An authenticator app is not the same as Google/Microsoft federated sign-in.
- **Credential-separation response:** user requested an explanation. No approval
  of the gateway/event/provider credential design is inferred.
- **Still unapproved:** identity-provider product/hosting, MFA enrollment/recovery,
  gateway/event credential design and lifecycle, key lifetimes and pairing.
- **Source disposition:** record this partial confirmation only; do not mark
  DP-02 resolved or amend source authentication requirements before clarification.

## DR-004: Native account/2FA and same-host demo storage

- **Date / decision owner:** 2026-10-29 / user.
- **Proposal / ambiguity:** revises DP-02 / AMB-runtime-governance-002.
- **Confirmed human-authentication direction:** the governance application itself
  manages the user's local account and two-factor authentication. This supersedes
  DR-003's earlier external-OIDC direction; do not introduce a separate identity
  service as though it were approved.
- **Confirmed deployment constraint:** this is a demo, not a commercial product.
  Storing credentials locally on the demo host is acceptable; no separate
  isolated credential-storage server is requested.
- **Engineering safety boundary:** native passwords must be stored as salted
  password-verifier hashes, never plaintext/reversibly encrypted passwords.
  Authenticator seed material and upstream secrets require appropriate protection;
  same-host storage does not mean embedding them in source or logging them.
- **Still unresolved:** the user's answer addressed storage location, not whether
  gateway and event-reporting credentials have distinct values and permissions.
  Explain that purpose separation does not require separate servers. Native MFA
  enrollment, recovery, provisioning, session policy and revocation also need review.
- **Source disposition:** selected native authentication must be reconciled into
  AUTH-001, the Phase 1 actor/boundary text and technical baseline. Preserve the
  exclusion of public signup/workspace management; do not promote deferred IAM
  platform requirements. Source amendment remains pending the authentication
  confirmation bundle; no source fingerprints changed yet.

## DR-005: Separate credential purposes on one demo host

- **Date / decision owner:** 2026-10-29 / user.
- **Proposal / ambiguity:** DP-02 / AMB-runtime-governance-002.
- **Approved choice:** different gateway, event-reporting and upstream-provider
  keys with different permissions, all stored on the same demo host. No separate
  credential-storage server or vault service is required.
- **Authority boundary explained:** gateway keys permit guarded model requests;
  event tokens permit reporting but not trace reads or approval; upstream keys
  remain server-side for model-provider access. Human login/2FA is separate.
- **Verification criteria:** reject cross-purpose use, isolate scope/request
  attribution and demonstrate that event tokens cannot approve/read traces;
  inspect success/failure paths for secret exposure.
- **Still open:** exact protected storage format, secure provisioning to Windows/
  WSL clients, expiry/rotation/revocation, in-flight handling and human-to-client
  binding. No proposed numeric lifetime is approved.
- **Evidence:** user explicitly approved different purpose-bound keys on the same
  demo host after the storage-versus-permission distinction was explained.

## DR-006: Public native registration, mandatory 2FA and recovery

- **Date / decision owner:** 2026-10-29 / user.
- **Proposal / ambiguities:** revises DP-02 and relevant DP-11/DP-14 scope /
  AMB-runtime-governance-002, -011 and -014.
- **Approved scope:** implement public self-service registration now, although
  initially only the user will use the demo. This supersedes earlier no-public-
  signup proposals and any interpretation of personal use as restricted signup.
- **Approved login behavior:** fresh logins for enrolled human accounts require
  password plus authenticator code, with the approved recovery-code alternative.
  Google Authenticator or Microsoft Authenticator compatibility is requested.
- **Approved recovery:** offline single-use recovery codes used with the password;
  controlled host-administrator recovery if normal factors/recovery options are
  lost. A recovery code is not a standalone password replacement.
- **Not approved by this choice:** registration identifier/email-verification
  policy, email delivery, public password-reset flow, account-to-scope ownership,
  numeric rate/lockout/session policies, authenticator enrollment/reset details,
  identity-provider integration, workspaces or commercial infrastructure.
- **Source changes:** AUTH-001 updated; new AUTH-002, AUTH-003, AUTH-004, AT-09 and
  OD-11 added. README, technical baseline and pending-design register reconciled.
  Existing requirement IDs/statuses and deferred workspace/OIDC requirements
  are preserved. Three new workflow IDs are appended, not renumbered.
- **Verification criteria:** distinct native registration, no password-only
  protected human session, valid authenticator login, recovery-code single-use
  and password binding, reviewed host recovery with no public bypass, and
  isolation from other account/session/credential authority. Detailed contracts
  still block executable acceptance.
- **Evidence:** user explicitly selected public self-service registration and
  mandatory 2FA, and previously approved the offline/host recovery direction.
- **Implementation status:** documentation only; no account, public endpoint,
  credentials, email service, WSL installation or application code created.

## DR-007: Low-friction sessions and password usability

- **Date / decision owner:** 2026-10-29 / user.
- **Proposal / ambiguities:** refines DP-02 and DP-14 /
  AMB-runtime-governance-002 and AMB-runtime-governance-014.
- **User goal:** avoid an annoying or unnecessarily strict login experience.
- **Approved session choice:** remain signed in for at most 30 days, expiring
  after 7 days of inactivity, surviving browser restart. These preserve a valid
  password/2FA-authenticated session; they do not bypass 2FA for fresh login.
- **Approved routine behavior:** no additional authenticator prompts for ordinary
  trace browsing or prompt approvals during a valid authorized session. Prompt
  approval remains submitter/content-bound and subject to its originating request
  deadline; a browser session does not extend an approval request's lifetime.
- **Approved sensitive-change policy:** password changes, authenticator replacement
  and recovery-code generation use full password/second-factor authentication
  no more than 10 minutes old; reuse confirmation during that window rather than
  prompt for every change. The previously approved recovery alternative applies.
- **Approved password usability:** permit password-manager autofill and paste;
  no mandatory periodic password changes.
- **Trade-off explained:** someone with access to an unlocked authenticated browser
  can use the current session. Logout, revocation and expiry still end access.
- **Not selected:** activity measurement/background polling rules, session transport
  and revocation propagation, password length/complexity/hash parameters, numeric
  failed-login/lockout rules, or all other proposed session-sensitive operations.
- **Source changes:** AUTH-003 refined; AUTH-005/AUTH-006 and corresponding
  appended workflow IDs added. AT-09/OD-11 and related context reconciled.
- **Verification criteria:** browser-restart persistence; absolute/inactivity
  expiry boundaries; no routine reauthentication during valid sessions;
  sensitive authentication at exactly 10 minutes versus older; no replay of
  authenticator/recovery codes; autofill/paste and absence of routine expiry.
- **Evidence:** user selected all three recommended options in the session/
  sensitive-change/password-usability confirmation form. No implementation tested.

## DR-008: Signup verification, private scopes and gateway grants

- **Date / decision owner:** 2026-10-29 / user.
- **Proposal / ambiguities:** refines DP-02/DP-14 and OD-05/OD-11 /
  AMB-runtime-governance-002 and AMB-runtime-governance-014.
- **Approved registration:** email and password; verify email once at signup
  and complete mandatory 2FA enrollment before protected access. Do not repeat
  signup email verification at every login.
- **Approved ownership:** each account owns a private scope for traces, approvals
  and client credentials. No cross-user access or shared workspaces.
- **Approved gateway admission:** public registration/verification/enrollment does
  not automatically grant model-gateway access or use of the server's model
  budget. An explicit deployment-operator grant is required.
- **Trade-offs presented:** signup verification requires configured email delivery;
  private ownership prevents cross-account visibility; explicit gateway admission
  avoids making the deployment-managed model budget freely available to public
  registrants. Personal demo use does not waive these selected public-flow rules.
- **Not selected:** email normalization/duplicate handling, delivery provider,
  verification/resend token lifetimes, account-email change/password-reset
  behavior, precise scope identifiers/provisioning or the operator-grant channel.
  Grant authority does not implicitly give the operator trace-data access.
- **Source changes:** AUTH-001/AUTH-002, authorization-scope terminology, AT-09,
  OD-05/OD-11 and related source context updated.
- **Verification criteria:** incomplete verification/enrollment cannot grant full
  access; valid subsequent login does not reverify email; cross-account data/
  approval/key access fails; registered accounts cannot dispatch model calls
  before a grant; a grant does not reveal provider secrets or other accounts.
- **Evidence:** user selected all three recommended registration/ownership/model-
  access options. No public registration, email sending or gateway test performed.

## DR-009: Starting bounded integration-feasibility work

- **Date / decision owner:** 2026-10-29 / user.
- **Authority:** user said to proceed after the recommendation to start the
  integration-feasibility milestone rather than full implementation.
- **Authorized work:** read-only environment checks, official-interface discovery
  and recording the evidence needed for bounded client prototypes.
- **Observed:** WSL 2.5.10.0 is present, default version 2, but no distro is
  registered. Windows VS Code reports 1.142.0 with a Crashpad diagnostic; no
  relevant extension versions or OpenCode command were established in this CLI
  context. These are not passing client integration tests.
- **Evidence:** [readiness report](./06-integration-feasibility.md).
- **Not authorized by this milestone start:** choosing/installing a Linux
  distribution without the setup confirmation, Windows feature changes,
  elevation/reboot, client routing changes or production support claims.
- **Next gate:** confirm the recommended Ubuntu-24.04 distribution installation
  or choose another setup path. No application requirement or source fingerprint
  changed during readiness discovery.

## DR-010: User-performed WSL setup

- **Date / decision owner:** 2026-10-29 / user.
- **Explicit choice:** "Do not install; give me the setup steps to perform myself."
- **Disposition:** do not run distro installation, account initialization, Windows
  feature changes or client setup. Provide reviewed manual instructions instead.
- **Deliverable:** [manual WSL setup guide](./07-wsl-manual-setup.md), using
  Ubuntu-24.04 as the recommended baseline, not a claim that it is installed.
- **Next evidence:** registered distro/version, successful private first-run setup,
  Linux execution and a Windows VS Code connection to that distro.
- **Still unverified:** all live OpenCode/Copilot capabilities, secure client
  storage, custom endpoint/approval mapping and Windows/WSL networking.
- **Source disposition:** readiness/setup only; no application requirement,
  source fingerprint or previously approved product behavior changed.

## DR-011: Defer WSL and resume client-independent preparation

- **Date / decision owner:** 2026-10-29 / user.
- **Authority:** user agreed to leave WSL pending, finish essential behavior/design
  decisions and prepare the first implementable development slice.
- **Approved sequencing change:** WSL installation is not a prerequisite for all
  development materials or unrelated Java/frontend work. It blocks only live
  tests of the selected WSL integration environment.
- **Preserved constraints:** no automatic Linux installation, system feature
  changes, credentials or client routing modifications. Full client support still
  requires evidence; the Windows/WSL target is deferred, not silently replaced.
- **Next preparation:** the [guard-core slice proposal](./08-first-slice-scope.md)
  separates trusted finding/decision composition from detector/client integration.
  Its package choices require explicit confirmation; this sequencing agreement
  does not approve detector patterns, overlap behavior or numeric limits.
- **Source disposition:** preparation sequencing only; no application requirement
  or global source fingerprint changed.

## DR-012: Guard decision core scope and behavior package

- **Date / decision owner:** 2026-10-29 / user.
- **Explicit choices:** proceed with the guard decision core first; approve the
  package in the scoped preparation proposal.
- **Approved boundary:** trusted findings/catalog revision become a decision and
  redacted message. Actual detectors, client mapping, accounts, approval delivery,
  persistence, upstream dispatch and WSL testing are not in this slice.
- **Approved overlap:** connected interval union, including transitive connections,
  uses the highest-priority finding's marker; multiple findings tied at the
  group's top priority fail evaluation. Adjacent intervals remain separate.
- **Approved vocabulary:** `[REDACTED_CREDENTIAL]`, `[REDACTED_API_TOKEN]`,
  `[REDACTED_EMAIL]`, `[REDACTED_PHONE]`, `[REDACTED_PAYMENT_CARD]`,
  `[REDACTED_FINANCIAL_ID]`.
- **Approved limits:** at most 64 KiB/65,536 UTF-8 message bytes and 1,024 findings
  per evaluation; overflow fails, without truncation or silent allow.
- **Approved validation:** missing policy identity/version, unknown/inconsistent
  rules and invalid/empty/out-of-range redaction spans fail explicitly; catalog
  owns effect, priority and marker.
- **Source amendments:** confirmed first-slice section added to REQUIREMENTS;
  README and pending-design register reconciled. This refines existing source
  requirements rather than renumbering the 72 global rows.
- **Still unapproved:** detector patterns, all other runtime limits, active-policy
  lifecycle, result/error contract, acceptance-runner adaptation, intent diagrams,
  implementation design and freeze. Full requirements remain open outside the
  included portions.
- **Next gate:** prepare scoped ingestion/domain and versioned intent diagrams;
  obtain diagram approval before authoring scenarios.

## DR-013: Guard-core intent v0.1 approved

- **Date / decision owner:** 2026-10-29 / user.
- **Explicit choice:** approve v0.1 and proceed to concrete scenarios.
- Artifact: guard-core/02-intent-v0.1.md, intent version v0.1.
- Raw-file SHA-256: `4DC5B0AF946E742DB41313BD8CD716843DB2DA38D02915447A98329FF3D6257B`.
- Preparation checks passed for source/requirement traceability and all labeled
  flow/state branches; no Mermaid rendering or application tests were run.
- The raw-file fingerprint was rechecked before recording approval. The intent
  artifact was not edited to add approval status.
- **Approved scope:** business evaluation flow/state boundaries and branches.
  No detector catalog, implementation structure, error/type contract, acceptance
  runner, frozen plan or product implementation is approved by this choice.
- **Next gate:** author concrete scenarios from the confirmed scoped requirements
  and this approved intent version, then resolve Phase 4 contract/tooling setup.

## DR-014: Library contract and Java baseline; frontend acceptance required

- **Date / decision owner:** 2026-10-29 / user.
- **Approved contract:** the proposed shared checklist section 3 library contract,
  including Unicode code-point spans, malformed-text rejection, distinct
  decision/failure results and unordered machine-readable failure reasons.
- **Approved toolchain direction:** retain Java 25 and plan a project-local Maven
  Wrapper. Do not install tools yet.
- **Acceptance clarification:** the user requires frontend acceptance tests
  produced through this workflow. Unit tests may supplement them but cannot
  replace acceptance. The proposed Playwright-to-Java subprocess acceptance
  adaptation is not approved.
- **Scope consequence:** the current decision-core slice has no frontend.
  Resolve the real frontend journey and resulting slice boundary before
  preparing UI contracts, frontend/backend tasks or claiming acceptance readiness.
  Do not invent a test-only screen or equate library tests with frontend acceptance.
- **Still required:** reconcile the approved library representation into source
  criteria and scenarios at the scoped contract stage; review the acceptance
  surface and update affected intent/scope before freeze.

## DR-015: Incident activity timeline as the first frontend journey

- **Date / decision owner:** 2026-10-29 / user.
- **Explicit journey:** incident log with visualization of the approval timeline,
  prompt log and associated activity.
- **Explicit prompt-log boundary:** metadata only: prompt event, time, identity,
  guard outcome and rule IDs. No prompt body is selected for storage/display.
- **Scope consequence:** prepare the real timeline inspection journey and frontend
  acceptance through the workflow, rather than a library-only first delivery or
  an invented prompt-submission screen. No incident case-management features are
  implied.
- **Preserved decisions:** guard-core intent/package approvals are not revoked,
  but they do not prove this frontend journey. WSL remains deferred; ordinary
  archives/reasoning text stay excluded. Approved native account/session rules
  and private account scope remain in force.
- **Still open:** exact event/read/UI contracts, inspection-only versus actionable
  approval, query limits and test setup/authentication boundaries.
- **Preparation scope:** [timeline first slice](./09-timeline-first-slice.md).
  No browser tests, API routes, payload storage or application code created.

## DR-016: Read-only timeline behavior package

- **Date / decision owner:** 2026-10-29 / user.
- **Explicit choices:** approval inspection only; approve the recommended timeline
  package items 2 through 6 in timeline/00-ingestion.md.
- **Approved order/hierarchy:** siblings by server receipt time then event ID,
  ascending, labeled receipt order; source time separate. Missing parents remain
  inspectable and may resolve later; cycles/cross-scope parents fail.
- **Approved truthfulness:** do not invent duration, parent, timestamps or
  completeness. Separate execution running/completed/failed/canceled/unknown from
  telemetry complete/incomplete/unknown/unsupported. Complete requires positive
  trusted evidence; completed execution may still be incompletely observed.
- **Approved reads:** at most 50 traces / 200 events per response, explicit
  continuation/load-more and manual refresh; no initial filters/search,
  auto-polling or live-token display. Partial loading is not telemetry loss.
- **Approved event semantics:** authentication determines scope/reporter;
  event tokens do not forge guard/approval authority. Identical scoped event
  duplicates are idempotent; conflicting duplicates fail without overwrite.
- **Preserved boundary:** prompt metadata only, no prompt bodies; browser/backend/
  persisted controlled-data acceptance, not mocked-screen or unit-test substitute.
  Inspection of history neither grants approval nor verifies live agent integration.
- **Source changes:** confirmed timeline subsection added to REQUIREMENTS;
  product README and pending-design register reconciled. The 72 existing global
  rows retain their IDs/statuses; complete EVT-002/003/UI-002 remain proposed.
- **Still open:** exact event/read/cursor/error and UI contracts, permission/
  authentication setup, trusted producer classification, native baselines and
  isolated fixture provisioning. No diagram approval inferred from this package.
- **Next gate:** scoped domain model and versioned intent for explicit approval.

## DR-017: Timeline intent v0.1 approved

- **Date / decision owner:** 2026-10-29 / user.
- **Explicit choice:** approve v0.1 and proceed to frontend acceptance scenarios.
- Artifact: timeline/02-intent-v0.1.md, version v0.1.
- Raw-file SHA-256: `5EF1378360CFC7A5F282568AB3EBEDDD058A487EDA1953A0E64960F7B836248C`.
- Scoped domain model prepared and presented; eleven scoped requirements and
  fourteen domain invariants traced. Two flow diagrams have 34 labeled edges and
  both branches for every decision.
- Preparation checks passed for six global/two timeline source fingerprints,
  local links and stable global requirement count. No rendering, browser
  acceptance or live integration test performed.
- Raw-file fingerprint verified unchanged after user approval. The intent file
  itself is not edited to add approval status.
- Approval covers this read-only journey and metadata boundaries, not exact
  API/UI copy, login/test setup, a frozen plan or implementation. Phase 3 may
  proceed; later shared contracts and Phase 6 review remain required.

## DR-018: Native authentication prerequisite before timeline delivery

- **Date / decision owner:** 2026-10-30 / user.
- **Explicit choice:** plan and acceptance-test native authentication as a
  prerequisite milestone, then the timeline.
- **Reason presented:** timeline frontend acceptance requires real authenticated
  human sessions and private scope, but no such application module exists yet.
  A fake login/forged cookie would not meet the approved requirements.
- **Preserved behavior:** public email registration and signup verification,
  mandatory authenticator 2FA with approved recovery, private accounts, explicit
  gateway grants and the approved 30-day/7-day/10-minute low-friction policies.
  This sequencing choice does not reduce their requirements.
- **Next preparation:** scoped native-auth requirements/domain/intent, frontend
  scenarios and shared contracts/design/tasks, reviewed and tested through the
  same workflow. Timeline materials remain valid work-in-progress, not discarded.
- **Review effect:** resolves R-TL-002's sequencing question; native-auth delivery
  is still a dependency and is not implemented or accepted. Other timeline review
  findings remain open, particularly traversal membership and exact contracts.
- **Not authorized:** tool installations, system configuration, application
  implementation, freeze, bypass authentication or alteration of approved intent.

## DR-019: Signup email identity and verification contract

- **Date / decision owner:** 2026-10-30 / user.
- **Proposal / ambiguities:** native-auth DP package / AMB-native-auth-001/002,
  011.
- **Approved identity:** trim surrounding whitespace and case-normalize the full
  email address for one unique account identity.
- **Approved duplicate privacy:** use the same generic confirmation for new,
  pending and already-verified addresses; do not reveal registration status.
- **Approved verification:** single-use link valid for 24 hours; resend invalidates
  the previous link.
- **Approved delivery/testing direction:** configurable outbound SMTP relay for
  production; use captured local mail for acceptance tests. No email vendor
  selected. Acceptance tests do not send real messages.
- **Trade-off presented:** whole-address case normalization is simple and avoids
  duplicate-looking accounts but can merge rare case-sensitive mailbox names;
  generic responses reduce enumeration but require clear generic instructions.
- **Still open:** exact generic copy, which existing-address case sends a message,
  resend/rate limits, SMTP failure/retry behavior, pending-account cleanup, and
  verification link path/state transition details.
- **Source changes:** AUTH-002 and OD-11 refined in REQUIREMENTS; README, technical
  baseline and pending-design register updated. Existing AUTH IDs/global row count
  unchanged. Current source fingerprints are refreshed in the scoped inventory.
- **Verification:** variants differing only in trim/case map to the approved
  identity rule; new/pending/verified addresses return the same approved response;
  valid link works once before 24h; expiry/replay/superseded links do not verify;
  local test messages are captured rather than externally delivered.
- **Evidence:** user selected the recommended email identity, duplicate response,
  verification lifetime/resend behavior and relay/test delivery options through
  the guided form. No registration or email test has run.

## DR-020: Password usability and verified-email reset

- **Date / decision owner:** 2026-10-30 / user.
- **Proposal / ambiguities:** native-auth DP package / AMB-native-auth-003.
- **Approved password policy:** at least 12 characters; allow passphrases,
  password-manager paste and autofill; no composition rules or forced expiry.
  Existing secure salted verifier-hash requirement remains.
- **Approved reset:** a single-use link to the verified email with 30-minute
  expiry. A successful reset preserves mandatory authenticator 2FA and revokes
  all existing account sessions; recovery codes remain governed separately.
- **Trade-offs presented:** an easier-to-use passphrase policy supports the user's
  low-friction goal while mandatory MFA remains; reset restores a forgotten
  password without becoming a TOTP bypass. Session revocation requires the human
  to sign in again with password and MFA.
- **Not selected:** maximum length/Unicode counting, hash algorithm and parameters,
  reset link single-use delivery/rate limits beyond the expiry, generic response
  behavior, and response to delivery failures.
- **Source changes:** AUTH-003 refined, AUTH-007 added and OD-11 updated in
  REQUIREMENTS; technical baseline and pending-design register reconciled.
  Existing global AUTH IDs remain stable; one new global requirement ID is appended.
- **Verification criteria:** 11-character versus 12-character input; accepted
  passphrase containing spaces; paste/autofill; no periodic expiry; reset before
  and after 30 minutes and replay; 2FA still required after reset; every existing
  session revoked after successful reset.
- **Evidence:** user selected both recommended password-policy and reset options
  in the guided confirmation. No password/reset implementation or test exists.

## DR-021: Authenticator and recovery-code lifecycle

- **Date / decision owner:** 2026-10-30 / user.
- **Proposal / ambiguities:** native-auth decision package /
  AMB-native-auth-004/005.
- **Approved TOTP:** six digits, 30-second step, accept the current step or one
  adjacent step on either side for clock drift, and accept a given time step
  at most once per account.
- **Approved enrollment:** show authenticator setup once for a pending enrollment;
  require one valid code to complete. Interrupted pending enrollment expires
  after 24 hours and must be restarted.
- **Approved recovery codes:** exactly 10 random one-use codes, display once,
  store only verifiers; rotation revokes every code in the old set.
- **Approved recovery login:** password plus an unused recovery code creates the
  ordinary low-friction session and keeps MFA enabled. Factor replacement
  requires fresh authentication or an unused recovery code.
- **Trade-offs presented:** small clock-skew tolerance avoids unnecessary login
  failures; replay protection prevents reuse; expiring incomplete enrollment
  bounds abandoned setup; recovery remains usable without silently turning MFA off.
- **Still open:** TOTP seed/QR generation, display and protection; exact recovery
  code format/entropy and one-time display acknowledgment; factor replacement
  UX, host-admin procedure and other account-abuse controls. These were not
  selected as hidden defaults.
- **Source changes:** AUTH-004 acceptance criteria refined and AUTH-008 added;
  AT-09/OD-11, technical baseline and pending-design register updated. Existing
  requirement IDs remain stable; AUTH-008 is appended.
- **Verification criteria:** protected access denied until a valid enrollment
  code; current and adjacent TOTP windows work; replay of the same step fails;
  setup expires after 24h; exactly 10 codes displayed once and stored only as
  verifiers; rotation revokes the old set; recovery login preserves MFA; factor
  replacement cannot bypass the reauthentication/recovery boundary.
- **Evidence:** user selected all four recommended TOTP/enrollment/recovery
  options in the guided confirmation form. No implementation or test has run.

## DR-022: Offline account recovery and operator gateway authority

- **Date / decision owner:** 2026-10-30 / user.
- **Proposal / ambiguities:** native-auth DP package / AMB-native-auth-006/010.
- **Approved host recovery:** a host-OS administrator can run a local offline
  recovery procedure for one named account after the human loses normal MFA and
  recovery options. Revoke that account's sessions/factors and require
  authenticator enrollment again. No public host-recovery endpoint.
- **Approved gateway admission:** a local host-admin command grants/revokes
  model-gateway access for one already email-verified and MFA-enrolled account.
  Public registration alone never authorizes provider-budget use; no public
  administrator UI is selected.
- **Approved operator boundary:** host operator can recover accounts and manage
  gateway entitlement, but receives no automatic trace, prompt or provider-secret
  read permission.
- **Trade-off presented:** local host access permits recovery without a separate
  identity/vault product but depends on trusted host administration. Public
  registration remains available without exposing model spend. Grant authority
  is separate from trace visibility.
- **Still open:** command syntax and proof of host authority; bootstrap and
  prevention of repeat/guessed grants; safe audit record; revocation propagation/
  in-flight calls; exact reset effect when an account is disabled/deleted; recovery
  behavior for an unavailable database. These are not defaults.
- **Source changes:** AUTH-001/AUTH-004 acceptance criteria and OD-11 refined;
  no new requirement ID. Existing requirement IDs/global count are preserved.
- **Verification criteria:** public routes cannot perform host recovery or
  operator grants; local recovery changes only the named account, revokes sessions/
  factors and requires new enrollment; grant requires verified email plus enrolled
  MFA; revoked grant blocks later gateway access; host operator cannot read traces,
  prompts or provider secrets by virtue of the operator mechanism.
- **Evidence:** user selected host-OS recovery, local host-admin grant/revocation
  and restricted operator authority in the guided confirmation form. No command,
  account, grant or recovery operation exists.

## DR-023: Generic authentication responses and bounded abuse throttling

- **Date / decision owner:** 2026-10-30 / user.
- **Proposal / ambiguity:** native-auth recommendations / AMB-native-auth-011.
- **Approved responses:** sign-in and password-reset responses do not reveal
  whether an email address is registered. Verification/reset resend responses
  are generic as already selected under DR-019.
- **Approved failure handling:** apply bounded temporary throttling with
  progressive delay to repeated failed authentication; never permanently lock
  the account.
- **Approved email throttling:** rate-limit verification/reset resends per
  normalized email address and request source; exact numeric thresholds deferred.
- **Trade-offs presented:** reducing account enumeration may make sign-in/reset
  errors less specific; temporary progressive delay protects a public endpoint
  while avoiding irreversible attacker-triggered lockout. Numerical thresholds
  require measurement rather than an invented arbitrary default.
- **Still open:** exact response copy/status equivalence, numerical login/reset/
  resend rates, delay progression/recovery window, source identity under proxies,
  SMTP failure behavior and interaction among account/address/IP limits.
- **Source changes:** AUTH-009 and its OD-11 coverage, plus AT-09 membership,
  added to REQUIREMENTS. Existing requirement IDs/global count are preserved;
  AUTH-009 is appended.
- **Verification criteria:** unknown email and wrong password have equivalent
  public responses; password reset does not disclose account status; rate
  throttling is temporary and recovers; no permanent account lock; resend
  throttling is per approved identities without email-status disclosure; all
  numeric bounds remain explicitly reviewed before freezing.
- **Evidence:** user selected all three recommended response/throttle options.
  No auth endpoint, email sender, failure counter or throttle has been implemented
  or tested.

## DR-024: Protected authenticator setup and recovery acknowledgement

- **Date / decision owner:** 2026-10-30 / user.
- **Approved seed protection:** encrypt pending and active TOTP seeds at rest with
  a deployment-local key kept outside source, database and logs. No separate
  vault server is required. This protects a database-only disclosure, not a fully
  compromised host.
- **Approved setup display:** show QR and manual-entry key once for the pending
  enrollment; require one valid code and provide no later seed readback.
- **Approved recovery acknowledgement:** require a simple acknowledgement that
  the ten recovery codes were saved before enrollment completes.
- **Source reconciliation:** AUTH-004/AUTH-008 already contain these confirmed
  rules from the interrupted run. No new requirement ID is necessary.
- **Still open:** encryption algorithm/key lifecycle, interrupted one-time-display
  recovery, code entropy/format, and exact enrollment UI/transport contracts.
- **Evidence:** user selected all three recommended seed/display/acknowledgement
  options before cancellation. This records that prior confirmation; it does not
  infer a new approval from the request to resume.
- **Status:** documentation only; no secrets, application code, tool installation,
  test execution or frozen acceptance artifacts created.

## DR-025: Session activity, cookie storage and settings-change revocation

- **Date / decision owner:** 2026-10-30 / user.
- **Approved activity:** successful deliberate protected actions reset inactivity;
  background polling/static assets do not. The 30-day absolute/7-day inactive
  limits and ten-minute recent-authentication rule are unchanged.
- **Approved session transport:** server-side sessions and Secure, HttpOnly,
  SameSite cookie with CSRF protection; no login token in localStorage.
- **Approved signed-in settings changes:** after recent-authenticated password
  change or authenticator replacement, revoke other sessions, rotate/retain the
  current session and preserve its original 30-day absolute deadline.
- **Preserved exceptions:** forgot-password reset and host recovery revoke every
  affected account session as previously approved.
- **Still open:** exact action classification and cookie/CSRF contract, concurrent
  revocation handling, and interrupted factor-replacement behavior.
- **Source reconciliation:** session refinements added under OD-11; these refine
  existing AUTH-005/006 rather than add or renumber global requirement rows.
- **Verification:** background-only requests cannot keep a session alive; deliberate
  activity affects only the idle deadline; cookie flags and absent localStorage
  token; settings change invalidates other sessions and rotates the current token;
  current absolute deadline is preserved; forgot-password/host recovery invalidate
  all sessions. No implementation or test execution is claimed.
