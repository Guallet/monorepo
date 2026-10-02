# Mobile budgets · issue #242

[Open the visual board](./issue-242-mobile-budgets.png). This is a UI proposal for review before changing the mobile implementation. Amounts and merchants are illustrative.

## Screen inventory

| Frame | Screen or state | Key behaviour |
| --- | --- | --- |
| 1–2 | Budget overview, current and previous month | Month selection drives the summary and every budget progress value. Show budgeted, spent, and remaining, as on the webapp. Keep the selected month when returning from detail or a form. |
| 3–4 | Budget detail, on track and over budget | Show spent, limit, remaining or overage, category scope, and transactions for the same selected month. |
| 5–7 | Create form, category sheet, currency sheet | Use the webapp's form fields: name, currency, budget amount, colour, icon, and categories. Validate name, positive amount, currency, colour, and at least one category. Category selection is searchable and applies draft choices explicitly. |
| 8 | Edit form | Prefill the same fields and preserve changes if saving fails. |
| 9 | Delete confirmation | Name the budget and explain that transactions remain. |
| 10–11 | No budgets created and no matched transactions | Offer budget creation only when the user has no budgets. Keep the detail context when a budget has no matched transactions. |
| 12–18 | Loading, API, validation, save, and delete states | Use skeletons, field-level errors, retry, and retained data. Disable duplicate mutations while pending. List, detail, and transaction failures have distinct presentations. |
| 19–20 | Colour and icon pickers | Give each webapp field a focused mobile selection sheet. |
| 21 | Month with no spending | Keep recurring budgets visible with £0 spent and full amounts remaining. |

Budgets recur every calendar month, so the form has **no period field**. Its introduction explains that the limit applies each month. The selected month is a viewing filter on the overview and detail pages, not a property of the saved budget. This matches the webapp and the current `CreateBudgetDto`: list, detail, and transaction endpoints accept a one-based `month` and `year` query. Currency choices follow the webapp's account-currency list; a default currency can be preselected.

## Mobbin references

- [Rocket Money budget overview](https://mobbin.com/screens/64db6b84-7887-41a3-a137-4a2df6d811bb): a month switcher, total spending summary, and category budgets in one view. The Guallet mock keeps a single column of budget cards and its blue-led design system.
- [Wise spending list](https://mobbin.com/screens/b2d58d78-50f9-45bc-98ba-daa46314b5c2): quick month browsing and easy-to-scan categories. The Guallet list adds a defined budget amount and progress per card.
- [Origin category budget setup](https://mobbin.com/screens/69b31d50-ba8e-4805-957e-60df0e98839d): one focused amount entry with the month in context. Guallet uses the same clarity in a full form that also covers currency and category selection.
- [Starling budget detail](https://mobbin.com/screens/02dd4a9b-0465-4632-a9d6-d4b253b15075): a short progress summary directly above related transactions. Guallet carries the selected month into that detail view.
- [Starling category selection](https://mobbin.com/screens/d15de7fa-c3cf-41d1-acc7-fc8afac5b200): searchable multi-select category list with a clear apply action.
- [Monarch delete confirmation](https://mobbin.com/screens/dfc89d06-87ba-448f-bb2b-bd5f682a416d): concise consequence copy and separate cancel and destructive actions.

The mocks are original layouts using Guallet's colours, card treatment, UK English, and tabular money figures; no Mobbin images are embedded. The PNG shows each phone at its initial scroll position; detail content is arranged so its transactions and management action remain visible.

## Implementation notes

Budget screens and API hooks already exist in the working tree. The mocks describe the target review state, not the current UI. In particular, the implementation should keep the selected month when navigating between list and detail, use the same month for budget and transaction requests, and provide visible pending and failure states for create, edit, and delete. The webapp create form marks icon as required, while the API field is optional; the mock follows the webapp presentation. Issue #242 also calls for automated monthly navigation and CRUD coverage. Issue #239 supplies the category picker dependency.
