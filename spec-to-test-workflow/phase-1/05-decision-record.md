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

## DR-026: Interrupted enrollment and atomic authenticator replacement

- **Date / decision owner:** 2026-10-30 / user.
- **Proposal / ambiguities:** AMB-native-auth-004/005/008/012.
- **Approved initial restart:** losing the once-shown QR/manual key or recovery
  codes through refresh, back navigation, closed tab or interrupted response
  does not permit secret readback. Offer an explicit restart after confirming
  the password for the verified account, with setup-only access.
- **Approved restart effect:** invalidate the previous pending seed/code set and
  create a new 24-hour attempt. A stale tab cannot complete the invalidated
  attempt. Protected access remains blocked until a valid new authenticator
  code and acknowledgement of saved recovery codes complete enrollment.
- **Approved replacement:** retain the current authenticator and recovery codes
  until the new authenticator is verified and its new recovery codes are
  acknowledged. Cancellation, expiry or lost-display restart discards only
  the pending replacement; it does not disable the active factor/code set.
- **Approved commit:** atomically replace the factor and recovery-code set,
  revoke other sessions and rotate/retain the current session without extending
  its original absolute deadline, as required by DR-025.
- **Approved authorization:** starting/restarting and final replacement completion
  require full authentication within the existing ten-minute window. Reuse a
  valid confirmation; do not unnecessarily consume another OTP. Recovery codes
  consumed for authentication remain consumed even if replacement is cancelled.
- **Trade-off presented:** avoiding accidental lockout and secret readback means
  rescanning a new QR after losing a one-time display.
- **Still open:** account lifecycle, exact UI/API and acknowledgement transport,
  concurrent completion/revocation contracts, code format/entropy and key lifecycle.
- **Source reconciliation:** OD-11 enrollment refinements, global/scoped register,
  recommendations and acceptance coverage updated; existing REQ IDs preserved.
- **Verification criteria:** browser refresh/back/close/interrupted-response
  restart; no redisplay or protected access before completion; stale-tab denial;
  pending-only cancellation/expiry; old factors usable before replacement commit
  and rejected afterwards; ten-minute authorization at start/restart/commit;
  consumed-code cancellation and DR-025 session outcomes.
- **Evidence:** user approved both recommended policies in the guided form.
  Documentation only; no application, browser test, freeze or implementation
  outcome is claimed.

## DR-027: Pending registration, private scope and bounded account lifecycle

- **Date / decision owner:** 2026-10-30 / user.
- **Proposal / ambiguities:** AMB-native-auth-001/009, with effects on
  AMB-native-auth-003/006/010/012.
- **Approved pending safety:** duplicate signup never replaces the stored
  password or takes over enrollment. The verified email owner may use the
  approved password-reset flow; reset does not bypass MFA or incomplete setup.
- **Approved cleanup:** remove only never-verified registrations after seven
  days from creation or the latest issued verification link, whichever is later.
  Ordinary duplicate submissions do not extend retention; an actually issued
  resend does. Verified accounts are not deleted when a 24-hour enrollment
  attempt expires.
- **Approved scope:** create one immutable private data scope only when first
  enrollment fully completes. Before that allow only required verification,
  setup and reset operations, not protected application data or gateway use.
  Later factor replacement/host recovery preserves that scope and ownership.
- **Approved first-increment boundary:** host-admin-only disable/re-enable.
  Defer account deletion, data erasure and verified-email re-registration to a
  separately specified increment. No public admin UI, self-service deletion
  or automatic recycling of a disabled verified email.
- **Approved disable effects:** deny further account access and revoke sessions,
  pending authentication operations and gateway entitlement; retain scope/data.
  Re-enable restores eligibility to authenticate/setup, not old tokens or
  gateway entitlement. Gateway use needs a new explicit eligible-account grant.
- **Trade-off presented:** smaller first increment without self-service erasure;
  verified accounts/data remain retained rather than silently deleted/reassigned.
