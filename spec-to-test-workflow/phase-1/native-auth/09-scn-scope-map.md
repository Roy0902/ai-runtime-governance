# Native-auth SCN-to-contract scope map

Version: 0.1. Prepared: 2026-11-01.
Status: **Approved under DR-039 (2026-11-01): 49 Browser / 45 API. Not frozen.**

Every SCN in [05-scenarios.md](./05-scenarios.md) appears exactly once. `Browser`
means the tagged acceptance test lives in `tests/specs/native-auth.spec.ts` and
drives the real UI through the real backend. `API` means the tagged acceptance
test lives in `tests/api/native-auth.spec.ts` and exercises the real service or
host boundary. API is not a unit test and does not replace browser coverage for a
browser-observable journey.

Operations are named as in the machine contract; `CLI` items are in
[08-operator-contract.md](./08-operator-contract.md).

## 1. Registration, lifecycle and mail (001–012)

| SCN | Surface | Operations | Level | Key harness need |
|---|---|---|---|---|
| 001 | Register → verify → enroll → complete | `registerAccount`, `consumeVerification`, `establishSetupAccess`, `startEnrollment`, `completeEnrollment`, `readOwnAccount` | Browser | Mail capture; generated TOTP; scope assertion |
| 002 | Register duplicate variant | `registerAccount` | Browser | Two identities; normalized-email assertion |
| 003 | Duplicate signup | `registerAccount` | Browser | Mail count unchanged |
| 004 | Protected access before completion | `readOwnAccount`, `establishSetupAccess`, `signIn` | Browser | All incomplete standings |
| 005 | Seven-day pending cleanup | cleanup worker | API | Controlled clock at `-1s`, `=`, `+1s` |
| 006 | Issued mail extends retention | cleanup worker, `resendVerification` | API | Link issuance timestamps |
| 007 | Verified survives enrollment expiry | `completeEnrollment`, `signIn`, `establishSetupAccess` | Browser | Clock past 24h |
| 008 | Purpose-bound mail eligibility | `resendVerification`, `requestPasswordReset` | Browser | Mail capture; all standings |
| 009 | Durable admission outage | `registerAccount`, `resendVerification` | Browser | Fault injection before commit |
| 010 | Accepted ≠ delivered | mail worker | API | Stop SMTP, then recover |
| 011 | Delivery rechecks authority | mail worker | API | Consume/supersede/disable between admission and send |
| 012 | Exact admission profile | `registerAccount`, `resendVerification`, `requestPasswordReset` | API | Clock; source/identity buckets |

## 2. One-use links and reset (013–023)

| SCN | Surface | Operations | Level | Key harness need |
|---|---|---|---|---|
| 013 | Opening does not consume | `readAuthContext`, `consumeVerification` | Browser | Two visits, one confirm |
| 014 | Strict expiry | `consumeVerification`, `consumePasswordReset` | API | `expiry-1s/=/+1s` |
| 015 | Supersession per purpose | `resendVerification`, `requestPasswordReset` | Browser | Two links, old/new |
| 016 | Failed issuance preserves old | `resendVerification` | API | Fail new issuance |
| 017 | Invalid new password keeps link | `consumePasswordReset` | Browser | 11-code-point password |
| 018 | Concurrent consumption | `consumeVerification`, `consumePasswordReset` | API | DB barrier, two transactions |
| 019 | Rollback does not consume | `consumePasswordReset` | API | Failure after validation |
| 020 | Unusable link cannot mutate | `consumeVerification`, `consumePasswordReset` | Browser | Expired/consumed/superseded |
| 021 | Reset issuance keeps sessions | `requestPasswordReset`, `readOwnAccount` | Browser | Existing session still valid |
| 022 | Reset revokes sessions, keeps MFA | `consumePasswordReset`, `signIn` | Browser | Two sessions; TOTP still required |
| 023 | Reset of incomplete account | `consumePasswordReset`, `establishSetupAccess` | Browser | Verified-not-enrolled fixture |

## 3. Password input and sign-in partitions (024–029)

| SCN | Surface | Operations | Level | Key harness need |
|---|---|---|---|---|
| 024 | Verifier profile and native reference | verifier service | API | Native measurement; no HTTP |
| 025 | Length-only range | `registerAccount`, `changePassword` | Browser | 11/12/128/129 code points |
| 026 | Text classes counted | `registerAccount`, `signIn` | Browser | Spaces, symbols, NUL, non-ASCII |
| 027 | Exact text preserved | `registerAccount`, `signIn` | Browser | Distinct near-equal passwords |
| 028 | Paste/autofill does not change credential | `signIn` | Browser | Paste and autofill simulation |
| 029 | Generic sign-in failure | `signIn` | Browser | Unknown/wrong/disabled parity |

