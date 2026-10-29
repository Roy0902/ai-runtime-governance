# Phase 0: Source inventory

Version: 0.4. Captured: 2026-10-29. Feature: `runtime-governance`.

## 1. Artifact inventory

SHA-256 values below are raw-file fingerprints of the current working tree, not
the freeze guard's normalized plan hashes. They distinguish uncommitted revisions
from their repositories' HEAD commits.

| Artifact | SHA-256 | Sections used / authority |
|---|---|---|
| [REQUIREMENTS.md](../../REQUIREMENTS.md) | `00E9CCDAD6277625F68B586CE6832C6E793598D6BCF929D1CB44EEEB53C3AF1D` | 72 global rows remain stable. Includes DR-015/DR-016's metadata-only read-only timeline refinements, preserved guard-core choices and native account/session behavior. Other release contracts remain open. |
| [README.md](../../README.md) | `BDAF339E9C81143FF82C99EB433D69155FAF5F02E64344CCFE859B65A3CA1A3A` | Product context with confirmed timeline-first frontend delivery; core/client gates preserved and WSL deferred. |
| [TECHNICAL_BASELINE.md](../../TECHNICAL_BASELINE.md) | `23F9F4035E35490C6585740C8E9D70A5647AF7ECD74F648B1E05F4FD72CBAA15` | Architecture direction with selected native 2FA, same-host credential storage, persistent session limits, signup verification and private scope/gateway admission; other choices retain their status. |
| [PENDING-DESIGN-DECISIONS.md](../../PENDING-DESIGN-DECISIONS.md) | `F39A448A4D74CE0F51BC99B2538A6D73FFF0060A7C9088CB8BD8CE8FC29669F0` | PD-01 through PD-11 and confirmed timeline read package; exact query/UI/auth setup and full detector/client lifecycle remain open. |
| [Canonical workflow](../../../spec-to-test-workflow/.github/skills/spec-to-test-workflow/SKILL.md) | `6A0D84DC14A6CF9EEC068863354AD9FDE327BC2BD0F5071BB9F929685DCC916A` | Phase order, gates, hard rules, progressive context, adoption and freeze boundaries. Process authority, not product behavior. |
| [Spec-ingestion skill](../../../spec-to-test-workflow/.github/skills/spec-ingestion/SKILL.md) | `E9D14F318823B7DE550314BB0E76CC42849D621A7ED8EECBEBC2BE145332EF76` | Inventory, precedence, oracle separation, register format, coverage obligations and exit criteria. |
| Reviewed intent diagrams | Missing | README text diagrams are explanatory, not an approved versioned Phase 2 Mermaid artifact. AMB-runtime-governance-012. |
| Reviewed development task list | Missing | Must be produced after shared contracts/design; not an oracle. AMB-runtime-governance-012. |
| Target application contracts, source, tests, manifests | Not present in inspected target root | No application pattern or native command established. AMB-runtime-governance-013. |

Target repository HEAD: `69a55fc134dcd102918dafb964625090dfec8cd0`.
All four source documents were already modified before this work.
Workflow repository HEAD: `498f62db38c97cded24ad1228e15603f21aa052b`.
That repository also has existing modified/untracked workflow files. Its current
canonical skill files, not historical redirects or HEAD alone, governed this run.

### Original ingestion snapshot (superseded, retained for audit)

Before the explicit user confirmations, there were 67 requirement rows: 35
confirmed, 10 proposed and 22 deferred. The four original fingerprints were:

- REQUIREMENTS.md: `5C63B3FDCC2E342D0FA06448E212F7E842634A4CAC96177CB3C04FA1A91B6305`
- README.md: `85DCC4EDBDD01D93311E8768EA71A934A31201833C3E045C7B41C806AE4ECF2D`
- TECHNICAL_BASELINE.md: `934DCCE695F39259409FA1384F3946DA815A66818E11FB01F8E22E0C678BEB74`
- PENDING-DESIGN-DECISIONS.md: `C58AF346D36F5C1373742ED780C9A3588B49FEA39B77D145598DE635CDC28E47`

Only the expressly confirmed choices in the
[confirmation record](./05-decision-record.md) motivated the current source
amendments. Original pre-existing changes were preserved. Updating current
fingerprints does not approve any unresolved proposal or establish a freeze.

### Previous confirmation snapshot (version 0.2, superseded)

Before DR-007/DR-008, the inventory contained 70 requirements: 38 confirmed,
10 proposed and 22 deferred. Its source fingerprints were:

- REQUIREMENTS.md: `0B2E3554EEE97D9916ADD96E2369CB026E9B83D8FAC554287D95D455116D0DF4`
- README.md: `F0687838F31712CCEDF06CD84AF68428EA73C601ABB7937C800598FE2DDB3A47`
- TECHNICAL_BASELINE.md: `DE45CA759BF558A11C4BA27470B9E42C71B4CCCA6A9C6F807AE6F9A6CA802DBA`
- PENDING-DESIGN-DECISIONS.md: `3A92EAC9977DBF1774FD80CB342E6CFE98F2F34F6BD5A1501B2AC55244275368`

