# Native authentication acceptance scenarios

Version: 0.3. Prepared: 2026-10-30.
Status: **Phase 3 catalog for contract/design handoff after structural checks.
Approved business oracles are concrete; no scenario has run, passed or been
frozen. Common contract/harness/native execution prerequisites remain open.**

## 1. Authority and interpretation

- [Requirements](../../../REQUIREMENTS.md), AUTH-001 through AUTH-009 and OD-11;
  [decisions](../05-decision-record.md), through DR-038.
- [Domain model v0.1](./03-domain-model.md).
- [Approved intent v0.1](./04-intent-v0.1.md), raw SHA-256
  `5AB84C0B99BDCAB8BF9C419AF6E55C958D1B159E8FFB155F7DE926EA042E6981`.
- [Approved v0.2 deadline addendum](./04-intent-v0.2.md), raw SHA-256
  `7FD646D33431671BED907282FE7735DA1F1E6427BECF0A9AD8B019B8A368EE99`;
  DR-034 approves its composition with the unchanged v0.1.
- [Approved v0.3 verifier/evidence/admission profile](./04-intent-v0.3.md), raw
  SHA-256 `C78BDBA0B2839F9D907159D4C60391B85EBFC119ADC5CF531629F9B4662A7F67`;
  DR-037 approves its composition and replaces auth-specific numerical deferral.
- [Approved v0.4 browser-compatibility addendum](./04-intent-v0.4.md), raw SHA-256
  `40761C1AD0C1233339B301F17DF6D483B4D6078D6B2CA4D5AB3BC4E62F1622EE`;
  CR/LF exclusion is a platform constraint, not a password-strength rule.
- [Scoped REQ/AMB register](./00-ingestion.md) and
  [frontend coverage plan](./02-acceptance-plan.md).

Expected states/counts/times below come from those authorities, not observations,
existing tests or a live application. Synthetic identities and relative times
are controlled examples, not additional production policy.

Each SCN ID identifies one scenario or outline, not one executed test. Every
outline row must become an independent planned case, not an authored executable
test. `@draft` means not frozen or run. Any newly discovered missing oracle must
be explicitly blocked and resolved before freeze, never guessed into green.
No scenario is presently execution-ready.

Common execution gates, not permission to weaken an oracle:

| Gate | Still needed | AMB groups |
|---|---|---|
| G-CONTRACT | Reviewed routes, shapes, statuses, exact copy, accessible semantic locators and action classification; no successful mocked screen | 001/002/003/007/008/012 |
| G-HARNESS | Actual browser/backend, isolated persistence/mail capture, controlled clock and deterministic concurrency/failure barriers, real local host operations | 004/005/006/009/010/012 |
| G-CRYPTO | Implement/review approved v0.3 mechanisms, key/transaction design and native checks; no generated secrets in committed fixtures or artifacts | 003/004/005 |
| G-LIMITS | Implement/verify exact approved v0.3 policy/source boundaries; do not infer whole-service capacity from native hash observations | 011 |
| G-SCOPE | Downstream trace/approval/runtime integrations are not silently required to implement the native-auth prerequisite | 008/010/012 |

State assertions are business oracles; exact copy/status assertions remain
G-CONTRACT, not values guessed here. Each failure must expose its approved
failure kind without claiming success. Unknown literal copy is not inferred
from an eventual screen.

## 2. Controlled acceptance vocabulary

- Accounts A and B have unrelated generated identities, credentials, factors and
  private scopes. Values such as "A" identify fixtures, never public authority.
- Passwords, TOTP seeds, recovery codes, links and session secrets are generated
  per case and held only in isolated test memory. No literal credential is
  supplied by this document.
- Unless varied, the account is enabled/verified/enrolled, required services work,
  the current session is before both deadlines, and abuse policy permits the
  action in isolated state. This is not a throttle bypass in production.
- Relative time is controlled server time, not sleep or the browser's clock.
  `expiry - 1s`, `expiry`, `expiry + 1s` are distinct deterministic instants.
- TOTP step N is the current 30-second step. Cases use generated factors/times
  whose candidate six-digit values do not collide with another tested window;
  this avoids a random collision invalidating an out-of-window example.
- Nonsecret host/failure support must exercise actual application authority and
  state transitions. It must not forge production sessions, substitute a library
  for browser acceptance or expose a public privileged fixture interface.
- `@supporting` adds evidence to the real browser journey; it never replaces
  browser/backend acceptance. Secret absence/entropy needs deliberate supporting
  evidence, not merely a plausible-looking code or an empty log.

## 3. Registration, lifecycle and mail

