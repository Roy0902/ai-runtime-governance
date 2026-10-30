# Paused progress: entire Phase 1 readiness

Paused: 2026-10-30, at the user's 18:35 (+08:00) stop request.
Status: **NOT development ready. Work is stopped; resume only when requested.**

Read this file before the older handoff. Several older indexes/status paragraphs
have not yet been reconciled with the latest approvals and scenario changes.
Do not treat their older blocker counts or source fingerprints as current.

## 1. User-authorized goal and boundaries

Authoritative approvals are in the [decision record](./05-decision-record.md).
There are now **38 unique sequential records, DR-001 through DR-038**.

- **DR-035:** prepare the entire confirmed Phase 1, not just native auth, through
  reviewed contracts/design/tasks, freeze, genuine feature-missing red browser
  acceptance and test lock. Bounded project-local tools/downloads and isolated
  loopback measurements/services are authorized.
- **DR-036:** prerequisite increments may be implemented and verified ONLY after
  each one's own approved design, freeze, genuine red acceptance and test lock.
  Then continue downstream readiness. This resolves the earlier conflict between
  auth-before-timeline sequencing and prohibiting all prerequisite implementation.
- **WSL remains user-performed and externally blocked.** Windows-with-WSL is
  still the client-feasibility target. No Windows-native substitution, distro
  installation, user-profile change or private-account sign-in was authorized.
- No global installation/PATH change, unrelated-project modification, real
  outbound email or production credentials. No staging/commits were performed.
- Preserve deferred features. Whole Phase 1 is not complete merely because one
  scoped package or documentation check passes.

## 2. Latest behavioral approvals: do not ask again

### DR-037: auth profile v0.3

[Intent v0.3](./native-auth/04-intent-v0.3.md) explicitly approves the exact
verifier/evidence/admission profile, incorporating unchanged v0.1/v0.2:

- Argon2id current/predecessor profiles, safe rehash, bounded hash work and narrow
  native reference thresholds.
- Recovery verifiers, authenticated seed encryption and cryptographic randomness.
- Exact rolling-window source/address limits, progressive temporary cooldown,
  bounded counter/mail state, retry/send limits and trusted-proxy source rules.
- Complete secret-safe exported-evidence inventory.

This replaces the earlier AUTH-specific numerical deferral. It does NOT approve
unrelated full-gateway/guard/event/transport capacity proposals or claim whole-
application capacity from a sequential hash measurement.

### DR-038: auth profile v0.4

[Intent v0.4](./native-auth/04-intent-v0.4.md) narrows password input only for
browser CR/LF compatibility:

- Password length remains 12-128 Unicode code points.
- Reject received CR/LF and raw pasted line breaks when observable before native
  sanitization. This is a platform constraint, not a strength/composition rule.
- Other valid characters, including spaces, symbols and NUL, remain allowed.
- No silent transformation of permitted text; ordinary passphrase paste/autofill
  remains supported. Do not promise to recover original external text already
  sanitized by native controls.

The user explicitly approved this after an actual Chromium feasibility probe.
Do not revert to either the older unrestricted-CR/LF expectation or broad
character/encoding bans. Exact wire/copy still needs the shared contract review.

### Immutable intent fingerprints

| Approved file | Raw SHA-256 |
|---|---|
| [v0.1](./native-auth/04-intent-v0.1.md) | `5AB84C0B99BDCAB8BF9C419AF6E55C958D1B159E8FFB155F7DE926EA042E6981` |
| [v0.2](./native-auth/04-intent-v0.2.md) | `7FD646D33431671BED907282FE7735DA1F1E6427BECF0A9AD8B019B8A368EE99` |
| [v0.3](./native-auth/04-intent-v0.3.md) | `C78BDBA0B2839F9D907159D4C60391B85EBFC119ADC5CF531629F9B4662A7F67` |
| [v0.4](./native-auth/04-intent-v0.4.md) | `40761C1AD0C1233339B301F17DF6D483B4D6078D6B2CA4D5AB3BC4E62F1622EE` |

All four matched at the pause snapshot. Later versions compose with the older
artifacts; do not overwrite approved bytes. Approval status is external.

## 3. Native-auth workflow position

- Original [domain model v0.1](./native-auth/03-domain-model.md) is retained.
- [Domain model v0.2](./native-auth/03-domain-model-v0.2.md) is the small refinement
  for DR-038, incorporating the original concepts rather than rewriting history.
- [Scenario catalog](./native-auth/05-scenarios.md) now has **94 sequential SCN
  IDs and 271 outline-expanded planned cases; zero active unspecified tags**.
- The last full outline/trace structural pass covered 93 IDs/265 cases before
  DR-038. The pause snapshot confirmed the current 94/271 counts and zero active
  unspecified tags; the newly appended SCN-094 still needs the complete
  structural/trace check on resume.
- Phase 3 business-oracle closure was achieved under DR-037. DR-038 added the
  explicit line-break negative cases; exact UI/API/host/harness/native execution
  contracts are Phase 4 work, not an acceptance pass.
