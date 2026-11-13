# Native Android migration

This project ports the committed Expo mobile routes from develop (`107f09a4`)
into Kotlin and Compose. Expo remains available for comparison and for iOS.
No React Native runtime, JavaScript engine, WebView UI, or Expo library is
embedded in the Android application.

## Screen and flow map

| Expo area          | Native destination and behaviour                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Welcome and login  | Welcome, password login, registration, email-code login, resend cooldown, Google browser login, password reset by code or link                                                     |
| Dashboard          | Per-currency wealth, complete 30-day cashflow, recent transactions, unread notifications, savings goal progress                                                                    |
| Accounts           | Search and type groups, per-currency totals, manual creation/editing, optional balance transactions, deletion confirmation                                                         |
| Account details    | Current balance, origin, current-month transactions, 90-day balance chart and accessible daily values                                                                              |
| Transactions       | Pagination, account/category/date filters, search within the current page, editable transaction details, creation and deletion                                                     |
| Budgets            | Month selection, per-currency summaries, remaining amounts, category selection, details and monthly transactions, create/edit/delete                                               |
| Categories         | Search, default category seeding, create/edit/delete, colours, the shared selectable icon contract, two-level hierarchy                                                            |
| Savings goals      | Progress/status, account linking, target amount/date and priority, details and create/edit/delete                                                                                  |
| Recurring payments | Search and type filters, upcoming occurrences over 30 days, all payments, monthly currency-separated estimates, start dates/cadence, details and create/edit/delete                |
| Notifications      | Unread filter, mark read/unread, mark all read, delete, allowlisted internal action destinations                                                                                   |
| Settings           | Profile name/email, default/preferred currencies, date display preference, feature links, sign-out confirmation                                                                    |
| CSV import         | Android document picker, 5 MB limit, quoted/multiline CSV parsing, column mapping, account/category mappings, preview with invalid-row counts, submission and job progress/results |
| Data export        | Account/date/format selection and queued-request confirmation                                                                                                                      |
| Mortgage tool      | Base and overpayment scenarios, one-off/monthly extras, repayment totals, term/interest comparison, monthly schedule and yearly breakdown                                          |
| Loan tool          | Two-loan comparison, fees, rounded repayment schedules and total costs                                                                                                             |
| Stamp duty tool    | Standard, first-time and additional-property scenarios, tax due and band breakdown, matching the source calculator's April 2025 rules                                              |

Related steps can share one native screen with local navigation state. There
is no requirement to preserve Expo's filesystem routes as Android activities.
The five signed-in tabs remain Home, Accounts, Transactions, Budgets, and
Settings. Other areas are reachable from Settings or contextual links.

## Business rules and API compatibility

Ktor Resources define existing API paths; all financial requests reuse the
Better Auth cookie session. The migration does not introduce new financial
backend resources or change their response contracts. Decimal fields accept
both JSON strings (TypeORM decimals) and numbers. Outgoing decimals use JSON
numeric literals without conversion through `Double`.

The native `Money` and `Currency` types were explicitly approved as the Android
replacement for the TypeScript `@guallet/money` package. Balances, totals, input
precision and formatting go through that native layer. Currency precision and
narrow symbols are generated from the shared currency dataset. Calculators use
`BigDecimal` and the source calculators' rounding choices. Locale number layout
uses the platform formatter; representative locale fixtures are covered by JVM
tests. The generated currency dataset retains the shared dataset's version; it
does not claim newer currency data than the existing applications.

Totals are grouped by currency. No exchange-rate conversion is inferred. A
new or edited savings goal must link accounts of one currency, because the
API's target amount has no currency or conversion contract. Existing mixed
currency goals remain visible, with an explanation instead of a fabricated
converted monetary total.

Transaction form dates are explicit ISO calendar dates. Displayed dates follow
the saved preference. Unknown category icons fall back to `IconQuestionMark`;
the selectable identifiers come from `packages/guallet-theme`.

## Authentication deployment

Deploy the API trusted-origin addition before using the native app against
that environment. It adds `guallet-android://` alongside the existing Expo
scheme, without disabling CSRF/origin checks or weakening secure cookies.
Google must already be configured in that API environment.

Google sign-in calls Better Auth's social endpoint and uses the installed
`@better-auth/expo` server plugin's authorization proxy to move OAuth state into
the browser. This is an HTTP protocol bridge; the app contains no Expo runtime.
The app imports only Better Auth session cookies from a matching native callback
and validates the result through `get-session`. A short-lived encrypted flow
nonce is isolated under a cookie path that is never sent to the auth endpoints;
it survives process recreation and is consumed once. Unrelated, duplicate,
expired, and replayed callbacks cannot replace a session.

The Android manifest accepts only `guallet-android://login/...` links. Google
returns to `/callback`; password reset links return to `/reset-password`. Expo
keeps its own scheme. API endpoints must be HTTPS with a certificate trusted by
the device, because the backend issues secure cookies.

The custom scheme still carries credentials in the existing callback protocol.
F01 in [REVIEW.md](REVIEW.md) remains open pending a verifier-bound server handoff
or verified HTTPS App Links; the nonce alone does not prevent interception.

## Lifecycle and transfers

Financial ViewModels and CSV drafts are held in a signed-in user scope and
cleared on sign-out or user changes. There is no persistent financial cache.
Passwords, email codes and reset tokens stay in memory. Some financial editor
values and import mapping dictionaries still use Android saved instance state;
F09 in [REVIEW.md](REVIEW.md) tracks the pending storage-policy decision and
Binder-size problem. Cookies and the pending OAuth nonce use the encrypted,
backup-excluded cookie store; cookie disk/Keystore work is dispatched to IO.

CSV reads/parsing, column validation, preview preparation, normalization and
request encoding run off the main thread. Request JSON is encoded once and
checked against the size limit. Import submission requires the
mapping/preview confirmation. Invalid rows are counted before submission and
skipped; no valid rows means submission is disabled. Requests larger than the
API's 10 MB body limit are rejected locally. Job polling ends when the job
finishes/fails, the screen lifecycle stops, the screen is left, the session
ends, or ten minutes pass. Polling resumes when the screen becomes visible. A
polling failure offers retry and does not imply the server job was cancelled.
The import job itself continues after leaving the screen. Export acceptance
means the API queued a job, not that a download has completed.

## Verification and rollout

```sh
./gradlew :app:assembleDebug :app:testDebugUnitTest :app:lintDebug
node scripts/generate-currencies.cjs
node scripts/generate-icons.cjs
```

Generation runs from the monorepo checkout and uses Node only as a development
tool. Icon generation needs the repository's pinned Tabler package installed.
The APK builds independently of Node/pnpm after the generated files are checked
in. Tabler's MIT licence is included in `TABLER-LICENSE`.

JVM tests cover existing authentication/accounts contracts plus native money,
calculator parity fixtures, CSV edge cases, recurrence month-end behaviour,
category hierarchy, notification route validation, planning/transfer/settings
contracts, and OAuth state/replay handling, including callbacks after process
recreation. Robolectric Compose tests exercise signed-in navigation, account
edits, and navigation to CSV document selection. Regression tests also cover
restoration, reset overlays, background polling,
labelled selection controls, cookie dispatchers, prepared CSV requests and
resource/plural/date formatting. See [REVIEW.md](REVIEW.md) for the current
validation results and remaining findings.

A successful build and JVM tests do not establish live-provider or device
parity. Before release, run the APK on target devices and exercise a real HTTPS
API, a configured Google provider, email-code/reset messages, and import/export
workers. Production signing, store publication, API deployment and retiring the
Expo Android build remain separate release actions.
