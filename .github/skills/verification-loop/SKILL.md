---
name: verification-loop
description: 'Use when verifying a spec-driven feature with locked acceptance tests, native quality checks, supporting tests, maintainability review, and explicit failure triage.'
---

# Skill 06: Safe Verification Loop

## Role & Goal

Execute acceptance tests, supporting tests, native quality checks, and a focused
maintainability review. Classify failures before fixing code. Preserve the frozen
oracle and report real results, not success-shaped exceptions.

Read the reviewed [implementation design](../implementation-design/SKILL.md) and
use a separate [execution record](../../../.ai/templates/execution-evidence.md).
The guard protects only `tests/specs/<feature>.spec.ts`,
`tests/api/<feature>.spec.ts`, and files under `tests/testdata/api/<feature>/`,
plus the frozen plan. It does not lock every test, helper, or configuration file.

## Test and evidence boundaries

- **Acceptance:** designated scenario-tagged UI/API files and baselines remain
  immutable after lock, including locators/setup. Every acceptance test needs
  feature-missing red evidence from Phase 8.
- **Supporting:** native unit/integration tests outside protected paths may be
  added/updated during implementation or behavior-preserving refactoring. They
  cannot satisfy missing acceptance coverage or redefine product behavior.
  Internal contract assertions may follow reviewed design. Do not copy actual
  results into assertions to manufacture green. Phase 8 red evidence is not
  required for every supporting test.
- **Evidence:** append red runs, later results, corrections, gaps, and status
  outside the frozen plan. Record exact commands, working directories, test IDs,
  artifact identities, and logs. Preserve red history. These are review records,
  not checksum-protected proof; the guard does not validate their truth.
- **Legacy:** never rewrite existing frozen plans/manifests to adopt new templates.
  Preserve embedded historical evidence and reference it from a new external
  record for subsequent runs.

## Execution Rules

1. **Reproduce Before You Fix (CRITICAL):** Reproduce the actual failing check with its native tool. For browser behavior, collect live evidence before application fixes:

   ```bash
   playwright-cli -s=<feature> open "$URL"   # PowerShell: "$env:URL"
   playwright-cli -s=<feature> state-load playwright/.auth/<user>.json
   # Replay the failing step, then:
   playwright-cli -s=<feature> snapshot
   playwright-cli -s=<feature> console
   playwright-cli -s=<feature> network
   ```

   Confirm browser, console, and relevant request evidence. For API failures,
   replay the local request using the native request runner. For supporting tests,
   compiler, formatting, and lint failures use their runner/diagnostics; do not
   require browser reproduction for non-browser failures. Reproduction never
   authorizes editing a locked file.

2. **The 3-Strike Limit (CRITICAL):** You have a maximum of **3 iteration attempts** per failing scenario. If it still fails after the 3rd attempt, immediately **HALT ALL EXECUTION**.

3. **The Anti-Hack Mandate:** You are strictly forbidden from forcing a pass.
   - DO NOT comment out, skip or weaken `expect*` assertions.
   - DO NOT edit an expected value in the spec, test plan or test to match observed behavior.
   - DO NOT hardcode return values in application code just to satisfy a test.
   - DO NOT change the `Given/When/Then` behavioral steps.
   - DO NOT assert a value that the test itself injected through a route mock.
   - DO NOT rewrite a baseline file to make a schema assertion pass.

4. **Triage Before You Touch Code:** Classify the failure into exactly one verdict.

   | Evidence                                                         | Verdict            | Action                                                                                                                |
   | :--------------------------------------------------------------- | :----------------- | :-------------------------------------------------------------------------------------------------------------------- |
   | App behavior differs from a consistent, frozen expectation       | **Product defect** | Report it. Do not change the test. Escalate to the implementer.                                                       |
   | Spec/diagram/task list changed, or the plan contradicts itself   | **Spec drift**     | Post-freeze gap: stop, record it in a follow-up plan (see Post-Freeze Gaps). Do not edit the frozen plan or the test. |
   | Cannot reach the step: locator, auth, route, timing, environment | **Test defect** | Reproduce and inspect. Before lock, fix authoring/setup. After lock, do not edit the protected file: stop the affected item and propose a reviewed follow-up. Fix external environment only when consistent with approved setup and without bypassing checks. |
   | API shape differs from an observed baseline                     | **Product defect** or **Spec drift** | A baseline mismatch is evidence, not a separate verdict. Compare against the frozen contract: report product defect when behavior violates it; use spec drift when the reviewed contract/plan is contradictory or incomplete. |
   | Scenario is `@unspecified` or has a blocking `AMB`               | **Blocked**        | Do not run it to green. Halts at the ambiguity.                                                                       |

