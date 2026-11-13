# Android code review

Reviewed on 13 November 2026. Audited application commit:
`005e940b171bfb67df5b617001fd248c2f3462fd`, on PR #415.

**Disposition: request changes before treating this app as release-ready.**
The Kotlin/Compose foundation is sound, but successful compilation, lint and
the existing 40 tests do not cover several security, state-restoration and
accessibility failures found below. Findings remain open; this is a review of
the committed implementation.

## Scope and evidence

The review covered the 60 main Kotlin files, feature navigation and forms,
network resources and models, cookie storage, manifest and backup rules,
Gradle configuration, dependency catalog, CI, generators, and tests. Generated
currency/icon assets were assessed through their generators, contracts and
packaged resources. Relevant Expo flows and API handlers were checked when
assessing integration behaviour. Code references below describe the audited
commit, so line numbers may change during remediation.

- The migration is committed and pushed to the existing PR.
- The baseline APK build, all 40 committed tests, and Android lint passed
  together. Lint reported zero errors and 22 dependency-version advisories.
- Additional temporary Robolectric/Compose probes exercised restoration,
  selection-control semantics, cookie execution context and import-state size.
  Eight focused probes ran: seven failed their desired-behaviour assertions,
  and one collected timing. Reproduction source and observations are in
  [REVIEW_PROBES.md](REVIEW_PROBES.md).
- A 2,228,925-byte CSV fixture contained 20,000 rows. One validation pass took
  1,832 ms on this builder. This is diagnostic timing, not a device benchmark.
- A representative large mapping serialised to 2,228,989 bytes before Bundle
  overhead. This alone exceeds Android's shared 1 MB Binder buffer.
- The debug APK passed `zipalign -c -P 16 4`; every packaged native library's
  load segments had `0x4000` alignment. Execution on a 16 KB device remains
  unverified.
- No emulator or device was attached. Hardware Keystore behaviour, actual
  deep-link interception, real Google/email flows, workers, TalkBack output,
  rotation on a device, and release performance were not exercised.

Android guidance is used as a comparison, not as a claim that every
recommendation is mandatory. Koin, a single application module, and Ktor are
compatible with the recommended architecture; replacing them with Hilt,
multiple modules or Retrofit is not required.

## Findings

There are 17 findings: three P1, eleven P2 and three P3.

P1 findings should be resolved before production use. P2 findings affect
correctness, reliability or accessibility. P3 findings are lower-priority
behaviour or maintainability improvements.

### F01 · P1 · Session credentials travel through an interceptable callback

