# Native-auth Phase 4 shared checklist and contracts

Version: 0.1. Prepared: 2026-11-01.
Status: **Approved under DR-039 (2026-11-01). Not frozen or implemented.**

Sources: [requirements](../../../REQUIREMENTS.md) AUTH-001–009/OD-11;
[decisions](../05-decision-record.md) DR-001–DR-038; [domain model](./03-domain-model.md);
approved intent [v0.1](./04-intent-v0.1.md), [v0.2](./04-intent-v0.2.md),
[v0.3](./04-intent-v0.3.md), [v0.4](./04-intent-v0.4.md);
[scenario catalog](./05-scenarios.md) SCN-native-auth-001–094.

## 1. One shared shape definition

[contracts/native-auth.openapi.json](../../../contracts/native-auth.openapi.json)
is the only machine-readable request/response shape definition. Frontend types,
backend DTOs and acceptance fixtures must derive from it or be checked against
it; do not create a second divergent shape list.

- Contract version: `0.1.0`, `x-review-status: draft`.
- 20 paths / 22 operations.
- Validation: `npm run ai:contract` runs Redocly lint and openapi-typescript.
- Last verified: lint valid with 0 errors / 0 warnings; TypeScript generation
  succeeded (57,292 bytes) into `.local-cache/generated/`.
- Exact copy and locators are **not** in the machine contract; they are in
  [07-ui-contract.md](./07-ui-contract.md).
- Operator commands are **not** HTTP operations; they are in
  [08-operator-contract.md](./08-operator-contract.md).

A contract change that alters observable behavior, permissions, error meaning or
durability needs a reviewed version, not a silent edit.

## 2. Transport and browser conventions

