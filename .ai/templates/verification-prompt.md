# Phase 10: Safe Verification Loop Execution Prompt

Verify acceptance integrity, Playwright acceptance suites, native supporting tests,
quality checks, and maintainability under the full verification protocol.

## Input Files

1. Frozen test plan: `specs/[feature-name].md`
2. Target test scripts: `tests/specs/[feature-name].spec.ts` and/or `tests/api/[feature-name].spec.ts`
3. [Verification skill](../../.github/skills/verification-loop/SKILL.md)
4. Reviewed implementation design, native quality baseline, and project instructions.
5. Separate [execution record](./execution-evidence.md).

## Pre-flight

- Confirm the local server is running and `URL`/`BASE_URL` points at it.
- Confirm the plan is **FROZEN**, acceptance tests are locked, and every acceptance test has Phase 8 feature-missing red evidence outside the plan (or preserved legacy evidence).
- Resolve the actual configured Playwright project names and native commands; example names below are not universal defaults.

## Protocol & Guardrails

1. **Initial Run:** `npx playwright test tests/specs/[feature-name].spec.ts --project=chromiumheadless` (and the API suite if present).
2. **If Acceptance Tests Pass:** Do not declare completion. Run `npm run ai:verify -- <feature>`, supporting tests, native format/lint/static-analysis/build/type checks, and the focused maintainability/shared-helper review required by the verification skill. Require no introduced violations and explicit dispositions for unresolved baseline failures; missing setup is blocked, N/A needs a reason. Then complete accessibility (Phase 11) and separate as-built comparison (Phase 12). Report all results outside the plan with `REQ` -> `SCN` -> acceptance file -> result. Approved baseline exceptions are not clean passes.
3. **If Tests Fail:**
   - For browser failures, reproduce live before application fixes:
     ```bash
     playwright-cli -s=[feature] open "$env:URL"
     playwright-cli -s=[feature] state-load playwright/.auth/[user].json
     playwright-cli -s=[feature] snapshot
     playwright-cli -s=[feature] console
     playwright-cli -s=[feature] network
     ```
   - Triage the failure into exactly one verdict:
     - **Product defect** — app contradicts a consistent frozen expectation. Report; do not change the test.
     - **Spec drift** — spec/diagram changed or the plan contradicts itself. Post-freeze gap: stop and record it in a follow-up plan. Do not edit the frozen plan or the test.
     - **Test defect** — reproduce locator/auth/timing/environment evidence. Do not edit locked setup or locators; stop affected work and propose a reviewed follow-up. External environment repairs must preserve approved setup and checks.
     - **Blocked** — `@unspecified` or a blocking `AMB`. Do not force it green.
   - Apply one precise permitted fix per attempt, then re-run. Supporting-test,
     compiler, lint, formatting, and API-only failures use their native diagnostics,
     not mandatory browser reproduction.

## CRITICAL: The 3-Strike Rule

- You are allowed a maximum of **3 attempt iterations** per failing acceptance scenario.
- **FORBIDDEN ACTIONS:**
  - DO NOT edit an expected value to match observed behavior.
  - DO NOT comment out, skip or weaken assertions.
  - DO NOT rewrite a baseline file to make a schema assertion pass.
  - DO NOT hardcode application values just to force a pass.
  - DO NOT alter the frozen business rules from Phase 1/3/7.
  - DO NOT edit locked acceptance files/baselines, including setup and locators, or frozen-plan evidence/status fields.
  - DO NOT weaken native quality rules, add blanket suppressions/exclusions, or disable suites to pass.
- **Circuit Breaker:** If the scenario fails on the 3rd attempt, **HALT IMMEDIATELY**. Do not make further edits. Generate `verification-report-[feature-name].md` containing:
  1. The failing scenario, `test.step()` and stack trace.
  2. The triage verdict (product defect / spec drift / test defect / blocked).
  3. What native reproduction showed (browser snapshot/console/network when relevant; request/tool diagnostics otherwise).
  4. The affected `REQ`/`SCN` IDs.
  5. Attempted fixes across the 3 strikes.
  6. Explicit request for human developer review.
