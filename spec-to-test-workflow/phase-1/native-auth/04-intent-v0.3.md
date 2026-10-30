# Native authentication intent v0.3: verifier, evidence and bounded demo profile

Version: 0.3. Prepared: 2026-10-30.
Approval status is recorded externally in the [decision record](../05-decision-record.md).
Submission for review is not approval. This version does not claim an application
acceptance result, production capacity, design approval or freeze.

## 1. Composition and purpose

This version incorporates both immutable approved artifacts:

- [v0.1 behavior and diagrams](./04-intent-v0.1.md), raw SHA-256
  `5AB84C0B99BDCAB8BF9C419AF6E55C958D1B159E8FFB155F7DE926EA042E6981`.
- [v0.2 deadline addendum](./04-intent-v0.2.md), raw SHA-256
  `7FD646D33431671BED907282FE7735DA1F1E6427BECF0A9AD8B019B8A368EE99`.

The additions below propose exact oracles for SCN-native-auth-012/024/079/080.
They do not change password length-only input, mandatory MFA, private ownership,
session lifetimes, scoped TOTP-key degradation or host authority.

This is a deliberately bounded single-node demo profile, not a measured
multi-user capacity claim. Its policy counts require explicit approval.
Whole-application measurements and reviewed design remain later gates.

## 2. Password verifier and measured reference

- Current password verifiers use Argon2id v19, 65,536 KiB memory, three passes,
  one lane, fresh 16-byte cryptographic salt and 32-byte result.
- Use a maintained Java implementation and versioned, self-describing verifier
  representation. New passwords always use the current profile.
- An existing reviewed predecessor profile of Argon2id v19, 19,456 KiB/two passes/
  one lane with the same salt/result sizes may verify solely to support a safe
  upgrade. Successful full authentication upgrades it without changing the
  password. Never downgrade or overwrite a concurrent credential change/reset.
- Reject unsupported/malformed verifier profiles explicitly rather than
  accepting attacker-controlled unbounded work parameters or a silent fallback.
- Bound active password-hash work to one job per application process, with at
  most four waiting jobs. Queue-plus-evaluation authority has a two-second
  deadline. Busy/expired work produces temporary-service failure, not wrong-
  password failure or late session authority. A still-running expired job holds
  its permit until it ends; no unbounded replacement threads.
- Native reference: [the pinned Java 25 probe](../../../local-env/measurements/pom.xml)
  uses two warmups/seven sequential samples, JVM maximum heap 512 MiB and the
  generated 32-byte input. For that reference only, require median at most
  1,000 ms and maximum at most 2,000 ms. Record actual sample values/configuration;
  never relabel these as end-to-end login latency, throughput or a percentile.
- [Observed results](./evidence/argon2-baseline.json) for the current candidate
  were median 435.572 ms/maximum 510.466 ms. These observations informed review;
  they are not the expected thresholds above and prove no web-server capacity.

No password character/encoding/composition restriction, 72-byte truncation,
plaintext password storage or routine periodic password change is added.

## 3. Recovery verifiers, seeds and randomness

- Recovery codes retain the approved 128-bit/32-hex-character representation.
  Accept either 32 contiguous hex characters or eight groups of four separated
  by hyphens, case-insensitively; canonical form is 32 upper-case hex characters.
  Do not silently normalize other content.
- Store a domain-separated SHA-256 verifier bound to account and current set
  identity using unambiguous length-framed fields. This is for random 128-bit
  codes, never a replacement for adaptive password hashing. Compare verifiers
  safely and consume through the approved atomic one-use transition.
- Recovery verification does not require the TOTP encryption key.
- Encrypt pending/active TOTP seeds with AES-256-GCM, a unique 96-bit nonce per
  key and a 128-bit authentication tag. Authenticate account, stable seed
  identity and representation version; key identifiers are versioned metadata.
  Rotation uses fresh nonce/ciphertext for the same seed. Concrete storage/
  uniqueness/transaction mechanisms require design review, not a cipher fallback.
- Use maintained Java cryptographic randomness for recovery-code 16-byte inputs,
  salts and key material. Inspect generator selection/input sizes and native
  verification; a random-looking string is not entropy proof.
- Seed confidentiality and verifier-only storage require actual supporting
  inspection coupled to real browser journeys. No later seed/code readback or
  operator data-read authority is added.

## 4. Initial admission, progressive delay and delivery policies

All windows use server time, with events in `(now - window, now]`.
Reaching the release/cooldown deadline permits evaluation again. Rate denial
does not extend its own cooldown indefinitely or set a permanent account flag.
The same rules apply before determining registered-account eligibility.