| Concern | Selected convention |
|---|---|
| Origin | Same-origin only; no cross-origin browser API use |
| Transport | HTTPS required outside loopback acceptance |
| Session cookie | `__Host-arg-session`; `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, no `Domain`; opaque server-side context |
| Context states | `ANONYMOUS`, `SETUP`, `HUMAN`; purpose enforced per operation, not only by cookie presence |
| Public operations | The eight operations whose `x-context` includes `ANONYMOUS` declare `security: []`; they do not require a cookie, though an anonymous cookie may be present. The other 14 require the browser context |
| CSRF | 43-character base64url context-bound token returned by `readAuthContext`; sent as `X-CSRF-Token` on state-changing methods; Origin/`Sec-Fetch-Site` validated independently |
| JSON | `Content-Type: application/json`; maximum request body 16,384 bytes; unknown fields rejected; no form-encoded fallback |
| Caching | Every auth/account response `Cache-Control: no-store` |
| Correlation | Every failure body and `X-Correlation-Id` carry the same UUID |
| Redirects | Server returns data/status; client routes by returned context state. No open redirect parameter |
| Tokens in URLs | One-time link tokens may appear only in the incoming link query. Never log, echo, store in browser history beyond the confirmation page, or include in a redirect |

Rotation: any transition into a new privilege context (`SETUP` → `HUMAN`, or a
new sign-in) issues a fresh session identifier. A failed or rejected request must
not retain partial new privilege.

## 3. Failure taxonomy

Machine codes are fixed by the contract (`Failure.code`). Status mapping is
declared in `x-failure-code-status` and repeated here for review.

| Code | HTTP | Meaning | User-facing class |
|---|---|---|---|
| `REQUEST_INVALID` | 400 | Malformed/unknown-field/shape-invalid input; never a password-strength rule | Field or request error |
| `SIGN_IN_FAILED` | 401 | Generic credential/factor failure; does not disclose account standing | Sign-in failure |
| `SIGN_IN_REQUIRED` | 401 | No valid human session | Sign-in required |
| `SETUP_ACCESS_FAILED` | 401 | Generic setup-access credential failure | Sign-in failure |
| `CSRF_REJECTED` | 403 | Missing/invalid CSRF or origin | Reload and retry |
| `FORBIDDEN` | 403 | Purpose or ownership forbidden | Not allowed |
| `RECENT_AUTH_REQUIRED` | 403 | Ten-minute recent confirmation missing/expired | Step-up required |
| `NOT_FOUND` | 404 | Own operation/record absent; no other-account disclosure | Not found |
| `STALE_OPERATION` | 409 | Superseded/cancelled state or stale tab | Start again |
| `SECRETS_ALREADY_ISSUED` | 409 | One-time display already issued; no readback | Start new attempt |
| `LINK_NOT_USABLE` | 410 | Expired, consumed or superseded one-time link | Request new email |
| `OPERATION_EXPIRED` | 410 | Pending operation past its deadline | Start again |
| `RATE_LIMITED` | 429 | Bounded admission/cooldown denial; `Retry-After` required | Temporary wait |
| `TEMPORARILY_UNAVAILABLE` | 503 | Hash work, key dependency or durable admission unavailable | Temporary unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected server failure; no internal detail | Generic failure |

Additional transport statuses without a body code: `413` body too large, `415`
unsupported media type, `405` method not allowed. They must not be success-shaped.

Copy rule: the body `message` is a short generic sentence. Field-level detail is
only in `fieldErrors` for `REQUEST_INVALID`. Authentication failures never reveal
whether the address is registered, verified, enrolled or disabled.

`Retry-After` is present exactly when `retryAfterSeconds` is present.

## 4. Operation-to-surface matrix

| Operation | Method/path | Context | Recent auth | Primary UI surface |
|---|---|---|---|---|
| `readAuthContext` | GET `/api/v1/auth/context` | any | no | App bootstrap; no inactivity renewal |
| `registerAccount` | POST `/api/v1/auth/registrations` | ANONYMOUS | no | `/register` |
| `resendVerification` | POST `/api/v1/auth/email-verifications/resend` | ANONYMOUS, SETUP | no | `/verify` resend |
| `consumeVerification` | POST `/api/v1/auth/email-verifications/consume` | ANONYMOUS | no | `/verify` explicit confirm |
| `requestPasswordReset` | POST `/api/v1/auth/password-resets` | any | no | `/forgot-password` |
| `consumePasswordReset` | POST `/api/v1/auth/password-resets/consume` | any | no | `/reset-password` |
| `establishSetupAccess` | POST `/api/v1/auth/setup-access` | ANONYMOUS | no | `/setup` credential step |
| `readEnrollment` | GET `/api/v1/auth/enrollment` | SETUP | no | `/setup/enroll` |
| `startEnrollment` | POST `/api/v1/auth/enrollment` | SETUP | no | `/setup/enroll` |
| `restartEnrollment` | POST `/api/v1/auth/enrollment/restart` | SETUP | password history | `/setup/restart` |
| `completeEnrollment` | POST `/api/v1/auth/enrollment/complete` | SETUP | password + candidate code | `/setup/enroll` |
| `signIn` | POST `/api/v1/auth/sign-in` | ANONYMOUS | no | `/sign-in` |
| `signOut` | POST `/api/v1/auth/sign-out` | SETUP, HUMAN | no | account menu |
| `confirmRecentAuthentication` | POST `/api/v1/auth/reauthentication` | HUMAN | full auth | step-up dialog |
| `readOwnAccount` | GET `/api/v1/account` | HUMAN | no | `/account` |
| `changePassword` | POST `/api/v1/account/password` | HUMAN | yes | `/account/password` |
| `startAuthenticatorReplacement` | POST `/api/v1/account/authenticator-replacements` | HUMAN | yes | `/account/authenticator` |
| `completeAuthenticatorReplacement` | POST `/api/v1/account/authenticator-replacements/{operationId}/complete` | HUMAN | yes | `/account/authenticator` |
| `startRecoveryCodeGeneration` | POST `/api/v1/account/recovery-code-generations` | HUMAN | yes | `/account/recovery-codes` |
| `completeRecoveryCodeGeneration` | POST `/api/v1/account/recovery-code-generations/{operationId}/complete` | HUMAN | yes | `/account/recovery-codes` |
| `readSecurityOperation` | GET `/api/v1/account/security/operations/{operationId}` | HUMAN | no | operation status |
| `cancelSecurityOperation` | DELETE `/api/v1/account/security/operations/{operationId}` | HUMAN | no | cancel action |

Idle renewal applies only to `readOwnAccount`, `changePassword`,
`completeAuthenticatorReplacement` and `completeRecoveryCodeGeneration`, and only
after a successful deliberate action. Bootstrap, polling, prefetch and static
assets never renew. `readEnrollment` with no current operation returns 404
`NOT_FOUND` (contract `0.2.1`).

## 5. Contract surfaces owned by companion documents

| Surface | Document | Status |
|---|---|---|
| Routes, copy, locators, state presentation | [07-ui-contract.md](./07-ui-contract.md) | Proposed, pending approval |
| Host commands, authority, audit, exit codes | [08-operator-contract.md](./08-operator-contract.md) | Proposed, pending approval |
| SCN-to-surface/test-level map | [09-scn-scope-map.md](./09-scn-scope-map.md) | Proposed, pending approval |
| Toolchain, harness, evidence, quality commands | [10-native-baseline.md](./10-native-baseline.md) | Partly measured; PostgreSQL/mail pending |
| Consolidated Phase 4 approval batch | [11-decision-proposals.md](./11-decision-proposals.md) | Pending user decision |

## 6. Harness and evidence rules

- Real browser + real backend + real PostgreSQL state. No forged session cookie,
  mocked successful login, static auth demo or public fixture endpoint.
- One isolated database/schema per run; mail captured by a real local SMTP sink.
- Controlled server clock through an application-internal test time source, never
  a public endpoint. `expiry - 1s`, `expiry`, `expiry + 1s` are distinct.
- Deterministic concurrency uses real database transactions with barriers, not
  `sleep` races. One committed winner is the only success.
- Host commands are executed as the real local operator process against the real
  database, not simulated in the browser.
- Secrets (passwords, seeds, recovery codes, link tokens, cookies) are generated
  per case and never committed. Tracing/video/DOM snapshots are disabled around
  secret displays and resumed only at a known nonsecret state.
- Exported evidence contains only scenario/correlation IDs, state/outcome,
  version, counts and timings. No raw secret, verifier, cookie or full link.
- A missing/empty artifact is not a pass. Each failure class needs its own
  observed response, not a success-shaped fallback.

## 7. Checklist ownership

| Item | Responsibility | Surface |
|---|---|---|
| CHK-NA-001 | Context/cookie/CSRF/session transport | Backend + frontend bootstrap |
| CHK-NA-002 | Registration, verification, mail admission/delivery | Backend + mail worker |
| CHK-NA-003 | Password verifier profiles, rehash, hash admission | Backend crypto |
| CHK-NA-004 | TOTP/enrollment/replacement/recovery-code lifecycle | Backend + frontend |
| CHK-NA-005 | Sessions, idle/absolute expiry, recent auth, revocation | Backend + frontend |
| CHK-NA-006 | Private scope and ownership enforcement | Backend + DB constraints |
| CHK-NA-007 | Host operator commands, audit, gateway entitlement | Host CLI + DB |
| CHK-NA-008 | Rate/cooldown/source identity and bounded state | Backend + proxy config |
| CHK-NA-009 | UI routes/copy/locators/accessibility | Frontend |
| CHK-NA-010 | Harness, secret-safe evidence, test-level split | Test setup |
| CHK-NA-011 | Contract validation and generated types | Build |

## 8. Still open before Phase 5/6

1. Approval of the exact UI copy, routes, locators and redirects.
2. Approval of the operator command spelling and audit record.
3. Approval of the 94-SCN browser/API test-level split.
4. Email syntax/length disposition and password maximum input handling.
5. PostgreSQL and mail-capture versions plus the harness shape.
6. Semantic approval of the draft machine contract after review.
