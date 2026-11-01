# Native-auth UI and copy contract

Version: 0.1. Prepared: 2026-11-01.
Status: **Approved under DR-039 (2026-11-01). Not frozen; no implementation exists.**

Authority: approved intent v0.1–v0.4, scenario catalog v0.3, and the machine
contract. This document does not add behavior; it fixes how approved behavior is
presented and located.

## 1. Routes and context guards

| Route | Allowed context | Behavior |
|---|---|---|
| `/` | any | Read context, then redirect to `/account`, `/setup`, or `/sign-in` |
| `/sign-in` | ANONYMOUS | Password + factor sign-in; link to register/reset |
| `/register` | ANONYMOUS | Email/password registration |
| `/verify` | ANONYMOUS | Reads `token` from the incoming query; explicit "Verify email" action |
| `/forgot-password` | any | Request reset email |
| `/reset-password` | any | Reads `token`; new password + explicit submit |
| `/setup` | SETUP | Setup landing; continues the current enrollment purpose |
| `/setup/enroll` | SETUP | QR/manual key, six-digit code, saved-code acknowledgement |
| `/setup/restart` | SETUP | Password-confirmed restart of a lost first enrollment |
| `/setup/recovery-codes` | SETUP | One-time recovery-code display and acknowledgement |
| `/account` | HUMAN | Own account summary |
| `/account/password` | HUMAN | Change password |
| `/account/authenticator` | HUMAN | Start/complete authenticator replacement |
| `/account/recovery-codes` | HUMAN | Start/complete standalone recovery-code regeneration |
| `/signed-out` | ANONYMOUS | Confirmation that the session ended |

Guard rules:

- HUMAN visiting `/sign-in`, `/register` or `/setup` redirects to `/account`.
- SETUP visiting `/account` redirects to `/setup`.
- ANONYMOUS visiting a HUMAN/SETUP route redirects to `/sign-in`; a protected
  action failure is an explicit `SIGN_IN_REQUIRED`, never a blank screen.
- Invalid/expired context resolves to ANONYMOUS, not a stale protected shell.
- The `token` query is read once into memory for the explicit action. It is not
  copied into local storage, analytics, headings or a redirect URL.

## 2. Copy: global and shared

| Key | Exact text |
|---|---|
| `app.name` | AI Runtime Governance |
| `action.signIn` | Sign in |
| `action.signOut` | Sign out |
| `action.createAccount` | Create account |
| `action.continue` | Continue |
| `action.cancel` | Cancel |
| `action.retry` | Try again |
| `action.close` | Close |
| `status.loading` | Loading… |
| `status.working` | Working… |
| `label.email` | Email |
| `label.password` | Password |
| `label.newPassword` | New password |
| `label.code` | Six-digit code |
| `label.factor` | Authenticator or recovery code |
| `label.reason` | Reason (operator only) |

Never display a raw error body, stack trace, correlation ID alone, or internal
identifier as the primary message. The correlation ID may be shown as secondary
small text, e.g. `Reference: 3f2a…`.

## 3. Copy and locators by page

Locators use accessible role/name. `data-testid` is not the primary contract; a
test may use one only when the accessible name is genuinely ambiguous, and that
exception must be recorded in the SCN map.

### `/sign-in` — H1 `Sign in`

| Element | Locator | Notes |
|---|---|---|
| Email field | `textbox` named `Email` | `autocomplete="username"`, `inputmode="email"` |
| Password field | `textbox` named `Password` (type=password) | `autocomplete="current-password"`; paste/autofill allowed |
| Factor field | `textbox` named `Authenticator or recovery code` | Optional until the server asks; accepts six digits or a recovery code |
| Submit | `button` named `Sign in` | Disabled only while submitting |
| Register link | `link` named `Create account` | To `/register` |
| Reset link | `link` named `Forgot password?` | To `/forgot-password` |
| Error region | `alert` | Generic sign-in failure text |

Copy:
- Generic failure: `Sign-in failed. Check your details and try again.`
- Rate-limited: `Too many attempts. Try again in {seconds} seconds.`
- Unavailable: `The service is temporarily unavailable. Try again shortly.`

### `/register` — H1 `Create account`

| Element | Locator |
|---|---|
| Email field | `textbox` named `Email` |
| New password field | `textbox` named `New password` (type=password) |
| Submit | `button` named `Create account` |
| Sign-in link | `link` named `Sign in` |
| Status | `status` |

