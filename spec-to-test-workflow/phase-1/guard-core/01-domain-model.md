# Guard-core domain model

Version: 0.1. Prepared: 2026-10-29.
Scope: confirmed guard decision core, not the complete governance product.

## 0. Sources & Traceability

- Spec: [confirmed first-slice requirements](../../../REQUIREMENTS.md#client-independent-guard-decision-core-confirmed-first-slice).
- Scoped register: [ingestion version 0.1](./00-ingestion.md).
- User decisions: DR-012 in the [confirmation record](../05-decision-record.md).
- Requirements covered: REQ-guard-core-001, REQ-guard-core-002,
  REQ-guard-core-003, REQ-guard-core-004, REQ-guard-core-005,
  REQ-guard-core-006, REQ-guard-core-007, REQ-guard-core-008.
- Reviewed diagrams used as inputs: none. This model is derived from the confirmed
  specification; the subsequent intent diagrams require separate approval.
- Blocking domain ambiguities: none in this bounded scope. Later-stage questions
  remain recorded in the scoped ingestion document.

## 1. Ubiquitous Language

- **Submitted message:** the already-identified new human message supplied for
  one evaluation. It does not include unrelated history or context.
  [REQ-guard-core-001]
- **Catalog revision:** the trusted set of rule identities, enabled state, fixed
  effects, priorities and marker categories used for that evaluation, with policy
  identity and version. [REQ-guard-core-002]
- **Finding:** an attributable match reported by the trusted evaluation process
  against the original submitted message. It does not select its own authority,
  effect or priority. Actual detection is outside this core. [REQ-guard-core-002]
- **Effect:** a catalog-owned redaction, denial or approval requirement that
  participates in the final decision. [REQ-guard-core-002/006]
- **Redaction span:** a nonempty portion of the original submitted message that
  a catalog-owned sensitive-data finding requires replacing. [REQ-guard-core-004]
- **Connected redaction group:** redaction spans linked by intersection, including
  transitive links. Adjacent spans without an intersection are separate groups.
  [REQ-guard-core-005]
- **Typed marker:** the replacement identifying the winning redaction category
  without reproducing the sensitive span. [REQ-guard-core-004/005]
- **Prompt decision:** allow, redact, deny or require approval, attributed to the
  applicable catalog revision and findings. It is not delivery authority.
  [REQ-guard-core-003/006/008]
- **Evaluation failure:** inability to produce a valid decision because the
  evaluation input, limits or overlap resolution are invalid. It is distinct from
  both a valid no-match allow and a policy denial. [REQ-guard-core-007]
- **Approval requirement:** a finding that the submitting human must separately
  authorize the exact evaluated/transformed message before delivery. This core
  identifies the requirement but does not grant approval. [REQ-guard-core-006/008]

## 2. Aggregates & Entities

- **Message Evaluation (aggregate root):** owns composition for one submitted
  message under one supplied catalog revision. [REQ-guard-core-001/002/006]
  - **Properties/state:** being evaluated, allowed, redacted, denied,
    approval required, or evaluation failed. Terminal decisions do not themselves
    deliver a message or approve its use. [REQ-guard-core-006/007/008]
  - **Value objects:** original submitted message, catalog revision identity,
    trusted finding set, typed markers, transformed message and decision
    attribution. [REQ-guard-core-001/002/004]
  - **Commands:** evaluate supplied findings; resolve redaction groups; compose
    effects; produce the decision or explicit failure. [REQ-guard-core-004/005/006/007]

- **Catalog Rule (referenced entity):** identified within the trusted catalog
  revision; owns its enabled state, effect, priority and marker category.
  Evaluation must not accept conflicting caller assertions as rule authority.
  Creation, activation and editing of catalog revisions are outside this slice.
  [REQ-guard-core-002/007]

- **Redaction Group (value object):** the connected union of original-message
  spans, all contributing finding identities, and the unique highest-priority
  finding when one exists. A tied highest priority cannot produce a winner.
  [REQ-guard-core-004/005]

## 3. Business Rules (Invariants)

- **INV-guard-core-001:** one evaluation transforms only its supplied submitted
  message; it does not discover or alter other context. [REQ-guard-core-001]
- **INV-guard-core-002:** a valid decision uses a trusted policy identity/version,
  derives effects from that catalog, and retains matched-rule attribution.
  Missing or inconsistent authority cannot produce a valid decision.
  [REQ-guard-core-002/007]
- **INV-guard-core-003:** no findings in an otherwise valid evaluation means
  unchanged allow. Failed evaluation is never equivalent to no findings.
  [REQ-guard-core-003/007]
- **INV-guard-core-004:** redaction spans are nonempty and within the original
  message; their references are not rebased onto already-redacted text.
  [REQ-guard-core-004/007]
- **INV-guard-core-005:** intersecting spans form connected groups, including
  transitive intersections. Adjacent nonintersecting spans remain independent.
  [REQ-guard-core-005]
- **INV-guard-core-006:** each connected union is replaced completely by its
  unique highest-priority finding's marker. Multiple findings tied at that
  group's highest priority fail evaluation, including transitive ties.
  [REQ-guard-core-005/007]
- **INV-guard-core-007:** text outside redaction unions is preserved. Marker
  vocabulary is exactly `[REDACTED_CREDENTIAL]`, `[REDACTED_API_TOKEN]`,
  `[REDACTED_EMAIL]`, `[REDACTED_PHONE]`, `[REDACTED_PAYMENT_CARD]` and
  `[REDACTED_FINANCIAL_ID]` for the corresponding categories.
  [REQ-guard-core-004/005]
- **INV-guard-core-008:** catalog effects are composed without losing redactions:
  any deny wins; otherwise any approval effect requires approval. An approval-
  required message is already redacted where required.
  [REQ-guard-core-004/006]
- **INV-guard-core-009:** without deny or approval effects, transformed permitted
  text has a redact decision and unchanged permitted text has an allow decision.
  [REQ-guard-core-003/006]
- **INV-guard-core-010:** at most 65,536 UTF-8 message bytes and 1,024 findings
  participate in one evaluation. Larger inputs, unknown/inconsistent rules or
  invalid spans fail explicitly, without truncation or partial-success allow.
  [REQ-guard-core-007]
- **INV-guard-core-011:** identifying an approval requirement does not grant human
  approval. An allow/redact result does not prove identity, durable authorization
  or message delivery. [REQ-guard-core-008]

## 4. Domain Events

These are conceptual business outcomes, not a requirement to publish a new
activity record for every internal step.

- **EvaluationAllowed:** a valid evaluation permitted an unchanged message.
  [REQ-guard-core-003/006]
- **EvaluationRedacted:** a valid evaluation permitted the transformed message
  after required redaction. [REQ-guard-core-004/005/006]
- **EvaluationDenied:** a valid evaluation found a catalog denial effect;
  other effects did not convert it to permission. [REQ-guard-core-006]
- **ApprovalRequirementIdentified:** a valid evaluation required separate human
  approval for the evaluated/transformed message; no approval was granted here.
  [REQ-guard-core-004/006/008]
- **EvaluationFailed:** invalid authority/findings, input limits or an overlap
  tie prevented a valid prompt decision. [REQ-guard-core-005/007]
