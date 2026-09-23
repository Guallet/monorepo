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
  instead of UTF-16 indexing when deriving initials or characters.
- Derive async image state from a stable source value rather than object
  identity, so inline `{ uri }` props do not reset error/loading state on each
  render. In Expo components, use `expo-image` where appropriate and show a
  theme-colored placeholder until the image is displayed.
- Preserve accessibility: labels should make controls discoverable by default;
  honor explicitly supplied `accessible`, role, state, and label props.
- For overlapping or ordered children, assign a consistent stacking order to
  every item, including the first.

## Review checklist

- [ ] Props, events, defaults, children, style overrides, and accessibility are
      explicit and typed.
- [ ] Component uses theme tokens and native controls appropriately.
- [ ] Children are nested between component tags, not passed as a prop.
- [ ] No nested ternaries, avoidable complexity, hardcoded theme values, or
      UTF-16 character indexing remain.
- [ ] Component and types are exported through the right barrels.
- [ ] Sonar and repository checks relevant to the change have been reviewed.