- **Still open:** exact disable/cleanup commands and race/failure contracts,
  verification send eligibility, reset delivery, gateway in-flight propagation
  and deferred deletion/retention policy. No actual erasure capability is claimed.
- **Source reconciliation:** OD-11 lifecycle refinements, global/scoped register,
  proposals, acceptance coverage and handoff updated; no REQ IDs added/renumbered.
- **Verification criteria:** duplicate password/enrollment preservation; seven-day
  cleanup boundary and resend-vs-duplicate distinction; verified interrupted
  enrollment survives; scope created once after full enrollment and stable
  across recovery; disable blocks access/revokes auth and entitlement; re-enable
  does not revive tokens/grants; disabled verified email cannot be recycled.
- **Evidence:** user approved all three recommended lifecycle policies in the
  guided form. Documentation only; no implementation or executable test result.

## DR-028: Verification/reset eligibility, atomic links and durable delivery

- **Date / decision owner:** 2026-10-30 / user.
- **Proposal / ambiguities:** AMB-native-auth-001/002/003/011/012.
- **Approved send eligibility:** new signup issues verification mail; duplicate
  signup preserves password/enrollment and sends no new mail. Explicit resend
  issues a verification link only for an enabled, never-verified registration.
  Reset sends only to an enabled, verified account, including incomplete initial
  MFA enrollment. Unknown, verified-for-resend, unverified-for-reset and disabled
  addresses receive the same generic acknowledgement without mail. Reset
  never bypasses MFA or setup.
- **Approved link lifecycle:** one current link per account/purpose. Durable
  issuance atomically supersedes the prior link; failed issuance preserves it.
  Opening a link alone does not consume it: verification requires explicit
  confirmation and reset requires a valid new-password submission.
- **Approved boundaries/races:** valid only while server time is strictly before
  expiry; exactly at expiry fails. Consumption and state changes are atomic;
  concurrent submissions cannot both succeed. Failed validation or rollback
  does not consume the link. Lifetimes remain 24 hours/30 minutes.
- **Approved reset effect:** issuing a reset link does not revoke sessions.
  Successful reset atomically changes password and revokes sessions while
  preserving active MFA, including the incomplete-setup restrictions.
- **Approved delivery admission:** acknowledge only accepted bounded durable
  mail-work requests, not successful delivery. Use the same admission step for
  ineligible addresses so queue outage does not disclose eligibility.
  Admission failure returns a generic temporary-service error, never success.
- **Approved asynchronous delivery:** bounded retries stop at expiry,
  supersession or disablement. Recheck eligibility before sending. Later SMTP
  failures are recorded/surfaced to the operator without secrets, not exposed
  as address-specific public status. Old delivered/in-flight mail cannot be
  recalled, but superseded links fail; guide users to the newest link. Retry
  never revives expiry.
- **Trade-offs presented:** explicit verification click; request acceptance is
  not delivery assurance. Avoids scanner consumption and success-shaped queue
  failures without revealing account eligibility.
- **Still open:** exact copy/routes/statuses, numerical abuse/retry/queue limits,
  delivery/key protection and concrete transactional/worker implementation.
- **Source reconciliation:** OD-11 mail/link refinements, global/scoped register,
  proposals, frontend coverage and handoff updated; no REQ IDs added/renumbered.
- **Verification criteria:** eligibility matrix/duplicate no-send; link opening
  does not consume; newest-link validity; failed issuance retains previous link;
  before/at/after expiry; concurrent consumption and rollback; reset-session
  effects; common admission outage; accepted-then-failed delivery; retry expiry/
  supersession/disablement and secret-safe operator reporting.
- **Evidence:** user approved all three recommendations in the guided form.
  Documentation only; no application, mail service or executable test run.

## DR-029: Length-only password input policy

