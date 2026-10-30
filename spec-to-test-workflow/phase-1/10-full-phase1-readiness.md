# Entire Phase 1: pre-implementation readiness audit

Version: 0.1. Recorded: 2026-10-30, after DR-035.
Verdict: **NOT development ready. Shared prerequisites have progressed; scope,
dependency sequencing, observable contracts and client feasibility still block
the requested whole-program finish line.**

## 1. Target and scope

DR-035 in the [decision record](./05-decision-record.md) authorizes preparing the
entire confirmed Phase 1 through reviewed design, frozen plans and locked genuine
feature-missing browser acceptance. It authorizes bounded project-local setup,
not global changes, production credentials, real outbound email or feature
implementation. The 22 deferred and ten proposed source rows are not silently
promoted; the 43 confirmed rows retain their open-contract obligations.

The [source specification](../../REQUIREMENTS.md) and
[canonical workflow](../../../spec-to-test-workflow/.github/skills/spec-to-test-workflow/SKILL.md)
remain authoritative. A passed documentation count is not runtime readiness.

## 2. Sequencing issue requiring an explicit direction

DR-018 requires native authentication to be separately implemented and verified
before timeline delivery relies on it. Its real-browser acceptance cannot be
replaced with forged sessions, a mocked login or a unit-only helper.

Therefore:

1. Native-auth can first reach its pre-implementation freeze/red/lock gate.
2. Its implementation and verification must then occur before downstream
   timeline acceptance can rely on genuine authenticated journeys.
3. If all feature implementation remains prohibited, downstream design can be
   prepared, but the entire dependency chain cannot honestly be declared
   acceptance-ready with independent correct-reason red evidence.

Dependency-missing red is not automatically proof that the downstream feature
itself is missing. Do not mark the entire program ready by counting many tests
that all fail in a missing upstream login.

An explicit choice is required between preserving the no-implementation boundary
and accepting staged readiness, or authorizing prerequisite implementation only
after each increment's own reviewed freeze/red/lock gate.

## 3. Package and full-release contract audit

| Surface | Current evidence | Remaining pre-implementation gate |
|---|---|---|
| Native auth | Approved composed intent v0.2; 83 SCNs/215 planned cases | Four unspecified IDs: 012/024/079/080; reviewed contracts, baseline/design/tasks, freeze/red/lock |
| Guard decision core | Approved intent/library contract, 29 SCNs | Frontend acceptance requirement supersedes old subprocess proposal; actual reviewed frontend/service evidence path, design/tasks, freeze/red/lock |
| Timeline | Approved intent, 30 draft SCNs, draft shared design and seven frontend/ten backend tasks | R-TL-001/003/004/005/008; genuine auth dependency; review/freeze/red/lock |
| Actual detection/policy/approval/gateway | Confirmed global requirements plus unapproved proposal catalog | Exact reviewed catalog/approval/policy/error/dispatch/transport/resource contracts and complete workflow artifacts |
| Client onboarding/mapping/lifecycle | Two documented candidate clients; neither verified in intended environment | Actual pinned-client feasibility, trusted new-human-message mapping, approval delivery, consent/cleanup, coverage and protocol evidence |
| Metadata reliability/recovery | Confirmed fail-closed guarding and outbox/incompleteness obligations | Concrete transaction/retry/uncertainty, storage lifecycle and backup/restore objectives/contracts |

Use the [global ambiguity register](./02-ambiguity-register.md) for all 14
cross-cutting groups; scoped auth approvals resolve only their selected parts.
Use [timeline review](./timeline/08-review.md) for exact open findings, not a
generic coverage count.

## 4. Authorized prerequisite setup actually performed

Project-local only; no system Java/PATH change:

