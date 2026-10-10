# Safe areas and keyboard layout

Device safe areas protect content from notches, system bars, and the home
indicator. Keyboard avoidance is separate: the focused field must be visible,
and every field and action must remain reachable by scrolling.

## Screen ownership

- Keep one `SafeAreaProvider` and one `KeyboardProvider` around navigation.
- Use `AppScreen` for stack screens. It protects left/right/bottom edges;
  a hidden header also enables the top edge. Its background fills the screen.
- Use `safeAreaEdges` when navigation already owns an edge. Tab screens
  protect top/left/right; the tab navigator owns bottom padding.
- Do not add another safe-area wrapper or duplicate inset padding inside an
  `AppScreen`. Use Luna theme spacing for ordinary content gutters.

## Input screens

Use `KeyboardAwareScrollView` from `@guallet/luna-mobile`. It reveals the
focused input, adds keyboard scroll space, forwards scroll props and refs,
and allows handled taps while typing. Include Save/Continue/Cancel actions
inside its content. Use `flexGrow`, rather than fixed content heights.

Do not wrap it in `KeyboardAvoidingView` or enable automatic keyboard
insets. The wrapper owns keyboard adjustment and `AppScreen` owns device
insets. Android uses `resize`; tabs hide while the keyboard is displayed.
Preserve virtualized lists instead of nesting them in another vertical scroll.

## Native sheets

Always use Luna `BottomSheet`. Keep its `RNHostView` touch and size bridge.
Native SwiftUI/Compose sheet layout owns system and keyboard insets; do not
apply root-screen keyboard heights inside that separate presentation.
Searchable pickers use full-height snap points, a flex container, and a bounded
scrollable results list with `keyboardShouldPersistTaps="handled"`.
Actions must remain reachable in the resized presentation.

## Verification and release

The controller is a native dependency; rebuild development clients and ship a
new native build. An OTA-only update cannot add the module.

Verify on a small iPhone, an iPad, and Android with gesture and button navigation:

- Focus first/last fields and switch focus while the keyboard stays open.
- Try password, OTP, numeric and multiline inputs, including validation errors.
- Scroll to and tap every form action without dismissing the keyboard first.
- Search sheet results, scroll/select/apply, and dismiss/reopen sheets.
- Dismiss via dragging, system controls and Android Back; confirm no leftover
  keyboard gaps and correct header/tab/home-indicator spacing.
- Check larger text and hardware keyboards. On iPad, also test floating keyboards.

Unit tests check inset ownership; native overlap needs device verification.

References: [Expo keyboard handling](https://docs.expo.dev/guides/keyboard-handling/)
and [Expo safe areas](https://docs.expo.dev/develop/user-interface/safe-areas/).