Copy:
- Helper: `Use at least 12 characters.`
- Accepted: `If this request is eligible, we'll send an email with the next steps.`
- Field error (email): `Enter a valid email address.`
- Field error (password length): `Password must be 12 to 128 characters.`
- Field error (line breaks): `Password can't contain line breaks.`

### `/verify` — H1 `Verify email`

| Element | Locator |
|---|---|
| Explain | `status` |
| Confirm | `button` named `Verify email` |
| Resend | `button` named `Send a new verification email` |
| Continue | `link` named `Continue to setup` (only after success) |

Copy:
- Before: `Confirm this email address to continue.`
- Success: `Email verified. Continue to set up your authenticator.`
- Unusable: `This link can't be used. Request a new email.`
- Resent: `If this request is eligible, we'll send an email with the next steps.`

### `/forgot-password` — H1 `Reset password`

| Element | Locator |
|---|---|
| Email field | `textbox` named `Email` |
| Submit | `button` named `Send reset email` |
| Status | `status` |

Copy:
- Accepted: `If this request is eligible, we'll send an email with the next steps.`
- The page never states whether the address exists or is verified.

### `/reset-password` — H1 `Choose a new password`

| Element | Locator |
|---|---|
| New password | `textbox` named `New password` |
| Submit | `button` named `Change password` |
| Status | `status` |

Copy:
- Success: `Password changed. Sign in with your new password.`
- Unusable: `This link can't be used. Request a new email.`
- Line breaks: `Password can't contain line breaks.`

### `/setup` and `/setup/enroll` — H1 `Set up your authenticator`

| Element | Locator |
|---|---|
| Step heading | `heading` level 2, e.g. `Scan the code` |
| QR image | `img` named `Authenticator QR code` |
| Manual key | `text` named `Manual key` |
| Code field | `textbox` named `Six-digit code` |
| Saved acknowledgement | `checkbox` named `I have saved my recovery codes` |
| Submit | `button` named `Complete setup` |
| Restart link | `link` named `Restart setup` |
| Secret region | `group` named `Authenticator setup` |
| Error region | `alert` |

Copy:
- Intro: `Scan the QR code or enter the manual key in your authenticator app, then enter the current six-digit code.`
- One-time warning: `This key and your recovery codes are shown once. Save them before continuing.`
- Save warning: `Store your recovery codes offline. Each code can be used once.`
- Missing acknowledgement: `Confirm that you saved your recovery codes.`
- Expired: `Setup expired. Restart setup to get new codes.`
- Already issued: `These setup values were already shown. Start a new attempt.`
- Stale tab: `This setup is no longer current. Start again.`
- Invalid code: `Enter the current six-digit code from your authenticator app.`
- Key unavailable: `Authenticator setup is temporarily unavailable. Try again shortly.`

### `/setup/recovery-codes` — H1 `Recovery codes`

| Element | Locator |
|---|---|
| Warning | `status` |
| Code list | `list` named `Recovery codes`, ten `listitem`s |
| Acknowledgement | `checkbox` named `I have saved my recovery codes` |
| Continue | `button` named `Continue` |

Copy:
- `Each code can be used once. They won't be shown again.`
- `I have saved my recovery codes`

### `/account` — H1 `Account`

| Element | Locator |
|---|---|
| Email row | `term` `Email` / `definition` |
| Verified row | `term` `Email verified` |
| Two-factor row | `term` `Two-factor authentication` |
| Gateway row | `term` `Gateway access` |
| Session row | `term` `Session expires` |
| Change password | `link` named `Change password` |
| Replace authenticator | `link` named `Replace authenticator` |
| New recovery codes | `link` named `Generate new recovery codes` |
| Sign out | `button` named `Sign out` |

Value copy: `Verified` / `Not verified`; `On` / `Not set up`;
`Granted` / `Not granted` / `Revoked`. Never show a seed, code, cookie or
provider key here.

### `/account/password` — H1 `Change password`

| Element | Locator |
|---|---|
| New password | `textbox` named `New password` |
| Submit | `button` named `Change password` |
| Status | `status` |

Copy:
- Step-up prompt appears first (see dialog).
- Success: `Password changed. Other sessions were signed out.`
- If the current session was retained: same message; do not claim all sessions ended.

### `/account/authenticator` — H1 `Replace authenticator`

