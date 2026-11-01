# Native-auth Phase 4 consolidated decision proposals

Version: 0.1. Prepared: 2026-11-01.
Status: **Approved under DR-039 on 2026-11-01. This file is retained as the
record of exactly what was approved; it is not itself the approval.**

These are the only new observable/contract choices needed to finish Phase 4.
Approved business behavior from DR-019–DR-038 is not reopened. Each item states
the recommendation, the exact scope, and what approval does **not** mean.

## DP-NA-001 — Email identity syntax and length

**Recommendation:** accept an ASCII mailbox of the form `local@domain`:

- 3–254 characters total; no display name, comments, quoted local part or
  multiple addresses.
- One `@`; local part 1–64 characters; domain has at least one dot, labels
  1–63 characters, no leading/trailing hyphen.
- Punycode (`xn--`) domains are allowed; non-ASCII input must be converted before
  validation or rejected explicitly.
- Reject whitespace, control characters and anything after the address.
- Trim leading/trailing Unicode `White_Space`, then case-normalize the **full**
  identity (local + domain) to lower case for identity comparison.
- Store/display the normalized identity. Do not silently change any other part.

**Why:** the contract already drafts this; it is deterministic, testable and
avoids quoted-local/display-name parsing that the product does not need.

**Approval does not mean:** real SMTP deliverability, internationalized local
parts, subaddressing semantics (`+tag` is ordinary text), or verified-email
recycling (deferred).

## DP-NA-002 — Exact UI routes, copy and locators

**Recommendation:** approve [07-ui-contract.md](./07-ui-contract.md) as written:

- Routes `/`, `/sign-in`, `/register`, `/verify`, `/forgot-password`,
  `/reset-password`, `/setup`, `/setup/enroll`, `/setup/restart`,
  `/setup/recovery-codes`, `/account`, `/account/password`,
  `/account/authenticator`, `/account/recovery-codes`, `/signed-out`.
- Context guards and redirects in section 1.
- Exact strings in sections 2–4.
- Role/name locators, not `data-testid`, except a recorded exception.
- Step-up dialog, alert/status regions and focus behavior.

**Why:** acceptance cannot be written red against guessed copy; the scenarios
deliberately left copy open. This is the single largest approval item.

**Approval does not mean:** visual design, CSS, component library, i18n or
additional pages.

## DP-NA-003 — Browser transport, cookie, CSRF and token shapes

**Recommendation:** approve:

- Cookie `__Host-arg-session`; `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`,
  no `Domain`; opaque server-side context.
- CSRF token 43-character base64url, context-bound, returned by
  `readAuthContext`, sent as `X-CSRF-Token`; Origin/`Sec-Fetch-Site` checked.
- One-time link/session/operation token: 43-character base64url (256 random bits),
  single-use or server-side state as applicable.
- JSON only, 16,384-byte request limit, unknown fields rejected, `no-store` on
  every auth/account response.
- One-time tokens never appear in a redirect, log, analytics event or storage.

**Why:** these are observable security/transport contracts and must be fixed
before tests and implementation.

**Approval does not mean:** a particular session-store schema, cookie-signing
algorithm or reverse-proxy product.

## DP-NA-004 — Failure code and HTTP status mapping

**Recommendation:** approve the 15 codes and mapping in
[06-shared-checklist.md](./06-shared-checklist.md) §3 and the contract's
`x-failure-code-status`:

`REQUEST_INVALID` 400, `SIGN_IN_FAILED`/`SIGN_IN_REQUIRED`/`SETUP_ACCESS_FAILED`
401, `CSRF_REJECTED`/`FORBIDDEN`/`RECENT_AUTH_REQUIRED` 403, `NOT_FOUND` 404,
`STALE_OPERATION`/`SECRETS_ALREADY_ISSUED` 409, `LINK_NOT_USABLE`/
`OPERATION_EXPIRED` 410, `RATE_LIMITED` 429, `TEMPORARILY_UNAVAILABLE` 503,
`INTERNAL_ERROR` 500. Transport-only 413/415/405 carry no body code.

**Why:** Redocly now passes with explicit 4xx responses; scenarios need one
non-success-shaped contract.

**Approval does not mean:** exact server log text or internal exception mapping.

## DP-NA-005 — Host operator command contract

**Recommendation:** approve [08-operator-contract.md](./08-operator-contract.md):

- Executable `arg-admin`, local-only, operator group, no network listener.
- Commands: `account disable|enable|recover-mfa`, `gateway grant|revoke`,
  `security cancel`, `totp-key provision|status|retire`.
