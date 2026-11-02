# Native-auth gap register

Mutable record outside the frozen plan. Append entries; do not rewrite the plan.
No secrets.

**2026-11-02 preparation note:** earlier entries preserve their historical
implementation-stage status. Rows saying the frontend, CLI or controls do not
exist are not a current source inventory. Current source exists; runtime results
remain the recorded November 1 partial runs. See GAP-NA-022 onward and the
[current handover](../../../../HANDOVER.md) before choosing the next fix.

| ID | Gap | Impact | Blocking | Status |
|---|---|---|---|---|
| GAP-NA-001 | `specs/native-auth.md` used Phase-1-relative provenance links, but the frozen plan lives at the repository root. The text, SCN IDs, hashes and oracle were correct; 16 Markdown paths resolved one directory too high. | Traceability links were broken; no behavioral oracle was affected | No | **Closed** by DR-041: links corrected, old plan `d03e6470…b7b5` re-frozen as `3929c857…c699b5`; old manifest preserved as `native-auth.freeze.v1.json` |
| GAP-NA-002 | 45 API SCNs had no authored test file | Phase 8 could not lock | Yes | **Closed**: `tests/api/native-auth.spec.ts` authored, red and locked |
| GAP-NA-003 | Test-only harness controls (clock, fault injection, cleanup/inspection, host launcher) are named in tests but not implemented | API and time-boundary tests cannot run green | Yes for Phase 9 | Open |
| GAP-NA-004 | PostgreSQL 18.6 and Mailpit 1.32.0 are not installed | Real persistence/mail acceptance cannot run | Yes for implementation verification | Open |
| GAP-NA-005 | No native-auth feature code exists; only the feature-missing scaffold | Expected at this gate | No | Open |
| GAP-NA-006 | Windows-with-WSL client setup is user-performed and not started | Blocks client integration feasibility, not native auth | Yes for release, no for this increment | External |
| GAP-NA-007 | The browser suite was authored against the approved UI contract; the enroll/recovery-code page composition may need clarification when the UI is implemented | Some locator/step refinements may be needed before lock | No, but review before lock | Open |
| GAP-NA-008 | `arg-admin` command launcher is the feature-missing stub | Host SCNs cannot run green | Yes for Phase 9 | Open |
| GAP-NA-009 | Acceptance tests are locked. Any defect discovered in a locked test requires the post-freeze follow-up path; the tests and plan must not be edited. | Implementation must satisfy the locked oracle or stop and report a gap | Yes | Open by design |
| GAP-NA-010 | Several locked TOTP tests reused the same 30-second step for the completion/authentication that just consumed it. | The strict per-step replay rule and those tests could not both pass. | Yes | **Partially closed**: DR-043 follow-up `native-auth-followup-01` corrects 033/057/089 and is frozen/locked; 3/3 pass. Original 039/041 remain browser-blocked until the frontend exists |
| GAP-NA-011 | PostgreSQL 18.6 backends crash on this host with `0xC0000142`/shared-memory error; seven child processes became unkillable. PostgreSQL 17.6 runs correctly. | The approved baseline pin cannot be used on this machine. | No for product behavior; yes for baseline honesty | **Accepted deviation** under DR-042: 17.6 is the local verification database; 18.6 remains the intended target pending a host/build fix |
| GAP-NA-012 | The host `arg-admin` CLI is still the feature-missing stub | SCNs 064–073 and 077 cannot pass | Yes for API suite | Open |
| GAP-NA-013 | Key-outage fault injection is not wired to the seed/key services | SCN-075 cannot pass | Yes for API suite | Open |
| GAP-NA-014 | Remaining API failures include 016, 019, 037, 061, 078, 079, 080, 085, 086 and 092 | These need implementation/contract debugging | Yes for full acceptance | Open |
| GAP-NA-015 | The frontend feature pages are not implemented | All 49 Browser SCNs remain blocked | Yes | Open |
| GAP-NA-016 | `specs/native-auth-followup-01.md` uses Phase-1-relative provenance links from the repository root. Text, SCN IDs, hashes and oracle are correct; six Markdown paths do not resolve. | Documentation traceability only; no behavioral oracle affected | No | Open; frozen/locked, not edited. Correct in a later reviewed follow-up or accept as documented |
| GAP-NA-017 | SCN-037 advances the controlled clock by 24h, which also expires the `SETUP` session. Completion therefore returns `401` before the operation-expiry check can return `410`. The original and follow-up-02 tests both encode this setup. | The expected `410` is not observable without refreshing the setup session or shortening the operation deadline. Test defect, not a product bug. | Yes for those tests | Open; follow-up-02 is frozen/locked red on this case |
| GAP-NA-018 | SCN-092 requests a reset immediately after registration, so the mail-identity 60-second admission limit returns `429` before the reset is issued. | The test needs a controlled clock advance or a pre-aged account. Test defect, not a product bug. | Yes for that test | Open; follow-up-02 is frozen/locked red on this case |
| GAP-NA-019 | `native-auth-followup-02` is frozen/locked with 1/3 passing (073 passes; 037/092 are the setup defects above). | A third follow-up or retirement is needed; do not edit the locked file. | Yes for documentation | Open |
| GAP-NA-020 | Playwright 1.64.1 `getByRole('term', { name })` matches zero elements even when the `<dt>` has the exact text and `aria-label`; `getByRole('term')` counts all five. | SCN-001/002/003 cannot pass with that locator. Use `getByRole('term').filter({ hasText })` or `getByText` in a follow-up. | Yes for those tests | Open; test-framework limitation |
| GAP-NA-021 | The frontend is implemented and **31/49 Browser SCNs pass**. Remaining: term locators (001/002/003), clock/expiry plus TOTP offset (007/036/054/059), status/flow (015/030), line-break input (094), replacement/regeneration (038/039/041/046/047/048/050) and the API-URL assertion (062). | Remaining frontend/acceptance debugging. | Yes for full acceptance | Open |
| GAP-NA-022 | This checkout lacks the flat JDK/Maven paths expected by `env.ps1`/Playwright, PostgreSQL 17.6/data, Mailpit, restored root/frontend dependencies and the backend jar. Earlier JDK/Maven exist in nested project-local directories. | Historical remote-host results are not a runnable local baseline | Yes for live reproduction | Confirmed by read-only path checks on 2026-11-02; no restore/service start performed |
| GAP-NA-023 | Shared `register` resets all state on every invocation, including the duplicate-signup action in locked 002/003. The async reset reporter only warns on failure and is not an established awaited fixture barrier. | A valid account can be deleted by test setup before the preservation assertion; isolation may race | Yes for trusted acceptance results | Source-confirmed; prepare an unlocked-helper/fixture correction preserving user actions and original oracles; no code changed |
| GAP-NA-024 | `SessionService.rotate` delegates to fresh `create`, and the settings path supplies a new recent-auth time. Current 058 copies one cookie instead of establishing an independent second session and does not check all preserved timestamps. | Original absolute lifetime/recent confirmation may be extended; existing pass is insufficient evidence of the invariant | Yes for full verification | Source-backed discrepancy; runtime regression/fix pending; proposed follow-up 058 must check exact preserved metadata and independent sessions |
| GAP-NA-025 | Follow-up-02 case 092 is sequential, not a predecessor-rehash/reset race. Conditional password update does not report its affected-row outcome to sign-in before session creation. | The required concurrent-reset invariant is not proven and stale authority needs deterministic reproduction | Yes for 092 verification | Prepare reviewed predecessor fixture/barrier, real reset and fresh-factor checks; do not use mail-limit relaxation or arbitrary `Promise.all` timing as race proof |
| GAP-NA-026 | Locked 094 sets a native password value after which the browser has removed CR/LF; locked 062 expects HTML from a JSON API. Initial expiry cases can hit context expiry first, and 054 performs potentially renewing navigation before asserting nonrenewal. | Some recorded failures have invalid preconditions/observables rather than proven product defects | Yes for affected cases | Proposed follow-up scope is in the handover; existing plans/tests remain untouched; role-name correction applies directly to 001, not a blanket 001/002/003 fix |
| GAP-NA-027 | Test-profile mail-identity settings are 100/minute and 1,000/hour while the approved/default rules are 1/minute and 5/hour. | Green setup under relaxed limits is not default-policy verification | Yes for approved rate-policy evidence | Prepare policy-correct setup pacing and explicit profile isolation/disposition; no configuration changed |
| GAP-NA-028 | Playwright started backend aggregate health before its Mailpit dependency, causing health 503/startup timeout before scenarios. Java/tool paths also assumed the other checkout layout. | Local acceptance did not start | Yes until repaired | **Resolved in focused Nov 2 runs:** mail starts first; direct health changed 503 to 200 when mail became ready; configured runs now start; nested tool layout recognized; per-run random control token and no backend reuse |
| GAP-NA-029 | Settings rotation extended original lifetime/recent auth; recent confirmation excluded exact ten-minute equality. | Violated approved session boundaries | Yes until repaired | **Resolved for covered paths:** 7 JUnit checks and 3 real-database supporting checks pass for password/replacement/regeneration and independent-session revocation; latest-state commit races remain separate |
| GAP-NA-030 | Bodyless frontend sign-out omitted JSON content type (415), and settings/replacement pages lacked shared sign-out access. | Locked 038/059 failed on actual product behavior | Yes until repaired | **Resolved in focused Nov 2 runs:** 2 supporting client checks; locked 038/056/058/059 all pass; shared navigation handles errors explicitly |
| GAP-NA-031 | Regeneration completion status disappeared after reload despite real nonsecret operation metadata. | Locked 048 failed | Yes until repaired | **Resolved in focused Nov 2 runs:** account-namespaced nonsecret operation ID plus real status lookup; locked 046/047/048/050 pass; no raw code/seed/token persisted in browser storage |
| GAP-NA-032 | The per-test reset was an asynchronous reporter callback that only warned on failure, so it was not an awaited fixture barrier. | Original-suite isolation could race with the test body. | Yes for trusted whole-suite results | **Resolved:** replaced with an awaited `test.beforeEach` in `tests/support/reset-hook.ts`, imported by both unlocked helpers and cache-busted per test file; failures are explicit. Original and follow-up suites rerun. |
| GAP-NA-033 | The `host()` helper defaulted `GOVERNANCE_TEST_FAULTS_FILE`/`GOVERNANCE_DISPATCH_FILE` to `.local-cache`, while the backend used `local-env/runtime/acceptance`. | 065/071/072 failed even though the product was correct: the CLI and web process read different file-backed state. | Yes for the host/dispatch checks | **Resolved:** the Playwright config exports the same paths to the test process and backend; 065/071/072 now pass. |
| GAP-NA-034 | The frontend webServer assumed `.local-tools/node-v24.22.0-win-x64/node.exe`, absent on this checkout. | Playwright could not start the frontend, so no browser/API acceptance ran. | Yes for live runs | **Resolved:** `tests/playwright.config.ts` falls back to `process.execPath` when the flat local Node is absent. |
| GAP-NA-035 | Current whole-suite disposition after the reset fix. | Needed to replace the historical 31/49 and 44/48 counts. | No | **Recorded 2026-11-02:** browser 48/55 (original 42/49 + F03 6/6); API 52/57 (original 41/45 + F01 3/3 + F02 2/3 + F03 6/6); supporting 4/4; native checks 10/10 and 24/24. Remaining failures are known test defects/superseded cases, not product defects. |

**2026-11-02 reset/suite update:** GAP-NA-019 is now 2/3 (073 and 092 pass;
037 remains). GAP-NA-021's original browser suite is 42/49; the seven remaining
failures are the known framework/setup cases corrected by F03. GAP-NA-023 is
resolved for the original suites by the awaited per-test reset; the
duplicate-signup helper no longer resets. GAP-NA-014: 065/071/072 are resolved by
the harness path alignment; 037/057/073/092 remain known test defects.
GAP-NA-027 (default mail policy) remains open.

## Notes

- The current frozen plan hash is
  `3929c8570bb2ad6b2409f95b75393a43851521f9aff42261e7ca9e696cc699b5`
  (re-frozen under DR-041). The previous hash
  `d03e6470b12957cef0794dd7601784a0f63c476bbdfee68b60a33c3af7d0b7b5` and
  manifest are preserved as historical evidence.
- GAP-NA-001 is a documentation-path defect discovered immediately after freeze,
  before any test lock or feature implementation. It is not an oracle change.
- No gap permits editing the frozen plan or the locked tests.
