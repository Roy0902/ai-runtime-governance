# Native-auth gap register

Mutable record outside the frozen plan. Append entries; do not rewrite the plan.
No secrets.

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

## Notes

- The current frozen plan hash is
  `3929c8570bb2ad6b2409f95b75393a43851521f9aff42261e7ca9e696cc699b5`
  (re-frozen under DR-041). The previous hash
  `d03e6470b12957cef0794dd7601784a0f63c476bbdfee68b60a33c3af7d0b7b5` and
  manifest are preserved as historical evidence.
- GAP-NA-001 is a documentation-path defect discovered immediately after freeze,
  before any test lock or feature implementation. It is not an oracle change.
- No gap permits editing the frozen plan or the locked tests.