- No acceptance tests have been authored, run red, frozen or locked.
- No application authentication, gateway, timeline or guard feature is implemented.
  The only Java/Node executable code added is prerequisite measurement/probe tooling.

## 4. Exact stopping point: shared contract draft

The last readiness file created before the stop request was:

[contracts/native-auth.openapi.json](../../contracts/native-auth.openapi.json)

Current snapshot:

- JSON parses.
- **20 path entries / 22 operations**.
- Explicitly marked `x-review-status: draft`.
- Defines shared request/response components, strict shapes, browser-context
  purpose, CSRF header, one-time secret responses and error-envelope structure.
- No existing endpoint baseline was captured; the application does not exist.
- It has NOT received full semantic OpenAPI validation, generated-type checks,
  implementation/design review, or user approval as a wire contract.

Still needed to complete Phase 4:

1. Finish the shared checklist referencing this machine contract as the single
   shape definition; do not create divergent frontend/backend shape definitions.
2. Complete error code/status/exact-copy mapping, UI routes/accessible semantic
   locator/copy matrix, operator-command contract, and every-SCN scope mapping.
3. Review new observable details explicitly. Examples already present in the
   machine draft but NOT approved include its email-syntax/length disposition,
   precise context/setup transitions, route/status mappings and cookie details.
4. Declare exact native baseline commands and missing application/harness setup
   dispositions. Do not call a tool measurement an application build baseline.
5. Then follow Phase 5 shared design and separate frontend/backend task planning,
   Phase 6 explicit review, freeze, genuine red browser acceptance and test lock.
   Only after those gates may DR-036 prerequisite feature implementation begin.

No shared-checklist/design/task file for native auth was completed in this phase.
Do not infer that the draft machine contract closed those gates.

## 5. Real prerequisite setup and measurements completed

Tools are project-local, under ignored tool/cache locations. No system Java
or PATH setting was changed.

| Item | Actual state |
|---|---|
| Eclipse Temurin | 25.0.5+8, Windows x64, downloaded and verified against published SHA-256 |
| Maven | 3.9.16 portable, downloaded and verified against published SHA-512 |
| BouncyCastle | `bcprov-jdk18on:1.86`, strict-checksum Maven restore, compiled/executed on Java 25 |
| Existing Node/npm | 22.19.0 / 10.9.3 |
| Playwright | `@playwright/test:1.64.1`, restored under measurement package with lockfile |
| Chromium | Headless Shell 156.0.8078.4 / Playwright build 1248, project-local |
| PostgreSQL / mail capture | Metadata researched; NOT installed/started by this work |
| Maven Wrapper | Still planned; a project wrapper was NOT generated or verified |
| Application/browser server | No application manifests, feature server or app UI established |

Reproducible tooling:

- [Measurement pom](../../local-env/measurements/pom.xml) and
  [isolated Maven settings](../../local-env/measurements/settings.xml).
- [Java measurement helper](../../local-env/measurements/src/main/java/local/governance/measurements/Argon2Measurement.java).
- [PowerShell measurement runner](../../local-env/measurements/run-argon2.ps1).
- [Node measurement manifest](../../local-env/measurements/package.json),
  generated lockfile and [browser probe](../../local-env/measurements/probe-password-input.mjs).
- [Ignore rules](../../.gitignore) exclude local tools/cache, dependency/build
  directories and live fixture runtime data.

### Argon2 observations

[Machine-readable evidence](./native-auth/evidence/argon2-baseline.json):

| Profile | Median | Sample maximum | Sampled peak working set |
|---|---|---|---|
| 19 MiB / two passes / one lane | 99.392 ms | 171.484 ms | 180,965,376 bytes |
| 64 MiB / three passes / one lane | 435.572 ms | 510.466 ms | 377,495,552 bytes |

Two warmups/seven sequential samples per profile, shared Windows host, eight
logical processors, maximum JVM heap 512 MiB. No HTTP, database, MFA, email or
concurrent-load behavior was measured. These are not production percentiles,
login capacity or whole-service memory guarantees.

The initial runner lost the child's exit code through its PowerShell process
wrapper. It was changed to own a .NET process/drain both streams, then a complete
rerun passed. Do not count the incomplete first run as a separate success.

### Browser feasibility observation

[Machine-readable evidence](./native-auth/evidence/password-input-feasibility.json):

- Ordinary text and NUL were preserved by both probed controls.
- Native password input removed LF, CR and CRLF.
- Textarea preserved LF but normalized CR/CRLF.
- Synthetic short probe text only; no real credential, server or outbound page
  requests. This informed DR-038, not an application acceptance result.

The integrated browser service timed out and stalled work. The local Playwright
runner succeeded afterwards; use it for subsequent checks rather than relying
on the unresponsive integrated service. The normal npm PowerShell shim also
failed in one invocation; running its installed Node CLI directly succeeded
without editing global tooling.

### Useful local commands/constraints

Use the existing project-local Java/Maven paths in the runner. For the browser,
set `PLAYWRIGHT_BROWSERS_PATH` to this project's `.local-tools\playwright`.
The successful dependency/probe invocation used the installed entry points
`D:\nodejs\node.exe` and `D:\nodejs\node_modules\npm\bin\npm-cli.js`.
Use project-local cache, no global installation.

