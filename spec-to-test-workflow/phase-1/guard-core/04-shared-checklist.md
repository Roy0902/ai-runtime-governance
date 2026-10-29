# Guard-core shared checklist and contracts

Version: 0.1. Prepared: 2026-10-29. Phase 4.
Status: **Prepared for setup/contract confirmation; not a frozen contract.**

**Review update (DR-014):** the library contract in section 3 and Java 25/local
Maven Wrapper direction are approved. The subprocess acceptance proposal in
section 6 is **not approved**: the user requires real frontend acceptance tests
through this workflow, with unit tests only supplementary. Section 6 is retained
as superseded proposal context. Frontend journey/scope must now be resolved
before the implementation design and task lists are finalized.

Sources: [scenarios](./03-scenarios.md), [domain](./01-domain-model.md),
[approved intent v0.1](./02-intent-v0.1.md), [scoped ingestion](./00-ingestion.md).
Behavior comes from the specification and approved intent, not the environment
or proposed type names below.

## 1. Architecture context

This target is greenfield: root inspection found source specifications and
workflow artifacts, but no Maven/application/frontend manifests, application
source, tests or Playwright configuration. No target AGENTS.md was found.
There are no existing routes, seed records, authentication middleware or screens
to reuse in the affected area. The unrelated stock projects are not patterns for
this Java library.

Selected product direction is Java 25/Maven. Current Windows PATH resolves Java
and javac through Oracle's javapath; `java -version` reports Java 21.0.5. Maven is
not on PATH. This is a PATH observation, not proof no other JDK/Maven installation
exists. Node/npm/git commands are available. No package was installed and no
application build was attempted without a manifest.

WSL is not needed for this slice. Spring Boot, PostgreSQL, login, HTTP routing,
actual detector matching and a frontend are not dependencies of the core.

### Checklist ownership

| Item | Responsibility | Surface |
|---|---|---|
| CHK-CORE-001 | Catalog/rule/finding types and authority validation | Backend library |
| CHK-CORE-002 | Original-message spans, Unicode handling and size/count bounds | Backend library |
| CHK-CORE-003 | Connected overlap resolution and typed-marker transformation | Backend library |
| CHK-CORE-004 | Effect composition, attribution and explicit failure result | Backend library |
| CHK-CORE-005 | No approval grant, persistence or network side effects | Backend library |
| CHK-CORE-006 | Protected scenario acceptance, supporting tests and native checks | Backend/test setup |

## 2. Scenario-to-scope map

Each SCN identifier below means `SCN-guard-core-###`. All have backend library
surface; proposed test level is library acceptance, not HTTP/API acceptance.
The linked scenarios carry their full REQ tags. No frontend task is applicable.

| SCN suffix | Observable behavior | Checklist | REQ suffixes |
|---|---|---|---|
| 001 | No-findings allow and policy attribution | 001, 004 | 002, 003 |
| 002 | Six exact markers | 001, 003, 004 | 002, 004 |
| 003 | Disjoint replacements | 003 | 004 |
| 004 | Adjacent equal-priority spans remain distinct | 003 | 004, 005 |
| 005 | Nested union with winning marker | 003 | 005 |
| 006 | Partial-overlap union | 003 | 005 |
| 007 | Transitive overlap | 003 | 005 |
| 008 | Direct top tie fails | 003, 004 | 005, 007 |
| 009 | Transitive top tie fails | 003, 004 | 005, 007 |
| 010 | Unicode surroundings unchanged | 002, 003 | 001, 004 |
| 011 | Deny | 004 | 006 |
| 012 | Approval requirement, not approval granted | 004, 005 | 006, 008 |
| 013 | Approval with redacted text | 003, 004 | 004, 006 |
| 014 | Deny/approval/redaction composition | 003, 004 | 004, 006 |
| 015 | Deny/redaction composition | 003, 004 | 004, 006 |
| 016 | Deny dominates approval | 004 | 006 |
| 017 | Unknown rule fails | 001, 004 | 002, 007 |
| 018 | Missing identity/version fails | 001, 004 | 002, 003, 007 |
| 019 | Message text cannot choose effect | 001, 004 | 002 |
| 020 | Disabled-rule finding fails | 001, 004 | 002, 007 |
| 021 | Invalid spans fail | 002, 004 | 004, 007 |
| 022 | ASCII byte boundaries | 002, 004 | 003, 007 |
| 023 | UTF-8 multibyte boundaries | 002, 004 | 003, 007 |
| 024 | Finding-count boundaries | 002, 003, 004 | 003, 004, 005, 007 |
| 025 | Independent message preserved | 002, 005 | 001 |
| 026 | Allow is not authority/delivery | 004, 005 | 003, 008 |
| 027 | Finding-order independence | 001, 003 | 002, 005 |
| 028 | Deny does not hide tie failure | 003, 004 | 005, 006, 007 |
| 029 | Deny does not hide count overflow | 002, 004 | 006, 007 |

## 3. Shared contract matrix

### Production HTTP/API contracts

None: this slice is a library, not a server. No endpoint, authentication header,
HTTP status, live response capture or regression baseline is applicable.
Do not introduce a production route simply to reuse an API-test example.

### Proposed library contract for confirmation

