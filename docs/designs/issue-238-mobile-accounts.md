# Issue 238: mobile account management

## Mobbin references

- [Monarch account list](https://mobbin.com/flows/a4f86316-186a-4c12-9ef1-918b04a94b42): account tab, balance summary, grouped account rows, add action.
- [YNAB account list](https://mobbin.com/flows/425ba680-5dec-44c7-a8a3-76562a3ebecf): compact grouped rows and clear account navigation.
- [Monarch manual account creation](https://mobbin.com/flows/f7a79714-c7b6-4e5c-9d95-114b673dca96): type selection, name and balance inputs, return to account detail.
- [Monarch account detail](https://mobbin.com/flows/3eaaaf90-717d-4a9c-8784-cf4ac553ff92): balance trend, recent transactions, account information.
- [Monarch edit account](https://mobbin.com/flows/f7a79714-c7b6-4e5c-9d95-114b673dca96): edit form and explicit save action.

## Screen map

1. **Accounts tab**: page title and Add action; net worth summary by currency; search field; account groups ordered by type with their own currency totals; tappable rows. Empty, loading, search-empty and retry states appear in the list area.
2. **New manual account**: name, currency, balance and type selection; optional fields change with the type; Save and Cancel actions. Validation appears beside the form and the Save action shows a pending state.
3. **Account detail**: balance hero, type and currency; balance history; monthly money in and out; optional account properties; recent transactions with a link to the filtered transaction list. Each data section has its own loading, empty and retry state.
4. **Edit manual account**: the same form, prefilled; Save changes and Cancel. Synced and imported accounts do not offer this action.
5. **Delete confirmation**: destructive action at the bottom of a manual account detail; confirmation explains transaction deletion. The action is disabled while pending and reports failure in an alert.
6. **Filtered transactions**: launched from detail with the account filter applied; individual rows open transaction detail.

## Visual and interaction decisions

The accounts destination stays in the bottom tab bar. White cards on the page surface use the theme border and large radius. Money amounts use tabular figures, and income and expense retain green and red semantics. Account type controls, the edit action, account rows and transaction rows have accessible roles and labels. No Mobbin imagery or branding is copied into the app.
