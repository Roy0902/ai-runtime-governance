# First client-independent slice: guard decision core

Version: 0.2. Prepared: 2026-10-29.
Status: **Scope and behavior package approved by the user; DR-012.
Domain/design preparation may proceed; implementation/freeze gates remain.**
Feature key for scoped materials: `guard-core`.

## 1. Why this slice

WSL is deferred integration work, not a prerequisite for domain/design work or
client-independent Java development. The proposed first slice is the reusable
guard decision core: **trusted rule findings plus a catalog revision become an
attributable decision and a correctly redacted message**.

This is not yet a complete detector, gateway or guard-capable client integration.
It is a cohesive part needed by the later guard engine. Starting here avoids
inventing an external provider protocol or blocking on client installation.
The [full Phase 1 requirements](../../REQUIREMENTS.md#client-independent-guard-decision-core-confirmed-first-slice)
record the approved refinements without removing other release requirements.

## 2. Boundaries

| Included in this slice | Explicitly outside this slice |
|---|---|
| Effects from trusted findings for one already-identified new human message | Discovering/authenticating that message inside an agent/provider request |
| Compose redaction, deny, require-approval and allow | Detecting actual secrets/injection/safety/weak-prompt patterns |
| Priority-aware redaction with attributable rule IDs and policy identity/version | Final built-in detector catalog, regex engine and provider compatibility |
| Explicit failure for invalid/inconsistent evaluation input | Active policy persistence, authorization to edit policy or toggle UI |
| Bounded message/finding input and deterministic synthetic examples | Human approval delivery/authentication, expiry/cancellation state machine |
| A result that cannot itself invoke an upstream model | Database/outbox/dispatch, response streaming, hooks, timeline and accounts |
| Client-independent domain/design/supporting-test preparation | WSL setup and claims of verified OpenCode/Copilot support |

Inputs are owned internal evaluation data, not a public API accepting user/model-
supplied policy authority. `require-approval` is a decision, not approval granted.
An allow/redact result is not proof of durable authorization or dispatch.

## 3. Already-confirmed behavior reused without another vote

- Inspect/transform only the identified newly submitted human message.
- Apply all relevant sensitive-data redactions before any approval forwarding.
- Any deny effect wins; otherwise any approval effect requires approval; otherwise
  allow, or identify a redaction outcome when the permitted text was transformed.
- No matching enabled rule means allow; evaluation failure never means allow.
- Priorities and effects come from the trusted built-in catalog, not request/
  model content. Attribute the result to policy identity/version and matched rules.
- A top-priority overlap tie is an evaluation error, not arbitrary winner selection.

Sources: GUARD-001 through GUARD-003, POL-001 through POL-003 and POL-006 in the
[requirements](../../REQUIREMENTS.md#policy-management-and-enforcement).
Only their core-decision portions are included; do not mark the full source rows
implemented or accepted when this module works.

## 4. Confirmed package choices

The user explicitly approved this package for the guard-core slice. These are
not approved defaults for every gateway/runtime resource:

1. **Overlap resolution:** group intersecting findings, including transitive
   connections. Replace the complete union with the highest-priority finding's
   typed marker. More than one finding tied at the group's top priority fails
   evaluation, even if the connection is through another interval. Adjacent
   nonintersecting findings remain separate. This may conservatively redact
   extra text and is a concrete extension of the existing overlap semantics.
2. **Marker vocabulary:** use `[REDACTED_CREDENTIAL]`,
   `[REDACTED_API_TOKEN]`, `[REDACTED_EMAIL]`, `[REDACTED_PHONE]`,
   `[REDACTED_PAYMENT_CARD]`, and `[REDACTED_FINANCIAL_ID]` for those
   catalog categories. This selects replacement text, not actual matcher rules.
3. **Input bounds:** at most 64 KiB of UTF-8 message text and 1,024 findings for
   one evaluation. Above either bound, fail explicitly; never truncate, silently
   discard findings or return an allow-shaped fallback.
4. **Invalid input:** missing policy identity/version, unknown catalog rule,
   findings inconsistent with the enabled catalog or invalid/empty/out-of-range
   redaction spans fail evaluation. Derive action/priority/marker from the catalog,
   never from a caller's asserted effect. Exact internal result/error types and
   text-offset representation belong to the subsequent reviewed design/contracts.

No regex patterns, additional weak-prompt denials, approval timeout, runtime-key
lifetime or resource values outside this package are approved by accepting it.

## 5. Scoped requirement skeleton

These are approved refinements of existing source requirements, not additions to
the current global count. They receive scoped IDs so later materials can trace
exactly what this first slice does and does not prove.

| Scoped REQ | Statement | Parent source | Coverage obligation |
|---|---|---|---|
| REQ-guard-core-001 | One evaluation affects only the supplied identified message | GUARD-001, GUARD-005 | Preserve unrelated text; no history/context discovery claim |
| REQ-guard-core-002 | Derive effects from the trusted enabled catalog, with explicit policy/rule attribution | POL-001, POL-006 | Version/rule attribution; forged or inconsistent finding failure |
| REQ-guard-core-003 | Allow an otherwise valid evaluation with no findings | POL-002 | Exact unchanged text; distinguish valid empty findings from evaluator failure |
| REQ-guard-core-004 | Apply nonoverlapping typed-marker redactions to original spans | GUARD-002, POL-002 | Exact replacements, adjacent findings, Unicode surrounding content |
| REQ-guard-core-005 | Resolve connected overlaps by approved union/priority semantics; reject top ties | POL-002; package choice 1 | Nested/transitive/adjacent findings; no partial sensitive span left |
| REQ-guard-core-006 | Compose deny, approval and permitted outcomes without losing redactions | GUARD-002, POL-002 | Deny dominates; approval receives transformed text; no-match allow |
| REQ-guard-core-007 | Fail explicitly for invalid evaluation input or selected bound overflow | GUARD-003, POL-003; package choices 3/4 | Missing policy, unknown rule, inconsistent/invalid span, exact limits and limit+1 |
| REQ-guard-core-008 | Produce no forwarding or human-approval authority by itself | GUARD-004 through GUARD-006, OPS-002 | Module result is not dispatch, identity proof, approval or durability evidence |

All rows are confirmed for scoped domain modeling; exact contracts, scenarios
and acceptance setup remain later gates. Synthetic rule descriptors test composition only; they are not user-
authored production rules or evidence of any real detector's coverage.

## 6. Gate-specific remaining work

| Gate | What is needed | Is WSL required? |
|---|---|---|
| Scoped ingestion/domain | Scope/package confirmed; prepare the scoped register and pure domain model | No |
| Intent diagram | Draft business flow and failure branches from scoped requirements, then user approval | No |
| Scenarios/contracts | Exact examples, result/error contract, offsets and boundary semantics | No |
| Shared design and task list | Java/toolchain discovery, ownership/naming, native checks and supporting tests | No |
| Acceptance setup/freeze | Resolve the reusable workflow's Playwright/API assumptions versus a library-only slice; do not silently substitute JUnit or invent a production endpoint | No |
| Code implementation | Reviewed design/tasks, appropriate acceptance plan and genuine red evidence before implementation | No |
| Integrated gateway/client acceptance | Verified mapping, authenticated approval, durable dispatch and selected protocol/environment | WSL only for WSL-specific tests |

The acceptance-runner choice is an explicit Phase 4 setup decision, not permission
to bypass freeze/lock rules or to treat supporting tests as locked acceptance.
The first slice is not declared implementation-ready merely because its business
model can be prepared.