- **Date / decision owner:** 2026-10-30 / user.
- **Proposal / ambiguities:** AMB-native-auth-003/012.
- **Approved length:** 12 through 128 characters inclusive, counted as Unicode
  code points rather than bytes or UTF-16 storage units. Counting is not an
  allowed-character or encoding restriction.
- **Approved content policy:** no additional character/encoding restrictions,
  allowed-character lists, composition rules or special bans on spaces,
  symbols or control characters. Keep paste/autofill and no periodic forced
  password changes.
- **Approved exact input:** no trimming, normalization, case folding, truncation
  or silent substitution. Preserve leading/trailing spaces. Use consistent
  interpretation at signup, password change/reset, login and reauthentication.
  Login failures retain the approved generic response; password-creation forms
  may explain validation errors.
- **Transport boundary:** malformed network requests remain ordinary transport/
  parse errors, not additional password-content/complexity rules. No alternate
  password encoding is required of the user. Secure salted verifier hashing
  remains mandatory and separate from input policy.
- **Correction recorded:** the initial proposal's special NUL/line-break and
  password-specific encoding exclusions were not approved. The user rejected
  extra character restrictions and then explicitly approved the revised
  12–128-character length-only policy.
- **Still open:** hash library/algorithm/parameters, safe rehash design and
  measured memory/concurrency bounds; exact UI/API/copy. Argon2id remains a
  recommendation, not an installed/measured/frozen implementation.
- **Source reconciliation:** AUTH-003 OD-11 refinement, global/scoped register,
  recommendations, frontend coverage and handoff updated; no REQ IDs changed.
- **Verification criteria:** 11/12/128/129 boundaries, non-BMP and multi-code-point
  counting, spaces/symbols/control characters without extra content rejection,
  exact-text differences/no silent transforms, paste/autofill, consistent
  password flows and generic login failure. Malformed transport handled explicitly.
- **Evidence:** user explicitly approved the revised length range with no
  additional character/encoding restrictions. Documentation only; no tests run.

## DR-030: TOTP encryption-key lifecycle and scoped degradation

- **Date / decision owner:** 2026-10-30 / user.
- **Proposal / ambiguities:** AMB-native-auth-004/007/012.
- **Approved separation:** the server-side TOTP seed-encryption key is not a
  provider API key, human credential or session key. Changing/disabling a
  provider API key does not revoke human sessions; affected model calls may
  become unavailable. This does not add a provider-key-management UI or change
  the selected server-side provider-key ownership.
- **Approved outage behavior:** permit explicitly degraded application operation
  when the TOTP key is unavailable. Otherwise-valid sessions continue. Password
  plus an unused recovery code may still sign in when independent verifiers and
  all other required services are available. No password-only MFA shortcut.
- **Approved affected operations:** TOTP verification and enrollment/replacement
  requiring the unavailable key fail explicitly as temporarily unavailable,
  not as an incorrect code. Report degraded state to the operator; never claim
  full authentication readiness. Do not use plaintext fallback, automatically
  reset factors or silently generate a replacement key.
- **Approved operations:** explicit host-admin provisioning of protected local
  key material outside source/database/logs; protected backup separate from
  database backup, with matched restore verification. Controlled versioned
  rotation re-encrypts the same seeds without user re-enrollment; retain old
  keys while retained backups need them. Restoring the correct key restores the
  affected capability. Irrecoverable loss uses explicit scoped offline host
  recovery, never a public bypass.
- **Correction recorded:** the original proposal to prevent all startup/readiness
  on missing keys was rejected/revised. The final approval is scoped degradation,
  not application-wide denial and not automatic session revocation.
- **Still open:** encryption algorithm, key identifiers/paths/permissions/commands,
  runtime reload/rotation/restore failure semantics, retention configuration,
  health/UI/API contracts and independent protection of other secret purposes.
- **Source reconciliation:** OD-11 and technical baseline clarify key/session/
  provider separation; global/scoped materials and coverage updated.
