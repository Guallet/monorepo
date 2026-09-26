# Native DateRangePicker design — issue #266

The chosen direction follows [Monzo's date range sheet](https://mobbin.com/screens/17676b62-d546-474e-9bd8-0b52e6a83d9c) and its [expanded calendar state](https://mobbin.com/screens/edac9b84-fcd9-4683-a625-7b9c1dd3648f). See the [Monzo direction board](./issue-266-date-range-picker-monzo.html) and [PNG preview](./issue-266-date-range-picker-monzo.png). The earlier [concept comparison](./issue-266-date-range-picker-mobile.html) is retained as exploration, not the implementation target.

## Layout

- The closed 56 px control displays the committed preset label when identifiable, otherwise the formatted date range. An empty value reads “Select range”.
- A native bottom sheet contains a title, a single From / To card, a horizontal quick-range rail, and a fixed Done button. The user can dismiss with Back or a sheet gesture; that discards the draft.
- Tapping From or To expands a month calendar _within that row's card_, as in Monzo. Both endpoints stay visible as the user edits. Selected endpoints use Luna's primary blue; days between them use a pale blue fill. The active row has the Luna input focus tint.
- Four common presets are immediately visible in the rail: Today, Last 7 days, Last 30 days, and Month to date. “See all” expands a scrollable list of all 13 web choices, including Custom range, in the same sheet. The rail itself scrolls horizontally; the visible set is a convenience, not a replacement for the full set.
- Done stays fixed above the safe area. It is disabled while either date is missing. “Done” invokes the issue's `onApply(range)` event and closes the sheet.

The board uses 26 September 2026 as an illustrative current day. Production uses localized month and date labels and Luna theme tokens. The calendar starts on Monday, matching the web week-to-date preset.

## Interaction

| Action                           | Draft state                                               | Committed value       |
| -------------------------------- | --------------------------------------------------------- | --------------------- |
| Open sheet                       | Copy `value`                                              | Unchanged             |
| Tap a preset                     | Set both dates; close expanded calendar                   | Unchanged             |
| Tap From, then a day             | Set start and clear end; To remains available below       | Unchanged             |
| Tap To, then a day               | Set end if on/after start; earlier tap starts a new range | Unchanged             |
| Tap Done                         | Emit complete range and close                             | Parent receives range |
| Back, swipe dismiss, system back | Discard draft; call optional `onCancel`                   | Unchanged             |

Same-day ranges are valid. The calendar does not impose a future-date limit because [issue #266](https://github.com/Guallet/monorepo/issues/266) does not define one. The default choices match the [web preset set](../../apps/webapp/src/components/DateRangeButton/DateListPicker.tsx): Today, Yesterday, Last 7 days, Last 30 days, Last 365 days, Last month, Last 12 months, Last year, Week to date, Month to date, Quarter to date, Year to date, and Custom range. Custom range opens the From calendar; tapping either endpoint also opens the calendar directly.

Monzo also shows “All time” and Clear. Those controls are omitted here because this component's `onApply` accepts only a complete range; it has no `null` result. A future contract change would be needed to support clearing a date filter.

## Component contract and access

Keep the issue's props: `value`, `onApply`, optional `presets` and `onCancel`, and `style`, `bottomSheetStyle`, `calendarStyle`, and `textStyle`. All style props apply to their named surfaces while preserving minimum touch targets.

The trigger announces its label and committed value. Endpoint rows announce their date or “not selected” and whether their calendar is expanded. Day cells announce full dates plus selection state. Preset chips and list items announce selected state. Month navigation, See all, Back, and Done have distinct labels and accessible focus order. From / To text makes the selection understandable without color alone.

The repository's app-local `BottomSheet` wrapper is the only allowed Expo UI sheet integration, while the issue places this reusable component in `packages/guallet-luna-mobile`. `DateRangeSheetProvider` connects the package control to that app wrapper; the package does not import Expo UI or app code.