```gherkin
Feature: Pending registration and accepted mail requests

  @SCN-native-auth-001 @REQ-native-auth-001 @REQ-native-auth-007 @REQ-native-auth-010 @smoke @draft
  Scenario: Initial enrollment establishes one private scope without gateway budget
    Given a new account has no verification, completed enrollment, private scope or gateway entitlement
    When its email is explicitly verified and its first current enrollment completes with a valid TOTP and saved-code acknowledgement
    Then the account is verified and enrolled with exactly one private scope
    And its human may obtain ordinary authorized access but gateway entitlement remains absent

  @SCN-native-auth-002 @REQ-native-auth-001 @draft
  Scenario: Full-address trim and case normalization identify the same account
    Given a pending registration exists for "alice@example.test"
    When registration is submitted for "  Alice@EXAMPLE.TEST  "
    Then exactly one normalized account identity "alice@example.test" exists
    And its existing password and enrollment are unchanged

  @SCN-native-auth-003 @REQ-native-auth-001 @draft
  Scenario Outline: Duplicate signup does not replace authority or send new mail
    Given an account in standing <standing> already has its original password and current enrollment standing
    When signup for the same normalized identity supplies a different generated password
    Then the original password and enrollment standing remain unchanged
    And no new verification mail is issued and the public acknowledgement is generic
    Examples:
      | standing                  |
      | never-verified            |
      | verified, not enrolled    |
      | verified, enrolled        |

  @SCN-native-auth-004 @REQ-native-auth-001 @REQ-native-auth-007 @draft
  Scenario Outline: Incomplete signup has no protected authority
    Given account A has standing <standing>
    When A attempts protected private-scope access or gateway admission
    Then neither protected access nor gateway admission is authorized
    And no private scope is established by the rejected action
    Examples:
      | standing                                    |
      | never-verified, not enrolled                 |
      | verified, candidate TOTP not verified        |
      | verified, recovery codes not acknowledged   |

  @SCN-native-auth-005 @REQ-native-auth-001 @draft
  Scenario Outline: Pending cleanup uses the seven-day authority boundary
    Given a never-verified registration was created at C and its latest verification link was issued at I
    And R is the later of C and I
    When cleanup evaluates the registration at <time>
    Then the registration has outcome <outcome>
    Examples:
      | time            | outcome  |
      | R + 7 days - 1s | retained |
      | R + 7 days      | removed  |
      | R + 7 days + 1s | removed  |

  @SCN-native-auth-006 @REQ-native-auth-001 @draft
  Scenario: Only issued verification mail extends pending retention
    Given a never-verified registration has latest issued-link time I
    When an ordinary duplicate signup is accepted at D and an explicit eligible resend is issued later at J
    Then the duplicate does not change I
    And the successful issued resend changes the retention reference to J

  @SCN-native-auth-007 @REQ-native-auth-001 @REQ-native-auth-010 @draft
  Scenario: Verified identity survives an expired enrollment attempt
    Given account A is verified but its incomplete enrollment is older than 24 hours
    When the expired attempt is rejected and A starts an authorized new enrollment
    Then A remains the same verified account and may enroll again
    And expiry did not delete A, establish protected authority or create a private scope

  @SCN-native-auth-008 @REQ-native-auth-001 @REQ-native-auth-009 @REQ-native-auth-011 @draft
  Scenario Outline: Mail eligibility is purpose-bound without public enumeration
    Given a request of purpose <purpose> targets an identity with standing <standing>
    When common mail-work admission succeeds
    Then the public result is the same generic accepted-work acknowledgement for that purpose
    And the number of newly issued links is <links> and mail eligibility is <send>
    Examples:
      | purpose               | standing                         | links | send |
      | new signup            | new identity                     | 1     | yes  |
      | explicit verification | enabled, never-verified           | 1     | yes  |
      | explicit verification | enabled, verified                | 0     | no   |
      | explicit verification | disabled                         | 0     | no   |
      | explicit verification | unknown                          | 0     | no   |
      | password reset        | enabled, verified, enrolled       | 1     | yes  |
      | password reset        | enabled, verified, not enrolled   | 1     | yes  |
      | password reset        | enabled, never-verified           | 0     | no   |
      | password reset        | disabled                         | 0     | no   |
      | password reset        | unknown                          | 0     | no   |

  @SCN-native-auth-009 @REQ-native-auth-001 @REQ-native-auth-009 @REQ-native-auth-011 @draft
  Scenario Outline: Common admission outage is failure, not accepted work
    Given a request targets an <eligibility> identity and mail-work admission cannot commit
    When verification resend or password reset is requested
    Then a generic temporary-service failure is exposed, not accepted-work success
    And no new link supersedes any previous current link
    Examples:
      | eligibility |
      | eligible    |
      | ineligible  |

  @SCN-native-auth-010 @REQ-native-auth-001 @REQ-native-auth-009 @draft
  Scenario: Accepted work does not promise later delivery success
    Given an eligible mail request was admitted and delivery subsequently fails until its bounded retries end
    When delivery failure is reported
    Then the operator receives a secret-free failure outcome
    And accepted work is not represented as delivered mail or address-specific public delivery status

  @SCN-native-auth-011 @REQ-native-auth-001 @REQ-native-auth-009 @draft
  Scenario Outline: Delivery rechecks current authority and account standing
    Given accepted mail work refers to a link that becomes <standing> before its next send attempt
    When that work is evaluated for delivery
    Then no additional send is authorized and the link is not revived
    Examples:
      | standing                     |
      | expired                      |
      | superseded                   |
      | attached to disabled account |

  @SCN-native-auth-012 @REQ-native-auth-001 @REQ-native-auth-009 @REQ-native-auth-011 @draft
  Scenario Outline: Mail admission obeys the exact bounded demo profile
    Given <policy> has admitted <prior> still-counted requests and other limits do not bind
    When one further applicable request is submitted
    Then its admission is <result>
    Examples:
      | policy                       | prior | result                    |
      | source mail requests/hour    | 19    | accepted                  |
      | source mail requests/hour    | 20    | temporarily rate-limited  |
      | identity mail requests/60s   | 0     | accepted                  |
      | identity mail requests/60s   | 1     | temporarily rate-limited  |
      | identity mail requests/hour  | 4     | accepted                  |
      | identity mail requests/hour  | 5     | temporarily rate-limited  |
      | uncompleted mail-work state  | 99    | accepted                  |
      | uncompleted mail-work state  | 100   | temporary-service failure |
```

## 4. One-use links and reset

```gherkin
Feature: Confirmation authority

  @SCN-native-auth-013 @REQ-native-auth-001 @REQ-native-auth-009 @draft
  Scenario Outline: Opening a current link does not consume it
    Given an enabled account has an unexpired current <purpose> link
    When that link is opened without the purpose-specific completion
    Then the link remains unconsumed and the account state is unchanged
    Examples:
      | purpose            |
      | email verification |
      | password reset     |

  @SCN-native-auth-014 @REQ-native-auth-001 @REQ-native-auth-009 @draft
  Scenario Outline: Link expiry is a strict server-time boundary
    Given an enabled account has a current <purpose> link with lifetime <lifetime>
    When valid purpose-specific completion is attempted at <time>
    Then completion is <result>
    Examples:
      | purpose            | lifetime   | time        | result                      |
      | email verification | 24 hours   | expiry - 1s | committed once              |
      | email verification | 24 hours   | expiry      | denied without state change |
      | email verification | 24 hours   | expiry + 1s | denied without state change |
      | password reset     | 30 minutes | expiry - 1s | committed once              |
      | password reset     | 30 minutes | expiry      | denied without state change |
      | password reset     | 30 minutes | expiry + 1s | denied without state change |

  @SCN-native-auth-015 @REQ-native-auth-001 @REQ-native-auth-009 @draft
  Scenario Outline: New durable issuance supersedes only the same purpose
    Given account A has current link L1 for <purpose>
    When eligible new link L2 for that purpose is durably issued
    Then L1 cannot complete and L2 can complete once before expiry
    And a link for a different purpose is not treated as this completion authority
    Examples:
      | purpose            |
      | email verification |
      | password reset     |

  @SCN-native-auth-016 @REQ-native-auth-001 @REQ-native-auth-009 @draft
  Scenario: Failed issuance preserves the previous current link
    Given an enabled account has an unexpired current confirmation link L1
    When eligible replacement issuance fails before commit
    Then L1 remains current and usable once before its original expiry
    And no replacement issuance is reported as successful

  @SCN-native-auth-017 @REQ-native-auth-009 @draft
  Scenario: Invalid new password does not consume reset authority
    Given an enabled verified account has a current unexpired reset link
    When reset supplies a generated password of 11 Unicode code points
    Then password validation fails and the original password remains current
    And the reset link remains unconsumed

  @SCN-native-auth-018 @REQ-native-auth-001 @REQ-native-auth-009 @draft
  Scenario Outline: Concurrent consumption has one committed winner
    Given an enabled account has one current unexpired <purpose> link
    When two valid completions contend for that same link
    Then exactly one completion commits and the other exposes an unusable-authority failure
    And the losing completion does not overwrite the winning state
    Examples:
      | purpose            |
      | email verification |
      | password reset     |

  @SCN-native-auth-019 @REQ-native-auth-001 @REQ-native-auth-009 @draft
  Scenario: Rolled-back completion does not consume the link
    Given an enabled account has a current unexpired confirmation link
    When its completion state change is rolled back
    Then completion is not reported as successful and no account change commits
    And the link remains unconsumed

  @SCN-native-auth-020 @REQ-native-auth-001 @REQ-native-auth-009 @draft
  Scenario Outline: Unusable confirmation authority cannot change state
    Given a confirmation is <standing>
    When purpose-specific completion is requested
    Then no verification or password change commits and an unusable-authority outcome is exposed
    Examples:
      | standing                      |
      | already consumed              |
      | superseded                    |
      | not a valid issued authority  |
      | attached to disabled account  |

  @SCN-native-auth-021 @REQ-native-auth-009 @draft
  Scenario: Reset issuance does not revoke current sessions
    Given account A has two valid human sessions
    When an eligible password-reset link is issued but not consumed
    Then both sessions remain authorized under their existing deadlines

  @SCN-native-auth-022 @REQ-native-auth-009 @REQ-native-auth-010 @draft
  Scenario: Completed reset revokes sessions without removing active MFA
    Given account A has two valid sessions, active authenticator and recovery codes
    When a current unexpired reset link completes with a valid new password
    Then the new password is current, the old password fails and both old sessions are revoked
    And fresh authentication still requires the password and an active second factor

  @SCN-native-auth-023 @REQ-native-auth-009 @REQ-native-auth-007 @draft
  Scenario: Reset of a verified incomplete account does not grant access
    Given account A is verified but has never completed enrollment
    When its eligible reset completes with a valid new password
    Then A may continue required setup with the new password
    And A has no private scope, protected access or gateway entitlement from reset alone

  @SCN-native-auth-024 @REQ-native-auth-003 @supporting @draft
  Scenario: Current password verifiers and their native reference match the approved profile
    Given a generated password is established through a real eligible account journey
    When its verifier metadata and the pinned seven-sample native reference are assessed without exporting credentials
    Then the current verifier is versioned Argon2id v19 with 65536 KiB, three passes, one lane, 16-byte salt and 32-byte result
    And the reference uses one hash job and a 512 MiB maximum JVM heap with median at most 1000 ms and sample maximum at most 2000 ms
    And those narrow observations are not represented as full-login capacity or a percentile
```