- **Verification criteria:** existing valid sessions and independent recovery
  login during key outage; key-dependent operations explicitly unavailable;
  no automatic factor/session reset, plaintext fallback or replacement key;
  operator-visible degraded readiness; provider-key changes do not sign out;
  matched restore/versioned rotation preserves seeds and account ownership.
- **Evidence:** user requested clarification of provider keys versus encryption
  keys, then explicitly answered true to the revised policy and proposed backup/
  rotation rules after a form returned no selection. No approval was inferred
  from that empty form. Documentation only; no implementation or live tests.

## DR-031: Recovery-code format and atomic standalone regeneration

- **Date / decision owner:** 2026-10-30 / user.
- **Proposal / ambiguities:** AMB-native-auth-004/005/008/012.
- **Approved format:** each of ten codes contains 128 random bits, displayed as
  32 hexadecimal characters grouped in eight blocks of four. Accept upper/lower
  case and optional grouping hyphens; store only verifiers, never retrievable
  codes. This does not add restrictions to passwords.
- **Approved standalone regeneration:** keep the current set until the new
  once-shown set is acknowledged as saved; atomically activate the new set and
  revoke the old. Require the existing ten-minute recent-auth confirmation at
  start/restart and final completion; reuse valid confirmation.
- **Approved pending lifecycle:** use the existing 24-hour pending-setup
  lifetime for a standalone pending code set. Cancellation, expiry or lost
  display before completion discards only that pending set. Authentication-
  consumed codes remain consumed. Stale tabs cannot activate an obsolete set.
- **Approved post-commit interruption:** a lost response after completion does
  not roll back or redisplay codes. Show nonsecret completion status and allow
  fresh regeneration. Do not promise that the old set remains valid after commit.
- **Approved session effects:** successful regeneration revokes other sessions
  and rotates/retains the current session without extending its original
  absolute deadline, as with authenticator replacement.
- **Approved exhaustion:** use the existing authenticator to sign in/regenerate
  when no recovery codes remain. If all second factors are lost, use approved
  offline host recovery. Concurrent use of one code can succeed only once.
- **Preserved initial setup:** DR-026 still governs interrupted initial
  enrollment and authenticator replacement. Standalone code regeneration does
  not replace the active authenticator seed.
- **Still open:** verifier algorithm, exact acknowledgement/status UI/API,
  race/failure transport and concrete transactional/session binding contracts.
- **Source reconciliation:** AUTH-004/006/008 OD-11 refinements and technical
  baseline, global/scoped registers, recommendations, coverage and handoff
  updated; no REQ IDs added/renumbered.
- **Verification criteria:** ten 128-bit codes/32 hex digits/eight groups;
  case/hyphen entry; verifier-only storage; old-set validity before commit and
  rejection after; pending cancellation/expiry/lost display; consumed-code
  permanence; recent-auth checkpoints; single-use races/stale tabs; lost commit
  response/nonsecret status; session rotation/revocation and exhaustion guidance.
- **Evidence:** user approved format and regeneration in the original guided
  form while requesting revision of the separate key policy. Documentation only;
  no executable browser, persistence, cryptography or session tests have run.

## DR-032: Consolidated host, gateway-revocation and session behavior

- **Date / decision owner:** 2026-10-30 / user.
- **Proposal / ambiguities:** AMB-native-auth-006/007/008/009/010/012.
- **Approved host authority:** trusted local host administration, one exact
  account, explicit reason/confirmation. Atomic state change and secret-free
  audit; unavailable database/audit commit means explicit failure, not success.
  Repeated grant/revoke/disable is safe and reports already-in-state.
- **Approved recovery handoff:** preserve email/password/private ownership;
  revoke sessions, factors, pending authentication and gateway entitlement.
  Create no signed-in session and disclose no data/secrets. The human returns
  with their password or approved email reset for setup-only re-enrollment,
  then needs a new explicit gateway grant. Recovery does not silently re-enable
  a disabled account. No separate public/bootstrap administrator account.