| Policy | Proposed fixed initial profile |
|---|---|
| Authentication/reauth source admission | At most 30 requests per source in 60 seconds |
| Signup source admission | At most ten requests per source in one hour |
| Verification/reset mail-request source admission | At most 20 combined requests per source in one hour, including eligible/ineligible requests |
| Verification/reset mail-request identity admission | At most one combined request per normalized address in 60 seconds and five in one hour; initial signup mail participates |
| Failed-auth history | Rolling 15-minute history per normalized address, including unknown addresses |
| Progressive cooldown after a failed full authentication | Failures 1-4: zero; 5-9: two seconds; 10-19: 30 seconds; 20 or more: 300 seconds |
| Full successful authentication | Clears that identity's failed-auth history/cooldown; consumed factor remains consumed |
| Bounded throttle state | At most 10,000 live identity buckets and 10,000 live source buckets; expire inactive buckets after one hour; never evict live protection to accept more keys |
| State-capacity/dependency exhaustion | Generic temporary-service failure; no account-eligibility disclosure or bypass |
| Mail-work capacity | At most 100 uncompleted requests, including active/delayed/ineligible work; common durable admission and atomic eligible-link issuance |
| Mail delivery | One active send; at most three attempts; retry waits of 60 seconds then 240 seconds after failures; per-attempt timeout ten seconds |
| Mail stop conditions | Before every send/retry: current, unconsumed, unexpired and eligible/enabled; stop on expiry/supersession/disablement or attempt exhaustion |

Source admission counts well-formed requests independently of account existence.
Cooldown-denied requests consume applicable source admission but do not register
another failed credential check. Queue/service errors are not failed passwords.
Do not sleep a request thread to impose progressive delay: expose temporary
retry authority without starting expensive verification.

Initial signup, duplicates and mail-ineligible addresses retain the approved
generic acknowledgement/privacy semantics when admitted. Rate or capacity
failure remains an explicit, eligibility-independent failure. These finite policy
limits are not a promise that a shared NAT or a larger deployment is supported
without review.

### Trusted request-source identity

- Default to the actual connection peer; ignore caller-supplied forwarding
  headers unless that peer belongs to an explicitly configured trusted proxy set.
- The default trusted-proxy set is empty. Deployment must explicitly configure
  its loopback reverse proxy before relying on forwarded client addresses.
- For a trusted peer, use a well-formed `X-Forwarded-For` chain of at most eight
  IP literals, without ports. Walk right-to-left through trusted hops to the
  first untrusted address; if every entry is trusted, use the leftmost entry.
- Missing forwarding metadata conservatively groups the request under the
  connection peer. Malformed forwarding metadata from a trusted peer is an
  explicit request failure, not an opportunity to trust an arbitrary fallback.
- Normalize equivalent IPv4/IPv6 address forms consistently; other forwarding
  headers do not override the selected source. Concrete parsing/trust configuration
  requires reviewed contract tests.

## 5. Secret-safe evidence contract

The complete export inventory is browser traces/HAR/DOM snapshots/screenshots/
video; test stdout/stderr/exceptions/reports/attachments; backend/access/audit
logs; and metrics labels. Runtime mail capture/fixture storage is isolated,
access-controlled, ephemeral and not an exported mailbox or database dump.

- Disable secret-bearing browser recording before password, QR/seed, recovery-
  code, verification/reset-link and session-secret exposure; resume only at a
  known nonsecret state. Do not retain earlier secret buffers in an export.
- Export only reviewed metadata: scenario/correlation identifiers, state/outcome,
  version, counts and resource timings. Never export raw passwords, TOTP seeds/
  QR payloads/codes, recovery codes, tokenized links, cookies or provider keys,
  nor stored password/recovery verifiers.
- Inspect generated secret values and their reviewed escaped/encoded forms
  across every actual export. Require the declared inventory and safe positive/
  negative state evidence; an empty/missing artifact is not a pass by itself.
- Supporting storage/generator/crypto inspection uses isolated runtime values,
  not secret-bearing exported fixtures. Preserve failure evidence without
  leaking those values or weakening assertions.
- Test cleanup targets only explicitly resolved per-case resources. No public
  privileged seed/auth endpoint, forged production session or mocked successful
  authentication screen is permitted.

Recorder transitions, field schemas and exact capture paths belong to the
reviewed implementation/harness design. They may not expand the secret export
allowlist or reinterpret missing evidence as success.

## 6. Version and remaining execution gates

If approved, reconcile these exact policy oracles into requirements/scenarios;
do not derive expected values from the benchmark or future application output.
Approval would permit Phase 3 oracle closure, not claim any scenario has run.

Exact frontend/API/host command contracts, design/task review, application-native
baselines, measured whole-service behavior, freeze, genuine red acceptance and
test lock remain mandatory. DR-036 permits prerequisite feature implementation
only after each increment's own gates. WSL/client feasibility remains external
and blocked until the user completes the approved environment setup.

After approval, preserve v0.1, v0.2 and this addendum unchanged; material later
changes require another reviewed version. As-built diagrams remain separate.
