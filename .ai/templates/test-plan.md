# Test Plan: [Feature Name]

> **Frozen artifact.** Derived only from the specification and approved intent diagram. Code, observations, captures, task lists, and engineering design are not expectation sources. Never modify this file after freeze, including evidence/status fields. Gaps go to a separate follow-up under the [verification policy](../../.github/skills/verification-loop/SKILL.md#post-freeze-gaps-replaces-the-change-protocol).

## 1. Provenance

| Field                        | Value                                                         |
| :--------------------------- | :------------------------------------------------------------ |
| Feature                      | `[feature-name]`                                              |
| Spec artifact                | `[path]` @ `[version/hash]`                                   |
| Intent diagram (Phase 2)     | `[path]` @ `[version/hash]`, user-approved on `[date]`        |
| Checklist (Phase 4)          | `[path]` @ `[version/hash]`                                   |
| Frontend task list (Phase 5) | `[path]` @ `[version/hash]` (scope only)                      |
| Backend task list (Phase 5)  | `[path]` @ `[version/hash]` (scope only)                      |
| Requirement source           | `.ai` Skill 00 output @ `[date]`                              |
| Frozen by                    | `[name]`                                                      |
| Frozen at                    | `[YYYY-MM-DD]`                                                |
| Implementation design       | `[path/version]` (engineering context only)                    |
| Execution evidence          | `[separate record path]` (record runs/status there, not here)  |
| Gap register                | `[separate record path]` (future follow-up references live there) |

## 2. Scope

**In scope:**

- `[Journey / surface / endpoint]`

**Out of scope (explicit):**

- `[Reason]`

## 3. Requirement Register

| ID                  | Requirement         | Type                          | Source     | Level           | Testability |
| :------------------ | :------------------ | :---------------------------- | :--------- | :-------------- | :---------- |
| `REQ-[feature]-001` | `[Observable rule]` | Rule / Flow / Data / Contract | `[spec §]` | UI / API / Both | Testable    |

## 4. Scenarios (Oracle)

_Every expected value below is concrete and observable. "Works correctly" is not an expectation._

| ID                  | REQ                 | Type     | Gherkin                       | Expected Observable                  | Data Needs               | Tag      |
| :------------------ | :------------------ | :------- | :---------------------------- | :----------------------------------- | :----------------------- | :------- |
| `SCN-[feature]-001` | `REQ-[feature]-001` | Positive | `Given ... When ... Then ...` | `[exact copy / URL / value / state]` | `[user, seed, endpoint]` | `@smoke` |
| `SCN-[feature]-002` | `REQ-[feature]-002` | Negative | `Given ... When ... Then ...` | `[exact error copy / status]`        | `[seed]`                 | `@reg`   |
| `SCN-[feature]-003` | `REQ-[feature]-003` | Boundary | `Given ... When ... Then ...` | `[limit behavior]`                   | `[boundary value]`       | `@reg`   |

### State Transitions (from Mermaid)

| From        | To          | Guard / Condition      | Scenario ID | Covered |
| :---------- | :---------- | :--------------------- | :---------- | :------ |
| `[State A]` | `[State B]` | `[Guard]`              | `SCN-...`   | Yes/No  |
| `[State B]` | `[State B]` | `[Invalid transition]` | `SCN-...`   | Yes/No  |

## 5. API Contract Coverage

| Endpoint          | Method | Auth           | REQ       | Expected Status | Expected Shape / Errors  | Baseline                                                |
| :---------------- | :----- | :------------- | :-------- | :-------------- | :----------------------- | :------------------------------------------------------ |
| `/api/[resource]` | GET    | session cookie | `REQ-...` | `200`           | `{ id, items[], total }` | `tests/testdata/api/[feature]/[resource].baseline.json` |

## 6. Data Plan

| Role         | Storage State                  | Seed Required | Reset Strategy       |
| :----------- | :----------------------------- | :------------ | :------------------- |
| `[standard]` | `playwright/.auth/[user].json` | `[dataset]`   | `[per-test / suite]` |

## 7. Coverage Summary

| Metric                | Target             | Planned |
| :-------------------- | :----------------- | :------ |
| Requirements covered  | `100%` of testable | `[n/n]` |
| Positive scenarios    | >= 1 per REQ       | `[n]`   |
| Negative / boundary   | Applicable         | `[n]`   |
| Guarded transitions   | `100%`             | `[n/n]` |
| Invariant violations  | >= 1 per invariant | `[n]`   |
| Endpoints             | >= 1 API test each | `[n/n]` |
| E2E `@smoke` journeys | Critical paths     | `[n]`   |

## 8. Assumptions & Ambiguities

| ID                  | Assumption / Question | Impact       | Blocking | Decision                      |
| :------------------ | :-------------------- | :----------- | :------- | :---------------------------- |
| `AMB-[feature]-001` | `[assumption]`        | High/Med/Low | Yes/No   | `[Pending / Approved by ...]` |

## 9. Execution Evidence Location

_Choose the external record location before freeze, using the
[execution-evidence template](./execution-evidence.md). During Phase 8 record
each acceptance test's actual feature-missing red failure there. Append subsequent
verification and status there too. No Phase 8 or later writes to this plan._

- Evidence record: `[target project feature-artifact path]`
- Required run identity: `[test/SCN, command, working directory, artifact hashes/commit, timestamp, log]`
- Evidence is reviewed, not mechanically validated or checksum-protected by the guard.
- Existing frozen plans are not migrated or rewritten. Preserve historical embedded
  evidence and reference it from external records for subsequent runs.

## 10. Freeze Sign-off

- [ ] Every requirement is testable or explicitly blocked.
- [ ] Every expected value is concrete and sourced from the spec or the approved intent diagram.
- [ ] No expected value came from code, a capture or a running app.
- [ ] No blocking ambiguity remains unresolved.
- [ ] Coverage targets met or justified.
- [ ] Intent diagram version recorded and approved.
- [ ] Implementation design and native quality strategy reviewed as engineering context.
- [ ] Separate evidence and gap-record locations selected; no later plan edits required.
- [ ] Freeze stamp recorded (`Frozen by` / `Frozen at` above). No edits after this point.
