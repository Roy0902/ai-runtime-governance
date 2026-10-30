# Native authentication intent v0.1

Version: 0.1. Prepared: 2026-10-30.
Approval status is recorded in the [confirmation record](../05-decision-record.md),
not by rewriting this versioned artifact. Submission for review does not imply
approval. This artifact alone does not freeze acceptance, approve an implementation
design or authorize dependency installation. As-built diagrams must be separate.

## 1. Authority, scope and review boundary

Derived from [requirements](../../../REQUIREMENTS.md), AUTH-001 through AUTH-009
and OD-11; [decisions](../05-decision-record.md), through DR-032; the
[scoped register](./00-ingestion.md), version 0.10; and the
[domain model](./03-domain-model.md), version 0.1.
Below, `REQ-001` abbreviates `REQ-native-auth-001`, and similarly for -002 to -011.

The diagrams describe approved core behavior, not invented routes, copy,
identifiers, storage schemas or cryptographic parameters. Failure/retry paths
must preserve authority and one-use semantics; a dependency failure is never
successful completion or an incorrect-factor diagnosis.

Outstanding design/acceptance gates:

- AMB-native-auth-011: numerical abuse/delay/source and delivery/queue limits
  still require review/measurement. "Policy permits" is a visible unresolved
  guard, not a numeric acceptance oracle.
- AMB-native-auth-001 through -010/-012: concrete command/authority/audit,
  crypto/verifier/hash/rehash, cookie/CSRF/session binding, exact UI/API/copy,
  transactional/dispatch ordering and failure/retry contracts require design
  and review. None may silently change the behavior here.
- Native dependency pins, Java/Maven setup, browser/backend/mail/persistence
  harness and resource measurements are not established.
- No timeline approval controls, provider-key-management UI, workspace model,
  deletion/erasure or verified-email recycling are added.

Intent approval, if obtained, records this file's raw SHA-256 separately.
After approval, material intent changes require a new version and review.
This intent is separate from any future as-built diagram.

## 2. Mail requests and one-use confirmation

Trace: REQ-001/009/011; DR-019/020/027/028.

Eligibility is fixed, not inferred from a live response:

| Request | Eligible mail target | Other states |
|---|---|---|
| New signup | New enabled, never-verified registration | Duplicate signup changes no password/enrollment and sends no mail |
| Explicit verification resend | Enabled, never-verified registration | Generic acknowledgement; no mail |
| Password reset | Enabled, verified account, including incomplete initial enrollment | Generic acknowledgement; no mail |

```mermaid
flowchart TD
    M0["Signup, explicit resend or reset request"] -->|"request received"| M1{"Abuse policy permits?<br/>AMB-011 numeric review pending"}
    M1 -->|"no"| ML["Temporary limit outcome; no permanent account lock"]
    M1 -->|"yes"| M2["Classify eligibility using the declared matrix"]
    M2 -->|"eligible or ineligible"| M3{"Common durable work admission commits?<br/>Eligible link issuance/supersession is atomic"}
    M3 -->|"no"| MF["Generic temporary-service error; previous link stays valid"]
    M3 -->|"yes"| MA["Generic accepted-work acknowledgement; not delivery assurance"]
    MA -->|"accepted work evaluated"| M4{"Eligible and still current,<br/>unexpired and enabled?"}
    M4 -->|"no"| MN["No send; do not revive expired or superseded authority"]
    M4 -->|"yes"| MS["Attempt asynchronous delivery"]
    MS -->|"delivered"| MD["Mail may arrive; only the current link can work"]
    MS -->|"delivery failed"| MR{"Retry policy permits and<br/>authority remains eligible?"}
    MR -->|"yes; bounded policy pending"| MS
    MR -->|"no"| MO["Secret-free operator failure report; no address-specific public status"]
```

Ineligible requests share admission/outage behavior without sending mail.
Old in-flight/delivered mail cannot be recalled; guide users to the newest link.
Workers recheck eligibility before each attempted send.

```mermaid
flowchart TD
    L0["Open verification/reset link"] -->|"open only"| L1["Do not consume authority"]
    L1 -->|"explicit confirmation or valid new-password submission"| L2{"Current, enabled, unconsumed,<br/>server time strictly before expiry?"}
    L2 -->|"no"| LF["No state change; unusable-link outcome"]
    L2 -->|"yes"| L3{"Purpose-specific validation succeeds?"}
    L3 -->|"no"| LV["Validation outcome; link remains unconsumed"]
    L3 -->|"yes"| L4{"Atomic consumption and state change commit?"}
    L4 -->|"rollback or lost race"| LR["No claimed success; rollback does not consume"]
    L4 -->|"verification committed"| LE["Email verified; no protected access before full enrollment"]
    L4 -->|"reset committed"| LP["Password changed; all sessions revoked; MFA/setup restrictions retained"]
```

