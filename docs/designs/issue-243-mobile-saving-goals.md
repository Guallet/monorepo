# Mobile saving goals · issue #243

[View the visual board](./issue-243-mobile-saving-goals.html) or [PNG preview](./issue-243-mobile-saving-goals.png). This is a design proposal for review before implementation.

## Screens and states

1. Dashboard widget: show the first goals and a **See all** link.
2. Saving goals list: every goal has its saved amount, target, progress, date/account summary, and completed or overdue status.
3. Goal detail: progress, target and current amount, deadline, linked accounts, description, and edit/delete actions.
4. Create goal form: name, target amount, optional date and description, and at least one linked account.
5. Linked accounts sheet: multi-select from existing accounts; preserve draft selections until **Apply accounts**.
6. Edit goal form: the same fields, prefilled.
7. Delete confirmation: names the goal and states that linked account balances are unaffected.
8. Empty list: explain the feature and offer **Create your first goal**.
9. Loading and list error: skeletons while loading; a retry action on failure. Detail loading and error should use the same pattern.
10. Form validation and save error: field-level messages; retain values and allow retry. Disable repeated submission while a mutation is pending.

The target date is optional in the create API, so the form labels it optional. The API requires a nonempty array of linked account IDs. The list, detail, and dashboard widget should refetch after goal creation, editing, deletion, or a relevant account balance mutation.

## Mobbin references

- [Quicken savings goals overview](https://mobbin.com/screens/ae165087-821c-4ef6-b5df-c407f1167d57): a compact list card combines a goal name, progress, saved amount, and target. Guallet uses a simpler blue progress bar and its existing card style.
- [KOHO goal detail](https://mobbin.com/screens/e11a1523-a9b4-4955-b257-00b6fae95fb3): important values and the deadline are easy to scan as rows. Guallet groups those rows below a progress summary.
- [Cleo goal edit flow](https://mobbin.com/flows/ab83e344-835d-4917-b7d0-28ee665a6f41): a short form for name, amount, and date. Guallet adds linked accounts because its API requires them.
- [Revolut goal setup flow](https://mobbin.com/flows/a8d5e8e7-e939-4980-bf9e-3955559a3da9): date selection appears as a focused sheet. Guallet uses the same focused selection pattern for accounts and a date picker for the optional deadline.
- [Cash App remove goal](https://mobbin.com/screens/77421f0e-576e-43e6-9ef1-7e9a3c87f28b): clear destructive action and cancellation. Guallet uses a shorter confirmation because deleting a Guallet goal does not transfer money.

## Implementation dependency

`apps/api/src/features/saving-goals/dto/saving-goal.dto.ts` currently sets `currentAmount` to zero with a TODO to calculate it from linked account balances. This also makes `progressPercentage`, `remainingAmount`, and `isCompleted` inaccurate. Issue #243's progress criteria require an API calculation and tests in addition to the mobile screens. The current mobile dashboard widget hardcodes GBP because the goal DTO carries no currency; implementation must define how linked-account currencies are represented and formatted, especially when more than one account is selected.

The board uses simple symbols as icon placeholders. Production UI should use Luna mobile icons and theme tokens.