This is the single definition of the proposed shared library shape for Phase 5.
Names/placement are representative; behavior and representation require review.

| Element | Proposed shape / rule |
|---|---|
| Input | Submitted message, trusted policy ID/version, trusted catalog rules and ordered collection of findings |
| Rule | Rule ID, enabled state, fixed effect; redaction rules additionally own integer priority and one approved marker category |
| Finding | Rule ID and redaction span only where the rule requires redaction; never caller-owned action/priority/marker |
| Span | Zero-based Unicode code-point offsets, start inclusive/end exclusive; positive length and within the original message |
| Text validity | Reject unpaired UTF-16 surrogates rather than silently replacing them during UTF-8 sizing; valid surrogate pairs count as one code point |
| Valid decision | Outcome ALLOW/REDACT/ DENY/REQUIRE_APPROVAL, transformed message, policy ID/version, matched-rule IDs as a set; no approval/dispatch flag |
| Failure | Distinct failed-evaluation result, no valid decision or transformed-message success; one or more machine-readable reasons, no promised first-error ordering |
| Failure categories | INVALID_POLICY, INVALID_FINDING, INVALID_TEXT, MESSAGE_LIMIT_EXCEEDED, FINDING_LIMIT_EXCEEDED, OVERLAP_PRIORITY_TIE |
| Attribution | Include all matched rules, including lower-priority redactions and deny/approval matches; order is not an acceptance requirement |
| Input ownership | Do not mutate supplied collections/message data; no global mutable evaluation state |
| Limits | Already approved: at most 65,536 UTF-8 message bytes and 1,024 findings |

Proposed new contract choices are not test oracles until approved and reconciled
into the source specification. Malformed-text handling and exact error assertions
need additional scenarios after that approval. No existing scenario's expected
behavior is changed to match an implementation.

## 4. UI element and copy matrix

Not applicable: no frontend, browser view or user-facing copy in this library
slice. The product's login/timeline/client approval interfaces remain separate.
No locators, test IDs, UI wording or accessibility results are fabricated.

## 5. Discovery notes

No existing screen/route exists in scope, so playwright-cli screen discovery is
not applicable. No live model response or source implementation was used as an
oracle. Inputs are bounded synthetic fixtures, not real secrets.

## 6. Coverage and acceptance setup proposal

All 29 scenarios map to backend work; Phase 5 will assign exact task IDs.
All eight REQs and eleven invariants have coverage in the scenario document.
Frontend task list: not applicable, with no frontend code to study or change.

**Superseded, not approved proposal:** keep Playwright/TypeScript
acceptance at the guard's protected path `tests/api/guard-core.spec.ts`, but test
the Java library through a **test-only local subprocess bridge**, not an HTTP
server. Use synthetic JSON input/output over stdin/stdout to the bridge. The
bridge translates fixture data/results only; it must not implement composition,
provide a replacement oracle or turn errors into success.

The name `tests/api` is the existing freeze guard's mechanical selection path,
not a claim that the library has an HTTP API. This is a reviewed adaptation of
the workflow's acceptance setup, not silent replacement by supporting JUnit.
No browser, locator helper or browser-driven playwright-cli execution is needed
for subprocess-only acceptance; explicitly approve their inapplicability.

Keep the bridge outside production source and test helpers under review. The
guard does not lock every helper/configuration file; Phase 6 must include bridge/
runner review and guard-integrity checks against weakened setup. Supporting JUnit
tests remain under Maven's native test layout, outside protected acceptance files.
Before red evidence, the harness must compile/run independently, so a missing
compiler or broken bridge is not mislabeled a feature-missing red failure.

Alternative: formally extend the target workflow/guard to protect native Java
acceptance files, with regression tests and explicit approval. That is more
tooling work; do not make that change without a decision.

## 7. Native baseline and setup gaps

| Check | Command / directory | Observed baseline | Disposition |
|---|---|---|---|
| Java runtime discovery | `java -version`, target root | Java 21.0.5, not selected Java 25; PowerShell rendered stderr as NativeCommandError text | Setup gap, not an application test failure |
| Maven discovery | PATH lookup, target root | `mvn` unavailable | Setup gap; wrapper/version setup not yet approved/created |
| Compilation/build | No manifest/command exists | Not run | Establish Maven Wrapper and JDK 25; no clean baseline claimed |
| Supporting tests | No test manifest exists | Not run | Propose JUnit 5 in native Maven test layout |
| Format/static analysis | No configuration exists | Not run | Select compatible pinned tools during setup; no blanket suppressions |
| Protected acceptance | No runner/bridge exists | Not run | Approve explicit subprocess adaptation before creating tooling |
| Browser build/type-check | No frontend in slice | N/A | Not a missing frontend pass; no browser application is being built |

No exact future build command is reported as an existing working script.
Proposed later commands include Maven Wrapper verify and Playwright's selected
guard-core test file, but their final working directories/configuration follow
the reviewed implementation design and actual manifests.

## 8. Handoff

Business scenarios and intent are prepared. Resolve library representation,
acceptance adaptation and Java/Maven setup choices next. Then prepare the shared
implementation design and backend file-level task list, perform Phase 6 review,
and only afterward freeze/author genuine red acceptance tests. No implementation,
dependency installation, WSL setup or acceptance freeze occurs in this document.