The measurement runner currently writes `argon2-baseline.json` at a fixed path.
That report is referenced by approved v0.3. Preserve the existing evidence before
any future rerun; do not accidentally replace a referenced observation with a
new run and pretend they are the same evidence.

## 6. Resolved package-version research, not installed app dependencies

Public metadata was inspected; only the measurement dependencies above were
actually restored.

- Spring Boot 4.1.2 was the latest published stable 4.x returned by the probe.
- React 19.3.1, Vite 8.3.5, React plugin 6.1.2 were resolved. The plugin's extra
  compiler/Babel peers are optional, not mandatory missing dependencies.
- OpenAPI TypeScript 7.13.0 requires TypeScript `^5.x`.
  TypeScript 5.9.3 was verified as a compatible candidate; latest 7.0.2 must NOT
  be chosen blindly with that generator.
- Embedded PostgreSQL library 2.2.2 and Windows binary artifact versions including
  18.6.0 were discovered; no fixture initialization/connectivity result exists.
- Mailpit v1.32.0 Windows AMD64 release was located; not downloaded or started.

Recheck and pin transitive compatibility during actual setup. A metadata response
is not a successful build or proof of service/client compatibility.

## 7. Whole Phase 1 and external blockers

[Full readiness audit](./10-full-phase1-readiness.md) was created after DR-035.
Its sequencing-choice paragraphs are now historical: DR-036 resolved that
choice. Its package inventory/measurement limits remain useful.

Auth is only one part of the goal:

- Guard core has an approved library intent/contract and 29 draft scenarios, but
  its old subprocess acceptance proposal is superseded by mandatory frontend
  acceptance. It still needs an actual reviewed frontend/service evidence path,
  design/tasks and freeze/red/lock.
- Timeline has 30 draft SCNs and draft design/tasks. The
  [review findings](./timeline/08-review.md) still require membership/error/
  navigation/identifier/harness/setup closure and actual verified auth dependency.
- Global detector catalog, policy/approval, gateway identity/dispatch/transport,
  client onboarding/consent/coverage and metadata reliability/recovery contracts
  remain open. Auth approvals do not resolve all 14 global ambiguity groups.
- At least one real guarded client/version/environment is required for release;
  neither candidate has that proof. Intended WSL/client setup is still explicitly
  user-performed and blocked. Do not substitute Windows-native or toy-provider
  observations for the intended live evidence.

## 8. Snapshot integrity and unfinished reconciliation

Read-only checks at pause:

- `git diff --check` passed.
- DR-001 through DR-038 are sequential/unique.
- Current scenario snapshot: 94 IDs / 271 planned cases / zero active unspecified tags.
- All four approved intent raw hashes match the table above.
- Draft OpenAPI is valid JSON with 20 paths/22 operations; semantic validation
  and generated bindings are still pending.

Current raw source fingerprints:

| Source | SHA-256 |
|---|---|
| [Requirements](../../REQUIREMENTS.md) | `EA0A567B471BE543F8EE7C337B367175B590AA08F19A6A8625137EEA9361B4F1` |
| [Technical baseline](../../TECHNICAL_BASELINE.md) | `09C0C8213A7165F7486C6C48BB349434EAB304901D2F9D47DE015BC60AA49A16` |
| [Decision record](./05-decision-record.md) | `CED75280EA062B1FD55C797A1E8BDE8B07F2F93C515B45FADCDE3AE8BAD32B18` |

**Important reconciliation debt:** source inventories, package READMEs,
recommendations, coverage plan and the
[older handoff](./REMAINING-WORK-HANDOFF.md) still contain stale DR-034-era
counts/fingerprints/permission wording. Reconcile them from DR-035 through
DR-038 and this snapshot before relying on them. Do not change approved intent
bytes to repair an index.

All work remains uncommitted. The worktree was already dirty; preserve existing
and unrelated changes. No frozen plan, freeze manifest, locked test suite or
feature implementation exists. No application acceptance test has passed or run.

## 9. Process state at pause

No running local helper/server was reported by the shell-session listing.
The local browser command is completed (exit 0); its script closes its owned
browser in `finally`. No PostgreSQL/mail/app service was started. The integrated
browser request returned a timeout with no usable page handle; it was an
`about:blank` probe, not an app session or credential flow.

## 10. Suggested resume instruction

> Resume from SESSION-PROGRESS-2026-10-30-1835.md, not the stale older handoff.
> Preserve DR-001 through DR-038 and all four approved intent fingerprints.
> Reconcile status/inventory debt, validate current SCN-094/94-ID catalog, and
> finish native-auth Phase 4 from the draft machine contract. Then design and
> separate task lists, explicit review, healthy bootstrap/native baselines,
> freeze, genuine red browser acceptance and test lock. Only then implement/
> verify prerequisites under DR-036. Continue the entire confirmed Phase 1,
> while keeping the user-performed Windows-with-WSL gate honestly blocked.
> Avoid small engineering-preference forms and the stalled integrated browser;
> use bounded project-local tools and actual evidence.
