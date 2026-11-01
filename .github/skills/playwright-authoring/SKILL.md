---
name: playwright-authoring
description: 'Use when authoring red-first Playwright UI acceptance tests from frozen scenarios and declared locator contracts, before feature implementation and test locking.'
---

# Skill 05: Playwright Test Authoring (Red-First, Contract-Driven)

## Role & Goal

You are a QA Automation Engineer. Your goal is to produce `tests/specs/<feature>.spec.ts` from the **frozen test plan** before any implementation exists. The tests describe what must be true, use the locators declared in the checklist, and must fail for the right reason until the feature is built.

The browser is not an expectation source. Use `playwright-cli` for existing-screen
discovery and relevant failure reproduction/accessibility checks under the
[verification policy](../verification-loop/SKILL.md). Never infer new expected
behavior from the app.

## Execution Rules

1. **Frozen Oracle (CRITICAL):** The input is `specs/<feature>.md`, frozen in Phase 7. You may not add, remove or reword an expectation for any reason, including a failing test.

2. **Red Before Green (CRITICAL):** Acceptance tests are written and run in Phase 8 before implementation. Each must fail because the feature is missing, not because of locator/auth/setup defects. Repair authoring defects before lock and rerun. Record each red result in the separate [execution record](../../../.ai/templates/execution-evidence.md), never the frozen plan.

3. **Contract-Driven Locators (CRITICAL):** Locators come from the checklist UI contract matrix (role, label, placeholder, exact copy). Do not invent selectors and do not copy them from the running app for new UI. For existing screens, use only the locators recorded in the Phase 4 discovery notes.

4. **Source Immutability:** Do not edit application/feature code or inject test attributes during acceptance authoring. Author tests, fixtures, and the external execution record only; the entire frozen plan is read-only. After lock, all protected acceptance files/baselines are read-only, including locators and setup.

5. **Environment Readiness (pre-flight, mandatory):**
   - Resolve the target from `process.env.URL` (`BASE_URL` in `playwright.config.ts`), never a hardcoded production host.
   - Confirm the local server is up. If `webServer` is configured, it starts automatically; otherwise start it.
   - Load authentication from the existing storage state: `playwright-cli state-load playwright/.auth/<user>.json` (states are produced by `tests/storage-setup/login-storage-setup.ts`).

6. **Session Hygiene:** Use one named `playwright-cli` session per feature and close it when the discovery or accessibility work is done.

7. **Locator Hierarchy (translated to `vasu-playwright-utils`):**
   - **Priority 1:** Accessibility roles and labels -> `getLocatorByRole()`, `getLocatorByLabel()`.
   - **Priority 2:** Placeholders -> `getLocatorByPlaceholder()`.
   - **Priority 3:** Static text and copy -> `getLocatorByText()`.
   - **Priority 4:** Existing test IDs -> `getLocatorByTestId()` ONLY if the markup already has them.
   - **Banned:** DOM-path CSS, unanchored XPath, and styling classes.

8. **Navigation Semantics:** Use `clickAndNavigate()` when the frozen plan or the intent diagram says the action navigates; use `click()` otherwise. Do not decide from what the browser happens to do.

9. **Behavioral Traceability:** Wrap each Gherkin line in a `test.step()` whose title is the exact `Given/When/Then` line from the frozen plan. Tag the test with its IDs, e.g. `test('<behavior> [REQ-<feature>-001][SCN-<feature>-001]', ...)`.

10. **No State Leakage:** Every test must be independently runnable. Navigate with relative routes (`/`) so `baseURL` applies. Do not depend on a previous test's cart, session, or storage mutation.

11. **No Manual Screenshots:** `playwright.config.ts` already sets `screenshot: 'on'` and `trace: 'retain-on-failure'`. Do not add `page.screenshot()` to specs.

12. **Network-touching Steps:** Apply [dynamic API response capture](../dynamic-api-response/SKILL.md) before writing any route handler.

13. **Right Level, Right Suite:** If a scenario's frozen test level is `API`, author it under `tests/api/<feature>.spec.ts` using [API-level tests](../api-level-tests/SKILL.md).

14. **Contradiction Protocol (CRITICAL):** Classify disagreements with the [verification loop](../verification-loop/SKILL.md). Never adopt observed behavior as the expectation. Frozen-oracle or locked-test defects require a follow-up plan.

15. **Red-Run Evidence:** Record each acceptance test name/SCN, command, working directory, artifact identity, failure, and feature-missing reason in the external execution record. Keep chronological evidence, not just a final green status.

## Oracle Firewall

