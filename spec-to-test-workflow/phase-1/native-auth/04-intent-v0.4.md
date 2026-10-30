# Native authentication intent v0.4: proposed browser line-break compatibility

Version: 0.4. Prepared: 2026-10-30.
Approval status is recorded externally in the [decision record](../05-decision-record.md).
This proposal is NOT approved merely because it was prepared.

## 1. Composition and reason

If explicitly approved, this version incorporates immutable approved v0.1/v0.2/
v0.3 and narrows only password input containing CR (U+000D) or LF (U+000A).
The approved v0.3 raw SHA-256 is
`C78BDBA0B2839F9D907159D4C60391B85EBFC119ADC5CF531629F9B4662A7F67`;
its two incorporated artifacts retain their own recorded fingerprints.

[The isolated Chromium observation](./evidence/password-input-feasibility.json)
found native password inputs remove CR/LF and textareas normalize CR/CRLF.
This is platform feasibility evidence, not an expectation inferred from
application output or an acceptance pass. No real credentials were used.

## 2. Proposed compatibility refinement

- Keep the inclusive 12-128 Unicode-code-point length range.
- Disallow CR and LF in password input solely because ordinary browser password
  controls cannot preserve them. This is not a claimed strength improvement.
- Keep other valid Unicode, spaces, symbols and controls, including NUL, allowed.
  Add no encoding-choice, composition, case or periodic-change requirement.
- The application must not silently trim, normalize, case-fold, truncate,
  substitute or strip characters from otherwise permitted input.
- Reject raw CR/LF when received by the application, including direct service
  submissions. When raw pasted text is available before browser sanitization,
  reject that paste explicitly rather than inserting a modified value.
- New/change/reset input validation explains the line-break constraint. Sign-in/
  reauthentication must still avoid account-status disclosure; exact wire/copy
  mappings belong to the shared contract review.
- Native controls may sanitize unsupported external/autofill text before the
  application can observe the original value. Do not promise recovery of that
  unobservable original or claim all managers support every unusual character.
  Ordinary passphrase paste/autofill remains supported.

## 3. Limits and version integrity

All mandatory MFA, verifier, session, recovery, rate, evidence and ownership
rules remain unchanged. The alternative is to retain literal CR/LF support and
design an explicit exact-entry mechanism with honest password-manager limits;
that alternative does not approve this proposed v0.4.

Neither alternative permits a hidden encoding workaround or pretending ordinary
native controls preserve line breaks. After approval, preserve every approved
intent artifact; later material changes require another version/review.
