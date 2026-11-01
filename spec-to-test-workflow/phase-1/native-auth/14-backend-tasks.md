# Native-auth backend task list

Version: 0.1. Prepared: 2026-11-01.
Status: **Reviewed and approved under DR-040 (2026-11-01). Not frozen; no backend code exists.**

## 1. Files studied

| File / source | Why it matters |
|---|---|
| [06-shared-checklist.md](./06-shared-checklist.md) | Contract source, transport, failure taxonomy, operation matrix |
| [08-operator-contract.md](./08-operator-contract.md) | Host commands, authority, audit, exit codes |
| [09-scn-scope-map.md](./09-scn-scope-map.md) | 45 API SCNs and their boundaries |
| [10-native-baseline.md](./10-native-baseline.md) | Toolchain, harness, quality gates |
| [12-implementation-design.md](./12-implementation-design.md) | Schema, transactions, crypto, rate/mail/hash design |
| [native-auth.openapi.json](../../../contracts/native-auth.openapi.json) | Request/response shapes, codes, statuses |
| [TECHNICAL_BASELINE.md](../../../TECHNICAL_BASELINE.md) | Java 25, Spring Boot, JDBC, Flyway, PostgreSQL |
| Repository root | Greenfield: no `backend/`, migrations or tests exist |

## 2. Endpoint baseline status

All 22 operations are new. No endpoint exists, so there is no captured baseline.
The contract is authoritative and `Baseline: deferred` applies to every row.

| Method | Path | Exists | Baseline |
|---|---|---|---|
| GET | `/api/v1/auth/context` | No | deferred |
| POST | `/api/v1/auth/registrations` | No | deferred |
| POST | `/api/v1/auth/email-verifications/resend` | No | deferred |
| POST | `/api/v1/auth/email-verifications/consume` | No | deferred |
| POST | `/api/v1/auth/password-resets` | No | deferred |
| POST | `/api/v1/auth/password-resets/consume` | No | deferred |
| POST | `/api/v1/auth/setup-access` | No | deferred |
| GET/POST | `/api/v1/auth/enrollment` | No | deferred |
| POST | `/api/v1/auth/enrollment/restart` | No | deferred |
| POST | `/api/v1/auth/enrollment/complete` | No | deferred |
| POST | `/api/v1/auth/sign-in` | No | deferred |
| POST | `/api/v1/auth/sign-out` | No | deferred |
| POST | `/api/v1/auth/reauthentication` | No | deferred |
| GET | `/api/v1/account` | No | deferred |
| POST | `/api/v1/account/password` | No | deferred |
| POST | `/api/v1/account/authenticator-replacements` | No | deferred |
| POST | `/api/v1/account/authenticator-replacements/{operationId}/complete` | No | deferred |
| POST | `/api/v1/account/recovery-code-generations` | No | deferred |
| POST | `/api/v1/account/recovery-code-generations/{operationId}/complete` | No | deferred |
| GET/DELETE | `/api/v1/account/security/operations/{operationId}` | No | deferred |

## 3. Task list

