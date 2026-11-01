# Native-auth frontend task list

Version: 0.1. Prepared: 2026-11-01.
Status: **Reviewed and approved under DR-040 (2026-11-01). Not frozen; no frontend code exists.**

## 1. Files studied

| File / source | Why it matters |
|---|---|
| [07-ui-contract.md](./07-ui-contract.md) | Routes, guards, exact copy, locators, failure presentation |
| [06-shared-checklist.md](./06-shared-checklist.md) | Transport, CSRF, failure taxonomy, operation matrix |
| [09-scn-scope-map.md](./09-scn-scope-map.md) | 49 Browser SCNs and their surfaces |
| [12-implementation-design.md](./12-implementation-design.md) | Module ownership, client/provider shape, harness |
| [native-auth.openapi.json](../../../contracts/native-auth.openapi.json) | Generated types and response shapes |
| [TECHNICAL_BASELINE.md](../../../TECHNICAL_BASELINE.md) | React/Vite/TypeScript direction |
| Repository root | Greenfield: no `frontend/`, components, hooks or tests exist |

## 2. Task list

| ID | Checklist ref | Action | Target file | Existing/new | Pattern to follow | Change detail | Scenarios |
|---|---|---|---|---|---|---|---|
| FE-NA-001 | CHK-NA-009/011 | Add | `frontend/package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx` | New | Design §3, §11 | Vite + React 19 + TypeScript 5.9; router skeleton; generated types script; typecheck/lint/build scripts; no auth logic | — |
| FE-NA-002 | CHK-NA-001/009 | Add | `src/api/client.ts`, `src/api/errors.ts`, `src/copy.ts`, `src/auth/AuthProvider.tsx` | New | Design §11 | Same-origin fetch; in-memory CSRF; parse `Failure`; map 15 codes to approved copy; context state; no token storage | 004, 029, 051, 059 |
| FE-NA-003 | CHK-NA-002/009 | Add | `src/routes/SignInPage.tsx`, `RegisterPage.tsx`, `VerifyPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx` | New | 07 §3 | Email/password/factor entry; generic outcomes; link token read once; line-break and length errors; paste/autofill | 001–004, 008, 013, 015, 017, 020–023, 025–029, 094 |
| FE-NA-004 | CHK-NA-004/009 | Add | `src/routes/SetupPage.tsx`, `EnrollPage.tsx`, `RestartPage.tsx`, `RecoveryCodesPage.tsx` | New | 07 §3 | QR/manual key once; six-digit code; acknowledgement; restart; expiry/stale-tab states; no readback | 001, 007, 030–036, 042–044, 049 |
| FE-NA-005 | CHK-NA-004/005/009 | Add | `src/routes/AccountPage.tsx`, `PasswordPage.tsx`, `AuthenticatorPage.tsx`, `RecoveryGenerationPage.tsx` | New | 07 §3 | Account summary; password change; replacement; regeneration; cancel; post-commit nonsecret status | 038–041, 046–048, 050, 055, 056, 058, 060, 063 |
| FE-NA-006 | CHK-NA-005/009 | Add | `src/components/StepUpDialog.tsx`, `src/components/Alert.tsx`, `src/components/SecretRegion.tsx`, `src/auth/guards.tsx` | New | 07 §3–§7 | Recent-auth dialog and retry; focus management; alert/status roles; context redirects; session-expiry handling; secret-display boundary | 004, 021, 041, 051–060, 062 |
| FE-NA-007 | CHK-NA-010 | Add | `tests/playwright.config.ts`, `tests/specs/native-auth.spec.ts` (tags only after Phase 7), `tests/support/browser.ts` | New | Design §14 | Browser project; real stack; trace/video off around secrets; role/name helpers | all 49 Browser SCNs |

## 3. Case matrix