## 5. Password input and sign-in partitions

```gherkin
Feature: Exact passwords with one browser-compatibility constraint

  @SCN-native-auth-025 @REQ-native-auth-002 @draft
  Scenario Outline: New passwords obey only the inclusive length range
    Given an account is eligible for <purpose> and all non-password completion requirements hold
    When a generated new password of <length> Unicode code points is supplied
    Then password-length validation is <result>
    Examples:
      | purpose         | length | result   |
      | signup          | 11     | rejected |
      | signup          | 12     | accepted |
      | signup          | 13     | accepted |
      | signup          | 127    | accepted |
      | signup          | 128    | accepted |
      | signup          | 129    | rejected |
      | password change | 11     | rejected |
      | password change | 12     | accepted |
      | password change | 13     | accepted |
      | password change | 127    | accepted |
      | password change | 128    | accepted |
      | password change | 129    | rejected |
      | password reset  | 11     | rejected |
      | password reset  | 12     | accepted |
      | password reset  | 13     | accepted |
      | password reset  | 127    | accepted |
      | password reset  | 128    | accepted |
      | password reset  | 129    | rejected |

  @SCN-native-auth-026 @REQ-native-auth-002 @draft
  Scenario Outline: Valid text classes are counted without character exclusions
    Given a generated password contains exactly 12 Unicode code points of class <text>
    When that exact password is established through an eligible password purpose and later used for full authentication
    Then its password component is accepted without extra character or encoding rejection
    Examples:
      | text                                                   |
      | ASCII                                                  |
      | non-ASCII basic multilingual characters                 |
      | non-BMP characters requiring multiple UTF-16 units       |
      | combining sequences containing multiple code points      |
      | leading and trailing spaces                             |
      | symbols and controls including NUL, but excluding CR/LF   |

  @SCN-native-auth-027 @REQ-native-auth-002 @draft
  Scenario Outline: Password authority preserves exact text
    Given account A has a valid generated password distinguished from another text by <difference>
    When full authentication supplies the altered text with an otherwise valid second factor
    Then no human session is created and the original exact password remains current
    Examples:
      | difference                          |
      | removal of leading or trailing space |
      | case folding                        |
      | Unicode normalization               |
      | truncation                          |
      | silent character substitution       |

  @SCN-native-auth-028 @REQ-native-auth-002 @draft
  Scenario Outline: Supported password entry does not change the credential
    Given account A has a valid generated passphrase
    When full authentication supplies the exact password by <method> and a valid second factor
    Then ordinary authentication succeeds without composition or entry-method rejection
    Examples:
      | method                    |
      | password-manager autofill |
      | paste                     |

  @SCN-native-auth-029 @REQ-native-auth-002 @REQ-native-auth-011 @draft
  Scenario Outline: Failed fresh authentication does not disclose identity standing
    Given a fresh sign-in has condition <condition> and abuse policy permits evaluation
    When full authentication is requested
    Then no human session is created and the same generic sign-in failure is exposed
    Examples:
      | condition                         |
      | unknown account                   |
      | wrong password                    |
      | disabled account                  |
      | verified but not enrolled          |
      | missing second factor             |
      | invalid authenticator code        |
      | invalid recovery code             |
```

## 6. Enrollment, TOTP and recovery codes