- **Approved gateway ordering:** grant only enabled, verified, fully enrolled
  accounts. After revoke/disable/recovery commits, block later admissions and
  not-yet-dispatched upstream calls; order dispatch authorization consistently
  with revocation, not stale cached grants. Already-dispatched calls may finish:
  upstream work/cost cannot be retracted. No follow-on authority; revoked human
  sessions cannot read protected results. No automatic entitlement restoration.
- **Approved activity/deadlines:** successful deliberate protected navigation,
  manual refresh and authorized changes renew inactivity, not polling/prefetch/
  static assets. Sessions fail exactly at the 30-day absolute or seven-day idle
  deadline. Recent full auth is reusable through ten minutes inclusive, bound
  to the same account/current session; shared-session tabs share it, distinct
  sessions do not.
- **Approved concurrency:** enforce logout/revocation on later server-side
  authorization checks. Sensitive changes recheck current account/session/factor
  state at commit: stale tabs cannot undo revocation or activate obsolete factors.
  Retained/rotated current sessions carry only still-valid recent-auth confirmation,
  preserving its original timestamp and absolute session deadline; other sessions
  do not inherit it.
- **Engineering delegation:** user was told ordinary command/cookie/CSRF/
  encryption/verifier details would be drafted in the design, not individually
  submitted as preference questions. This does not approve unreviewed design.
- **Still open:** concrete commands/authority proof, dispatch ordering mechanism,
  audit schema, exact contracts and native setup/measurements. Numerical abuse/
  delivery limits remain explicitly deferred pending review/measurement.
- **Source reconciliation:** OD-11 and scoped/global registers, recommendations,
  coverage and handoff updated. Domain model and draft intent may now be derived
  from settled core behavior; intent approval remains separate.
- **Verification criteria:** scoped/idempotent audited host operations and
  rollback; recovery handoff/disabled-state preservation; grant eligibility;
  before/after dispatch revocation; no follow-on/read authority from revoked
  sessions; activity/expiry/recent-auth boundaries; shared/distinct sessions;
  stale-factor/session rejection at commit and preserved confirmation timestamps.
- **Evidence:** user approved recommendations A, B and C in one guided form.
  No application implementation, installation, freeze or test execution approved.

## DR-033: Native-auth intent v0.1 approved

- **Date / decision owner:** 2026-10-30 / user.
- **Artifact:** [Native-auth intent v0.1](./native-auth/04-intent-v0.1.md).
- **Approved raw SHA-256:**
  `5AB84C0B99BDCAB8BF9C419AF6E55C958D1B159E8FFB155F7DE926EA042E6981`.
- **Approved scope:** the bounded behavioral intent derived through DR-032:
  mail/link lifecycle; mandatory MFA/enrollment/replacement/recovery codes;
  persistent sessions/recent authentication/concurrent revocation; scoped
  TOTP-key degradation; local host operations and gateway dispatch/revocation.
- **Explicit open gates:** numerical abuse/delay/source and delivery/queue limits;
  exact UI/API/copy, engineering/crypto/hash/session/audit/dispatch contracts;
  native dependency/tooling baseline and resource measurements. This approval
  closes none of those gaps and approves no installation, acceptance freeze,
  implementation design or application implementation.
- **Version integrity:** approval status lives here, not by rewriting the
  approved intent. Material changes require a new version and explicit review;
  future as-built diagrams remain separate.
- **Next workflow phase:** concrete frontend acceptance-scenario preparation
  from the approved requirements/intent, with missing exact/numerical oracles
  explicitly blocked. Then shared contracts, native baseline, design/tasks,
  review, freeze, genuine red acceptance and lock before implementation.
- **Evidence:** user selected "Approve this exact v0.1 intent with the stated
  open gates" after the exact path/fingerprint and scope were presented.
