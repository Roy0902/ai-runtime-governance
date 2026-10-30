# Native authentication domain model v0.2

Version: 0.2. Prepared: 2026-10-30. Presented after DR-038.

## 0. Sources & Traceability

- Incorporates [domain model v0.1](./03-domain-model.md) unchanged, except for
  the password-value refinement below.
- [Requirements](../../../REQUIREMENTS.md), AUTH-003/OD-11; scoped
  `REQ-native-auth-002`; [decision DR-038](../05-decision-record.md).
- [Intent v0.4](./04-intent-v0.4.md) records the approved behavioral refinement.
  Remaining operational/contract gates do not authorize new business behavior.

## 1. Ubiquitous Language

- **Permitted password value:** exact text of 12-128 Unicode code points without
  CR or LF. Other valid characters, including spaces, symbols and NUL, remain
  permitted. This refines the password value, not account ownership or factors.
  [REQ-native-auth-002]
- All other v0.1 business terms retain their meanings.

## 2. Aggregates & Entities

- The Account retains its password credential and all prior ownership/access/
  enrollment dimensions. Only the permitted password value is refined.
  [REQ-native-auth-002/007]
- All other roots, entities, states and relationships remain as in v0.1.

## 3. Business Rules (Invariants)

- [REQ-native-auth-002] Reject received CR/LF explicitly without establishing
  a different silently modified credential. Preserve permitted exact text,
  leading/trailing spaces and case; no normalization, substitution or truncation.
- [REQ-native-auth-002] The inclusive length range and absence of composition/
  periodic-change rules remain. Failed validation establishes no human authority.
- All other v0.1 invariants remain; no account, factor or entitlement is broadened.

## 4. Domain Events

All v0.1 conceptual events retain their meanings. Rejected password input does
not produce password-change, authentication or session-establishment success.
[REQ-native-auth-002/006/009]