```gherkin
Feature: Current enrollment and factor authority

  @SCN-native-auth-030 @REQ-native-auth-010 @draft
  Scenario: Setup secrets are displayed once without later readback
    Given an enabled verified account has obtained its pending QR, manual key and recovery codes once
    When the same pending setup values are requested again
    Then no QR, manual key or recovery-code secret is redisplayed
    And protected access remains unavailable until completed enrollment

  @SCN-native-auth-031 @REQ-native-auth-010 @draft
  Scenario Outline: TOTP accepts only current or adjacent unused steps
    Given account A has an active authenticator and no tested step has been consumed
    When fresh full authentication supplies the generated TOTP from step <step> while server step is N
    Then second-factor validation is <result>
    Examples:
      | step  | result   |
      | N - 2 | rejected |
      | N - 1 | accepted |
      | N     | accepted |
      | N + 1 | accepted |
      | N + 2 | rejected |

  @SCN-native-auth-032 @REQ-native-auth-010 @draft
  Scenario: One accepted time step cannot authenticate again
    Given account A has already authenticated using its authenticator at step N
    When another authentication for A supplies that same accepted step
    Then the repeated factor is rejected and no second authentication succeeds from it

  @SCN-native-auth-033 @REQ-native-auth-010 @draft
  Scenario: Concurrent TOTP acceptance has at most one winner
    Given account A has an unused valid current authenticator step
    When two authentication attempts concurrently present that step
    Then exactly one accepts it and the other exposes factor failure

  @SCN-native-auth-034 @REQ-native-auth-010 @REQ-native-auth-007 @draft
  Scenario Outline: Initial completion requires both candidate proof and saved codes
    Given an enabled verified account has a current unexpired initial enrollment
    When completion has candidate TOTP valid <totp> and saved-code acknowledgement <saved>
    Then enrollment is <result> and private-scope count is <scopes>
    Examples:
      | totp | saved | result       | scopes |
      | yes  | yes   | completed    | 1      |
      | yes  | no    | not completed| 0      |
      | no   | yes   | not completed| 0      |
      | no   | no    | not completed| 0      |

  @SCN-native-auth-035 @REQ-native-auth-010 @draft
  Scenario Outline: Lost initial display requires an authorized new attempt
    Given enabled verified account A loses a once-shown <display> through <interruption> before completion
    When A explicitly restarts after confirming its password
    Then a new 24-hour attempt supersedes the old pending seed and code set
    And old pending values and stale completion attempts cannot activate factors or protected access
    Examples:
      | display       | interruption          |
      | QR/manual key | refresh               |
      | QR/manual key | back navigation       |
      | recovery set  | closed session view   |
      | recovery set  | interrupted response  |

  @SCN-native-auth-036 @REQ-native-auth-010 @draft
  Scenario Outline: Pending setup is usable before and unusable after its lifetime
    Given a pending <purpose> was established at P and the account still has required authority
    When valid completion is attempted at <time>
    Then the pending attempt is <result>
    Examples:
      | purpose                  | time             | result                       |
      | enrollment               | P + 24 hours - 1s| eligible for completion      |
      | enrollment               | P + 24 hours + 1s| rejected as expired          |
      | standalone recovery set  | P + 24 hours - 1s| eligible for completion      |
      | standalone recovery set  | P + 24 hours + 1s| rejected as expired          |

  @SCN-native-auth-037 @REQ-native-auth-010 @draft
  Scenario Outline: Exact pending expiry rejects activation
    Given a pending <purpose> was established at P and all other completion guards hold
    When completion is attempted exactly at P plus 24 hours
    Then completion is rejected as expired without activating pending factors or codes
    And existing active factors and consumed-code standing are unchanged
    Examples:
      | purpose                  |
      | enrollment               |
      | standalone recovery set  |

  @SCN-native-auth-038 @REQ-native-auth-010 @draft
  Scenario Outline: Incomplete replacement does not revoke active factors
    Given account A has an active authenticator and recovery set plus a pending replacement
    When the pending replacement is <interrupted>
    Then the previously active authenticator and unused recovery codes remain usable
    And no pending candidate becomes active
    Examples:
      | interrupted                      |
      | cancelled                        |
      | expired                          |
      | restarted after lost display     |
      | rejected for invalid candidate   |
      | rejected without acknowledgement |

  @SCN-native-auth-039 @REQ-native-auth-010 @REQ-native-auth-006 @draft
  Scenario: Replacement swaps factors and session authority atomically
    Given A has current session S1, another session S2 and valid recent confirmation
    When its current replacement completes with valid new TOTP and acknowledged new codes
    Then old authenticator and old unused recovery codes fail while the new factors work
    And S2 is revoked while S1 is rotated and retained with its original absolute deadline

  @SCN-native-auth-040 @REQ-native-auth-010 @draft
  Scenario: A superseded replacement cannot activate from stale authority
    Given a replacement attempt R1 was superseded by current attempt R2
    When completion of R1 is attempted with its candidate proof and acknowledgement
    Then R1 cannot change active factors and R2 remains the current pending attempt

  @SCN-native-auth-041 @REQ-native-auth-006 @REQ-native-auth-010 @draft
  Scenario Outline: Recent confirmation is checked at each sensitive factor stage
    Given the current session has full-authentication age <age> and otherwise-current factor standing
    When authenticator replacement or standalone regeneration reaches <stage>
    Then authority from that confirmation is <result>
    Examples:
      | age        | stage      | result   |
      | 9m 59s     | start      | accepted |
      | 10m        | start      | accepted |
      | 10m 1s     | start      | rejected |
      | 9m 59s     | restart    | accepted |
      | 10m        | restart    | accepted |
      | 10m 1s     | restart    | rejected |
      | 9m 59s     | completion | accepted |
      | 10m        | completion | accepted |
      | 10m 1s     | completion | rejected |

  @SCN-native-auth-042 @REQ-native-auth-010 @supporting @draft
  Scenario: Recovery-code representation is usable and not retrievable later
    Given account A receives one generated recovery set through its real enrollment
    When its once-shown values and later factor standing are assessed
    Then exactly ten codes each have 32 hexadecimal characters grouped in eight blocks of four
    And upper/lower-case and optional-hyphen forms of a code identify the same one-use authority
    And later account access cannot retrieve the raw codes

  @SCN-native-auth-043 @REQ-native-auth-004 @REQ-native-auth-010 @draft
  Scenario: Password plus unused recovery code creates ordinary authority once
    Given enabled verified enrolled A has unused code C
    When A authenticates with its password and C
    Then an ordinary human session is created and MFA remains enabled
    And using C again cannot create another session

  @SCN-native-auth-044 @REQ-native-auth-004 @REQ-native-auth-010 @draft
  Scenario Outline: Recovery codes are neither standalone passwords nor transferable factors
    Given accounts A and B have independent credentials and recovery sets
    When authentication for A supplies <credentials>
    Then no human session is created and generic sign-in failure is exposed
    Examples:
      | credentials                         |
      | recovery code without password      |
      | wrong password and A's unused code  |
      | A's password and B's recovery code  |
      | A's password and consumed code      |
      | A's password and invalid code       |
      | A's password and incorrectly grouped code |

  @SCN-native-auth-045 @REQ-native-auth-004 @REQ-native-auth-010 @draft
  Scenario: Concurrent use consumes a recovery code exactly once
    Given enabled verified enrolled A has unused code C
    When two valid password-and-C authentications contend
    Then exactly one consumes C and creates its authorized session
    And the other authentication fails without a second consumption or session

  @SCN-native-auth-046 @REQ-native-auth-010 @draft
  Scenario Outline: Pending standalone codes do not replace the active set
    Given A has active unused recovery codes and a pending standalone new set
    When pending generation is <interrupted> before commit
    Then only the pending set is discarded and prior unused active codes remain usable
    And the active authenticator is unchanged
    Examples:
      | interrupted               |
      | cancelled                 |
      | expired                   |
      | restarted after lost display |

  @SCN-native-auth-047 @REQ-native-auth-006 @REQ-native-auth-010 @draft
  Scenario: Acknowledged standalone regeneration revokes old codes and other sessions
    Given A has valid recent confirmation in S1, another session S2 and a current pending code set
    When saved-code acknowledgement and current-state completion commit
    Then the new set alone is active, old unused codes fail and the authenticator is unchanged
    And S2 is revoked while rotated S1 retains its original absolute deadline

  @SCN-native-auth-048 @REQ-native-auth-010 @draft
  Scenario: Lost regeneration completion response cannot undo or redisplay codes
    Given a standalone regeneration has committed but its completion response is lost
    When the account obtains nonsecret completion standing
    Then the new set remains active and the old set remains revoked
    And raw codes are not redisplayed, while fresh authorized regeneration remains available

  @SCN-native-auth-049 @REQ-native-auth-004 @REQ-native-auth-010 @draft
  Scenario Outline: Exhausted recovery authority does not become an MFA bypass
    Given A has no unused recovery codes and its authenticator is <standing>
    When A seeks ordinary human authority
    Then the eligible recovery path is <path> and password-only ordinary access is denied
    Examples:
      | standing  | path                                                |
      | available | authenticator authentication and authorized regeneration |
      | lost      | scoped offline host recovery and re-enrollment       |

  @SCN-native-auth-050 @REQ-native-auth-004 @REQ-native-auth-010 @draft
  Scenario: Cancelled regeneration cannot restore consumed or stale authority
    Given A consumed recovery code C for recent authentication and pending set P1 was superseded by P2
    When regeneration is cancelled and stale P1 completion is attempted
    Then C remains consumed and P1 cannot activate
    And cancellation does not resurrect either authority
```

## 7. Sessions, sensitive changes and ownership

