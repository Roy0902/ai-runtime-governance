# Native-auth host-operator command contract

Version: 0.1. Prepared: 2026-11-01.
Status: **Approved under DR-039 (2026-11-01). Not frozen; no implementation exists.**

Authority: DR-022 and DR-032 plus REQ-native-auth-004/007/008/010. This is a
local host-OS procedure, not an HTTP API and not a public admin surface.

## 1. Execution boundary

- The command runs only on the deployment host, as a local OS user that belongs
  to the configured operator group.
- It opens the database directly with deployment credentials. It does not listen
  on a network port and has no remote mode.
- Possession of an operator grant does not grant trace, prompt, recovery-code,
  TOTP-seed or provider-key read access.
- Every mutating command requires a reason and an exact-account confirmation.
  There is no `--yes`, environment-variable or config-file bypass.
- The command never creates a human session, prints a secret, or returns a
  password/recovery verifier.

## 2. Command surface

Executable name (proposed): `arg-admin`.

```text
arg-admin account disable   --account <email|uuid> --reason <text> --confirm <email>
arg-admin account enable    --account <email|uuid> --reason <text> --confirm <email>
arg-admin account recover-mfa --account <email|uuid> --reason <text> --confirm <email>
arg-admin gateway grant     --account <email|uuid> --reason <text> --confirm <email>
arg-admin gateway revoke    --account <email|uuid> --reason <text> --confirm <email>
arg-admin security cancel   --account <email|uuid> --operation <uuid> --reason <text> --confirm <email>
arg-admin totp-key provision --key-id <id> --from-file <path>
arg-admin totp-key status
arg-admin totp-key retire    --key-id <id> --reason <text>
```

Rules:

- `--account` accepts a normalized email or UUID. If both match different
  accounts, the command fails with a state conflict.
- `--confirm` must equal the target account's normalized email exactly. It is a
  deliberate human check, not a secret.
- `--reason` is 8–200 Unicode code points, required on every mutating command.
  It must not contain a password, code, token, cookie or key.
- `--from-file` reads exactly 32 raw bytes. The file must not be group/world
  readable. The value is never echoed.
- No command accepts a caller-supplied actor identity; the operator identity is
  the authenticated local OS user plus host name.

## 3. Behavior by command

| Command | Effect | Must not do |
|---|---|---|
| `account disable` | Revoke sessions, pending setup/replacement/generation authority and gateway entitlement; mark account disabled; retain scope and data | Delete data, change email verification, create a session |
| `account enable` | Clear disabled standing only | Revive old sessions, tokens, grants, pending operations or consumed codes |
| `account recover-mfa` | Revoke sessions/factors/pending authority/grant; mark verified account recovery-required; hand off to password + setup-only enrollment | Disable the account, change ownership/scope, create a session, reveal a seed |
| `gateway grant` | Grant budget eligibility only when account is enabled, verified and enrolled | Grant to an incomplete account, imply trace/prompt read access |
| `gateway revoke` | Revoke future admission and undispatched work; already-dispatched work keeps its committed order | Retract cost already dispatched or rewrite history |
| `security cancel` | Cancel one current pending operation for the account | Roll back a completed operation or restore a consumed code |
| `totp-key provision` | Validate a 32-byte key and store it under the given key id, initially inactive | Print or log the key material |
| `totp-key status` | Report key ids, active/retained state and health | Return key material |
| `totp-key retire` | Retire a non-active key after matched restore is confirmed | Retire the only key protecting active seeds |

Recovery handoff: after `account recover-mfa`, the human establishes setup-only
access through `establishSetupAccess` with the account password, then completes
a new enrollment. The CLI itself never authenticates the human.

Disable/re-enable: a disabled account cannot sign in, complete setup or use the
gateway. Re-enable restores only the ability to authenticate again.

## 4. Authority and confirmation

Checks, in order:

1. The process runs on the deployment host and the OS user is in the operator
   group. Otherwise exit 6 with `AUTHORITY_DENIED`. For the demo, the configured
   local OS user is verified directly; real OS group ACLs are deployment-specific
   and are documented as such (DR-040).
2. `--reason` and `--confirm` are present and valid. Otherwise exit 2.
3. The target account resolves to exactly one account. Otherwise exit 3 or 4.
4. The requested transition is currently applicable. Otherwise exit 4.
5. The state change and its audit record commit in one database transaction.
6. A database/transaction failure exits 5 and changes nothing.

The command never prompts interactively in acceptance; an interactive wrapper may
collect the same arguments but cannot weaken the checks.

## 5. Audit record

Each successful or safe-repeat command writes one append-only record:

| Field | Content |
|---|---|
| `auditId` | UUID |
| `occurredAt` | Server UTC timestamp |
| `operatorId` | Local OS user + host name |
| `action` | Command action, e.g. `ACCOUNT_DISABLE` |
| `targetAccountId` | Account UUID (not email) |
| `reason` | Operator-supplied text, length-bounded |
| `outcome` | `CHANGED`, `NO_CHANGE` or `REFUSED_STATE` |
| `changedFields` | Non-secret field names only, e.g. `disabled`, `gatewayEntitlement` |
| `correlationId` | UUID for support correlation |

The audit record contains no password, verifier, seed, recovery code, token,
cookie or key material. A refused authority check is recorded in the host
security log without account data. The audit row and the state change are one
transaction; there is no "audit later" path.

## 6. Output and exit codes

Success (stdout, JSON, one line):

```json
{"ok":true,"action":"GATEWAY_GRANT","accountId":"...","changed":true,"auditId":"..."}
```

Failure (stderr, JSON, one line):

```json
{"ok":false,"code":"STATE_CONFLICT","message":"Account is not enrolled."}
```

| Exit | Meaning |
|---|---|
| 0 | Success, including an idempotent no-op |
| 2 | Usage/validation error |
| 3 | Account or operation not found |
| 4 | Current-state conflict |
| 5 | Database/dependency unavailable |
| 6 | Authority denied |

Exit 0 with `"changed":false` is a safe repeat, never a claim that a new grant,
session or token was created.

## 7. Concurrency and failure

- Each command uses one short transaction with a current-state check (compare and
  set). Concurrent disable/enable/grant/revoke cannot lose an update.
- Gateway grant/revoke and dispatch use the committed order: a revocation that
  commits before dispatch blocks it; a dispatch that commits first is not
  retroactively unauthorized, but its result is still protected by the current
  session check.
- A crash before commit leaves the prior state and no audit row. A crash after
  commit leaves both the change and its audit row.
- Safe repeats are allowed and audited as `NO_CHANGE`; they do not extend a
  session, revive a token or re-send mail.

## 8. Key lifecycle commands

- `totp-key provision` stores a new inactive key. Activation requires an explicit
  separate step during a reviewed maintenance window; it is not implicit.
- Rotation = provision new key, re-encrypt the same seeds with fresh nonces,
  verify matched restore, then retire the old key while retaining a backup.
- `totp-key status` is the only read command and returns metadata only.
- A missing/unavailable key degrades only key-dependent operations. It does not
  end otherwise-valid sessions, delete data, fall back to plaintext or disable
  independent recovery login.

## 9. Still open

1. Final executable name and packaging.
2. Whether `security cancel` belongs in the first increment.
3. Exact key provisioning/activation/retirement sequence and backup proof.
4. Operator-group provisioning and host audit-log location.
5. Whether an interactive confirmation wrapper is required in addition to
   `--confirm`.