- Required `--reason` (8–200 code points) and `--confirm <normalized-email>`.
- Exit codes 0/2/3/4/5/6; JSON one-line output; atomic audit with the change.
- Recovery handoff creates no session; re-enable revives nothing.

**Why:** DR-032 fixed the behavior but not the command surface; tests and the
operator procedure need exact spelling.

**Approval does not mean:** final OS packaging, service-manager integration or
key-backup tooling.

## DP-NA-006 — Acceptance test-level split

**Recommendation:** approve [09-scn-scope-map.md](./09-scn-scope-map.md):

- 49 Browser SCNs: real UI, real backend, real persisted state.
- 45 API SCNs: real service/worker/host-CLI boundary for cleanup, concurrency,
  rate admission, crypto/evidence, key lifecycle, host authority and dispatch
  ordering.
- Every SCN has exactly one locked acceptance tag.
- `@supporting` scenarios still need their supporting inspection **and** their
  tagged acceptance.

**Why:** running time/worker/concurrency boundaries only through a browser would
be slow and would not prove the boundary; running user journeys only at API level
would violate the workflow's frontend-acceptance rule.

**Approval does not mean:** unit tests can supply acceptance coverage, or that
the API tests may mock the database/service under test.

## DP-NA-007 — Server clock control for browser boundaries

**Recommendation:** a test-profile-only time source advanced through a
loopback-only control channel protected by a per-run random token, absent from
production profiles. Browser SCNs 005/007/014/036/037/052/086 use it.

**Fallback if rejected:** move those exact-boundary cases fully to API level and
keep only coarser browser coverage of the resulting visible state.

**Why:** the scenarios require `expiry-1s`, `expiry`, `expiry+1s` without `sleep`.
A public endpoint would be a privilege boundary; a test-only channel must be
declared and reviewed.

**Approval does not mean:** any production time-travel feature.

## DP-NA-008 — Toolchain and environment pins

**Recommendation:** accept the measured/proposed pins in
[10-native-baseline.md](./10-native-baseline.md):

- JDK 25.0.5+8, Maven 3.9.16, Node 24.22.0, npm 11.19.1, Playwright 1.64.1,
  Chromium 156.0.8078.4.
- PostgreSQL 18.6, Mailpit 1.32.0.
- Spring Boot 4.1.2, React 19.3.1, Vite 8.3.5, plugin 6.1.2, TypeScript 5.9.3.
- Project-local installs only; no global PATH change.

**Why:** the previous Node 22.19.0 environment no longer matches this machine.

**Approval does not mean:** any build, install, database or browser result has
passed. Each pin is re-verified during the scaffold and recorded.

## DP-NA-009 — Contract review status

**Recommendation:** after DP-NA-001/002/003/004/005 are approved, set the contract
to version `0.2.0`, `x-review-status: reviewed`, keep `x-contract-notes`, and
regenerate types. Any later observable change requires another reviewed version.

**Alternative:** keep `draft` until Phase 6 sign-off.

**Why:** frontend/backend task lists need one reviewed shape, and generated types
should not be built against a moving draft.

## DP-NA-010 — First-increment command scope

**Recommendation:** include `account disable|enable|recover-mfa` and
`gateway grant|revoke`; defer `security cancel` and `totp-key provision|retire`
from the first implementable increment, while keeping `totp-key status` as a
read-only diagnostic. Key provisioning is still required before enrollment can
run; if it is deferred, the first increment needs a reviewed test-only key
bootstrap that is not a public endpoint.

**Alternative:** include the full command surface in the first increment.

**Why:** the scenarios cover key lifecycle, but the smallest coherent auth slice
needs enrollment to work before key rotation/retirement is exercised.

## Decision summary

| ID | Topic | Default if not approved |
|---|---|---|
| DP-NA-001 | Email syntax/length | Contract stays draft; validation tests blocked |
| DP-NA-002 | UI routes/copy/locators | No red browser acceptance can be authored |
| DP-NA-003 | Cookie/CSRF/token shapes | Contract stays draft |
| DP-NA-004 | Failure/status mapping | No executable failure assertions |
| DP-NA-005 | Operator command contract | Host SCNs blocked |
| DP-NA-006 | 49/45 test split | Freeze and lock blocked |
| DP-NA-007 | Clock control | Exact-boundary browser cases blocked |
| DP-NA-008 | Toolchain pins | Scaffold and baselines blocked |
| DP-NA-009 | Contract review status | Types remain draft-only |
| DP-NA-010 | First-increment command scope | Task list cannot be finalized |

Approval of all ten closes Phase 4 contract review. It still does not pass Phase 5
(design/tasks), Phase 6 (review), Phase 7 (freeze), Phase 8 (red/lock) or any
runtime acceptance gate.