```gherkin
Feature: Continuing human authority

  @SCN-native-auth-051 @REQ-native-auth-005 @draft
  Scenario: Restarting the human session's browser context preserves valid authority
    Given A completed full authentication and its session is before both deadlines
    When the browser is closed and restarted with its persistent human-session state
    Then A's ordinary authorized access continues without another MFA challenge

  @SCN-native-auth-052 @REQ-native-auth-005 @draft
  Scenario Outline: Either session deadline independently ends authority
    Given A's session has deadline <deadline> and the other deadline is later
    When a protected action is authorized at <time>
    Then session authority is <result>
    Examples:
      | deadline               | time          | result   |
      | creation + 30 days     | deadline - 1s | accepted |
      | creation + 30 days     | deadline      | denied   |
      | creation + 30 days     | deadline + 1s | denied   |
      | last activity + 7 days | deadline - 1s | accepted |
      | last activity + 7 days | deadline      | denied   |
      | last activity + 7 days | deadline + 1s | denied   |

  @SCN-native-auth-053 @REQ-native-auth-005 @draft
  Scenario Outline: Only successful deliberate activity renews inactivity
    Given A has a valid session with last deliberate activity T
    When successful activity <activity> occurs at later time U
    Then last deliberate activity becomes <last> and the original absolute deadline is unchanged
    Examples:
      | activity                       | last |
      | protected navigation           | U    |
      | manual protected refresh       | U    |
      | authorized account change      | U    |
      | background polling             | T    |
      | prefetch                       | T    |
      | anonymous static-asset access  | T    |

  @SCN-native-auth-054 @REQ-native-auth-005 @draft
  Scenario: Rejected protected actions do not extend inactivity
    Given a session has last successful deliberate activity T
    When a later attempted protected action is rejected
    Then its last successful deliberate activity remains T

  @SCN-native-auth-055 @REQ-native-auth-005 @REQ-native-auth-006 @draft
  Scenario: Ordinary own-account access does not repeat MFA
    Given A has an otherwise-valid ordinary session but recent confirmation is older than ten minutes
    When A performs ordinary authorized private-account navigation and manual refresh
    Then access succeeds without sensitive-change reauthentication
    And the original absolute session deadline remains unchanged

  @SCN-native-auth-056 @REQ-native-auth-006 @draft
  Scenario Outline: Recent full authentication is reusable, not an OTP replay
    Given current session S has a full-authentication confirmation of age <age> and its OTP was consumed
    When an authorized sensitive password change checks that confirmation
    Then confirmation authority is <result> without accepting the consumed OTP again
    Examples:
      | age    | result   |
      | 9m 59s | accepted |
      | 10m    | accepted |
      | 10m 1s | rejected |

  @SCN-native-auth-057 @REQ-native-auth-006 @draft
  Scenario Outline: Recent confirmation belongs only to its current account and session
    Given A has valid recent confirmation in S1 and independent session S2
    When sensitive authorization uses <authority>
    Then S1's confirmation is <result>
    Examples:
      | authority                         | result    |
      | another tab sharing A's S1        | reusable  |
      | A's separate S2                   | not reusable |
      | B's session                       | not reusable |

  @SCN-native-auth-058 @REQ-native-auth-005 @REQ-native-auth-006 @draft
  Scenario: Signed-in password change preserves only current eligible authority
    Given A has S1 with still-valid recent confirmation at R and another session S2
    When an authorized valid password change commits through S1
    Then the new password is current, S2 is revoked and S1 is rotated and retained
    And S1 retains its original absolute deadline and confirmation timestamp R, not a new ten-minute window

  @SCN-native-auth-059 @REQ-native-auth-005 @draft
  Scenario Outline: Ended session authority is rejected on later checks
    Given A's ordinary session has been <ended>
    When a later protected action attempts to use that session
    Then access is denied and the ended session is not revived
    Examples:
      | ended     |
      | logged out|
      | revoked   |
      | expired   |

  @SCN-native-auth-060 @REQ-native-auth-006 @REQ-native-auth-010 @draft
  Scenario Outline: Sensitive commit cannot use stale account or factor authority
    Given A began a sensitive change under valid authority
    When <change> commits before A's sensitive completion checks current standing
    Then the stale sensitive completion is denied without undoing that change
    Examples:
      | change                         |
      | account disable                |
      | current-session revocation     |
      | host recovery                  |
      | superseding factor activation  |

  @SCN-native-auth-061 @REQ-native-auth-006 @REQ-native-auth-010 @draft
  Scenario: Rolled-back sensitive completion does not swap active authority
    Given A has active factors and a current fully evidenced pending replacement
    When replacement completion rolls back before commit
    Then active factors remain unchanged and no successful replacement is reported

  @SCN-native-auth-062 @REQ-native-auth-007 @REQ-native-auth-008 @draft
  Scenario Outline: Another account's ownership cannot be selected as authority
    Given enabled enrolled A and B have distinct private scopes and valid sessions
    When A attempts <action> using B's account or private-scope identity
    Then B's private account state is neither disclosed nor changed
    And A's private scope and authorization do not become B's
    Examples:
      | action                            |
      | protected private-account access  |
      | sensitive account change          |
      | gateway-entitlement use           |

  @SCN-native-auth-063 @REQ-native-auth-007 @REQ-native-auth-010 @draft
  Scenario: Replacement and recovery cannot create another private scope
    Given A established private scope P at first completed enrollment
    When A completes authorized replacement and later authorized host-recovery enrollment
    Then A still owns exactly the same scope P
    And no other account obtains P and no second scope is established by those completions
```

## 8. Host authority, gateway ordering and degraded capability