- **Verification status:** approval is not an application/browser result.
  Preserve the approved bytes and verify their fingerprint on resumption.

## DR-034: Deadline equality and composed native-auth intent v0.2 approved

- **Date / decision owner:** 2026-10-30 / user.
- **Artifact:** [Native-auth intent v0.2 deadline addendum](./native-auth/04-intent-v0.2.md).
- **Approved addendum raw SHA-256:**
  `7FD646D33431671BED907282FE7735DA1F1E6427BECF0A9AD8B019B8A368EE99`.
- **Unchanged incorporated v0.1 raw SHA-256:**
  `5AB84C0B99BDCAB8BF9C419AF6E55C958D1B159E8FFB155F7DE926EA042E6981`.
- **Approved cleanup equality:** for a still-never-verified registration, R is
  the later of creation/latest actually issued verification link, D = R + seven
  days. At t < D time alone does not permit removal; at t >= D it is eligible.
  A cleanup evaluation committing removal exactly at D removes it. This is not
  a promise of exact-instant background scheduling; existing resend/verified
  account protections and concrete race/transaction design gates remain.
- **Approved pending equality:** pending enrollment/standalone code sets are
  eligible for completion only while t < creation + 24 hours, with all other
  guards holding. Exactly at or after expiry, reject without activating pending
  factors/codes. Preserve initial-access restrictions and active-factor/
  consumed-code standing under the existing pending-only expiry rules.
- **Version integrity:** v0.2 consists of the approved immutable v0.1 behavior/
  diagrams plus this immutable addendum. Neither approved file is overwritten;
  material subsequent changes require a further version/review.
- **Scenario reconciliation:** SCN-native-auth-005 and -037 now have exact
  oracles. SCN-037 enumerates enrollment and standalone code sets independently.
  SCN-012/024/079/080 remain unspecified/blocked; Phase 3 is not passed.
- **Explicit limits:** no verifier/evidence/numerical-limit contract, resource
  measurement, installation, application implementation, freeze or test execution
  is approved by this clarification.
- **Evidence:** user selected approval of the exact v0.2 addendum and its unchanged
  v0.1 base after both clauses, scope and addendum fingerprint were presented.
- **Status:** documentation approval, not a passed runtime acceptance result.

## DR-035: Entire Phase 1 pre-implementation readiness and local setup authorized

- **Date / decision owner:** 2026-10-30 / user.
- **Approved scope:** entire confirmed Phase 1 preparation, not only native auth
  or timeline. Deferred features are not reinstated.
- **Approved finish line:** reviewed specification/contracts/design/task package,
  frozen acceptance expectations and genuine feature-missing red browser
  acceptance tests locked before feature implementation.
- **Approved setup:** bounded project-local downloads/tooling/dependencies and
  isolated loopback measurements/services; no global installation, system PATH
  changes, unrelated-project modification, real outbound email, production
  credentials or feature implementation.
- **Preserved gates:** observable policy changes and final design/freeze review
  still need explicit approval. Setup permission does not approve candidate
  crypto costs, numerical limits or invented acceptance oracles.
- **External feasibility limits:** existing per-client/WSL/live-account
  prerequisites are not silently waived or claimed verified. Record actual
  capability evidence and any user-controlled blockers honestly.
- **Evidence:** user chose entire Phase 1, the full pre-implementation gate, and
  project-local setup authorization in one scope/setup form.

## DR-036: Staged prerequisite implementation authorized; WSL remains external

- **Date / decision owner:** 2026-10-30 / user.
- **Approved dependency sequencing:** prerequisite increments may be implemented
  and verified only after each increment's approved design, freeze, genuine
  feature-missing red acceptance and test-lock gates. Continue readiness for
  downstream increments afterwards; do not substitute missing-auth failures
  for independent correct-reason downstream acceptance.
- **Preserved target:** Windows with WSL remains the client-feasibility target.
  The user will perform missing WSL/client setup; record that external gate
  as blocked. No Windows-native substitution or distro installation is approved.
