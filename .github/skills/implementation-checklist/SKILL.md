---
name: implementation-checklist
description: 'Use when mapping acceptance scenarios to shared API and UI contracts, repository conventions, and native quality-tool baselines before implementation planning.'
---

# Skill 03: Shared Implementation Checklist & Contracts

## Role & Goal

You are a Technical Lead. Bridge [behavioral specifications](../behavioral-specifications/SKILL.md) and the codebase with a **shared checklist**. Define the scope, API/UI contracts, and coverage inputs that [frontend](../frontend-task-planning/SKILL.md) and [backend](../backend-task-planning/SKILL.md) planning must follow.

This checklist is not the task list or implementation design. It supplies shared
contracts and evidence to the required [implementation-design step](../implementation-design/SKILL.md) in Phase 5.

## Execution Rules

1. **Context Discovery (Mandatory):** Read applicable persistent project instructions, dependency/build manifests, routes, affected modules, tests, and Playwright configuration. Determine actual stack conventions, including whether the project is greenfield. Do not assume npm/TypeScript for implementation tooling or invent an existing pattern.
2. **Scenario Mapping:** Every `SCN` maps to the user-visible behavior it needs and to the surfaces it touches (`frontend`, `backend`, or `both`). Task titles are never scenario names.
3. **Screen Discovery (read-only):** For **existing** screens, use `playwright-cli` to observe the real roles, labels, placeholders and copy. Record only what is needed to locate elements. Do not record any value as an expectation.
4. **Declared Contracts for New UI:** For **new** UI, declare the role, label, placeholder or exact copy for every element. Do NOT require `data-testid` attributes. Locator priority:
   - **Priority 1:** Accessibility roles and labels -> `getLocatorByRole()`, `getLocatorByLabel()`.
   - **Priority 2:** Form placeholders -> `getLocatorByPlaceholder()`.
   - **Priority 3:** Static text and copy -> `getLocatorByText()`.
   - **Priority 4:** Existing test IDs -> `getLocatorByTestId()` ONLY if the attributes already exist in the codebase.
   - **Banned:** DOM-path CSS, unanchored XPath, styling classes.
5. **API Contracts:**
   - **Existing endpoint:** discover it and record the real response as a regression baseline now (shape only; never an expectation for new behavior).
   - **New endpoint:** declare the intended contract from the spec (method, auth, request, status codes, response shape, error envelope). Mark `Baseline: deferred`. Do not execute or capture it.
6. **Single Source for Shared Shapes:** The API contract matrix in this checklist is the only definition of shared request and response shapes. Both task lists reference it.
7. **Coverage Inputs:** Attach the relevant `REQ-*` and test level (UI / API / Both) to every scope item.
8. **Native Quality Baseline:** Discover the project's existing format, lint/static-analysis, build/type-check, and supporting-test commands. Run applicable baseline checks before edits and record commands, working directories, scope, results, and evidence. Missing tools are setup gaps requiring approved decisions; inapplicable checks require reasons. Keep existing failures visible, require no introduced violations, and obtain an explicit disposition for unresolved baseline failures in Phase 6. Do not add a universal toolchain or weaken rules.
9. **Shared Design Handoff:** Identify suitable patterns, ownership/dependency constraints, and domain vocabulary for Phase 5. Record where there is no suitable pattern. The design step proposes justified structure and concrete names before independent frontend/backend tasks are prepared.

## Output Format

### 1. Architecture Context

_Actual stack, applicable instruction paths, suitable pattern files, dependency constraints,
and greenfield/proposed conventions. Distinguish evidence from recommendations._

### 2. Scenario-to-Scope Map

| Scenario            | User-Visible Behavior               | REQ                 | Surface                   | Test Level      |
| :------------------ | :---------------------------------- | :------------------ | :------------------------ | :-------------- |
| `SCN-[feature]-001` | `[what the user can observe or do]` | `REQ-[feature]-001` | frontend / backend / both | UI / API / Both |

A scenario with no surface is either out of scope or missing from the scope; record which.

### 3. API Contract Matrix

_One row per endpoint a scenario depends on. This is the single source for shared shapes._

| Endpoint          | Method | Auth           | Exists?  | Baseline                                                              | Request Shape | Response Shape | Status Codes  | Error Envelope | Owner Scenario      |
| :---------------- | :----- | :------------- | :------- | :-------------------------------------------------------------------- | :------------ | :------------- | :------------ | :------------- | :------------------ |
| `/api/[resource]` | GET    | session cookie | Yes / No | `tests/testdata/api/[feature]/[resource].baseline.json` or `deferred` | `[from spec]` | `[from spec]`  | `[from spec]` | `{ message }`  | `SCN-[feature]-001` |

### 4. UI Element & Copy Contract Matrix

| Target Element / Content | Type        | Source (existing / new) | Role / Label / Placeholder / Copy                   | Locator                                             | Owner Scenario      |
| :----------------------- | :---------- | :---------------------- | :-------------------------------------------------- | :-------------------------------------------------- | :------------------ |
| **Email Input**          | Form Field  | new                     | Label: `"Email"` / Placeholder: `"user@domain.com"` | `getLocatorByRole('textbox', { name: 'Email' })`    | `SCN-[feature]-001` |
| **AI Disclaimer**        | Static Copy | existing                | `"AI outputs may be inaccurate"`                    | `getLocatorByText(/AI outputs may be inaccurate/i)` | `SCN-[feature]-004` |

### 5. Discovery Notes

_Record what `playwright-cli` observed on existing screens, as locator input only. No expected values._

| Screen / Route | Element     | Observed Role / Label / Copy | Recorded In           |
| :------------- | :---------- | :--------------------------- | :-------------------- |
| `/[route]`     | `[element]` | `[observed]`                 | Section 4 row `[ref]` |

### 6. Coverage Inputs for the Test Plan

| Scenario            | REQ                 | Test Level      | Surface | Frontend Task List Ref | Backend Task List Ref |
| :------------------ | :------------------ | :-------------- | :------ | :--------------------- | :-------------------- |
| `SCN-[feature]-001` | `REQ-[feature]-001` | UI / API / Both | both    | `FE-[n]`               | `BE-[n]`              |

Task list references are filled in after Phase 5. Any `SCN` without a reference after Phase 5 is flagged for Phase 6.

### 7. Native Quality Baseline and Setup Gaps

| Check | Exact command | Working directory / scope | Baseline result / evidence | Setup gap / N/A reason / baseline disposition |
|---|---|---|---|---|
| `[format, lint/static analysis, build/type check, supporting tests]` | `[native command]` | `[path/scope]` | `[actual result and log reference]` | `[explicit decision needed or approved disposition]` |

Review missing setup and unresolved baseline failures in Phase 6. No unrun check
or pre-existing failure is reported as a pass.
