# Mobile reports

Reports implements the approved spending-first concept from
[the design review](../../../docs/mockups/mobile-reports-designs.md).

Open **View reports** on Dashboard. Reports starts with the latest completed UTC
calendar month and its Spending tab. The month picker and previous/next buttons
also allow the current month, labelled “Month to date”.

- Spending and Income show a donut and category rows with amounts and shares.
  Parent rows include their descendants once. Tap a parent to see subcategories
  and amounts assigned directly to the parent; nested parents remain explorable.
- Cash flow shows income, expenses and their difference for the selected month.
- Filters select accounts and categories. Selecting a parent category includes
  its descendants. An empty selection means all. Changes apply only with Apply;
  closing the sheet discards its draft. Reset restores the full report.
- Currency selection appears when there are multiple transaction currencies.
  Totals use each transaction’s currency, with no conversion or mixed total.
- Pull to refresh reloads the report; returning to Reports also reloads it.
  Loading, request failure, no transactions, and no income/spending have distinct
  states. Failed requests keep the chosen period and filters.

## Amount semantics

The new `GET /reports/monthly` endpoint accepts `year`, `month`, and optional
comma-separated UUID lists `accounts` and `categories`. Queries are scoped to
the session user through account ownership; category definitions and filter
expansion are also scoped to that user. Months use a start-inclusive,
next-month-exclusive UTC date boundary.

Income is the sum of positive amounts. Expenses are the magnitude of negative
amounts. Refunds count as inflows and transfers are included on both sides;
there is currently no transfer-pair model to exclude them reliably. The screen
states this explicitly. Net cash flow is income minus expenses, not an account
balance or a savings figure. Uncategorized transactions appear as Untagged.

The existing yearly cash-flow endpoint keeps its original contract. Monthly
category totals are direct totals, so clients roll up the hierarchy once.
Amounts use `@guallet/money`, including currency precision and displayed format.
The API uses the package’s compiled `@guallet/money/node` entry; its build and
development commands build that dependency first. Mobile keeps using the
original source entry.

## Validation

Targeted tests cover gross versus net totals, decimal precision, separate
currencies, untagged data, user/filter scoping, date boundaries, request
validation, client query serialization, category rollups and month navigation.
Run:

```bash
pnpm --filter @guallet/money build
pnpm --filter api exec vitest run src/features/reports src/openapi/dto-schemas.spec.ts
pnpm --filter @guallet/api-client exec vitest run src/reports/reports.api.test.ts
pnpm --filter mobile exec vitest run features/reports/reportModels.test.ts
pnpm --filter api build
pnpm lint
```

Native device verification remains necessary: check month/filter/category sheets,
scrolling on small screens, larger text, VoiceOver/TalkBack, light/dark themes,
back navigation, and switching currencies. The accessible category list provides
the values represented by the chart; larger text moves the total below the ring.

Workspace validation passed 518 report/OpenAPI tests, two client tests, four
mobile report-model tests, and 75 money-package tests. Repository-wide lint,
API/client/hooks typechecking, the API production build, and an iOS JavaScript
bundle export passed. The bundle check used a temporary Metro configuration to
exclude native dependency build trees from file scanning; no application Metro
configuration changed. The isolated PR also passes 30 shared sheet/toast tests.
Full mobile typechecking remains blocked by existing category/saving-goal
contract errors and importer nullability errors. Native device
interaction and accessibility checks have not been performed in this environment.