| Tool | Exact version | Evidence |
|---|---|---|
| JDK | Eclipse Temurin 25.0.5+8, Windows x64 | Official Adoptium ZIP verified against published SHA-256 `636bdc13dc649ddc7d5921c5c7d23cca6e44fd19d662b45cc9c02135a6c96c42`; local version command passed |
| Maven | 3.9.16 portable | Maven Central ZIP verified against published SHA-512 `ed41650d42485cfc243fad22158caf9cbb5dc408ce7a09ddb94dd42a019de929ca43065bfa450612cf12bf78b5cafa3884b96c090de326ff590448c933454af3`; measurement build passed |
| Cryptographic dependency | BouncyCastle bcprov-jdk18on 1.86 | Pinned measurement manifest; strict-checksum Maven resolution; compiled and executed on JDK 25 |
| Existing Node/npm | 22.19.0 / 10.9.3 | Read-only version probe; no global package installation |

Installed tool/cache locations are excluded by the project's
[ignore rules](../../.gitignore). They are prerequisites, not application code.
No PostgreSQL, mail service, browser/server application or WSL setup is claimed
by this step. Those runners and exact service versions remain to be established.

## 5. Bounded actual Argon2 observations

Reproduce with [run-argon2.ps1](../../local-env/measurements/run-argon2.ps1).
The [measurement manifest](../../local-env/measurements/pom.xml) and
[hashing helper](../../local-env/measurements/src/main/java/local/governance/measurements/Argon2Measurement.java)
are tooling for candidate evaluation, not authentication feature implementation.
Full machine-readable results and source/manifest fingerprints are in
[argon2-baseline.json](./native-auth/evidence/argon2-baseline.json).

Conditions: Windows shared host, eight logical processors; one hashing job;
JVM maximum heap 512 MiB; two warmups and seven samples per profile; generated
ephemeral inputs/salts never printed. Each process has a 60-second bound.

| Candidate | Median core hashing | Maximum of seven samples | Sampled peak working set |
|---|---|---|---|
| Argon2id, 19 MiB, two passes, one lane | 99.392 ms | 171.484 ms | 180,965,376 bytes |
| Argon2id, 64 MiB, three passes, one lane | 435.572 ms | 510.466 ms | 377,495,552 bytes |

Both use 16-byte salt/32-byte output. These are **observations, not approved
acceptance thresholds, login throughput, percentiles or whole-server capacity**.
No HTTP, credential comparison, persistence, MFA, email or concurrent load is
included. Sampled working set is not a guaranteed OS peak; summed heap-pool
peaks in the JSON are not simultaneous total live heap.

The initial runner lost the child's exit code through its PowerShell process
wrapper, despite valid first-profile output. That run was not reported as a
completed measurement. The runner now owns the .NET process and drains its two
output streams; a full rerun passed. No measurement parameters were weakened.

## 6. User-controlled client/environment dependency

The [feasibility report](./06-integration-feasibility.md) records Windows with
WSL as the confirmed target, with no registered distro in the earlier probe,
assistant installation declined and user-performed setup deferred. This report
does not silently replace that target with Windows-native testing.

DR-035 permits local tools but does not authorize system-level distro installation,
VS Code profile changes, GitHub sign-in or production credentials. Live
WSL/client readiness needs current user-supplied setup or an explicitly approved
target change. Read-only rechecks are distinct from installing or modifying it.

Client support and the required guarded-release evidence are not inferred from
public documentation, a toy provider or the hashing benchmark.

## 7. Immediate work frontier

- Confirm staged readiness versus permission to implement prerequisites after
  their own gates; retain the current no-feature-implementation boundary until
  explicitly changed.
- Review the source-backed auth verifier/evidence and bounded initial policy
  proposal against actual measurements; no costs or rate counts are approved
  merely because they were measured or recommended.
- Resolve the timeline membership/error/identifier proposal as a coherent
  observable contract, plus the full guard/gateway/client proposal gaps.
- Keep all intent versions immutable, preserve stable IDs and obtain actual
  Phase 6 approval before freeze. No acceptance tests have yet been authored,
  run red or locked in this work.