## 2. Precedence and conflict handling

### Guard-core checkpoint fingerprints (historical)

Before timeline confirmation, REQUIREMENTS fingerprint was
`9304761929ED49510AEB726F7D6FFE7E4964DE1F5A2E65DA1D9571C32F483FB0`,
README was `CE0C5300106742BC4B4E4563FBEB5654FAF1E994C89F4F8C3A189C521F3E826E`,
and pending-design was
`55E19552A2667BB0CC4D19DD7FA2F9761708F583BE8DEE1D60B5B6EFE7A29F01`.
The guard-core scoped inventory retains its original source snapshot for audit;
its approved intent is not overwritten by subsequent timeline work.

### Previous confirmation snapshot (version 0.3, superseded)

Before DR-012's scoped refinements the global count was already 72 and the
source fingerprints were:

- REQUIREMENTS.md: `269517DE4EB1E3A75211286589FDEB90A12DEB700A655174BA5A0D4EC6D8DCAF`
- README.md: `7E46B702AEA28361E49EE753BFDA8F530ED109CFEE00BA5EE7A85028E8008A80`
- TECHNICAL_BASELINE.md: `23F9F4035E35490C6585740C8E9D70A5647AF7ECD74F648B1E05F4FD72CBAA15`
- PENDING-DESIGN-DECISIONS.md: `5BA93D9E313195D713F3429424F875B70FF4C22F9219929F0A0CBAF0C8363332`

Eight scoped guard-core refinements have their own
[ingestion register](./guard-core/00-ingestion.md). They are not eight new global
requirement rows or a claim that full parent requirements have passed.

1. Confirmed acceptance criteria in the requirements.
2. Reviewed intent diagrams, once approved; none supplied.
3. Approved user-facing scope statements; no reviewed task list supplied.
4. Existing contracts/code: discovery only; none established for this target.
5. Runtime observations: evidence only; none gathered here.

Proposed rows and targets remain proposals. Deferred rows remain excluded. README
event-name examples such as action/output-policy decisions do not activate
deferred enforcement. The explicit current authentication choice is native
password/authenticator 2FA with public registration, not the original OIDC
proposal. Private per-account ownership is selected; exact scope provisioning
and identifiers remain open. Shared workspaces remain deferred.

PD-02 discusses advisory output findings, while OUT-001/OUT-002 explicitly defer
them; the Phase 1 exclusion wins. The workspace wording in OPS-005 does not
reinstate deferred workspace administration; its Phase 1 recovery dataset needs
an explicit decision under AMB-runtime-governance-011.

The PostgreSQL transactional outbox is established architecture direction in the
baseline/PD-03/PD-07. It does not settle atomic dispatch ownership, crash recovery,
or numerical queue/retry limits. Likewise, Java 25/Spring MVC virtual threads do
not settle a Spring Boot version, SQL-library choice, or resource budget.

## 3. Evidence and limits

- Graph project: `D-Personal`, root `D:/Personal`, reported ready.
- Index generation/indexed-at: `2026-10-27T05:00:43Z`.
- Tier: 2 verification.
- `check_index_coverage` checked all four target sources, workflow README,
  orchestration, ingestion, domain-modeling and the user-tagged frontend planning
  skill. Target source freshness was `metadata_changed` or `not_tracked`; the
  workflow documents had the same limitations.
- Fallback: direct reads of the complete target source documents and complete
  workflow README/orchestration/ingestion guidance. The domain and frontend skill
  reads were orientation only; neither later phase was executed.
- The target scope's recorded graph gap was the excluded `.git` subtree. It is
  repository metadata, not missing application behavior; it was not recursively
  searched. Exact HEAD and worktree status were obtained using Git.
- Direct target-root listing showed `.git`, `.gitattributes` and the four source
  documents before this package. This is a bounded current-worktree observation,
  not a negative claim based on the stale graph.
- No structural code discovery was needed: the task inputs are Markdown specs.
  No graph code snippets, live client capabilities, or external documentation
  were used as behavioral oracles.

No automatic reindex was performed in this shared workspace. Recheck source
fingerprints on continuation; changed inputs require impact review before any
later approval or freeze.

## 4. Scope inventory

| Classification | Count | Treatment |
|---|---|---|
| Confirmed source requirements | 40 | Phase 1 obligations; includes confirmed native-account/session requirements; complete executable acceptance still blocked |
| Proposed source requirements | 10 | Retained for review; not approved acceptance gates |
| Deferred source requirements | 22 | Retained for traceability; excluded from Phase 1 acceptance |
| Source acceptance review groups | 9 | AT-01 through AT-09 are review groupings, not authored workflow scenarios |
| Source open decisions | 11 | Seven distinct IDs affect Phase 1: OD-01, OD-04, OD-05, OD-06, OD-08, the response-transport portion of OD-10, and native-account contract OD-11. |

OD-02/OD-03/OD-07/OD-09 concern deferred platform, workspace credentials,
archives, and attachments. Their existence is not permission to expand Phase 1.