```gherkin
Feature: Purpose-bound operational authority

  @SCN-native-auth-064 @REQ-native-auth-004 @REQ-native-auth-007 @REQ-native-auth-008 @draft
  Scenario Outline: Host authority cannot be forged or expanded
    Given A exists and the requested operation lacks <requirement>
    When recovery, grant, revoke or disable is attempted
    Then no account or entitlement change commits and an explicit authority or validation failure is exposed
    Examples:
      | requirement                   |
      | trusted local host authority  |
      | exact target account          |
      | explicit reason               |
      | explicit confirmation         |

  @SCN-native-auth-065 @REQ-native-auth-004 @REQ-native-auth-007 @draft
  Scenario Outline: Host changes and safe audit have one commit outcome
    Given an otherwise-authorized exact-account host change encounters <failure>
    When that change is attempted
    Then the operation fails explicitly without claiming success
    And no partial target-state change commits without its secret-free audit
    Examples:
      | failure                       |
      | account service unavailable   |
      | audit commit unavailable      |
      | state-change rollback         |

  @SCN-native-auth-066 @REQ-native-auth-007 @draft
  Scenario Outline: Repeated host changes are safe
    Given an authorized host operation has already established <standing>
    When the same authorized operation is repeated for the same exact account
    Then already-in-state is reported and no duplicate authority or ownership is created
    Examples:
      | standing             |
      | gateway grant        |
      | gateway revocation   |
      | account disabled     |

  @SCN-native-auth-067 @REQ-native-auth-004 @REQ-native-auth-007 @REQ-native-auth-010 @draft
  Scenario: Host recovery creates setup-only handoff, not impersonation
    Given enabled verified enrolled A owns P and has sessions, factors, pending authentication and gateway entitlement
    When authorized host recovery for A commits
    Then all those sessions, factors, pending authentication and entitlement are revoked
    And email, password and scope P remain A's while no host-created human session or data disclosure occurs
    And A may use its password or approved reset for setup-only enrollment, followed by explicit eligible-account regrant

  @SCN-native-auth-068 @REQ-native-auth-004 @REQ-native-auth-007 @draft
  Scenario: Recovery does not silently re-enable a disabled account
    Given A is disabled and retains its private scope
    When authorized host recovery for A commits
    Then A remains disabled and ordinary authentication and gateway use remain denied
    And A's ownership is retained rather than transferred to the host administrator

  @SCN-native-auth-069 @REQ-native-auth-007 @draft
  Scenario: Re-enable does not resurrect revoked authority or recycle identity
    Given host disable revoked A's sessions, pending authentication and gateway entitlement while retaining its private scope
    When the host explicitly re-enables A
    Then A regains only eligibility for required authentication or setup
    And old sessions, pending authority and entitlement remain revoked and A's verified identity is not reassigned

  @SCN-native-auth-070 @REQ-native-auth-007 @draft
  Scenario Outline: Gateway grant requires all eligibility dimensions
    Given the host has valid exact-account authority and A has standing <standing>
    When a gateway grant is requested for A
    Then grant outcome is <result>
    Examples:
      | standing                     | result   |
      | enabled, verified, enrolled   | granted  |
      | disabled, verified, enrolled  | denied   |
      | enabled, never-verified       | denied   |
      | enabled, verified, not enrolled | denied |
      | enabled, recovery-required    | denied   |

  @SCN-native-auth-071 @REQ-native-auth-007 @REQ-native-auth-008 @draft
  Scenario Outline: Revocation distinguishes undispatched and dispatched work
    Given A's gateway entitlement is revoked while work is <standing>
    When that work next reaches its authorization or completion boundary
    Then the permitted outcome is <outcome>
    Examples:
      | standing                | outcome                                     |
      | awaiting admission      | admission denied                            |
      | admitted, undispatched  | upstream dispatch denied                     |
      | already dispatched      | existing work may finish without follow-on authority |

  @SCN-native-auth-072 @REQ-native-auth-007 @REQ-native-auth-008 @draft
  Scenario: Concurrent dispatch and revocation follow the committed order
    Given a gateway dispatch and entitlement revocation contend for A's authority
    When controlled ordering makes revocation commit before dispatch authorization
    Then upstream dispatch is denied despite any older observed grant
    And reversing the ordering permits only already-dispatched work to finish, not a new follow-on call

  @SCN-native-auth-073 @REQ-native-auth-007 @REQ-native-auth-008 @draft
  Scenario: Host budget authority is not private human authority
    Given a host administrator has granted gateway entitlement to A but has no human-session authority for A
    When the operator attempts private human access by virtue of that grant
    Then no trace, prompt, private-account state or provider secret is disclosed by the grant mechanism
    And no authority to approve another human's work is established

  @SCN-native-auth-074 @REQ-native-auth-005 @REQ-native-auth-010 @draft
  Scenario: Missing TOTP capability does not automatically end independent authority
    Given A has a valid session and unused recovery code when its TOTP encryption key becomes unavailable
    When A performs an ordinary authorized action and separately authenticates with password plus that code
    Then the existing session remains valid and independent recovery authentication may succeed
    And neither action bypasses other required services or account standing

  @SCN-native-auth-075 @REQ-native-auth-010 @draft
  Scenario Outline: Key-dependent actions fail as unavailable, not incorrect code
    Given the required TOTP key is unavailable and A otherwise has valid authority for <action>
    When A requests <action>
    Then explicit temporary dependency unavailability is exposed and degraded capability is reported
    And no plaintext fallback, password-only bypass, silent key replacement or automatic factor/session reset occurs
    Examples:
      | action                    |
      | TOTP authentication       |
      | initial enrollment        |
      | authenticator replacement |

  @SCN-native-auth-076 @REQ-native-auth-005 @REQ-native-auth-008 @REQ-native-auth-010 @draft
  Scenario Outline: Provider credentials do not own human sessions
    Given A has an otherwise-valid human session
    When a provider API key is <change>
    Then A's session remains valid and only dependent model capability may become unavailable
    Examples:
      | change    |
      | replaced  |
      | disabled  |

  @SCN-native-auth-077 @REQ-native-auth-010 @supporting @draft
  Scenario: Versioned key rotation and matched restore preserve factors and ownership
    Given A's authenticator and scope are active under an explicitly provisioned protected key
    When controlled rotation re-encrypts the same seed and a matched retained backup is restored with its required protected key
    Then A's authenticator still verifies its eligible new time steps without re-enrollment
    And A retains its private ownership, backup-required old keys are retained, and no secret is exposed

  @SCN-native-auth-078 @REQ-native-auth-002 @draft
  Scenario: Password age does not force periodic replacement
    Given enabled enrolled A has an unchanged valid password established 90 days earlier and no revoked account standing
    When fresh full authentication supplies that exact password and a valid unused second factor
    Then A obtains ordinary authentication without a password-age change requirement

  @SCN-native-auth-079 @REQ-native-auth-003 @REQ-native-auth-010 @supporting @draft
  Scenario: Verifier, entropy and secret-safe evidence have a complete inspected surface
    Given real password, enrollment, recovery and reset journeys use per-case generated secrets
    When supporting evidence inspects verifier storage, random generation and all captured artifacts
    Then passwords use approved Argon2id verifiers and recovery codes use account-and-set-bound domain-separated SHA-256 verifiers without raw-value readback
    And seeds use versioned AES-256-GCM with unique per-key 96-bit nonce, 128-bit tag and authenticated account, stable seed identity and representation version
    And maintained Java cryptographic randomness supplies 16-byte recovery-code inputs, salts and key material as specified
    And the complete v0.3 export inventory contains only permitted metadata and no raw credentials, links, cookies, QR payloads or stored verifiers
    And missing or empty evidence alone cannot satisfy that export check

  @SCN-native-auth-080 @REQ-native-auth-011 @draft
  Scenario: Successful authentication clears bounded cooldown without permanent lock
    Given enabled enrolled A has 20 failed full authentications in 15 minutes and its last failure occurred at T
    When A authenticates correctly at T plus 300 seconds with a fresh unused factor and all source limits permit evaluation
    Then ordinary authentication succeeds and A's failed-auth history and cooldown are cleared
    And the used factor remains consumed and no permanent account-lock flag exists

  @SCN-native-auth-081 @REQ-native-auth-004 @REQ-native-auth-010 @draft
  Scenario: Recovery-verifier unavailability is not an incorrect-code diagnosis
    Given A supplies its correct password and unused recovery code but the required independent verifier service is unavailable
    When fresh recovery authentication is attempted
    Then temporary dependency unavailability is exposed and no human session is created
    And the outage is not represented as an incorrect recovery code or password-only success

  @SCN-native-auth-082 @REQ-native-auth-005 @REQ-native-auth-007 @REQ-native-auth-008 @draft
  Scenario: Dispatched work does not let a revoked session read protected results
    Given A dispatched authorized gateway work while human session S was valid
    And S is revoked before a later protected result authorization
    When the already-dispatched work finishes and S attempts to read its protected result
    Then completion does not restore S and the protected read is denied

  @SCN-native-auth-083 @REQ-native-auth-002 @draft
  Scenario: Malformed requests are not additional password-content rules
    Given A has an unchanged valid password and a request is malformed at the transport or parsing boundary
    When that malformed request is evaluated
    Then an explicit request or parse failure is exposed without changing A's password or creating a session
    And valid exact password text is not silently rewritten or assigned extra character exclusions

  @SCN-native-auth-084 @REQ-native-auth-011 @draft
  Scenario Outline: Source admission has exact authentication and signup caps
    Given <policy> has <prior> still-counted requests and other policy dimensions do not bind
    When one further applicable request is evaluated
    Then source admission is <result> without account-existence disclosure
    Examples:
      | policy                         | prior | result                   |
      | authentication requests/60s    | 29    | accepted                 |
      | authentication requests/60s    | 30    | temporarily rate-limited |
      | signup requests/hour           | 9     | accepted                 |
      | signup requests/hour           | 10    | temporarily rate-limited |

  @SCN-native-auth-085 @REQ-native-auth-011 @draft
  Scenario Outline: Progressive cooldown uses the failed-auth history only
    Given normalized identity A has <failures> failed full authentications in the last 15 minutes with the latest at T
    When the latest failure commits
    Then its cooldown release is T plus <seconds> seconds
    And unknown normalized identities use the same rule without a permanent lock flag
    Examples:
      | failures | seconds |
      | 4        | 0       |
      | 5        | 2       |
      | 9        | 2       |
      | 10       | 30      |
      | 19       | 30      |
      | 20       | 300     |
      | 21       | 300     |

  @SCN-native-auth-086 @REQ-native-auth-011 @draft
  Scenario Outline: Rolling-window and cooldown release includes exact equality
    Given <authority> has its only binding release deadline D
    When a request is evaluated at <time>
    Then that restriction is <result>
    And rate-denied requests do not extend their own cooldown or count as failed credential checks
    Examples:
      | authority                              | time   | result  |
      | authentication source 60-second window  | D - 1s | binding |
      | authentication source 60-second window  | D      | cleared |
      | mail source one-hour window            | D      | cleared |
      | mail identity 60-second window         | D      | cleared |
      | mail identity one-hour window          | D      | cleared |
      | failed-auth 15-minute history          | D      | cleared |
      | progressive cooldown                   | D - 1s | binding |
      | progressive cooldown                   | D      | cleared |
      | progressive cooldown                   | D + 1s | cleared |

  @SCN-native-auth-087 @REQ-native-auth-011 @draft
  Scenario Outline: Trusted-source identity cannot be selected by an untrusted caller
    Given connection and forwarding standing is <standing>
    When admission identifies its request source
    Then source outcome is <outcome>
    Examples:
      | standing                                                                 | outcome                      |
      | untrusted peer 198.51.100.7, forwarded 203.0.113.8                         | 198.51.100.7                 |
      | trusted peer 127.0.0.1, forwarded 203.0.113.8                               | 203.0.113.8                  |
      | trusted 127.0.0.0/8, peer 127.0.0.1, chain 203.0.113.8 then 127.0.0.2       | 203.0.113.8                  |
      | trusted 127.0.0.0/8, peer 127.0.0.1, chain 127.0.0.3 then 127.0.0.2         | 127.0.0.3                    |
      | trusted peer 127.0.0.1 without forwarding metadata                         | 127.0.0.1                    |
      | trusted peer with malformed forwarding IP                                | explicit request failure     |
      | trusted peer with nine forwarding hops                                   | explicit request failure     |
      | trusted peer with a forwarding IP-and-port instead of IP literal          | explicit request failure     |
      | untrusted peer 198.51.100.7 with malformed forwarding metadata             | 198.51.100.7                 |
      | equivalent IPv4 and IPv4-mapped IPv6 connection addresses                  | one normalized source bucket |

  @SCN-native-auth-088 @REQ-native-auth-011 @draft
  Scenario Outline: Throttle state is finite without live-protection eviction
    Given <kind> has 10000 live buckets and the requested key has no bucket
    When a new key requires admission state
    Then generic temporary-service failure is exposed and no live protection is evicted
    And an inactive bucket becomes eligible to expire after its one-hour retention, permitting bounded reuse afterwards
    Examples:
      | kind             |
      | identity state   |
      | source state     |

  @SCN-native-auth-089 @REQ-native-auth-002 @REQ-native-auth-011 @draft
  Scenario: Hash admission cannot exceed its bounded work or grant late authority
    Given one hash job is active and four jobs are waiting
    When another authentication requires hashing
    Then temporary-service failure is exposed rather than starting a sixth job or reporting a wrong password
    And queued or evaluating authority that exceeds two seconds cannot create a session
    And an expired still-running job retains its permit until it ends

  @SCN-native-auth-090 @REQ-native-auth-001 @REQ-native-auth-009 @draft
  Scenario: Mail retries and timeout remain bounded without reviving authority
    Given eligible accepted mail work encounters repeat delivery failure while its link remains current and unexpired
    When the worker performs its scheduled attempts
    Then there is at most one active send and at most three attempts with waits of 60 then 240 seconds after failures
    And an individual attempt times out at ten seconds rather than waiting without bound
    And no fourth attempt or send after consumption, expiry, supersession or disablement is authorized

  @SCN-native-auth-091 @REQ-native-auth-003 @supporting @draft
  Scenario Outline: Only reviewed verifier profiles can authenticate and upgrade
    Given A's same current credential has verifier profile <profile>
    When A completes otherwise-valid full authentication
    Then credential outcome is <outcome>
    Examples:
      | profile                         | outcome                                      |
      | reviewed 19456 KiB/two passes/one lane predecessor | upgraded to current profile without password change |
      | unsupported algorithm/version   | explicit failure without session or fallback |
      | unreviewed work parameters       | explicit failure without unbounded hashing   |
      | malformed verifier              | explicit failure without session or fallback |

  @SCN-native-auth-092 @REQ-native-auth-003 @REQ-native-auth-009 @supporting @draft
  Scenario: Rehash cannot overwrite a concurrent password reset
    Given A's predecessor verifier has been checked and a successful reset commits a new current credential revision
    When the earlier authentication attempts to upgrade the old verifier
    Then the reset password remains current and the old verifier is not written over it
    And no ordinary authority is created from superseded credential standing

  @SCN-native-auth-093 @REQ-native-auth-010 @supporting @draft
  Scenario Outline: Authenticated seed protection rejects modified or mismatched values
    Given A's protected seed representation is <condition>
    When A attempts an operation requiring that seed
    Then dependency failure is exposed without accepting a factor or returning plaintext
    And no wrong-key fallback, scope reassignment or automatic session reset occurs
    Examples:
      | condition                         |
      | modified ciphertext/tag            |
      | authenticated identity belongs to B |
      | required key unavailable            |

  @SCN-native-auth-094 @REQ-native-auth-002 @draft
  Scenario Outline: Received line breaks fail explicitly without a modified password
    Given an otherwise-eligible <purpose> supplies a generated password within the length bounds containing <linebreak>
    When the application receives the raw value through <entry>
    Then explicit input-validation failure is exposed without changing a credential or creating a session
    And the application does not silently remove that line break and accept a different password
    Examples:
      | purpose         | linebreak | entry                    |
      | signup          | CR        | paste before sanitization |
      | signup          | LF        | direct submission         |
      | password change | CRLF      | paste before sanitization |
      | password reset  | LF        | paste before sanitization |
      | sign-in         | CR        | direct submission         |
      | reauthentication| LF        | direct submission         |
```