- **Scope limits:** DR-035 local-tool authorization still applies; no global
  changes, unrelated projects, production credentials or real outbound email.
  This is staged permission, not an assertion that any design/freeze/lock or
  implementation gate has already passed.
- **Evidence:** user selected staged prerequisite implementation after its own
  gates and retained user-performed Windows-with-WSL setup in the dependency form.

## DR-037: Native-auth verifier/evidence/admission intent v0.3 approved

- **Date / decision owner:** 2026-10-30 / user.
- **Artifact:** [Native-auth intent v0.3](./native-auth/04-intent-v0.3.md).
- **Approved raw SHA-256:**
  `C78BDBA0B2839F9D907159D4C60391B85EBFC119ADC5CF531629F9B4662A7F67`.
- **Composition:** incorporates immutable approved v0.1/v0.2 with their recorded
  fingerprints. Preserve all three files; changes require another version/review.
- **Approved additions:** current/legacy Argon2id profiles and safe upgrade;
  one active hash job/four waiting/two-second authority bound; narrow seven-
  sample Java reference thresholds; account/set-bound recovery verifiers,
  authenticated seed encryption/randomness; exact rolling-window admission,
  progressive cooldown, finite state/queue/retry/send bounds; explicit trusted-
  proxy source identity; complete exported-evidence inventory and secret safety.
- **Numerical-deferral change:** this replaces the earlier auth-specific
  numerical deferral with the exact v0.3 demo policy. It does not approve the
  unrelated global guard/gateway/event/transport capacity proposals.
- **Measurement limitation:** actual sequential Java 25 hash observations informed
  review; approval is not proof of end-to-end authentication throughput, a
  production percentile, concurrent capacity or whole-service memory bounds.
- **Scenario effect:** replace the missing oracles in SCN-012/024/079/080 with
  these approved expectations and append any necessary independent boundary
  cases without renumbering existing SCNs. Execution/native-design gates remain.
- **Preserved permissions:** DR-036 permits prerequisite feature implementation
  only after its own reviewed design, freeze, genuine red acceptance and lock.
  Windows-with-WSL client setup remains an external user-controlled block.
- **Evidence:** user approved the exact v0.3 profile and its stated measurement
  limits after the file fingerprint, proposed policy counts and scope were
  presented. This is not a passed acceptance, design or freeze gate.

## DR-038: Browser line-break compatibility intent v0.4 approved

- **Date / decision owner:** 2026-10-30 / user.
- **Artifact:** [Native-auth intent v0.4](./native-auth/04-intent-v0.4.md).
- **Approved raw SHA-256:**
  `40761C1AD0C1233339B301F17DF6D483B4D6078D6B2CA4D5AB3BC4E62F1622EE`.
- **Reason:** isolated real Chromium input observation showed native password
  controls remove CR/LF and textareas normalize CR/CRLF. This is platform
  feasibility, not application behavior or a password-strength argument.
- **Approved narrow refinement:** keep 12-128 Unicode-code-point length and
  other allowed content, including NUL. Reject CR/LF when the application
  receives them and reject raw pasted line breaks before native sanitization
  when observable. Do not silently transform otherwise permitted password text.
- **Preserved behavior:** ordinary passphrase paste/autofill, no composition/
  encoding-choice/periodic-change rules, generic account-private authentication
  outcomes and all v0.3 verifier/session/evidence/admission policies remain.
  Do not promise to recover original external/autofill text already sanitized
  by a native browser control.
- **Version integrity:** v0.4 composes with immutable approved v0.1/v0.2/v0.3.
  Preserve every approved artifact; exact shared wire/copy still needs review.
- **Evidence:** user approved the exact v0.4 browser-compatibility addendum and
  preservation of other rules after its fingerprint and observed limitation
  were presented. No feature implementation or acceptance pass is implied.