| Behavior | Case | UI handling | Scenario | Status |
|---|---|---|---|---|
| Bootstrap | Context loading | Neutral loading state; no protected shell | 051 | Mapped |
| Bootstrap | Expired/invalid cookie | Redirect to `/sign-in` | 004, 059 | Mapped |
| Submit | Double submit | Disable submit while in flight; server idempotent | 034, 039, 043 | Mapped |
| Submit | 400 `REQUEST_INVALID` | Field errors + alert; focus first invalid | 025, 026, 094 | Mapped |
| Submit | 401 generic sign-in | Same message for unknown/wrong/disabled | 029 | Mapped |
| Submit | 403 `RECENT_AUTH_REQUIRED` | Open step-up dialog, retry once confirmed | 041, 056 | Mapped |
| Submit | 409 `STALE_OPERATION`/`SECRETS_ALREADY_ISSUED` | Alert + restart; no secret redisplay | 035, 040, 048 | Mapped |
| Link | 410 `LINK_NOT_USABLE` | Alert + resend action | 014, 020 | Mapped |
| Rate | 429 | Countdown from `Retry-After` | 012, 084, 085 | Mapped |
| Dependency | 503 | Temporary-unavailable alert; no fake success | 009, 075, 081 | Mapped |
| Setup | Reload/back after secrets | No readback; restart guidance | 030, 035 | Mapped |
| Recovery | Codes shown once | List + acknowledgement; tracing stopped | 042 | Mapped |
| Session | Idle expiry during interaction | Next action gets `SIGN_IN_REQUIRED`; redirect | 052, 059 | Mapped |
| Session | Background tab/polling | Must not renew; no hidden heartbeat | 053 | Mapped |
| Navigation | Pending request then route change | Abort or ignore stale response; no false success | 054 | Mapped |
| Ownership | Guessed other-account URL/id | Server 404/403; no other data | 062 | Mapped |
| Accessibility | Dialog open/close | Focus trap, Escape, restore focus | 041 | Mapped |
| Browser | Raw pasted line break | Explicit rejection message | 094 | Mapped |

## 4. Phase 6 resolutions (DR-040)

1. **Manual-key locator.** Use a labelled `<output>` or `<p>` with an accessible
   name; no `data-testid` exception.
2. **Recovery-code list.** Use a named `<ol>`; each `<li>` contains the code text
   and is not otherwise labelled. The list name is the locator.
3. **`readEnrollment` with no operation.** Contract `0.2.1` returns 404
   `NOT_FOUND`; the page starts a new operation.
4. **Step-up retry.** Re-issue the same request after `confirmRecentAuthentication`;
   server current-state and idempotency checks prevent double application.

## 5. Coverage against checklist

- Frontend-owned checklist items covered: 2/2 (`CHK-NA-009`, `CHK-NA-011`).
- Harness item `CHK-NA-010` has FE-NA-007; remaining harness work is backend-owned.
- Browser SCNs with a frontend task: 49/49.

## 6. Implementation design and validation

| Task | Design responsibility / dependency | Naming example | Supporting test | Native validation |
|---|---|---|---|---|
| FE-NA-001 | `frontend/` app shell; depends on generated types only | `AppRouter`, `AuthProvider` | build smoke | `npm --prefix frontend run build` |
| FE-NA-002 | `api/client.ts` owns transport; no component fetches directly | `readAuthContext()`, `mapFailure()` | unit test for error mapping | `npm --prefix frontend run typecheck` |
| FE-NA-003 | route modules; depends on `AuthProvider` and `client` | `SignInPage`, `RegisterPage` | component test (supporting) | `npm --prefix frontend run lint` |
| FE-NA-004 | setup modules; secret region owns capture boundary | `EnrollPage`, `RecoveryCodesPage` | component test (supporting) | `npm --prefix frontend run typecheck` |
| FE-NA-005 | account modules; step-up reused | `AccountPage`, `PasswordPage` | component test (supporting) | `npm --prefix frontend run lint` |
| FE-NA-006 | shared components; no business rules | `StepUpDialog`, `Alert` | accessibility check | `npm --prefix frontend run build` |
| FE-NA-007 | tests/support; real stack only | `browser.ts`, `recording.ts` | red acceptance authoring | `npx playwright test --project=browser` |

All tests outside `tests/specs/native-auth.spec.ts` are supporting and cannot
supply acceptance coverage.
