# Mobile data export · issue #248

See the [visual board](./issue-248-mobile-data-export.html) or [PNG preview](./issue-248-mobile-data-export.png). This is a design proposal for approval, not a production implementation.

## Mobbin references

- [Copilot Money settings](https://mobbin.com/screens/f700bf77-3079-47db-9982-6a0aa2030de4): a clear “Export your transactions” row among account settings.
- [Wise statements and reports](https://mobbin.com/screens/dca57696-0137-4e2f-8ff8-1f00c6153465): date presets followed by explicit start/end and format controls.
- [Crypto.com transaction export](https://mobbin.com/screens/81406cb1-4078-41d7-babc-7bd090846bf8): account and date selection on a focused export form with a fixed action.

The Guallet layout follows the existing blue palette, light page background, card signature, sentence case, and Luna mobile theme. The board's symbols stand in for Luna icons; production should use Luna icons.

## Proposed interaction

1. Settings gets a “Your data” section with “Export data”.
2. The export screen defaults to all accounts, all dates, and CSV, matching the webapp's optional filters. The user can select accounts, a date range, and CSV, JSON, or OFE. No account IDs or date fields are sent for the “All” choices.
3. A fixed “Create export” button shows a loading state while `POST /data/export` is pending. Validate any custom start date is on or before the end date.
4. On an accepted response, show “Export started”, explain that processing continues in the background, and say the selected-format file will be emailed to the account email when ready. “Got it” dismisses the confirmation. Do not show a job percentage, file-ready state, or native share sheet.
5. If submission fails, retain the selected filters and offer “Try again” and “Edit selection”. The app cannot observe a later job failure through the current API; that outcome is handled by the API's email path.

The existing DateRangePicker direction in [issue #266](./issue-266-date-range-picker.md) can supply the date sheet. The existing account picker can supply the account sheet if it supports multi-select; otherwise extend it for this screen. Account and date selections are draft values until their sheet's Apply/Done action.

## Existing API and webapp behaviour

The current `POST /data/export` queues a job and returns an accepted response with an email-delivery message. The processor generates the selected format and emails it to the user when done. The webapp shows a success modal after the request is accepted: “Your data export is now being processed in the background” and “You'll receive an email with the exported file”. The mobile confirmation follows that behaviour.

## Coverage after approval

Automated tests should cover filter-to-request mapping, optional all-account/all-date filters, invalid custom dates, accepted response, request rejection, and retry with preserved selections. The loading and confirmation states should have accessible labels and state announcements.