| ID | Checklist ref | Action | Target file | Existing/new | Pattern to follow | Change detail | Scenarios |
|---|---|---|---|---|---|---|---|
| BE-NA-001 | CHK-NA-001/011 | Add | `backend/pom.xml`, `mvnw`, `.mvn/`, `GovernanceApplication.java`, `config/*`, `application.yml` | New | Design §3 | Java 25, Boot 4.1.2, MVC virtual threads, JDBC, Flyway, Jackson, profiles, health | — |
| BE-NA-002 | CHK-NA-001/006 | Add | `db/migration/V1__auth_core.sql`, `auth/persistence/*` | New | Design §4 | All tables, indexes, partial unique constraints, row mappers | 001, 007, 018, 033, 045, 061, 063 |
| BE-NA-003 | CHK-NA-003/004 | Add | `auth/crypto/*` | New | Design §5 | Argon2 current/predecessor, rehash CAS, token hash, AES-GCM, TOTP, recovery verifier, randomness | 024, 027, 042, 077, 079, 091–093 |
| BE-NA-004 | CHK-NA-002 | Add | `auth/application/RegistrationService`, `VerificationService`, `auth/mail/*` | New | Design §6, §10 | Registration/duplicate safety, link issue/consume, mail admission + worker, retries | 001–003, 005, 006, 008–011, 013–016, 020–022, 090 |
| BE-NA-005 | CHK-NA-008 | Add | `auth/application/SignInService`, `auth/ratelimit/*`, `auth/crypto/HashWorkLimiter` | New | Design §8, §9 | Credential/factor check, generic failure, rolling windows, cooldown, source identity, hash admission | 012, 014, 029, 031–033, 043–045, 049, 080, 083–089 |
| BE-NA-006 | CHK-NA-001/005 | Add | `auth/session/*`, `auth/api/ContextController`, `config/SecurityConfig` | New | Design §6, §7 | Cookie/session/CSRF, context states, rotation, idle/absolute expiry, recent auth | 004, 021, 022, 041, 051–060, 062 |
| BE-NA-007 | CHK-NA-004 | Add | `auth/application/EnrollmentService`, `ReplacementService`, `auth/api/EnrollmentController` | New | Design §6 | Start/restart/complete, secret one-time response, replacement atomic swap | 001, 007, 030, 031, 034–041, 063 |
| BE-NA-008 | CHK-NA-004 | Add | `auth/application/RecoveryCodeService`, `auth/api/RecoveryController` | New | Design §6 | Ten codes, verifier storage, consume-once, pending/active set, regeneration, session effects | 042–050, 081 |
| BE-NA-009 | CHK-NA-006/007 | Add | `auth/application/AccountService`, `PasswordService`, `auth/api/AccountController` | New | Design §6 | Own-account read, password change, ownership checks, scope immutability | 055, 058, 062, 063, 078 |
| BE-NA-010 | CHK-NA-007 | Add | `admin/*`, `db/migration/V2__host_audit.sql` if needed | New | Design §7, 08 | CLI parser, operator proof, disable/enable/recover, gateway grant/revoke, key commands, atomic audit | 005, 006, 064–077, 082 |
| BE-NA-011 | CHK-NA-011 | Add | `auth/api/ErrorHandler`, `api/mapping/*` | New | Design §7 | Map domain failures to the 15 codes, headers, `Retry-After`, no internal detail | all |
| BE-NA-012 | CHK-NA-010 | Add | `tests/support/stack.ts`, `clock.ts`, `mail.ts`, `host.ts`, `tests/api/native-auth.spec.ts` (tags after Phase 7) | New | Design §14 | Real DB/mail/server, controlled clock, fault injection, host process, API project | all 45 API SCNs |
| BE-NA-013 | CHK-NA-008/011 | Add | `config/ObservabilityConfig`, logging pattern, metrics | New | Design §7 | Correlation id, secret-safe logs, counters without identity labels, trusted-proxy config | 087, 088 |

## 4. Case matrix

| Operation | Case | Expected handling | Scenario | Status |
|---|---|---|---|---|
| `registerAccount` | Malformed email / short password | 400 `REQUEST_INVALID` + field errors | 025, 083 | Mapped |
| `registerAccount` | Duplicate identity | 202 generic, no mail, no password change | 003 | Mapped |
| `registerAccount` | Invalid JSON / unknown field | 400 `REQUEST_INVALID` | 083 | Mapped |
| `registerAccount` | Body > 16,384 bytes | 413, no parse | 083 | Mapped |
| `registerAccount` | Non-JSON content type | 415 | 083 | Mapped |
| `registerAccount` | Mail admission unavailable | 503, no account disclosure | 009 | Mapped |
| `consumeVerification` | Expired/consumed/superseded | 410 `LINK_NOT_USABLE` | 014, 020 | Mapped |
| `consumeVerification` | Concurrent consume | One 200; other 410 | 018 | Mapped |
| `signIn` | Wrong password / unknown / disabled | 401 `SIGN_IN_FAILED`, same body | 029 | Mapped |
| `signIn` | Fifth failure in 15 min | 429 `RATE_LIMITED`, `Retry-After: 2` | 080, 085 | Mapped |
| `signIn` | 31st attempt per source/60s | 429 | 084 | Mapped |
| `signIn` | Sixth concurrent hash | 503 `TEMPORARILY_UNAVAILABLE` | 089 | Mapped |
| `signIn` | TOTP replay same step | 401 | 032 | Mapped |
| `signIn` | Concurrent recovery code use | One 200, one 401 | 045 | Mapped |
| All HUMAN ops | Missing/invalid CSRF | 403 `CSRF_REJECTED` | 054 | Mapped |
| All HUMAN ops | Expired session | 401 `SIGN_IN_REQUIRED` | 052, 059 | Mapped |
| Sensitive ops | No recent auth | 403 `RECENT_AUTH_REQUIRED` | 041, 056 | Mapped |
| `completeAuthenticatorReplacement` | Stale operation id | 409 `STALE_OPERATION` | 040 | Mapped |
| `completeRecoveryCodeGeneration` | Lost completion response | 409 `SECRETS_ALREADY_ISSUED` on retry | 048 | Mapped |
| `consumePasswordReset` | Expired link | 410 | 014 | Mapped |
| `readSecurityOperation` | Another account's id | 404 `NOT_FOUND` | 062 | Mapped |
| `totp-key` unavailable | Sensitive factor op | 503, not wrong code | 075, 093 | Mapped |
| `arg-admin gateway grant` | Unenrolled account | exit 4, no change | 070 | Mapped |
| `arg-admin` | Concurrent grant/revoke | Committed order wins | 072 | Mapped |
| `arg-admin` | DB failure | exit 5, no partial audit | 065 | Mapped |

