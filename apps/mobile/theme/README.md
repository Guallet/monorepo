# App theme

`AppThemeProvider` owns the device-wide appearance preference. It lives above
navigation and authentication so signed-out screens use the saved theme too.
Signing out does not reset this preference.

System is the default. Light and Dark override both Luna's theme and React
Native's native appearance. Selecting System removes the native override with
`'unspecified'`, as required by [React Native 0.86's Appearance API](https://reactnative.dev/docs/0.86/appearance#setcolorscheme). Web
uses Luna's theme without calling the unsupported native appearance setter.

Startup waits up to 1.5 seconds for AsyncStorage before falling back to System.
`AuthNavigator` retains the native splash until authentication and navigation
are ready. Missing, invalid, failed, and stalled reads all use System. A read
that completes after the timeout is ignored, so it cannot overwrite a later
user selection.

Writes complete before the active theme changes. If a write fails, the theme
stays unchanged and `ThemePreferenceRow` displays an error. The shared
`SelectionSheet` closes immediately after a choice; it does not await saving.

Focused checks:

```bash
pnpm --filter mobile test theme components/ui/SelectionSheet.test.tsx
pnpm --filter mobile lint
```
