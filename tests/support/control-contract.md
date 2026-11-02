# Test-only control surface

Version: 0.1. Prepared: 2026-11-01. **Test support only; never exposed in a
production profile.**

The acceptance suite needs controlled time, fault injection, mail flushing,
cleanup, dispatch and nonsecret inspection. These controls are bound to
`127.0.0.1` by the test-profile server binding, enabled only when the `test`
profile is active, and require the per-run `X-Test-Token` header. They are not
part of the product API and must not appear in the OpenAPI contract.

| Control | Method/path | Purpose |
|---|---|---|
| Clock set | `POST /__test/clock` `{now}` | Set the test server clock |
| Clock advance | `POST /__test/clock/advance` `{milliseconds}` | Advance the test clock |
| Reset | `POST /__test/reset` | Clear test-owned accounts, rate buckets, faults and dispatch state; reset the controlled clock; runs once before each test |
| Fault | `POST /__test/faults` `{name, enabled}` | Enable/disable a named fault |
| Barrier state | `GET /__test/inspect?what=barrier&name=predecessor-rehash-after-derive` | Return only whether the bounded predecessor-rehash barrier is currently reached |
| Predecessor verifier | `POST /__test/verifier/predecessor` `{email, password}` | Verify a generated current password, replace only its verifier with the approved predecessor profile and revoke sessions for deterministic race setup |
| Cleanup | `POST /__test/cleanup` | Run the pending-registration cleanup once |
| Mail flush | `POST /__test/mail/flush` | Run the mail worker until idle or exhausted |
| Dispatch | `POST /__test/dispatch` `{accountId}` | Exercise the gateway admission/dispatch path |
| Inspect | `GET /__test/inspect?what=...` | Read nonsecret state: account, link, mail_request, audit, verifier, seed, evidence, buckets |
| Export evidence | `POST /__test/evidence/export` | Produce the declared metadata-only evidence inventory |

`/reset` is destructive and is enforced as an awaited per-test fixture barrier in
`tests/support/reset-hook.ts`. It must complete before the test body and must
never be issued during a scenario action or duplicate-signup step.

Fault names: `mail-admission`, `smtp`, `consume-rollback`, `hash-service`,
`recovery-verifier`, `totp-key-missing`, `db-commit`, `account-disable`,
`predecessor-rehash-after-derive` (waits at most 10 seconds, test profile only).

Inspection never returns passwords, verifiers, seeds, recovery codes, tokens or
cookies. A missing/empty inspection result is not a pass. The predecessor
fixture route returns no verifier or submitted password. The barrier state
inspection returns a boolean only; reset releases blocked work and timeout is
an explicit test failure, never an authentication fallback.

The verifier-seeding route returns no verifier or password-derived value. The
barrier inspection returns a boolean only. Release the barrier by setting its
named fault false; test reset also releases any waiter. Timeout is an explicit
test failure, never an auth fallback.

The token is generated per run and passed to Playwright through
`TEST_CLOCK_TOKEN`; the URL is `TEST_CONTROL_URL` (default
`http://127.0.0.1:8081/__test`).
