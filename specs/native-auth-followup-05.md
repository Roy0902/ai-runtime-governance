# Test Plan: Native Authentication — acceptance setup follow-up 05

## 1. Provenance

| Field | Value |
|---|---|
| Feature | `native-auth-followup-05` |
| Source behavior | Locked native-auth SCN-022/023/031/036/063 |
| Authority | Existing frozen requirements; user confirmed on 2026-11-04 that initial enrollment completion requires password proof |
| Status | Corrected browser test setup only; no product behavior change |

This follow-up preserves every original test. It adds explicit response barriers,
independent sessions where required, the approved password precondition, and
controlled-clock setup for the existing behavior.

## 2. Scope and scenarios

| Source SCN | Corrected setup | Exact oracle |
|---|---|---|
| `SCN-native-auth-022` | Establish two independent human sessions; wait for password-reset success before checking the other session | Reset revokes both sessions; fresh sign-in still requires the new password and active TOTP |
| `SCN-native-auth-023` | Wait for reset completion before checking the verified, incomplete account | No private scope, enrollment, gateway entitlement, or protected access is granted by reset alone |
| `SCN-native-auth-031` | Fix server TOTP time before setup and provide the required password when testing the prior time step | A valid unused `N-1` TOTP plus password completes enrollment |
| `SCN-native-auth-036` | Fix server time, advance to `operation expiry - 1s`, and provide the required password | Valid current TOTP and saved-code acknowledgement complete before expiry |
| `SCN-native-auth-063` | Wait for the replacement completion response before reading account state | The account retains exactly its original private scope after replacement |

These are corrected test-oracle/setup baselines for existing behavior, not
feature-missing red tests. SCN-077 remains excluded because its local key fixture
has no approved provisioning procedure.

## 3. Acceptance mapping

Browser tests in `tests/specs/native-auth-followup-05.spec.ts` are tagged with
the corresponding original SCN IDs. They use the existing loopback test-control
surface only before or after a scenario action, never during one.
