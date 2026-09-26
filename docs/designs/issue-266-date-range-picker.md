# Native DateRangePicker design — issue #266

The [mobile design board](./issue-266-date-range-picker-mobile.html) shows two concepts in 390 × 844 frames. [Concept A](./issue-266-date-range-picker-mobile.png) is recommended: a full preset list followed by a focused custom calendar. The date examples use 26 September 2026 as the illustrative current day.

## Mobbin findings

| Reference | Observed pattern | Applied here |
| --- | --- | --- |
| [Klarna filter sheet](https://mobbin.com/screens/59fe2496-7f9b-42b2-99b5-68fead2aed8a) | Radio-style date options in a sheet with fixed actions | Scannable preset rows and fixed Cancel / Apply footer |
| [Monzo date range](https://mobbin.com/screens/17676b62-d546-474e-9bd8-0b52e6a83d9c) | Clear From / To summary and quick ranges | Two explicit endpoint boxes above the calendar |
| [StubHub range calendar](https://mobbin.com/screens/884f331a-261f-4138-addd-013c62020550) | Selected endpoints and a continuous in-between highlight | Blue endpoint circles and pale blue included dates |
| [Expedia date range](https://mobbin.com/screens/86a978a2-30bc-4865-8d89-e0b5370ef1f3) | Navigable calendar with persistent confirmation | Month navigation and Apply anchored below scrollable content |

These are interaction references. Colors, spacing, type, and surfaces follow `DESIGN.MD` and Luna Mobile tokens.

## Concepts

**A · Preset list and calendar (recommended).** The closed control shows the committed label or formatted range. Opening it reveals all 12 fixed presets, grouped as Recent, This period, and Previous periods, plus Custom range. The list scrolls under a fixed footer. Choosing Custom range opens the calendar within the same sheet. This keeps the entire web choice set discoverable and provides room for a legible calendar.

**B · Quick-pick grid (alternative).** Four frequent presets are shown first; More presets reveals the remaining eight fixed presets. Custom range remains visible. This makes the first sheet lighter but adds a step and hides most of the required fixed options. It should only be chosen if usage data shows that a small set dominates.

The board depicts five states: committed control, preset draft, incomplete custom range, complete custom range, and the compact alternative. Its transaction screen is context for the reusable component, not a proposed transaction-screen redesign.

## Component anatomy

| Part | Design |
| --- | --- |
| Closed control | Full-width, 56 px high, 16 px radius, calendar icon, value, and chevron; Luna input surface/border tokens |
| Sheet | Native bottom sheet, white/light surface, top handle, title, Cancel, scrollable content, and fixed action footer |
| Preset row | At least 50 px high, sentence-case label, radio indicator, clear active color |
| Calendar | Monday-first seven-column grid, 38–45 px day cells, month controls, visible From and To summaries |
| Selection | Primary blue endpoint fill; light blue dates between endpoints; today underlined only when not selected |
| Footer | Cancel secondary action and Apply primary action; Apply disabled until two dates are chosen for custom range |

Use Luna theme tokens for colors, spacing, typography, and borders in production. The board's static hex values illustrate the light token values; dark mode should resolve from Luna's theme. Date and month labels should use the device locale and accessible date formatting. The examples use UK English.

## Presets and state

The default choices exactly cover the [web control's preset set](../../apps/webapp/src/components/DateRangeButton/DateListPicker.tsx): Today, Yesterday, Last 7 days, Last 30 days, Last 365 days, Last month, Last 12 months, Last year, Week to date, Month to date, Quarter to date, Year to date, and Custom range. The groups are visual only; they do not change the public preset identifiers or date calculations.

1. The closed control reflects the committed `value`. On open, copy that value into a draft. A `null` value displays “Select range”. If the committed dates match a known preset, show its label; otherwise, show the formatted dates.
2. Tapping a fixed preset updates only the draft and marks its radio row. Apply emits its complete range once and closes the sheet. Cancel, swipe dismissal, and system back discard the draft and call `onCancel` when provided.
3. Tapping Custom range switches to the calendar. The first tap sets the start and clears the end. The second tap on the same or a later date sets the end. A tap before the current start begins a new range from that day. After a complete range, a new tap begins a new selection.
4. Apply stays disabled while custom selection has only one endpoint. The From / To boxes announce which date is expected. A same-day range is valid, matching the web calendar's single-day support.
5. Date ranges use local calendar days, inclusive. Fixed presets retain the web control's start-of-day / end-of-day semantics. The visual calendar does not impose a future-date limit because the public contract in [issue #266](https://github.com/Guallet/monorepo/issues/266) defines none.
6. `style`, `bottomSheetStyle`, `calendarStyle`, and `textStyle` affect the surfaces named in the issue without changing the event contract or minimum touch-target geometry.

## Accessibility and implementation handoff

- The closed control exposes a button role and announces “Date range, [value]”. Each preset announces its label and selected state. Calendar days announce full localized dates plus “start”, “end”, or “in selected range” where relevant.
- Month navigation, Cancel, Back to presets, and Apply need distinct labels and reachable focus order. The selected dates must remain understandable without color alone through the From / To summary.
- The sheet footer remains visible with large text and on shorter screens; list/calendar content scrolls. The sheet may expand to full height on small devices.
- The app currently requires mobile sheets to go through `apps/mobile/components/ui/BottomSheet.tsx`, while the issue places the reusable component in `packages/guallet-luna-mobile`. That dependency boundary needs an implementation decision before coding. A package-level presentation adapter or a shared wrapper that the app re-exports could preserve a single theme-aware sheet integration without coupling Luna to the app. The visual and event design does not depend on which adapter is chosen.

## Review points

- Choose Concept A or B; A is recommended for discoverability of all 13 choices.
- Confirm the two-stage custom flow and whether the closed control should display a recognized preset label or always display dates.
- Confirm that same-day ranges and future dates should follow the web behavior described above.
