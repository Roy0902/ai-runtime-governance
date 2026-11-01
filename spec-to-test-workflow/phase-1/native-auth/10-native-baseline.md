# Native-auth native baseline and harness

Version: 0.1. Prepared: 2026-11-01.
Status: **Toolchain partly measured; application build, PostgreSQL and mail capture
are not installed. Pins are approved under DR-039; commands become real only when
the scaffold exists and the command has actually been run.**

## 1. Verified toolchain

| Tool | Version | Location | Evidence |
|---|---|---|---|
| Eclipse Temurin JDK | 25.0.5+8 (LTS) | `.local-tools/jdk-25.0.5+8` | Archive SHA-256 verified; `java -version` run |
| Apache Maven | 3.9.16 | `.local-tools/apache-maven-3.9.16` | Archive SHA-512 verified; `mvn -version` run on Java 25 |
| Node.js | 24.22.0 | host | `node --version` |
| npm | 11.19.1 | host | `npm --version` |
| git | 2.56.0.windows.2 | host | `git --version` |
| `@playwright/test` | 1.64.1 | `local-env/measurements` | lockfile restore |
| Chromium | Chrome for Testing 156.0.8078.4, build 1248 | `.local-tools/playwright` | Headless launch + page title smoke |
| Chromium headless shell | 156.0.8078.4, build 1248 | `.local-tools/playwright` | Installed |
| Redocly CLI | 2.72.1 | `local-env/contract-tools` | Contract lint passes |
| openapi-typescript | 7.13.0 | `local-env/contract-tools` | Generates 57,292 bytes |
| TypeScript | 5.9.3 | `local-env/contract-tools` | Compatible with openapi-typescript 7.x |

Machine-readable evidence:
[toolchain-baseline.json](../../../local-env/evidence/toolchain-baseline.json).
Reproduction: `. .\local-env\env.ps1`.

Environment difference to record honestly: the previous snapshot used Node
22.19.0/npm 10.9.3; this machine has Node 24.22.0/npm 11.19.1. The acceptance
runner must be pinned and re-verified against the scaffold before freeze.

## 2. Proposed application toolchain (not installed)

| Layer | Proposed version | Note |
|---|---|---|
| Spring Boot | 4.1.2 | Metadata resolved earlier; pin after the scaffold builds |
| Spring MVC | virtual threads enabled | Per technical baseline |
| LangChain4j | pin at scaffold | Not needed by native auth itself |
| Flyway | pin at scaffold | Schema migration owner |
| PostgreSQL | 18.6 | Project-local binaries under `.local-tools`; real server process; isolate per run (DR-040) |
| Mail capture | Mailpit 1.32.0 (Windows AMD64) | SMTP + HTTP API |
| Frontend | React 19.3.1, Vite 8.3.5, plugin 6.1.2 | Resolved metadata; pin at scaffold |
| TypeScript | 5.9.3 | Shared with contract tooling |
| Maven Wrapper | 3.9.16 | Generate in the application module |
| Playwright | 1.64.1 | Same version as the feasibility probe |

Do not treat a metadata response as a successful build. Each row is confirmed
only when the scaffold builds and the command is recorded.

## 3. Commands (proposed)

```powershell
# Project-local environment
. .\local-env\env.ps1

# Contract validation and generated types
npm run ai:contract

# Backend (after scaffold)
.\mvnw.cmd -q -DskipTests package
.\mvnw.cmd -q verify

# Frontend (after scaffold)
npm --prefix frontend ci
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run build

# Acceptance
npx playwright test --config tests\playwright.config.ts --project=chromium

# Workflow guard
npm run ai:verify
```

No command is claimed to pass until it has actually been run on the scaffold.

## 4. Harness shape

| Concern | Selected mechanism | Status |
|---|---|---|
| Database | One PostgreSQL cluster, one schema/database per worker, Flyway-migrated from empty | Proposed |
| Mail | Mailpit; tests read messages through its HTTP API and assert one-time link/token | Proposed |
| Server clock | Test-profile-only time source, advanced through a loopback-only control channel with a per-run random token | Proposed, requires approval |
| Browser | Real Chromium against the real HTTP server; no route mocking of auth responses | Selected by workflow |
| Host CLI | Invoke the built application command against the same test database, with a temporary operator group/identity | Proposed |
| Concurrency | Two real transactions with a database barrier/advisory lock; no `sleep` race | Proposed |
| Failure injection | Test-profile fault switch for DB commit, SMTP, key availability and hash admission | Proposed |
| Secrets | Generated per case; kept only in test memory and Mailpit; never committed | Selected |
| Evidence | Scenario ID, correlation ID, state/outcome, counts, timings; no secret values | Selected |

The time-control channel is the highest-risk harness decision: it must not exist
in production profiles and must be bound to loopback with a per-run token. If that
is not acceptable, the alternative is to run every time-boundary case at API level
with an injected clock and keep only coarser browser coverage. That choice belongs
in the Phase 6 review, not in implementation.

## 5. Quality gates

| Gate | Command | Required result |
|---|---|---|
| Contract valid | `npm run ai:contract` | Redocly valid, types generated |
| Backend compile | `mvnw -q -DskipTests package` | Build succeeds |
| Backend tests | `mvnw -q verify` | Supporting tests pass |
| Frontend types | `tsc --noEmit` | No errors |
| Frontend lint | project ESLint config | No new violations |
| Frontend build | `vite build` | Succeeds |
| Browser acceptance | Playwright `tests/specs` | Every Browser SCN green |
| API acceptance | Playwright `tests/api` | Every API SCN green |
| Workflow guard | `npm run ai:verify` | Frozen plan and locked tests unchanged |

Baseline failures are captured before edits; no configuration is weakened to get
green. Supporting tests never replace a locked acceptance SCN.

## 6. Test-level split

The split is in [09-scn-scope-map.md](./09-scn-scope-map.md): 49 Browser / 45 API.
Every SCN has exactly one locked acceptance tag. Browser cases must still assert
their persisted result through the UI; API cases exercise the real service, worker
or host CLI boundary.

## 7. Evidence and secret safety

- Playwright tracing, video, HAR and screenshots are disabled by default and
  enabled only around declared nonsecret sections.
- Before a password, QR/manual key, recovery code, link token or session cookie
  is visible, recording stops. It resumes at a known nonsecret state.
- Exported evidence includes no raw password, TOTP seed, QR payload, recovery
  code, tokenized link, cookie, provider key or stored verifier.
- The evidence inventory covers browser artifacts, test stdout/stderr/reports,
  backend/access/audit logs and metric labels.
- A missing artifact is not a pass; each expected artifact is checked for the
  declared nonsecret metadata.

## 8. Resolved and still open

Resolved by DR-040: time-control mechanism approved; PostgreSQL 18.6 uses
project-local binaries; the loopback cookie is tried on HTTP with a local HTTPS
fallback; mail capacity states and the audit field shape are fixed.

Still open:

1. Spring Boot/Flyway/frontend transitive pins after the scaffold builds.
2. Maven Wrapper generation and CI wiring.
3. Whether the host CLI is a separate module or a Spring Boot command.