Verification expires after 24 hours; reset after 30 minutes. Exactly at expiry
fails. Concurrent consumption has at most one success. Issuing reset authority
does not log the human out; successful reset does.

## 3. Enrollment, replacement and standalone code regeneration

Trace: REQ-001/002/004/006/007/010; DR-021/024/025/026/027/029/030/031/032.

| Journey | Authority before starting/restarting | Completion requirements | Preserved on pre-commit interruption |
|---|---|---|---|
| Initial enrollment | Verified enabled identity with setup-only authority; explicit restart confirms password | Valid candidate TOTP plus saved-code acknowledgement; current unexpired attempt | No protected access; restart invalidates old pending values/stale attempts |
| Post-host-recovery enrollment | Enabled verified identity using password or approved reset, setup-only | Valid candidate TOTP plus saved-code acknowledgement | Existing private ownership, but no restored sessions or gateway grant |
| Authenticator replacement | Same-account/session full auth through ten minutes inclusive | Valid new TOTP, saved new codes, current attempt and still-valid recent auth | Active authenticator/code set; already-consumed authentication codes remain spent |
| Standalone code regeneration | Same-account/session full auth through ten minutes inclusive | Saved new-code acknowledgement, current attempt and still-valid recent auth | Active code set and authenticator; already-consumed authentication codes remain spent |

```mermaid
flowchart TD
    E0["Start or explicitly restart the selected journey"] -->|"request received"| E1{"Required authority and current<br/>account state valid?"}
    E1 -->|"no"| EF["Deny or require appropriate authentication; no protected shortcut"]
    E1 -->|"yes"| E2{"Operation needs TOTP encryption key?"}
    E2 -->|"yes"| E3{"Required key available?"}
    E3 -->|"no"| EU["Explicit temporary unavailability; report degraded capability"]
    E3 -->|"yes"| EP["Create current pending candidate; invalidate superseded pending attempt"]
    E2 -->|"no; standalone codes"| EP
    EP -->|"pending values issued"| ED["Show applicable setup values once; collect required completion evidence"]
    ED -->|"cancel, expire or lose display before commit"| EC["Discard pending attempt only; follow journey-specific restart rule"]
    ED -->|"submit applicable TOTP and saved-code acknowledgement"| E4{"Candidate requirements, current attempt,<br/>account/session/factor and recent-auth guards hold?"}
    E4 -->|"no"| ER["No completion; expose applicable validation, stale or expiry outcome"]
    E4 -->|"yes"| E5{"Atomic completion commits?"}
    E5 -->|"no; rollback or stale race"| EX["No claimed completion; no obsolete activation"]
    E5 -->|"initial or recovery enrollment committed"| EA["Activate verified factors; establish scope only if first enrollment"]
    E5 -->|"replacement committed"| EB["Swap authenticator/code set; revoke other sessions; rotate current"]
    E5 -->|"standalone codes committed"| EG["Swap code set only; revoke other sessions; rotate current"]
    EG -->|"completion response lost"| ES["Nonsecret completion status; fresh generation allowed; no readback or rollback"]
```

- Pending enrollment and standalone code sets last 24 hours.
- TOTP: six digits/30-second step, current step plus/minus one, one acceptance
  per account/time step. No replay to refresh recent confirmation.
- Recovery sets: exactly ten codes, each 128 random bits, 32 hex characters in
  eight groups of four; accept upper/lower case and optional grouping hyphens.
  Store only verifiers. No later secret readback.
- Replacement/regeneration final completion checks recent authentication again.
  Consumed authentication codes remain consumed after cancellation.
- Completion cannot restore revoked authority or extend the retained session's
  original absolute deadline. Initial scope creation is once-only; recovery
  preserves it and still needs an explicit eligible-account gateway grant.
- Password content restriction is length only, 12-128 Unicode code points.
  Preserve exact text; no extra character/encoding/composition exclusions.

## 4. Login, session activity and authenticator unavailability

Trace: REQ-002/004/005/006/008/010/011; DR-007/023/025/029/030/032.