Reuses the setup section copy and locators, plus:
- Start: `button` named `Start replacement`
- Current factor warning: `Your current authenticator keeps working until you finish this replacement.`
- Completion: `Authenticator replaced. Other sessions were signed out.`
- Cancel: `button` named `Cancel replacement`; copy `Pending replacement cancelled. Your current authenticator still works.`

### `/account/recovery-codes` — H1 `Generate new recovery codes`

- Start: `button` named `Generate new recovery codes`
- Warning: `Generating new codes revokes the previous set after you confirm you saved the new one.`
- Completion: `New recovery codes are active. Other sessions were signed out.`
- Cancel: `Pending codes cancelled. Your previous codes still work.`

### Step-up dialog — H1 `Confirm your identity`

| Element | Locator |
|---|---|
| Dialog | `dialog` named `Confirm your identity` |
| Password | `textbox` named `Password` |
| Factor | `textbox` named `Authenticator or recovery code` |
| Submit | `button` named `Confirm` |
| Cancel | `button` named `Cancel` |

Copy:
- `Enter your password and current authenticator code to continue.`
- `Your confirmation is valid for ten minutes.`
- Expired: `Your confirmation expired. Confirm your identity again.`

### `/signed-out` — H1 `Signed out`

- `Your session has ended.`
- `link` named `Sign in`

## 4. Failure presentation

| Code | Presentation | Primary text |
|---|---|---|
| `REQUEST_INVALID` | Inline field errors + alert | `Check the highlighted fields and try again.` |
| `SIGN_IN_FAILED` | Alert on sign-in/setup | `Sign-in failed. Check your details and try again.` |
| `SIGN_IN_REQUIRED` | Redirect to `/sign-in` | `Sign in to continue.` |
| `SETUP_ACCESS_FAILED` | Alert on `/setup` | `Sign-in failed. Check your details and try again.` |
| `CSRF_REJECTED` | Alert + reload action | `Your session changed. Reload the page and try again.` |
| `FORBIDDEN` | Alert | `You can't perform this action.` |
| `RECENT_AUTH_REQUIRED` | Open step-up dialog | `Confirm your identity to continue.` |
| `NOT_FOUND` | Alert | `We couldn't find that item.` |
| `STALE_OPERATION` | Alert + restart action | `This setup is no longer current. Start again.` |
| `SECRETS_ALREADY_ISSUED` | Alert + restart action | `These setup values were already shown. Start a new attempt.` |
| `LINK_NOT_USABLE` | Alert | `This link can't be used. Request a new email.` |
| `OPERATION_EXPIRED` | Alert + restart action | `This setup expired. Start again.` |
| `RATE_LIMITED` | Alert with countdown | `Too many attempts. Try again in {seconds} seconds.` |
| `TEMPORARILY_UNAVAILABLE` | Alert | `The service is temporarily unavailable. Try again shortly.` |
| `INTERNAL_ERROR` | Alert | `Something went wrong. Try again.` |

The alert region is `role="alert"`; non-error progress uses `role="status"`.
Focus moves to the alert or the first invalid field after a failed submit.

## 5. Loading, disabled and stale-tab behavior

- A submitting control is disabled and labelled `Working…` only while the request
  is in flight. It is not permanently disabled by a failed request.
- Double submit is prevented client-side and remains safe server-side.
- A stale tab that resumes after another tab completed an operation receives
  `STALE_OPERATION` or `SECRETS_ALREADY_ISSUED`; it must not re-show secrets.
- No optimistic success. The page renders the server-confirmed state.
- Background polling, prefetch and static assets never renew inactivity.

## 6. Accessibility

- One `h1` per route; heading order is not skipped.
- Every input has a persistent visible `<label>`; placeholders are not labels.
- Error summary is linked to invalid fields with `aria-describedby`.
- The step-up dialog traps focus, restores focus on close and is dismissible.
- Recovery-code list is announced as a list; each code is selectable text.
- No color-only status. Disabled state is conveyed by `disabled` and text.
- Keyboard-only completion is possible for every journey.

## 7. Secret-display boundary

While a password, QR/manual key, recovery code, link token or session secret is
visible:

- browser tracing, video, HAR and screenshot capture are disabled;
- no analytics, third-party script or console logging receives the value;
- the value is never placed in a URL except the incoming one-time link token;
- leaving the page clears it from the rendered DOM; reload never re-fetches it.

The harness resumes recording only at a declared nonsecret state.