## 4. Enrollment, TOTP and recovery codes (030–050)

| SCN | Surface | Operations | Level | Key harness need |
|---|---|---|---|---|
| 030 | Setup secrets shown once | `startEnrollment`, `readEnrollment` | Browser | Reload/back/close; no readback |
| 031 | TOTP window | `completeEnrollment`, `signIn` | Browser | Current ±1/±2 steps |
| 032 | Step replay | `signIn` | Browser | Same step twice |
| 033 | Concurrent TOTP acceptance | `signIn` | API | Two parallel transactions |
| 034 | Completion needs code + acknowledgement | `completeEnrollment` | Browser | Each missing dimension |
| 035 | Lost display restart | `restartEnrollment`, `readEnrollment` | Browser | Password confirmation; old secrets invalid |
| 036 | Pending lifetime | `readEnrollment`, `completeEnrollment` | Browser | Clock before/after 24h |
| 037 | Exact pending expiry | `completeEnrollment` | API | `expiry-1s/=/+1s` |
| 038 | Incomplete replacement preserves factor | `startAuthenticatorReplacement`, `signIn` | Browser | Cancel/expire mid-replacement |
| 039 | Atomic replacement swap | `completeAuthenticatorReplacement`, `readOwnAccount` | Browser | Old factor/codes invalid after |
| 040 | Superseded replacement | `startAuthenticatorReplacement`, `completeAuthenticatorReplacement` | Browser | Stale operation id |
| 041 | Recent auth at each stage | `startAuthenticatorReplacement`, `completeAuthenticatorReplacement` | Browser | Expire confirmation between stages |
| 042 | Recovery-code representation | `startEnrollment`, `readSecurityOperation` | Browser | Format/case/hyphen entry; no readback |
| 043 | Recovery login creates ordinary authority | `signIn` | Browser | Password + unused code |
| 044 | Recovery code is not standalone/transferable | `signIn` | Browser | Code alone; other account |
| 045 | Concurrent code use | `signIn` | API | Two parallel transactions |
| 046 | Pending codes do not replace active | `startRecoveryCodeGeneration`, `signIn` | Browser | Old codes still work |
| 047 | Acknowledged regeneration swaps set | `completeRecoveryCodeGeneration`, `readOwnAccount` | Browser | Old codes invalid; other sessions revoked |
| 048 | Lost completion response | `completeRecoveryCodeGeneration`, `readSecurityOperation` | Browser | Reload; no redisplay |
| 049 | Exhausted codes do not bypass MFA | `signIn` | Browser | All ten consumed |
| 050 | Cancelled regeneration | `cancelSecurityOperation`, `signIn` | Browser | Consumed/stale code unchanged |

## 5. Sessions, sensitive changes and ownership (051–063)

| SCN | Surface | Operations | Level | Key harness need |
|---|---|---|---|---|
| 051 | Browser restart preserves session | `readAuthContext`, `readOwnAccount` | Browser | Persistent context |
| 052 | Either deadline ends session | `readOwnAccount` | Browser | Clock at both deadlines |
| 053 | Only deliberate activity renews | `readOwnAccount`, `readAuthContext` | Browser | Polling/prefetch/static requests |
| 054 | Rejected action does not renew | `changePassword`, `readOwnAccount` | Browser | Failed CSRF/validation |
| 055 | Ordinary access needs no MFA | `readOwnAccount` | Browser | Full journey without step-up |
| 056 | Recent auth reusable, not OTP replay | `confirmRecentAuthentication`, `changePassword` | Browser | Two actions in ten minutes |
| 057 | Confirmation bound to account/session | `confirmRecentAuthentication`, `changePassword` | API | Two sessions; two accounts |
| 058 | Signed-in password change session effects | `changePassword`, `readAuthContext` | Browser | Two sessions; current rotated |
| 059 | Ended session rejected later | `signOut`, `readOwnAccount` | Browser | Back/refresh after sign-out |
| 060 | Stale account/factor at commit | `completeAuthenticatorReplacement` | Browser | Concurrent disable/replace |
| 061 | Rolled-back sensitive completion | `completeRecoveryCodeGeneration` | API | Transaction failure |
| 062 | Cannot select another account | `readOwnAccount`, `readSecurityOperation` | Browser | Guessed UUID/scope |
| 063 | Replacement/recovery cannot create scope | `completeAuthenticatorReplacement`, `establishSetupAccess` | Browser | Scope count before/after |