5. **Failing Step Map:**
   - `Given` -> fixture, seeding, or storage state.
   - `When` -> locator or interaction (hidden, covered, disabled, wrong navigation helper).
   - `Then` (UI/copy) -> application rendering/copy or domain logic.
   - `Then` (status/data) -> API contract or business rule.
   - Timeout with no element -> wrong route, auth state, or local server not running.

6. **Read the First Failure:** Inspect the first failing step and the first error line. Do not rewrite unrelated code while scrolling the log.

7. **Red-Run Evidence:** Every acceptance test must have a recorded Phase 8 feature-missing red run outside the frozen plan. A green acceptance run without that evidence is not accepted. Supporting tests use the separate policy above.
8. **Supporting/Tool Failures:** Reproduce with the native command and inspect focused diagnostics. Fix introduced implementation defects without changing protected artifacts. Report tooling setup gaps and unresolved baseline failures explicitly; obtain the reviewed disposition instead of silently ignoring them. The 3-strike rule is per failing acceptance scenario, not a license for unlimited supporting/tool retries: stop with evidence when progress stalls.

## Run Commands

```bash
# Targeted run (default verification)
npx playwright test tests/specs/<feature>.spec.ts --project=chromiumheadless

# API-level suite
npx playwright test tests/api/<feature>.spec.ts --project=chromiumheadless

# Headed reproduction
npx playwright test tests/specs/<feature>.spec.ts --project=chromium --headed

# Single scenario
npx playwright test tests/specs/<feature>.spec.ts --project=chromiumheadless -g '<scenario name>'

# Inspect the retained trace
npm run trace
```

## Output Protocol

### Required Phase 10 Gates

1. Run `npm run ai:verify -- <feature>` and the required acceptance suites.
2. Run relevant supporting tests and the reviewed native formatting, lint/static
   analysis, build/type checks. Start focused; expand when required by the design,
   affected dependencies, or the project's completion/CI policy.
3. Compare results with actual pre-edit baselines. Require no introduced
   violations. Existing failures need an explicit scope/rationale/reviewer
   disposition; report them as baseline issues, never clean passes. Missing
   tooling is blocked pending an approved setup decision; N/A needs a reason.
4. Review the changed code for cohesive module ownership, suitable folder
   placement, domain-appropriate names, allowed dependency direction, justified
   abstractions, reuse, and relevant lower-level tests. Fix introduced design
   defects and rerun affected checks. Do not turn this into unrelated cleanup.
5. Review shared test helpers, runner/CI configuration, and quality rules for
   bypasses: no disabled suites, weakened setup/assertions, blanket suppressions,
   or exclusions merely to pass. Checksums do not prove these surfaces unchanged.
6. Record deviations and outcomes outside the frozen plan, distinguishing
   **pass**, **fail**, **blocked**, **N/A**, and **baseline issue**.

### After Required Gates

Proceed to the Accessibility Check (Phase 11), then the separate as-built diagram
and intent comparison (Phase 12). "Pencil Down" and completion apply only after
all applicable gates are satisfied; approved baseline exceptions remain explicit.
Do not stage or commit. Report `REQ` -> `SCN` -> acceptance file -> result,
red evidence, supporting tests, quality results, maintainability/accessibility
reviews, as-built differences, and blocked/out-of-scope work.

### If Tests FAIL after 3 Strikes (Red):

1. Stop all code generation. **"Pencil Down."**
2. Generate `verification-report-[feature-name].md` containing:
   - The failing test block and the exact `test.step()` that failed.
   - The Playwright error trace (e.g., `TimeoutError: locator.click()`).
   - What native reproduction showed (browser snapshot/console/network when relevant; request/tool diagnostics otherwise).
   - The verdict from the triage table (product defect / spec drift / test defect / blocked).
   - The requirement and scenario IDs affected.
   - The three attempted fixes and why each failed.
   - A brief hypothesis of why the AI could not resolve the issue.
3. Instruct the user that human intervention is required to unblock the pipeline.

## Accessibility Check (Phase 11)

Run against the running build after the suite is green.

1. For each row in the checklist UI contract matrix, confirm the contract locator resolves to exactly one element.
2. Confirm that element's role, text and state match the frozen plan.
3. Use `playwright-cli` read-only (`snapshot`) for this check. Do not change locators to make the check pass. Close the named browser session when finished.
4. A mismatch is triaged with the table above. A wrong frozen expectation or locked locator requires a follow-up, not an edit to the protected artifact.

## Post-Freeze Gaps (replaces the change protocol)

The frozen plan is never modified, versioned or extended after Phase 7.

1. Stop the affected item. Do not continue against the unresolved expectation.
2. Record the gap outside the frozen plan: scenario ID, observed behavior, and the unresolved question or locked-test defect.
3. Create a follow-up plan for a later iteration. It has its own intent diagram review, scenarios, and freeze.
4. The current frozen plan and its tests stay as they are. The affected scenario is reported as blocked in this iteration.
5. Never resolve the gap inside the current iteration by editing an expectation, a test, or a baseline.
