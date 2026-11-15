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

Deploy the API changes in this PR before connecting the native app. Google
must already be configured and the public API origin must use HTTPS. The
native handoff uses the existing Redis connection and requires no database
migration. Existing Expo `guallet://` browser flows remain available.

Android generates a private random verifier and sends only its SHA-256
challenge to `/native-auth/google` or `/native-auth/reset`. Google opens an
HTTPS API entry that establishes browser OAuth state and an HttpOnly browser
binding. Only Better Auth's verified provider callback can publish its newly
issued session. Email reset callbacks are bound to the requested account.

The dedicated `guallet-android://` callback contains a flow reference and a
separate, single-use completion code. It never contains a session cookie or
reset token. Completing the handoff also requires the app's private verifier,
sent in an HTTPS POST body. Google exchanges return a secure `Set-Cookie`
header and Android verifies the session through `get-session`. Reset exchanges
submit the new password; the server invokes Better Auth without returning its
reset token to Android. Legacy credential-bearing native callbacks are rejected,
including OAuth states created before this API upgrade.

Redis stores encrypted handoff credentials, hashes of completion codes and
binding information, and atomically consumes valid exchanges across replicas.
Flows expire after ten minutes; completed handoffs expire within five minutes
or the original expiry, whichever comes first. Reopening an email does not
extend this expiry. The private verifier uses the encrypted, backup-excluded
cookie store at an isolated path that is never sent to the auth endpoints, so
legitimate callbacks can survive app process recreation. A competing scheme
handler cannot redeem an intercepted code without that verifier, but can still
prevent delivery; exercise that behavior on a device before release. See the
[server protocol notes](../api/src/features/native-auth/README.md).

## Lifecycle and transfers

Financial ViewModels and CSV drafts are held in a signed-in user scope and
cleared on sign-out or user changes. Financial form values, calculator inputs,
CSV data and mapping/name dictionaries stay in memory, survive configuration
changes through ViewModels, and restart from server/default values after
process death. Explicitly discarded editors clear their draft. No full draft
is written to saved instance state or disk. Small navigation, scroll, wizard
position and applied filter state can be saved; saved transaction filters are
bounded to 8 KB. Large filters restart after process death. CSV rows use opaque
keys so account/category names do not enter saved state indirectly.

Passwords and email codes stay in memory. Cookies and pending browser verifiers
use the encrypted cookie store; disk and Keystore work runs on IO.

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

## Editable API contracts

Deploy the review follow-up API fixes with the native app. Saving-goal responses
include persisted priority. For nullable transaction notes/categories and category
parents, an omitted field keeps the current value and an explicit null clears it.
Goal updates translate target amounts/dates to their persisted fields, and null
clears a goal date or recurring image URL. Date filters support either inclusive
bound independently, consistently across
transaction pages, counts and exports. These fixes require no schema migration.

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
contracts, and verifier-bound browser handoff/replay handling, including
callbacks after process recreation. Robolectric Compose tests exercise signed-in navigation, account
edits, and navigation to CSV document selection. Regression tests also cover
restoration, reset overlays, background polling,
labelled selection controls, cookie dispatchers, prepared CSV requests and
resource/plural/date formatting. See [REVIEW.md](REVIEW.md) for the current
validation results and device checks.

A successful build and JVM tests do not establish live-provider or device
parity. Before release, run the APK on target devices and exercise a real HTTPS
API, a configured Google provider, email-code/reset messages, and import/export
workers. Production signing, store publication, API deployment and retiring the
Expo Android build remain separate release actions.