Locations: [AndroidManifest.xml:24](app/src/main/AndroidManifest.xml#L24),
[BrowserAuthRepository.kt:117](app/src/main/java/io/guallet/android/features/auth/data/BrowserAuthRepository.kt#L117).

Google's callback carries Better Auth session cookies in the URL query of
`guallet-android://login/callback`. The installed Expo server plugin explicitly
copies `Set-Cookie` into that query. A second installed app can register the
same scheme. If Android routes the callback to it, it receives the reusable
session credential and can use that credential directly against the API.
The receiving app's nonce check prevents unsolicited session replacement;
it does not protect a cookie intercepted before this app receives it. Reset
links have the related risk of exposing a password-reset bearer token.

The dedicated scheme was explicitly approved and implemented as requested.
The risk concerns putting credentials into its callback. Remediation needs an
approved protocol choice: verified HTTPS App Links with a supported server
handoff, or a one-time exchange
bound to a verifier held by the initiating app. Merely adding `autoVerify` to
a custom scheme does not verify ownership of that scheme. Test competing
handlers as well as legitimate cold-start completion.

Android documents the interception risk and verified web-link mitigation in
[unsafe use of deep links](https://developer.android.com/privacy-and-security/risks/unsafe-use-of-deeplinks).

### F02 · P1 · Recreating an account editor discards unsaved changes

Locations: [AccountsScreens.kt:154](app/src/main/java/io/guallet/android/features/accounts/presentation/AccountsScreens.kt#L154),
[AccountsViewModel.kt:61](app/src/main/java/io/guallet/android/features/accounts/presentation/AccountsViewModel.kt#L61).

On recreation, `LaunchedEffect(id)` reloads the account. `loadDetails()` sets
`selected = null`, which removes `AccountEditor` from the composition. Its
restored `rememberSaveable` values are then lost; the response recreates the
editor using server values. A probe changed the name to `Unsaved draft`,
restored state with a delayed repository, and observed `Original name`.

Several transaction/planning editors similarly remove their editable subtree
while refreshing. Audit those paths too. In addition, planning editors build
their dirty-check baseline with `remember` from editable values. A second
probe restored a new recurring-payment draft, pressed Cancel, and observed
immediate navigation out instead of discard confirmation: the edited values
had become the new clean baseline.

Keep the draft and original baseline in a screen state holder, initialise
once per entity, and render refresh/loading status without discarding that
holder. Restore only appropriate small state; continue keeping passwords and
codes out of saved state. Add restoration tests for every editor and dirty
form guard. See [saving Compose UI state](https://developer.android.com/develop/ui/compose/state-saving).

### F03 · P1 · Balance adjustments have the opposite ledger sign

Locations: [AccountsScreens.kt:195](app/src/main/java/io/guallet/android/features/accounts/presentation/AccountsScreens.kt#L195),
[KtorAccountsRepository.kt:57](app/src/main/java/io/guallet/android/features/accounts/data/KtorAccountsRepository.kt#L57),
[accounts.service.ts:131](../api/src/features/accounts/accounts.service.ts#L131).

This is a pre-existing API defect exposed by the Android flow, not a defect
introduced in Kotlin. Recording a balance transaction is enabled by default.
Changing a balance from 100 to 150 sends the flag, but the API computes
`old - new`, creating a transaction of -50 while setting the balance to 150.
The transaction should represent an increase of +50. The reverse edit has
the opposite problem. The transaction save and account save are also separate,
so an intermediate failure can leave a partial update.

Fix the backend delta and make the ledger/account update atomic. Verify both
directions, zero change, currency changes and failure rollback with service or
integration tests. Do not compensate by reversing amounts in the Android
client; other clients share this endpoint. Current MockEngine tests establish
the payload contract, not the server's accounting result.

### F04 · P2 · Calculator results are cleared on recreation

Locations: [CalculatorScreens.kt:44](app/src/main/java/io/guallet/android/features/calculators/CalculatorScreens.kt#L44),
[CalculatorViewModel.kt:34](app/src/main/java/io/guallet/android/features/calculators/CalculatorViewModel.kt#L34).

`LaunchedEffect(mortgage)` calls `model.clear()` whenever the screen enters a
new composition. After recreation, the retained ViewModel's completed results
are erased and the results/schedule flow falls back to the form. The
restoration probe confirmed that an existing result becomes null.

Initialise/reset when the user explicitly starts a new calculation, rather
than on every composition entry. Preserve a completed result across
configuration changes and reconstruct it from small saved inputs after
process death if that is the intended product behaviour.

### F05 · P2 · Failure to launch a browser escapes the UI coroutine

Locations: [GualletApp.kt:33](app/src/main/java/io/guallet/android/ui/GualletApp.kt#L33),
[AuthViewModel.kt:116](app/src/main/java/io/guallet/android/features/auth/presentation/AuthViewModel.kt#L116),
[SettingsScreen.kt:142](app/src/main/java/io/guallet/android/features/settings/presentation/SettingsScreen.kt#L142).

`uri.openUri(url)` is not guarded. If no activity can handle the URL, or a
profile restriction prevents launching it, the exception escapes
`LaunchedEffect`. `browserFailed()` exists but has no caller. The website and
source-code buttons have the same unchecked external-launch assumption.

Handle the documented launch failure and show actionable feedback while
clearing the pending launch state. Test with a throwing `UriHandler`; consider
a Custom Tab for the authentication browser experience. The [AndroidX implementation](https://github.com/androidx/androidx/blob/androidx-main/compose/ui/ui/src/androidMain/kotlin/androidx/compose/ui/platform/AndroidUriHandler.android.kt)
wraps an unavailable handler in `IllegalArgumentException`.

### F06 · P2 · Cookie encryption and synchronous persistence can block Main

Locations: [AppModule.kt:29](app/src/main/java/io/guallet/android/di/AppModule.kt#L29),
[PersistentCookies.kt:18](app/src/main/java/io/guallet/android/core/network/PersistentCookies.kt#L18),
[EncryptedCookieStore.kt:47](app/src/main/java/io/guallet/android/core/security/EncryptedCookieStore.kt#L47).

Creating the auth dependencies reads and decrypts preferences synchronously
from Activity startup. Cookie writes open the Keystore, perform AES-GCM and
call `SharedPreferences.commit()` without switching execution context. A
MockEngine/Robolectric probe confirmed that a sign-in cookie write occurs
on the main thread. A suspend API or a mutex does not move blocking work off
Main.

Make cookie initialisation and persistence main-safe through an injected IO
dispatcher while preserving serialised updates and persistence failure
handling. Add StrictMode/instrumented tests for actual Keystore operations.
This follows [Android coroutine main-safety guidance](https://developer.android.com/kotlin/coroutines/coroutines-best-practices).

### F07 · P2 · Import validation and submission preparation run on Main

Locations: [TransferScreens.kt:59](app/src/main/java/io/guallet/android/features/transfer/TransferScreens.kt#L59),
[TransferScreens.kt:285](app/src/main/java/io/guallet/android/features/transfer/TransferScreens.kt#L285),
[TransferRepository.kt:29](app/src/main/java/io/guallet/android/features/transfer/TransferRepository.kt#L29).

Reading/parsing is correctly dispatched to IO, but the composable repeatedly
maps, deduplicates and validates the entire CSV, including before required
fields are mapped. Submission also normalises the entire dataset and builds
mapping objects in the click handler. The repository serialises the complete
request to check its size on the caller's context, then Ktor serialises it
again for transmission. A single 20,000-row validation pass took 1,832 ms on
this builder; executing that work during composition blocks UI interaction.

Move validation, indexing and request preparation into a state holder on an
injected Default dispatcher, keyed by file/mapping changes. Validate required
mapping selection before per-row date parsing, avoid repeated complete
encoding, and expose a prepared immutable preview. Measure on devices; the
recorded host timing is not an ANR measurement.

### F08 · P2 · Unbounded lists are eagerly composed

Locations: [FinanceComponents.kt:28](app/src/main/java/io/guallet/android/ui/components/FinanceComponents.kt#L28),
[TransferScreens.kt:163](app/src/main/java/io/guallet/android/features/transfer/TransferScreens.kt#L163),
[NotificationsScreen.kt:69](app/src/main/java/io/guallet/android/features/notifications/presentation/NotificationsScreen.kt#L69).

`FinancePage` uses a scrolling `Column`; accounts, notifications, categories,
planning lists, balance history and CSV mappings emit every row through
`forEach`. A file-size limit does not bound the number of distinct mapping
cards. Large datasets therefore create and measure all row compositions,
including those far outside the viewport. This is a memory/jank risk; no
device OOM was deliberately induced during this review.

Use keyed `LazyColumn` items for potentially large collections. Keep small
forms as columns, and avoid nesting a vertical lazy list under an unbounded
vertical scroll container. Payment schedules and the choice sheet already
demonstrate useful lazy patterns. See [Compose lazy-list guidance](https://developer.android.com/develop/ui/compose/lists).

### F09 · P2 · Entire import mappings enter saved instance state

Location: [TransferScreens.kt:36](app/src/main/java/io/guallet/android/features/transfer/TransferScreens.kt#L36).

The mapping/name maps use `rememberSaveable` and grow with input cardinality.
A representative 20,000-key map serialised to 2,228,989 bytes before Bundle
overhead. This is a synthetic high-cardinality case, but it fits within the
allowed CSV size and the implementation has no mapping-state bound. Saving
such state can exceed the process's shared 1 MB Binder budget and fail during
backgrounding or recreation.

Keep bulk mappings in the scoped draft holder and save a small draft identity
and wizard position. Persist a larger draft only after agreeing its privacy
and retention policy. Reconcile the migration document's memory-only wording
with financial form values currently stored through `rememberSaveable`.
Android explains the shared transaction limit in
[TransactionTooLargeException](https://developer.android.com/reference/android/os/TransactionTooLargeException).

### F10 · P2 · Selection controls lack their visible option labels

Locations: [FinanceComponents.kt:143](app/src/main/java/io/guallet/android/ui/components/FinanceComponents.kt#L143),
[FinanceComponents.kt:177](app/src/main/java/io/guallet/android/ui/components/FinanceComponents.kt#L177),
[AccountsScreens.kt:238](app/src/main/java/io/guallet/android/features/accounts/presentation/AccountsScreens.kt#L238).

Checkboxes are independently clickable while the label is a sibling `Text` in
a non-toggleable row. The semantics probe found a checkbox with state and
role but no `Everyday bank` label. The choice sheet similarly creates separate
clickable row and radio-button targets. Notification filters and the yearly
schedule switch repeat the checkbox pattern.

Make the whole labelled row `toggleable`/`selectable` with the appropriate role,
put the state/action on that row, and make the inner control non-clickable.
Check disabled semantics and keyboard interaction. Add semantic assertions and
TalkBack tests following [Android's selection-control guidance](https://developer.android.com/develop/ui/compose/accessibility/api-defaults).

### F11 · P2 · An unvalidated reset link disposes signed-in work

Locations: [AuthViewModel.kt:126](app/src/main/java/io/guallet/android/features/auth/presentation/AuthViewModel.kt#L126),
[GualletApp.kt:39](app/src/main/java/io/guallet/android/ui/GualletApp.kt#L39),
[NativeApp.kt:46](app/src/main/java/io/guallet/android/ui/NativeApp.kt#L46).

Any non-empty token in a reset URI immediately replaces the signed-in UI with
the reset form, even while another operation is busy. No server validation is
needed to trigger this transition. Removing `NativeApp` runs its disposal
handler and clears the financial ViewModel store, discarding in-memory CSV
data and cancelling operations. Cancelling the reset form cannot restore
that cleared state.

Treat the incoming link as pending input. Preserve the signed-in graph until
the user accepts a transition, and coordinate that transition with pending
mutations. An invalid link must not clear the active user's work. This is a
control-flow finding; it was not exercised with a real externally launched
intent. The [deep-link guidance](https://developer.android.com/privacy-and-security/risks/unsafe-use-of-deeplinks)
also calls for checking relevant application state.

### F12 · P2 · Restored filter controls can disagree with the fetched data

Locations: [TransactionsScreens.kt:29](app/src/main/java/io/guallet/android/features/transactions/presentation/TransactionsScreens.kt#L29),
[FinanceViewModel.kt:66](app/src/main/java/io/guallet/android/features/finance/presentation/FinanceViewModel.kt#L66).

Transaction filter controls are saved, but `transactionFilter` and the selected
budget month are plain ViewModel properties. After process death, the controls
can restore selected accounts/dates while the new ViewModel starts with an
empty filter and `LaunchedEffect(Unit)` loads unfiltered transactions. The
selected budget month likewise returns to the current month.

Give the applied filter/month a single small, restorable source of truth,
distinct from an unsubmitted filter draft. Initialise requests from that
restored state and add process-recreation tests that inspect both displayed
controls and request parameters. Rotation alone does not test process death.

### F13 · P2 · Import polling continues when the app is backgrounded

Locations: [ImportResultScreen:359](app/src/main/java/io/guallet/android/features/transfer/TransferScreens.kt#L359),
[ImportViewModel.kt:75](app/src/main/java/io/guallet/android/features/transfer/ImportViewModel.kt#L75).

Polling is launched in a session-scoped `viewModelScope` and is cancelled only
when the composable is disposed, a result arrives, or ten minutes pass.
Backgrounding an Activity does not dispose its composition. Consequently the
two-second polling loop can keep making requests while the UI is stopped;
`collectAsStateWithLifecycle` pauses collection, not this producer.

Start/stop the observer using the visible screen lifecycle and fetch current
status on return. The server-owned import job should keep running. WorkManager
is only needed if the product later requires persistent device-side monitoring
or notifications. See [lifecycle-aware coroutines](https://developer.android.com/topic/libraries/architecture/coroutines).

### F14 · P2 · Recurring outflows change sign between views

Locations: [PlanningScreens.kt:629](app/src/main/java/io/guallet/android/features/planning/PlanningScreens.kt#L629),
[PlanningScreens.kt:666](app/src/main/java/io/guallet/android/features/planning/PlanningScreens.kt#L666).

Upcoming occurrences negate subscriptions/payments before passing them to
`MoneyLabel`, but the All list and detail screen pass the stored positive
amount directly. The same outgoing payment therefore appears negative/red in
Upcoming and positive/green in All/details. The Expo `Amount` component
consistently derives the sign and colour from the recurring-payment type.

Use a shared signed display-amount function in every recurring view, keeping
the stored/API amount positive. Test subscription, regular payment and regular
income across summaries, lists and details. This is a client presentation
regression, separate from the backend ledger issue in F03.

### F15 · P3 · Authentication Back buttons push new destinations

Location: [GualletApp.kt:85](app/src/main/java/io/guallet/android/ui/GualletApp.kt#L85).

The login, signup and recovery Back callbacks call `navigate()` instead of
popping or navigating up. For example, Welcome → Login → on-screen Back builds
Welcome → Login → Welcome; the next system Back returns to the abandoned
login page. Repeating the cycle accumulates entries. `launchSingleTop` only
deduplicates the current top entry.

Use `popBackStack()`/`navigateUp()` for Back, with an explicit fallback when
the expected parent is absent. Test on-screen and system Back together. See
[navigation back-stack behaviour](https://developer.android.com/guide/navigation/backstack).

### F16 · P3 · Scaffold insets are applied again by child pages

Locations: [NativeApp.kt:116](app/src/main/java/io/guallet/android/ui/NativeApp.kt#L116),
[FinanceComponents.kt:29](app/src/main/java/io/guallet/android/ui/components/FinanceComponents.kt#L29).

The graph applies `Scaffold` padding with `Modifier.padding(padding)` without
consuming those insets. `FinancePage` then applies `safeDrawingPadding()` again.
This can add system-bar/cutout space twice and reduce the available viewport.

Consume the applied padding or establish one owner of system-bar insets, while
retaining appropriate IME handling. Verify gesture/three-button navigation,
cutouts and keyboard appearance on API 36. Android explicitly describes this
in [Material 3 inset handling](https://developer.android.com/develop/ui/compose/system/material-insets).

### F17 · P3 · UI strings and date presentation bypass shared resources

Locations: [FinanceComponents.kt:36](app/src/main/java/io/guallet/android/ui/components/FinanceComponents.kt#L36),
[PlanningScreens.kt:668](app/src/main/java/io/guallet/android/features/planning/PlanningScreens.kt#L668),
[AndroidManifest.xml:10](app/src/main/AndroidManifest.xml#L10).

UI copy, accessibility labels, counts and the app label are embedded in Kotlin
or the manifest rather than string/plural resources. Some dates use the saved
preference through `DateLabel`, while recurring start/next dates and dashboard
dates print ISO strings directly. English-only operation is possible, but
translation, plural handling and date consistency require changes throughout
the UI.

Extract string/plural resources, reuse the date presentation helper, and add
pseudo-locale/RTL checks before introducing other languages. This follows
[Android localisation guidance](https://developer.android.com/guide/topics/resources/localization).

## Comparison with Android best practices

| Area                               | Assessment                     | Evidence or next step                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native UI and navigation           | Meets the requested foundation | Single Activity, Compose Navigation, Material 3, Kotlin; no JS/WebView UI. Auth Back has F15.                                                                                                                                                                                                                                                                                            |
| Layered architecture and DI        | Partial                        | Repository interfaces, Koin and ViewModels are appropriate. Feature actions/validation and repository calls still live in composables; one FinanceViewModel holds most finance domains and a shared mutation channel. Prefer feature state holders and explicit actions as this grows. [Architecture recommendations](https://developer.android.com/topic/architecture/recommendations). |
| State ownership and restoration    | Changes required               | F02, F04, F09, F12; custom session ViewModelStore needs device lifecycle coverage.                                                                                                                                                                                                                                                                                                       |
| Flow and coroutine use             | Partial                        | Read-only StateFlow and lifecycle-aware collection are good; IO/CPU main-safety and polling lifecycle need F06, F07 and F13. Inject dispatchers for deterministic tests.                                                                                                                                                                                                                 |
| Cancellation                       | Partial                        | RemoteResource checks cancellation before publishing results/errors and keys cached requests. AccountsViewModel's read paths lack equivalent late-result guards; keep cooperative cancellation in repositories and extend tests if introducing caches/non-cooperative sources.                                                                                                           |
| Networking                         | Good baseline                  | Reused Ktor/OkHttp client, typed Resources, timeouts, explicit error propagation, HTTPS-only configuration, redirects disabled, no body/credential logging. Add live contract and failure tests.                                                                                                                                                                                         |
| Authentication and secrets         | Changes required               | Keystore AES-GCM, backup exclusions, memory-only passwords/codes, FLAG_SECURE, origin/path cookie restrictions and nonce/replay handling are good. F01 and F11 remain. Device-test key loss, invalidation and persistence failures.                                                                                                                                                      |
| Money and calculations             | Mostly sound                   | BigDecimal payloads and arithmetic, shared currency precision, per-currency totals and parity fixtures. No inferred FX conversion. F03 is a separate backend defect; F14 affects recurring-payment presentation. Tax rules are explicitly dated; current tax-law correctness was not reassessed.                                                                                         |
| Large data and Compose performance | Changes required               | F07–F09. Keep lazy-list identity stable and profile release builds on modest devices. Dashboard cashflow also fetches every transaction page for its 30-day aggregates; assess a currency-aware aggregate contract for high-volume accounts.                                                                                                                                             |
| Accessibility                      | Partial                        | Material controls, textual amounts/signs, error live regions and chart values help. F10 remains; add headings, contextual progress labels and screen-reader testing.                                                                                                                                                                                                                     |
| Contrast                           | No blanket failure found       | Positive money text is bold, with a calculated 3.87:1 green-on-white ratio, above Android's documented 3:1 threshold for that bold size. Actual rendered UI still needs scanning. [Text visibility guidance](https://developer.android.com/guide/topics/ui/accessibility/apps#color-contrast).                                                                                           |
| Insets and Android 16              | Partial                        | Edge-to-edge enabled and target SDK 36; F16. No on-device predictive-back, IME, cutout or large-window validation. [Android 16 behaviour](https://developer.android.com/about/versions/16/behavior-changes-16).                                                                                                                                                                          |
| Adaptive UI                        | Improvement needed             | The signed-in shell uses the same bottom bar and full-width column at every window width. Assess content-width limits, navigation rail and larger-window layouts using [window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes). This is a recommendation, not proof of a tablet crash.                                          |
| Autofill and input                 | Improvement needed             | Password keyboard/visibility controls exist, but login/signup fields lack explicit username/email/password ContentType semantics and autofill save-flow coverage. See [Compose autofill](https://developer.android.com/develop/ui/compose/text/autofill).                                                                                                                                |
| Offline and background behaviour   | Product decision               | No persistent finance cache is documented. Room/offline-first storage is not automatically required; agree privacy/UX requirements before adding it. Server imports do not require a device worker to continue.                                                                                                                                                                          |
| Release optimisation               | Improvement needed             | Release explicitly disables minification and does not enable resource shrinking. Enable and test R8/resource shrinking before performance measurement and publication. Signing/publication remain separately authorised release work. [R8 guidance](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization).                                           |
| Packaging and dependencies         | Partial                        | Version catalog/wrapper and licensing are present. APK ZIP/ELF alignment checks passed; dependency advisories need deliberate review, not an untested wholesale upgrade.                                                                                                                                                                                                                 |
| Test strategy and CI               | Incomplete for release         | CI builds debug, runs JVM/Robolectric tests and lint. There is no instrumented/device matrix, release-variant exercise, benchmark, actual Keystore test, or real provider/worker test. [Android testing strategy](https://developer.android.com/training/testing/fundamentals/strategies).                                                                                               |

## Recommended remediation sequence

1. Resolve the callback credential handoff decision (F01), repair account
   draft preservation (F02), and fix the shared backend accounting defect with
   rollback tests (F03).
2. Address the remaining functional findings: restoration, external launches,
   main-thread work, saved-state bounds, labelled controls, pending reset
   links, restored filters and lifecycle-bound polling.
3. Add regression assertions for the reproduced failures. Turn the review
   probes into maintained tests of correct behaviour as each fix lands.
4. Finish Back/inset/resource improvements and agree the adaptive, autofill,
   release-optimisation and financial-draft persistence scope.
5. Exercise release builds on API 26 and API 36 devices/emulators, plus relevant
   large-screen and 16 KB configurations. Verify background/process death,
   large font, RTL, TalkBack, no browser handler, expired/corrupted cookies,
   and network loss before/after a mutation reaches the server.
6. Test a deployed HTTPS API with Google, reset/email-code messages and actual
   import/export workers. Confirm uncertain mutation outcomes cannot quietly
   create duplicates when the user retries after losing a response.

Protocol changes, newly persisted financial drafts, new backend contracts and
store deployment need the user's approval before implementation. Routine
correctness fixes can be scoped and reviewed separately from those decisions.
