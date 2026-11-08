# Handoff — current state

Updated: 2026-11-08. This file supersedes the 2026-11-04 checkpoint.
Read this first; `HANDOVER.md` remains historical context.

## 1. Current checkpoints

All three repositories are clean and pushed.

| Repository | Branch | Commit | State |
|---|---|---|---|
| `ai-runtime-governance-backend` | `release/v0.1.0` | `6e299d0 [SignIn]Add Keycloak sign-in and unified account projections` | pushed |
| `ai-runtime-governance-frontend` | `release/v0.1.0` | `bf13ce2 [UI]Align auth pages and add English locale catalog` | pushed |
| `ai-runtime-governance` (docs/tests) | `main` | `f30ec4e [Test]Align auth coverage with current sign-in and sign-up flows` | pushed |

Local development stack, if started:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:8080`
- Keycloak: `http://127.0.0.1:8180`
- Mailpit: `http://127.0.0.1:8025`

The isolated acceptance PostgreSQL on port `55434` is currently **stopped**.

## 2. Completed in this session

### Authentication

- Native/local login and Keycloak login coexist behind one Spring Security BFF.
- Unified session context is exposed at `/api/v1/session/context`.
- Local and Keycloak identities are projected into the shared `app_user` /
  `app_scope` tables.
- Gateway, hook, usage and timeline access now use the unified projection.
- CSRF handling covers both native and Keycloak sessions.
- Google login is wired behind `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and
  stays hidden until those values are configured.

### Sign-up and verification

- Sign-up is synchronous and gives immediate feedback.
- Duplicate local registration returns `409 EMAIL_ALREADY_REGISTERED`.
- Duplicate Keycloak registration returns an immediate email-field error.
- The sign-up success panel replaces the form and shows the verification
  destination.
- Multiple unexpired confirmation links may coexist.
- Any valid link works.
- Successful verification consumes the used link and supersedes the remaining
  verification links and pending mail.
- The same invalidation rule applies to password-reset links.
- The duplicate-email check runs before the per-email mail rate limit.

### Frontend

- Added a typed English catalog at `src/locales/en.ts`.
- Added the typed `t()` translator at `src/i18n/index.ts`.
- Moved auth, account, activity, gateway, loading and error copy into the
  catalog.
- Extracted the sign-in split layout into `AuthFrame` and applied it to both
  sign-up pages.
- Removed the last user-facing “local account” wording.
- Sign-in heading is “Welcome back”; sign-up heading is “Create account”.
- Sign-out is accessed from the sidebar drawer.

### Playwright

- Updated the native-auth helper and specs to the current password → MFA flow.
- Updated follow-ups 03, 04 and 05 and the accessibility spec.
- Added `tests/specs/auth-current-ui.spec.ts` for the current sign-in/sign-up UI.
- Updated `tests/playwright.config.ts` to use the current backend jar and to
  pass the backend URL into the Vite proxy.
- Added local Keycloak setup scripts and the realm template under
  `local-env/keycloak/`.

## 3. Verified results

| Gate | Result |
|---|---|
| `tests/specs/native-auth.spec.ts` | **49/49 passed** |
| Native-auth follow-ups 03/04/05 | **12/12 passed** |
| `tests/specs/auth-current-ui.spec.ts` | **6/6 passed** |
| `tests/supporting/accessibility.spec.ts` (a11y config) | **4/4 passed** |
| Frontend typecheck | pass |
| Frontend lint | pass |
| Frontend production build | pass |
| Backend build | pass; jar exercised by the acceptance run |
| `git diff --check` | clean |

The acceptance run used an isolated PostgreSQL database on `55434` and
non-default ports so it could run alongside the dev stack:

```text
GOVERNANCE_PORT=8081
FRONTEND_PORT=5174
MAILPIT_HTTP_PORT=8026
MAILPIT_SMTP_PORT=1026
FAKE_UPSTREAM_PORT=19091
```

The acceptance config starts Mailpit, the fake upstream, the backend and the
frontend. Stop the dev stack if you want to use the default ports
(`8080`/`5173`/`8025`).

Not yet run:

- Full backend `mvn test`
- Full non-auth acceptance suite
- Real Google OAuth login (no credentials configured)
- Full Keycloak brokered Google flow

## 4. Behavior decisions to preserve

- Multiple active confirmation links are intentional; do not reintroduce a
  single-current-link unique index.
- A successful verification consumes the used link and invalidates the rest;
  it is not the “latest link wins” model.
- Duplicate sign-up must be an explicit synchronous error, not a generic
  accepted response.
- Sign-up copy is “Create account”; sign-in heading is “Welcome back”.
- The sign-out control lives in the sidebar drawer.
- Completing an authenticator replacement revokes the current session; the
  replacement tests navigate back to sign-in before re-authenticating.
- The Chakra checkbox uses a hidden input. In Playwright, click the label
  (`I have saved my recovery codes`) rather than calling `.check()` on the
  hidden input.
- `SecretDisplay` exposes the manual key via `aria-label="Manual key"`.

## 5. Environment and resume commands

```powershell
cd C:\Users\pigcr\Documents\Workspace

