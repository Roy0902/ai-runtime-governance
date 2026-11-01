---
name: api-level-tests
description: 'Use when authoring real-local-server API acceptance tests for frozen contracts, authorization, validation boundaries, response schemas, and status codes.'
---

# Skill 08: API-Level Tests

> Supporting skill used by Phase 8 alongside [Playwright authoring](../playwright-authoring/SKILL.md). It is not a pipeline phase.

## Role & Goal

You are an API test engineer. Your goal is to verify contracts, status codes, boundaries, validation matrices and authorization rules **without a browser**, so the E2E suite stays small and focused on user journeys.

## When to Use API-Level vs E2E

| Behavior under test                             | Level | Reason                                           |
| :---------------------------------------------- | :---- | :----------------------------------------------- |
| Status codes, error envelopes, headers          | API   | Cheaper, faster, deterministic                   |
| Field validation, boundaries, required fields   | API   | Exhaustive input matrices are impractical via UI |
| Auth/role authorization per endpoint            | API   | Bypasses UI navigation noise                     |
| Pagination, sorting, filtering contracts        | API   | Payload-level concern                            |
| Response schema and required keys               | API   | Contract verification                            |
| Cross-page state, redirects, rendering, copy    | E2E   | Requires the real UI                             |
| Accessibility, keyboard flow, responsive layout | E2E   | Browser-only concerns                            |
| Critical user journeys (`@smoke`)               | E2E   | Business-critical path proof                     |

If a behavior can be verified at the API level, verify it there and let one E2E scenario cover the happy path.

## Execution Rules

1. **Frozen Oracle:** Expected status codes, error codes, field names, limits and defaults come from the frozen test plan (`specs/<feature>.md`). Never from a live response, source code or a colleague's guess.

2. **Real Local Server (CRITICAL):** These tests hit the local server through the Playwright request context. Do NOT use `page.route` mocks here ??that would test the mock.

3. **Project Conventions:** Use `test` from `@fixturesetup` so `setPage(page)` runs (required by `api-utils`), and use `getRequest` / `postRequest` / `putRequest` / `deleteRequest` from `vasu-playwright-utils`.

4. **Auth by Role:** Use `test.use({ storageState: ... })` inside a `test.describe` block per role. Do not sign in through the UI for API-only tests.

5. **Idempotent Data:** Create what the test needs and clean it up, or use a seeded read-only fixture. Never depend on data left behind by another test or by a manual browser session.

6. **No UI Assertions:** No locators, no `getByRole`, no screenshots. Assert status, headers, schema and values only.

7. **Traceability:** Tag each test with its requirement and scenario IDs, e.g. `test('rejects quantity above maximum [REQ-CART-004][SCN-CART-002]', ...)`.

8. **Drift Detection, Not Drift Acceptance:** A baseline under `tests/testdata/api/<feature>/` records observed shape, not new expected behavior. If the live shape differs, compare with the frozen contract; do not update a locked baseline. A wrong frozen plan follows the [post-freeze gap protocol](../verification-loop/SKILL.md#post-freeze-gaps-replaces-the-change-protocol).

## File Layout

```
tests/
?œâ??€ api/
??  ?”â??€ <feature>.spec.ts
?”â??€ testdata/
    ?”â??€ api/
        ?”â??€ <feature>/
            ?œâ??€ <endpoint>.baseline.json
            ?”â??€ <endpoint>.meta.json
```

`playwright.config.ts` uses `testDir: './tests'`, so `tests/api/*.spec.ts` is picked up automatically.

## Structure

```typescript
import { test, expect } from '@fixturesetup';
import { getRequest, postRequest } from 'vasu-playwright-utils';

test.describe('<Feature> API @reg', () => {
  test('<behavior> [REQ-<feature>-001][SCN-<feature>-001]', async () => {
    const response = await postRequest('/api/<resource>', {
      data: { <requestBodyFromSpec> },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body).toMatchObject({ <expectedShapeFromSpec> });
  });
});
```

Notes:

- `getRequest` and friends resolve relative paths against `use.baseURL`, so never hardcode the host.
- Call `.json()` once; cache the body in a variable when asserting multiple fields.
- For role-specific suites:
  ```typescript
  test.describe('admin only', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });
    // ...
  });
  ```

## Contract Assertions

| Assertion       | Example                                                                                         |
| :-------------- | :---------------------------------------------------------------------------------------------- |
| Status          | `expect(response.status()).toBe(422);`                                                          |
| Error envelope  | `expect(body).toMatchObject({ error: { code: 'QUANTITY_EXCEEDED' } });`                         |
| Required keys   | `expect(Object.keys(body)).toEqual(expect.arrayContaining(['id', 'items', 'total']));`          |
| Type discipline | `expect(typeof body.total).toBe('number');`                                                     |
| Boundary values | Data-driven `for (const qty of [0, 1, 99, 100]) { ... }` with one expected outcome per the spec |
| Headers         | `expect(response.headers()['cache-control']).toContain('no-store');`                            |
| Unauthorized    | Missing cookie -> `401`; wrong role -> `403`                                                    |

Use `test.step()` to group a matrix of inputs so failures name the offending value.

## Coverage Checklist

- [ ] Every in-scope endpoint from the test plan has at least one contract test.
- [ ] Every `REQ` tagged with a test level of `API` or `Both` is covered here.
- [ ] Every error envelope in the spec has a negative test.
- [ ] Every boundary value from the test plan appears in a data-driven case.
- [ ] Every role that changes the response has an authorization test.
- [ ] No test depends on execution order.

## Exit Criteria

- Phase 8: API acceptance tests fail for the feature-missing reason against the local server, with no route mocking; obtain red evidence before locking.
- Phase 10: those unchanged API acceptance tests pass against the local server with no route mocking. Continue all native quality and review gates before completion.
- Each test references its `REQ` and `SCN`.
- Each acceptance test has feature-missing red evidence in the separate execution record before implementation and locking.
- Failures are classified with the [verification loop](../verification-loop/SKILL.md) before any fix; locked tests stay unchanged.