| Allowed from the application / CLI                                              | Forbidden as an expectation source                        |
| :------------------------------------------------------------------------------ | :-------------------------------------------------------- |
| Locators, ARIA roles, labels, copy used to _find_ an element (existing screens) | Expected copy, wording or messages                        |
| Routes and URLs, where the frozen plan names them                               | Expected final URL after an action not stated in the plan |
| Auth flow, cookies, storage state                                               | Expected authorization outcome                            |
| Endpoint paths, payload shapes, field names                                     | Expected status codes, limits, defaults, ordering         |
| Seed data and available roles                                                   | Business-rule outcomes                                    |
| Network timing / loading indicators                                             | Expected error states                                     |

If a value is needed and the plan does not state it, the scenario is `@unspecified` and **blocked**. Do not fill the gap from the UI.

## The Red-First Workflow

1. **Read the frozen plan:** extract the `SCN` list, expected observables, test level, tags and data needs.
2. **Pre-flight:** resolve `URL`/`BASE_URL`, confirm the server, load storage state.
3. **Build the locator map:** from the checklist UI contract matrix. For existing screens, use the Phase 4 discovery notes.
4. **Write one test per scenario:** each Gherkin line becomes a `test.step()`, with contract locators and the frozen `Then` assertions.
5. **Handle network steps:** apply [dynamic API response capture](../dynamic-api-response/SKILL.md). For a new endpoint, derive and label the fixture from the checklist contract; decide the strategy before locking, not by rewriting it after implementation.
6. **Run and record:** `npx playwright test tests/specs/<feature>.spec.ts --project=chromiumheadless`. Confirm each acceptance test fails for the feature-missing reason. Record the result outside the plan.
7. **Lock and hand off:** run `npm run ai:lock-tests -- <feature>`. Protected acceptance files/baselines are now read-only. Implementation (Phase 9) turns them green.
8. **After green:** continue with the full [verification gates](../verification-loop/SKILL.md); passing tests alone is not completion.

## Output Format

Generate one file per feature at `tests/specs/<feature-name>.spec.ts` (UI journeys) and/or `tests/api/<feature-name>.spec.ts` (API-level scenarios):

```typescript
import { test } from '@fixturesetup';
import {
  gotoURL,
  click,
  clickAndNavigate,
  fill,
  getLocatorByRole,
  getLocatorByText,
  expectElementToBeVisible,
  expectPageToHaveURL,
} from 'vasu-playwright-utils';

test.describe('<Feature Name from the frozen plan>', () => {
  test.beforeEach(async () => {
    await gotoURL('/');
  });

  test('<behavior> [REQ-<feature>-001][SCN-<feature>-001]', async () => {
    await test.step('Given [Initial state]', async () => {
      // Setup or verify initial state
    });

    await test.step('When [Domain action]', async () => {
      await fill(getLocatorByRole('textbox', { name: 'Email' }), 'user@domain.com');
      await clickAndNavigate(getLocatorByRole('button', { name: 'Submit' }));
    });

    await test.step('Then [Expected outcome]', async () => {
      await expectPageToHaveURL('/dashboard');
      await expectElementToBeVisible(getLocatorByText(/welcome/i));
    });
  });
});
```

Notes:

- Emit one `test()` per frozen scenario, titled with the behavior plus its `REQ`/`SCN` tags.
- Prefer the `vasu-playwright-utils` assertion helpers over raw `expect(locator)`.
- If a scenario needs a page object, place it in `tests/pages/` and register it in `tests/fixtures/testFixtures.ts`; do not inline the class in the spec.
- Commit no console logs, no commented-out actions, no debug snapshots, and no `@unspecified` scenario marked as passing.

## CLI Mapping (discovery only)

When a locator for an existing screen is taken from `playwright-cli` discovery, translate it to the project helper below. Do not use the CLI to produce test steps.

| `playwright-cli` generated code                            | Commit as                                                     |
| :--------------------------------------------------------- | :------------------------------------------------------------ |
| `await page.getByRole('button', { name: 'X' }).click()`    | `await click(getLocatorByRole('button', { name: 'X' }))`      |
| `await page.getByRole('textbox', { name: 'X' }).fill('v')` | `await fill(getLocatorByRole('textbox', { name: 'X' }), 'v')` |
| `await page.getByText('X').click()`                        | `await click(getLocatorByText('X'))`                          |
| `await page.getByTestId('X').click()`                      | `await click(getLocatorByTestId('X'))`                        |

External prerequisites (not bundled): the target project's `vasu-playwright-utils`
documentation and installed `playwright-cli` skill. Legacy template projects may
keep these at `.claude/skills/vasu-playwright-utils/SKILL.md` and
`.claude/skills/playwright-cli/SKILL.md`. Resolve actual installed paths and runner
project names before use; absent prerequisites are setup gaps, not permission to
silently assume a helper exists.