## 9. Traceability and design techniques

This is a mapping, not proof of executed coverage or a passed quota. Common
G-CONTRACT/G-HARNESS gates apply even to scenarios with a concrete business oracle.

| Scoped requirement | Positive coverage | Negative/boundary coverage |
|---|---|---|
| REQ-native-auth-001 | 001/002/006/008 | 003-020, including blocked 012 |
| REQ-native-auth-002 | 025/026/028/078 | 025/027/029/083/089/094; 11/12/13/127/128/129 length points |
| REQ-native-auth-003 | 024/079/091 supporting | 091/092; exact v0.3 verifier/evidence oracles approved, implementation/native gates remain |
| REQ-native-auth-004 | 043/067 | 044/045/049/050/064/065/068/081 |
| REQ-native-auth-005 | 051/053/055/074/076 | 052/054/058/059/082; exact deadline points |
| REQ-native-auth-006 | 039/041/047/056/057/058 | 041/056/057/060/061 |
| REQ-native-auth-007 | 001/063/066/067/069/070 | 004/023/034/062/064/065/068/070-073/082 |
| REQ-native-auth-008 | 076 and bounded authority in 062/071-073 | 062/071-073/082; downstream integration remains G-SCOPE |
| REQ-native-auth-009 | 008/013-019/021-023 | 008-012/014/017-020/022/023/090/092 |
| REQ-native-auth-010 | 001/031/034/039/042/043/047/063/074/077/079 | 030-050/060/061/075/079/081/093 |
| REQ-native-auth-011 | Admission/privacy in 008/009/029/080 | 012/029/084-089; approved v0.3 numerical/source boundaries |