## 5. Seed and data needs

- No public seed/auth-bypass endpoint. Fixtures are created through the real API
  or browser journey.
- Test support may read the database for assertions and may clean explicitly
  resolved per-case rows; it may not forge a session or insert a “logged-in”
  cookie.
- Operator commands run against the same database with a temporary operator OS
  identity configured for the test profile.
- Generated passwords, TOTP secrets, recovery codes and link tokens are per case
  and never committed.
- Mail is read from Mailpit by recipient; the token is consumed in memory.

## 6. Phase 6 resolutions (DR-040)

1. **`readEnrollment` with no current operation.** Returns 404 `NOT_FOUND`;
   contract `0.2.1`.
2. **Operator proof on Windows.** Configured local OS user for the demo; real
   group ACLs are deployment-specific.
3. **`__Host-` cookie on loopback.** Try `http://localhost`; fall back to local
   HTTPS with a generated test certificate.
4. **PostgreSQL install form.** Project-local PostgreSQL 18.6 binaries.
5. **Mail capacity.** Count `PENDING`, `DELAYED`, `SENDING` and
   `INELIGIBLE_ACCEPTED`; terminal states excluded.
6. **`host_audit.changed_fields`.** JSONB array in the DB and JSON array in CLI
   output.

## 7. Coverage against checklist

- Backend-owned checklist items covered: 8/8 (`CHK-NA-001`–`008`).
- Shared contract/harness items: `CHK-NA-010` (BE-NA-012), `CHK-NA-011`
  (BE-NA-011/BE-NA-001).
- SCNs with a backend task: 94/94.

## 8. Implementation design and validation

| Task | Design responsibility / dependency | Naming example | Supporting test | Native validation |
|---|---|---|---|---|
| BE-NA-001 | app/config; depends on no auth module | `GovernanceApplication` | context load | `mvnw -q -DskipTests package` |
| BE-NA-002 | persistence only; no business rules | `AccountRepository` | migration + repository test | `mvnw -q verify` |
| BE-NA-003 | crypto only; no HTTP/DB | `Argon2PasswordHasher`, `TotpGenerator` | vectors + property tests | `mvnw -q test` |
| BE-NA-004 | application + mail; uses 002/003 | `RegistrationService` | mail worker integration | `mvnw -q verify` |
| BE-NA-005 | application + ratelimit; uses 002/003 | `SignInService`, `RollingWindowLimiter` | clock/concurrency tests | `mvnw -q verify` |
| BE-NA-006 | session/security; uses 002 | `SessionService`, `CsrfFilter` | session expiry tests | `mvnw -q verify` |
| BE-NA-007 | application; uses 003/006 | `EnrollmentService` | atomic swap tests | `mvnw -q verify` |
| BE-NA-008 | application; uses 003/006 | `RecoveryCodeService` | consume-once tests | `mvnw -q verify` |
| BE-NA-009 | application; uses 002/006 | `AccountService` | ownership tests | `mvnw -q verify` |
| BE-NA-010 | admin CLI; uses 002 | `AdminCli`, `HostAuditRepository` | CLI integration | `mvnw -q verify` |
| BE-NA-011 | API adapter; central mapping | `ApiErrorHandler` | contract conformance | `npm run ai:contract` + `mvnw -q verify` |
| BE-NA-012 | harness only; no production code | `TestClockController` (test profile) | red authoring | `npx playwright test --project=api` |
| BE-NA-013 | config/logging; no policy | `ObservabilityConfig` | log redaction test | `mvnw -q verify` |

Supporting tests stay outside `tests/specs` and `tests/api`; they cannot supply a
missing acceptance tag.
