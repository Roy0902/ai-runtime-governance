# Phase 8: Red-First Test Authoring Prompt

You are authoring automated tests from a **frozen test plan**, before any implementation exists. The tests must describe what must be true, use the locators in the checklist contract, and fail for the feature-missing reason until implementation (Phase 9) is complete. You may use the browser only for read-only screen discovery on existing screens (done in Phase 4); you may not use it to write steps or to decide the result.

## Input Files

1. Frozen test plan: `specs/[feature-name].md`
2. Shared checklist (UI and API contract matrices): `.ai` Skill 03 output
3. Requirement/ambiguity registers: `.ai` Skill 00 output
4. Skill rules:
   - [Playwright authoring](../../.github/skills/playwright-authoring/SKILL.md) (UI / E2E)
   - [API-level tests](../../.github/skills/api-level-tests/SKILL.md)
   - [Dynamic API response](../../.github/skills/dynamic-api-response/SKILL.md) (network steps)
5. External [execution record](./execution-evidence.md), selected before freeze.

## Pre-flight

- Resolve the target from `process.env.URL` (`PowerShell: $env:URL`); never hardcode a host.
- Confirm the local server is running.
- Load auth: `playwright-cli -s=<feature> state-load playwright/.auth/<user>.json` (for existing screens only).

## Protocol

1. **Read the frozen plan first.** Extract the `SCN` list, expected observables, tags and data needs.
2. **Build the locator map** from the checklist UI contract matrix. Use the Phase 4 discovery notes for existing screens. Do not invent selectors.
3. **Write one test per scenario.** Wrap each Gherkin line in `test.step('<exact Gherkin line>')`, use contract locators, and assert only the frozen `Then` expectations. Tag each test with its `REQ`/`SCN`.
4. **Handle network steps** with Skill 07. For a new endpoint, build the fixture from the checklist's API contract and mark it as a contract fixture.
5. **Run:** `npx playwright test tests/specs/<feature>.spec.ts --project=chromiumheadless`.
6. **Confirm the red reason.** Every test must fail because the feature is missing. A failure from a locator typo, auth, or setup is a test defect: fix it and run again.
7. **Record red-run evidence** in the separate execution record: test/SCN, exact command, working directory, artifact identity, failure, and feature-missing reason. Never edit the frozen plan.
8. **Lock and hand off.** Run `npm run ai:lock-tests -- <feature>`. Protected acceptance files/baselines are now read-only. Implementation (Phase 9) turns them green.

## Hard Stops

- A test passes before implementation -> stop. It is either already implemented or the expectation is wrong. Report it; do not change the test.
- Observed behavior contradicts the frozen plan -> record it as a post-freeze gap. Do NOT update the expectation.
- A scenario has no concrete expected observable -> it stays blocked, not skipped, not green.
- A selector is not in the contract matrix -> add it to the checklist for review; do not invent it.
- Any temptation to edit `specs/[feature-name].md` to make a test pass -> stop; post-freeze gaps go to a follow-up plan.

## Output

- `tests/specs/<feature>.spec.ts` for E2E scenarios.
- `tests/api/<feature>.spec.ts` for API-level scenarios.
- Red-run evidence outside the frozen test plan; preserve chronological entries.
- A short report mapping `SCN` -> test file -> red reason.