# Start or stop the normal local stack
cmd /c "start-arg-local.cmd -NoBrowser"
cmd /c "stop-arg-local.cmd"

# Frontend checks
npm --prefix .\ai-runtime-governance-frontend run typecheck
npm --prefix .\ai-runtime-governance-frontend run lint
npm --prefix .\ai-runtime-governance-frontend run build

# Backend build
mvn -f .\ai-runtime-governance-backend\pom.xml -DskipTests package
```

Focused auth acceptance run (isolated ports):

```powershell
cd C:\Users\pigcr\Documents\Workspace\ai-runtime-governance

# Start the acceptance database once
.\.local-tools\pgsql17\bin\postgres.exe -D .\.local-cache\pgdata17 -p 55434

$env:GOVERNANCE_PORT='8081'
$env:FRONTEND_PORT='5174'
$env:MAILPIT_HTTP_PORT='8026'
$env:MAILPIT_SMTP_PORT='1026'
$env:FAKE_UPSTREAM_PORT='19091'

npx playwright test --config tests/playwright.config.ts --project=browser tests/specs/native-auth.spec.ts
npx playwright test --config tests/playwright.config.ts --project=browser tests/specs/native-auth-followup-03.spec.ts tests/specs/native-auth-followup-04.spec.ts tests/specs/native-auth-followup-05.spec.ts
npx playwright test --config tests/playwright.config.ts --project=browser tests/specs/auth-current-ui.spec.ts
npx playwright test --config tests/playwright.a11y.config.ts --project=a11y

# Stop the acceptance database when finished
.\.local-tools\pgsql17\bin\pg_ctl.exe -D .\.local-cache\pgdata17 stop -m fast
```

## 6. Remaining work, ordered

1. **Run the full backend test suite.** The backend was built and exercised by
   the auth acceptance run, but `mvn test` was not run after the unified
   projection and Keycloak migration.
2. **Run the full acceptance suite** on a clean checkout and confirm no
   non-auth regressions. The timeline/guard suites are outside the auth work
   completed here.
3. **Validate Google OAuth** once `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   are supplied. The button is hidden until then.
4. **Review the local Keycloak setup.** The new scripts and realm template are
   in `local-env/keycloak/`; document the first-run sequence if it is not
   already covered by the root start scripts.
5. **Resolve previously known locked-test issues.** The prior handoff records
   the timeline SCN-031/SCN-037 defects and the remaining native-auth API
   disposition. Use reviewed follow-ups, not edits to locked tests.
6. **Production ingestion and event credentials.** Replace the test-only
   ingestion path with an authenticated, account-scoped reporting contract.
7. **Guard catalog and gateway integration.** Unsafe-content and weak-prompt
   rules, approval delivery, guarded provider forwarding, and client
   integration remain.
8. **Tombstone browser coverage** for the timeline.
9. **Docs reconciliation.** Keep `handoff.md` current and record any new
   decisions in the decision log.

## 7. Constraints

- Commit messages use `[TaskType]Goal-oriented title`, for example
  `[SignIn]Add Keycloak sign-in and unified account projections`.
- Push only when asked.
- Do not edit frozen specs, freeze manifests, or locked acceptance tests.
  Correct them through a reviewed follow-up.
- Do not weaken assertions or skip tests to make a suite pass.
- Test-only `/__test/...` routes remain loopback-only, token-protected, and
  disabled outside the test profile.
- Preserve the existing session-deadline, recent-auth, sign-out, enrollment
  and regeneration fixes unless new evidence shows a regression.

## 8. First three actions

1. Start the acceptance database and run the full backend `mvn test`.
2. Run the full acceptance suite on clean ports and triage non-auth failures.
3. Configure real Google OAuth credentials and verify the hidden Google path.
