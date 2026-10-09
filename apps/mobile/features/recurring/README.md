# Subscriptions and recurring payments

Open **Settings → Subscriptions & payments** to manage subscriptions, regular
payments and income. The feature uses the existing subscriptions API hooks and
does not create bank payments or transactions.

**Upcoming** lists expected occurrences in the next 30 calendar days. Its
summary counts occurrences in the current calendar month, including earlier
dates. **All items** provides search and normalised monthly estimates. Type
filters apply to the list and summaries. Currency totals remain separate.

Monthly estimates annualise weekly payments by 52, fortnightly by 26, monthly
by 12, quarterly by four and yearly by one, then divide by 12. Display uses
`@guallet/money` and currency-specific precision. Undated items contribute to
estimates but not to dated projections.

Dates preserve the original calendar anchor. Monthly, quarterly and yearly
schedules clamp to the last valid day in shorter months without changing the
anchor for subsequent occurrences. Date-only API values and picked dates do
not shift with the device timezone.

## API compatibility

The matching API change supports explicit `null` dates on creation and explicit
`null` dates/categories on update. Omitted update fields remain unchanged, and
omitting the date on creation retains the existing default of today. Deploy
the API change before releasing this mobile feature. Existing database columns
are already nullable; no new database columns are required.

Responses convert database decimal amounts to numbers and expose category IDs
even when a relation is not loaded, so saved edits remain visible in the query
cache. The UI preserves input after failed saves, confirms removal from Guallet
and warns before discarding unsaved form changes.

## Validation

```sh
pnpm --filter mobile exec vitest run features/recurring
pnpm --filter api exec vitest run src/features/regular-payments
pnpm --filter @guallet/luna-mobile exec vitest run src/overlays/BottomSheet.test.tsx
pnpm lint
```

Before a native release, verify on iOS and Android: Settings navigation,
first/last input visibility with the keyboard open, currency/category sheets,
date picker, swipe dismissal, large text and screen-reader labels. Component
tests cover form payloads, retries, discard confirmation and removal, but do
not prove native keyboard or sheet visibility.
