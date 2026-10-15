# Native DateInput design — issue #265

## Intent

Add one reusable Luna Mobile field that displays a date and opens the platform's date picker. It follows Luna's existing `TextInput` dimensions and theme tokens. The [mobile component board](./issue-265-date-input-mobile.html) shows six phone-sized states, including the two platform picker presentations.

## References

- [Wise scheduled payment](https://mobbin.com/screens/b38143ae-2b9d-4400-aaa8-3f6619ec09ed): a labelled date field opens a focused calendar surface while the form remains visible behind it. Use the field-to-picker relationship.
- [Commons add transaction](https://mobbin.com/screens/d29cd54b-b9cd-4629-94de-a526d556b26d): a date row in a transaction form opens an iOS wheel with explicit confirmation. Use the platform picker rather than a custom calendar.
- [Lloyds first payment date](https://mobbin.com/screens/26158413-3f55-42a7-8f88-e743e1328dec): a bounded payment-date choice keeps the title and dismissal actions close to the calendar. Use clear context and cancellation.
- [ClickUp due date](https://mobbin.com/screens/b4c5abb0-6b6f-44a1-b2f2-71a785dc52e5): the selected date can be cleared in the same selection surface. Provide a clear action only when a value exists.

These references informed the interaction, not the visual styling. The field itself uses the Guallet palette and Luna input geometry from `packages/guallet-luna-mobile/src/components/inputs/TextInput.tsx`.

## Field anatomy

| Part            | Design                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Label           | Optional, sentence case, 16 px medium, 4 px below label                                                                  |
| Hit target      | Full width, at least 56 px high, 16 px radius, 1 px border                                                               |
| Background      | `colors.surface.background.input` (`#F0F9FF` in light mode)                                                              |
| Border          | `colors.surface.border.input` (`#E5E7EB` in light mode)                                                                  |
| Value           | 16 px primary text; locale-formatted date, e.g. `23 Sep 2026` in UK English                                              |
| Empty           | `Select date` in `colors.text.placeholder`                                                                               |
| Trailing action | Calendar icon for empty and selected values; a separate clear button is available when selected and the field is enabled |
| Error           | Error background and border, then 14 px error text beneath the field                                                     |
| Disabled        | Disabled background, disabled text, no picker or clear action                                                            |

The pressed/focused field uses an accent border and remains legible. The picker uses the operating system's native appearance; the design board illustrates the expected hierarchy rather than prescribing its internal pixels.

## Interaction and states

The public component contract remains the one in [issue #265](https://github.com/Guallet/monorepo/issues/265): `value: Date | null`, `onChange(Date | null)`, optional `minDate`, `maxDate`, `label`, `disabled`, `error`, `onFocus`, `onBlur`, and the container, input, and text style props. The design adds no required props.

1. Activating the enabled field calls `onFocus` once and opens the native date picker. The initial picker value is the selected date, or today clamped to the allowed range.
2. A valid confirmation emits one `Date` via `onChange` and closes the picker. Dismissal leaves the value unchanged. Both paths call `onBlur` once when interaction ends.
3. The clear control appears only for a selected, enabled field. It emits `null` without opening the picker. Keep the clear control's accessible label distinct from the field's.
4. `minDate` and `maxDate` are passed to the platform picker and should also be checked before emitting a selection. Bounds are inclusive calendar dates in the user's local time zone.
5. A disabled field has no press response, clear action, `onFocus`, `onBlur`, or `onChange`.
6. If an error message exists, it stays visible until the parent updates it; the component does not invent validation text.

The iOS implementation uses a native wheel in a themed modal with Cancel and Done. Android uses the system date dialog with Cancel and OK. The shared Luna package cannot import the app-local bottom sheet wrapper, so the field uses a modal for its iOS presentation. The platform may adapt picker appearance by OS version; the shared field appearance and events remain stable.

## Implementation mapping

- Build `DateInput` alongside Luna's `TextInput` and export it through `components/inputs/index.ts` and the package entry point.
- Use `useTheme()` for field colours, spacing, radius, and typography. Keep `style`, `inputStyle`, and `textStyle` mapped to the container, pressable field, and value text respectively.
- Use `@react-native-community/datetimepicker`, which the mobile app already uses, for the selection control. Keep the field package compatible with its consumers by declaring the picker dependency appropriately.
- For mobile usage, replace the bespoke `FieldButton` date field in `TransactionDetailsScreen` after the component is available; preserve the existing `maximumDate={new Date()}` behaviour for transaction dates.
- Include a screen reader announcement that combines label, current value or placeholder, and error. The full field and clear control must have separate touch targets.

## Review checklist

- Empty, selected, pressed, error, and disabled states match the design board.
- iOS and Android picker presentations preserve cancellation and selection semantics.
- Today's date, the lower bound, and the upper bound remain selectable; dates beyond bounds cannot be emitted.
- Clear emits `null`; dismiss emits nothing.
- Dark theme uses corresponding Luna tokens, including error and disabled states.
