---
name: create-react-native-component
description: Create and refactor React Native UI components in Guallet's Luna mobile package. Use when adding a native Luna component or adapting a web component for the Expo app.
---

# Create React Native Components

Build native UI components in `packages/guallet-luna-mobile` using the repo's
existing Luna, React Native, Expo, and accessibility patterns.

## Workflow

1. Read the repo's `AGENTS.md` guidance and inspect nearby components, theme
   hooks, barrel exports, and any web equivalent.
2. Define the component API before styling: typed props, callback/event props,
   children, style overrides, defaults, and accessibility behavior.
3. Implement native interactions and rendering with small helpers or focused
   subcomponents. Keep complexity low and behavior easy to follow.
4. Export the component from the appropriate local index and public package
   barrel. Add dependencies to `package.json` and the lockfile when required.
5. Review the diff for theme use, accessibility, Sonar findings, and package
   exports. Run the relevant checks when requested or required by the task.

## Component rules

- For money amounts, use `@guallet/money` and `Money.format()` for display.
  Derive precision from `Currency.decimalPlaces`; never hardcode two decimal
  places or create a local currency formatter.

- Use `Readonly<Props>` for component props. Document non-obvious props and
  callbacks. Use React Native event names and types (`onPress`, `onChangeText`,
  and so on) consistently with the native control.
- Pass content as React children: write `<Component>content</Component>`, not
  `<Component children={content} />`.
- Use `useTheme()` from the Luna mobile package for colors, spacing, typography,
  and named radii. Do not hardcode values that have a theme token. Resolve
  named radii from `theme.borderRadius`; reserve explicit numbers for values
  that are genuinely component-specific.
- Define static styles with `StyleSheet.create`. Keep theme-dependent values in
  style arrays or helper functions.
- Prefer guard clauses, `switch` statements, and small helpers over nested
  ternaries. Split rendering into focused subcomponents when a component's
  cognitive complexity grows; keep individual functions understandable and
  below Sonar's configured complexity limit.
- Prefer `??` for nullish defaults. Use `.at(-1)` instead of indexing from
  `array.length - 1`, when supported by the package's TypeScript target.
- Treat names as Unicode text. Use `Array.from(value)` or code-point iteration
  instead of UTF-16 indexing when deriving initials or characters. Prefer
  `String#codePointAt()` over `String#charCodeAt()` when reading a character.
- Derive async image state from a stable source value rather than object
  identity, so inline `{ uri }` props do not reset error/loading state on each
  render. In Expo components, use `expo-image` where appropriate and show a
  theme-colored placeholder until the image is displayed.
- Every interactive control needs a meaningful accessible name, including when
  its visible label is empty or omitted. Preserve explicit `accessible`,
  `accessibilityLabel`, `accessibilityRole`, `accessibilityState`, and
  `accessibilityValue` props. Give icon-only controls an action label.
- Expose errors and instructions through accessible hints or text. Keep touch
  targets large enough to use, preserve keyboard and focus behavior, and hide
  purely decorative icons from the accessibility tree. Check loading, empty,
  disabled, and error states with a screen reader when possible.
- Import icons from `@guallet/luna-mobile/icons`. If a needed icon is missing,
  add a named export in `packages/guallet-luna-mobile/src/icons/` using Luna's
  1.5 stroke style, then import that export. Do not import an icon library
  directly into app components or use a text glyph as an icon.
- For overlapping or ordered children, assign a consistent stacking order to
  every item, including the first.

## Bottom sheets

Use `BottomSheet` from `@guallet/luna-mobile` for mobile bottom sheets. Control
visibility in the consuming component with React state:

```tsx
const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
```

Pass `isBottomSheetOpen` to `isOpen`, open the sheet by setting it to `true`,
and always set it back to `false` in `onClose`. The callback runs when the user
dismisses the sheet or presses its optional close icon. Update visibility before
running any additional close handling.

```tsx
import { useState } from 'react';
import { BottomSheet, Button } from '@guallet/luna-mobile';
import { Text } from 'react-native';

export function ExampleSheet() {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setIsBottomSheetOpen(true)}>Open sheet</Button>
      <BottomSheet
        isOpen={isBottomSheetOpen}
        title="Details"
        showCloseIcon
        onClose={() => setIsBottomSheetOpen(false)}
      >
        <Text>Sheet content</Text>
      </BottomSheet>
    </>
  );
}
```

Actions inside the sheet that finish or cancel the flow must also set
`isBottomSheetOpen` to `false`. Keep one visibility state as the source of truth.

## Review checklist

- [ ] Props, events, defaults, children, style overrides, and accessibility are
      explicit and typed.
- [ ] Every control has a spoken name, role, and relevant state/value; errors,
      empty states, and icon-only actions remain understandable with a screen reader.
- [ ] Icons come from Luna's mobile icon exports; missing icons were added there.
- [ ] Component uses theme tokens and native controls appropriately.
- [ ] Children are nested between component tags, not passed as a prop.
- [ ] Bottom sheets use `isBottomSheetOpen` state for `isOpen` and reset it to
      `false` in `onClose` and any completion or cancellation actions.
- [ ] No nested ternaries, avoidable complexity, hardcoded theme values, or
      UTF-16 character indexing remain.
- [ ] Component and types are exported through the right barrels.
- [ ] Sonar and repository checks relevant to the change have been reviewed.