## 6. Host authority, gateway and degraded capability (064–082)

| SCN | Surface | Operations | Level | Key harness need |
|---|---|---|---|---|
| 064 | Host authority cannot be forged | HTTP surface, CLI | API | Public endpoint absence; spoofed headers |
| 065 | Host change + audit atomic | CLI | API | DB failure before/after commit |
| 066 | Repeated host changes safe | CLI | API | Repeat each command |
| 067 | Recovery handoff not impersonation | CLI, `establishSetupAccess` | API | No session created; setup-only |
| 068 | Recovery does not re-enable | CLI, `signIn` | API | Disabled account |
| 069 | Re-enable revives nothing | CLI, `signIn` | API | Old session/token/grant |
| 070 | Gateway grant eligibility | CLI | API | All eligibility dimensions |
| 071 | Revocation vs dispatched work | CLI, dispatch service | API | Committed ordering |
| 072 | Concurrent dispatch/revocation | CLI, dispatch service | API | DB barrier |
| 073 | Host budget ≠ private read | CLI, `readOwnAccount` | API | Operator cannot read trace/prompt/key |
| 074 | Missing TOTP key preserves sessions | key outage, `readOwnAccount` | API | Key unavailable injection |
| 075 | Key-dependent action unavailable | `signIn`, `completeEnrollment` | API | No wrong-code response |
| 076 | Provider credentials ≠ human sessions | provider-key change, `readOwnAccount` | API | Credential rotation |
| 077 | Key rotation/restore | CLI, seed service | API | Fresh nonces; matched restore |
| 078 | Password age does not force change | `signIn`, `readOwnAccount` | API | Old credential still valid |
| 079 | Evidence surface complete | exported evidence | API | Inspect every artifact class |
| 080 | Cooldown clears on success | `signIn` | API | Failure history, then success |
| 081 | Recovery-verifier outage | `signIn` | API | Dependency failure |
| 082 | Revoked session cannot read dispatched result | dispatch service, `readOwnAccount` | API | Revoke after dispatch |

## 7. Abuse, source identity and bounded work (083–094)

| SCN | Surface | Operations | Level | Key harness need |
|---|---|---|---|---|
| 083 | Malformed request is not a password rule | `registerAccount`, `signIn` | API | Shape/transport faults |
| 084 | Source caps | admissions | API | 30/60s; 10/hour |
| 085 | Cooldown from failures only | `signIn` | API | Service/queue errors excluded |
| 086 | Rolling-window equality | admissions | API | `window-1s/=/+1s` |
| 087 | Trusted source identity | proxy config | API | Untrusted peer; trusted chain; malformed XFF |
| 088 | Finite throttle state | admissions | API | 10,000 buckets; no live eviction |
| 089 | Hash admission bound | hash service | API | 1 active + 4 waiting; 2s deadline |
| 090 | Mail retry bound | mail worker | API | 3 attempts, 60/240s, 10s timeout |
| 091 | Reviewed verifier profiles only | verifier service | API | Predecessor/unsupported/malformed |
| 092 | Rehash vs concurrent reset | verifier service | API | Two transactions |
| 093 | Seed protection rejects modified values | seed service | API | Tampered/wrong-key ciphertext |
| 094 | Received line breaks rejected | `registerAccount`, `changePassword`, `consumePasswordReset` | Browser | Browser paste path + direct API CR/LF |

## 8. Coverage counts

| Level | SCNs | Purpose |
|---|---|---|
| Browser | 49 | Real UI + backend + persisted state |
| API | 45 | Service/CLI/worker boundaries that the browser cannot truthfully exercise |
| Total | 94 | Every SCN has one designated acceptance file |

The API-level cases are still acceptance tests against the real running service
or real host command. They are not unit tests and do not replace a browser case
where the behavior is user-visible. `@supporting` scenarios (024, 042, 077, 079,
091–093) additionally require their supporting inspection, but their locked
acceptance tag is the level shown.

A browser journey that depends on an API-level-only behavior (for example a rate
limit) still asserts the resulting user-visible state in at least one Browser SCN;
the API row proves the exact boundary that the UI cannot densely enumerate.

## 9. Still open

1. Approval of the 49/45 split.
2. Whether `005`, `006`, `010`, `011` and `090` need a visible admin status page
   in the first increment, or API-level acceptance is sufficient.
3. Final test file names and tag placement.
4. Whether host CLI cases run in the same API project or a separate tagged file.