```mermaid
flowchart TD
    S0["Fresh enrolled-account sign-in"] -->|"request received"| S1{"Abuse policy permits?<br/>AMB-011 numeric review pending"}
    S1 -->|"no"| SL["Temporary limit outcome; never permanent account lock"]
    S1 -->|"yes"| S2{"Enabled, verified, enrolled<br/>and password valid?"}
    S2 -->|"no"| SF["Generic sign-in failure; no session"]
    S2 -->|"yes"| S3{"Second factor supplied"}
    S3 -->|"authenticator"| S4{"TOTP capability available?"}
    S4 -->|"no"| SU["Explicit dependency unavailability; no password-only shortcut"]
    S4 -->|"yes"| S5{"Time-window and one-use checks pass?"}
    S3 -->|"recovery code"| S6{"Independent verifier available<br/>and code unused/valid?"}
    S3 -->|"missing or invalid factor type"| SF
    S5 -->|"no"| SF
    S6 -->|"validity fails"| SF
    S6 -->|"required service unavailable"| SU
    S5 -->|"yes; atomic acceptance"| SA["Full authentication; create ordinary session and recent confirmation"]
    S6 -->|"yes; atomic one-use consumption"| SA
    SA -->|"later protected action"| S7{"Session/current account authorized<br/>and before both session deadlines?"}
    S7 -->|"no; including exact expiry"| SD["Deny; require eligible authentication"]
    S7 -->|"yes; successful deliberate action"| SR["Renew inactivity only; preserve absolute deadline"]
    S7 -->|"yes; polling/prefetch/static request"| SN["Do not renew inactivity"]
    SR -->|"later authorization check"| S7
    SN -->|"later authorization check"| S7
```

Existing sessions do not depend on provider API-key changes or TOTP-key
availability; ordinary authorization and all other required dependencies still
apply. Key-dependent actions fail explicitly and capability is reported degraded,
not fully ready. No automatic factor/session reset, plaintext fallback or silent
replacement key. Protected key provisioning, separate backup/matched restore and
versioned same-seed rotation remain host-managed, not user re-enrollment.

Recent confirmation is valid through ten minutes inclusive, bound to the same
account/current session. Shared-session tabs share it; other sessions do not.
Sensitive completion rechecks current account/session/factor state. A valid
confirmation carried through current-session rotation keeps its original time;
rotation never extends the original absolute session deadline.

## 5. Host operations and gateway revocation

Trace: REQ-004/007/008/010; DR-022/027/032.

```mermaid
flowchart TD
    H0["Request local host operation for one exact account"] -->|"operation received"| H1{"Trusted host authority,<br/>explicit reason and confirmation?"}
    H1 -->|"no"| HD["Deny; no state change or human impersonation"]
    H1 -->|"yes"| H2{"Requested grant satisfies<br/>enabled/verified/enrolled standing?<br/>Non-grant operation is scoped and applicable?"}
    H2 -->|"no"| HI["Explicit ineligible-operation failure"]
    H2 -->|"yes"| H3{"State change and secret-free audit<br/>commit atomically?"}
    H3 -->|"no; including dependency failure"| HF["Explicit failure; no claimed success"]
    H3 -->|"yes; grant/revoke/disable already in requested state"| HH["Report already-in-state safely"]
    H3 -->|"yes; grant"| HG["Grant budget eligibility only; no trace/prompt/provider-secret access"]
    H3 -->|"yes; disable"| HX["Disable; revoke sessions/pending auth/grant; retain private data"]
    H3 -->|"yes; re-enable"| HE["Restore authentication/setup eligibility; no revived tokens or grant"]
    H3 -->|"yes; recovery"| HR["Revoke sessions/factors/pending auth/grant; preserve identity/scope and disabled standing"]
    H3 -->|"yes; revoke"| HV["Revoke gateway entitlement"]
    HR -->|"human uses password or approved reset; account enabled"| HS["Setup-only re-enrollment; no host-created session; later explicit regrant"]
```

```mermaid
flowchart TD
    G0["Gateway admission or not-yet-dispatched work"] -->|"ordered authorization check"| G1{"Current account eligible and<br/>entitlement granted at admission/dispatch?"}
    G1 -->|"no; revoke/disable/recovery committed first"| GN["Deny new admission/dispatch; no stale cached grant authority"]
    G1 -->|"yes; dispatch authorized first"| GU["Already-dispatched upstream work may finish; work/cost not retractable"]
    GU -->|"follow-on call requested"| G0
    GU -->|"protected result read requested"| G2{"Current human/session still authorized?"}
    G2 -->|"no"| GD["Deny protected read"]
    G2 -->|"yes"| GA["Permit only own authorized result access"]
```

There is no public host-recovery/grant mechanism or bootstrap human administrator.
Concrete host authority proof, command syntax, secret-free audit schema and
dispatch/revocation ordering must be reviewed before implementation.

## 6. Approval and next gates

Review the model and transitions together. Approval of this version would approve
the bounded intent, not close numerical AMB-011 or approve an unreviewed design.
Next prepare concrete acceptance scenarios, one shared frontend/backend contract
and locator matrix, native tooling baseline, design and task lists. Resolve
blocking exact/numerical expectations before review/freeze/red acceptance/lock.

Native authentication must pass real frontend/backend acceptance before timeline
delivery uses it. No successful mocked login, forged session, unit-only
substitution or environment bypass is permitted.