Domain invariant coverage:

| Domain invariant | Scenario IDs |
|---|---|
| 1 identity/duplicate safety | 002/003 |
| 2 pending retention | 005/006/007 |
| 3 send eligibility | 003/008 |
| 4 confirmation validity/consumption | 013/014/017-020 |
| 5 issuance/delivery | 009-012/015/016/090 |
| 6 exact permitted credential | 024-028/078/079/083/091/092/094; DR-038 CR/LF compatibility |
| 7 full authentication/recovery | 029/043-045/049/081/089 |
| 8 TOTP windows/replay | 031-033 |
| 9 enrollment/private scope | 001/004/023/034/063 |
| 10 lost initial setup | 030/035-037 |
| 11 replacement/consumed codes | 038-041/050/060/061 |
| 12 code representation/one-use | 042-048/050 |
| 13 regeneration/recent proof/lost response | 041/046-050 |
| 14 session effects | 022/039/047/058/067 |
| 15 lifetime/activity | 051-055/059/082 |
| 16 recent confirmation/current standing | 041/056-061 |
| 17 host authority/audit | 064-067/073 |
| 18 recovery handoff | 063/067/068 |
| 19 gateway standing/ordering | 069-073/082 |
| 20 key/session separation | 074-077/079/081/093 |
| 21 reset effects | 021-023/092 |
| 22 bounded non-enumerating abuse | 008/009/012/029/080/084-089 |

Approved intent failure/guard mapping (diagram node IDs are from the immutable
intent, not implementation names):

| Intent guard or exit | Scenario IDs |
|---|---|
| M1/ML temporary limits; MR bounded retry policy | 012/080/084-090 under approved v0.3 |
| M3/MF common admission failure | 009/016 |
| M4/MN ineligible/stale/expired/disabled mail | 008/011 |
| MS/MR/MO later delivery failure and retry termination | 010/011/012/090 |
| L1 non-consuming open; L2/LF unusable authority | 013/014/020 |
| L3/LV invalid completion input | 017 |
| L4/LR failed/contended atomic consumption | 018/019 |
| E1/EF missing authority | 004/041/060/068 |
| E3/EU missing required key | 075 |
| ED/EC pre-commit interruption | 030/035-038/046 |
| E4/ER invalid/stale/expired/incomplete proof | 034/036-041/050/060 |
| E5/EX activation rollback/lost race | 040/050/061 |
| EG/ES lost post-commit response | 048 |
| S1/SL temporary limits | 080/084-089 under approved v0.3 |
| S2/SF, S3/SF, S5/SF, S6/SF invalid authentication | 029/031-033/044/045 |
| S4/SU, S6/SU unavailable dependency | 075/081/093 |
| S7/SD expired/revoked/unauthorized session | 052/059/062/082 |
| S7/SR versus S7/SN activity classification | 053/054 |
| H1/HD invalid local authority | 064 |
| H2/HI ineligible operation | 064/068/070 |
| H3/HF atomic state/audit failure | 065 |
| H3/HH safe repeat | 066 |
| G1/GN denied admission/dispatch | 069-072 |
| G2/GD denied protected result read | 082 |

Applied techniques:

- Equivalence: identity/mail standing, credential text, sign-in failure, role and
  factor classes.
- Boundary values: password min-1/min/min+1/max-1/max/max+1; current/adjacent/
  outside TOTP steps; before/equal/after link/session/recent-auth deadlines.
  Pending/cleanup equality follows the explicitly approved DR-034 addendum;
  numerical/evidence oracles now follow the explicitly approved DR-037 profile.
- Decision tables: 008 send eligibility, 034 completion evidence, 070 gateway
  standing and 071 dispatch standing.
- State transitions/races: confirmation issue/consume/rollback, factor/set
  activation, logout/revoke/disable/recovery, admission/dispatch ordering.
- Combination coverage: all pairs of password purpose and length class in 025;
  text classes then exact-credential authentication in 026/027; same/distinct
  account/session authority in 057. Do not expand an unreviewed full Cartesian
  product into unnecessary acceptance cases.
- Failure classes: common admission outage, later delivery failure, rolled-back
  consumption/activation/host audit, stale authority, key-dependent unavailability.

## 10. Oracle closure and execution gates

| Former oracle gap | Approved resolution | Remaining implementation prerequisite |
|---|---|---|
| 005/037 equality | DR-034/v0.2 exact deadlines | Cleanup/clock/transaction contracts |
| 012/080 admission/cooldown | DR-037/v0.3 exact rolling windows, finite bounds and source identity | Counter/mail/dispatch and proxy contracts |
| 024 verifier/rehash/reference | DR-037/v0.3 current/predecessor profiles, bounded work and narrow native reference | Maintained encoding, revision checks and application-native verification |
| 079 secrecy/crypto/evidence | DR-037/v0.3 exact mechanisms, complete export inventory and field restrictions | Concrete schema/recorder/harness design and actual safe evidence |

There are no remaining unspecified business oracles in this catalog. Phase 3
may hand off to Phase 4 after structural/trace checks; this does not close
G-CONTRACT/G-HARNESS or applicable native/scope execution prerequisites, approve
a design, run a test or freeze the plan. Review any newly discovered observable
gap explicitly; never manufacture a value or accept a success-shaped fallback.

Native-auth browser evidence uses its own private-account surface, not a fake
timeline or approval control. Trace-specific reads, submitter-only prompt
approval and event/gateway/provider credential integrations require their later
real integration evidence; this catalog does not declare those release gates
passed. Gateway ordering needs a controlled real dispatch path, not seed-only
entitlement state. Local operations and supporting observations must never
impersonate human authority or grant the operator private data access.

No expected copy, HTTP mapping, locator, command spelling, hash cost, numerical
throttle limit or implementation path has been invented here. No tests have
been authored, run, skipped into green, frozen or locked.
