---
name: add-mobile-screen
description: Add a new screen to the Expo React Native mobile app using Expo Router. Covers tab screens, stack screens, and detail screens. Use when adding new pages to apps/mobile.
---

# add-mobile-screen

Adds a new screen to the Expo mobile app following the file-based routing pattern.

> **Placeholders:** Replace `{Name}` with PascalCase (e.g. `Budget`), `{name}` with kebab-case (e.g. `budget`), `{names}` with plural kebab-case (e.g. `budgets`), `{domain}` with camelCase (e.g. `budget`), `{domains}` with plural camelCase (e.g. `budgets`).

## Critical: Expo Router File Requirements

- **Route files MUST use `export default function`** — named exports are silently ignored by Expo Router.
- Route file name becomes the URL segment: `budgets.tsx` → `/budgets`.
- `[id].tsx` creates a dynamic segment: `/budgets/abc123`.
- Do not use ternary expressions in screen components. Use early returns for
  distinct screen states, `&&` for optional elements, and named variables or
  helper functions with `if` statements for derived values.
- Prefer `String#codePointAt()` over `String#charCodeAt()` when reading Unicode
  characters. Iterate strings with `for...of` or `Array.from()` so characters
  outside the basic multilingual plane remain intact.

## Required: Mobile forms

- Every new mobile screen or screen component that edits and submits data must
  use `useForm` and `form.Field` from `@tanstack/react-form` directly in the
  screen. Bind Luna controls with `value={field.state.value}`,
  `onChangeText={field.handleChange}`, and `onBlur={field.handleBlur}`. Keep
  submitted values and validation in TanStack Form; do not add a shared form
  adapter layer or a separate form-state library.
- Define the form schema with `z.object(...)` alongside the screen and pass
  that schema to `validators.onDynamic`. Use `revalidateLogic()` so errors
  appear after submission and revalidate as the user corrects input. Define
  defaults, listeners, and `onSubmit` in the screen's `useForm` options. Keep
  server request errors separate from field validation and clear them when
  values change. Add Zod as a direct mobile dependency if it is not already
  declared.
- Render Zod field issues from `field.state.meta.errors[0]?.message` into
  Luna's `error` prop. Use `form.Subscribe` for reactive UI and `useSelector`
  for values needed in navigation; reading `form.state` alone does not
  subscribe.
- Submit through `form.handleSubmit()`. Use a screen-local async handler that
  checks `form.state.isSubmitting` before calling it, and use that same handler
  for buttons and keyboard submission. Subscribe to `canSubmit` and
  `isSubmitting` to keep submit controls current. Await the API mutation or auth
  action in `onSubmit`.
- Keep picker visibility and password visibility in local UI state. For
  non-text controls, bind their selected values through `form.Field` and keep
  temporary sheet selections local until confirmation.
- Preserve edit initialization, normalization, money precision, and discard
  behavior. Do not reset edits on background refetch. `isDirty` stays true even
  after reverting changes; compare normalized values when that distinction
  matters. Schema transforms require explicit parsing at submission.
- For TanStack Form
  React Native behavior, see the
  [React Native guide](https://tanstack.com/form/latest/docs/framework/react/guides/react-native)
  and [quick start](https://tanstack.com/form/latest/docs/framework/react/quick-start).
  For Zod with `onDynamic`, see the
  [Standard Schema validation guide](https://tanstack.com/form/latest/docs/framework/react/guides/dynamic-validation#standard-schema-validation).
  Existing screens only need migration when the task explicitly includes them.

```tsx
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const form = useForm({
  defaultValues: { email: '', password: '' },
  validationLogic: revalidateLogic(),
  validators: { onDynamic: formSchema },
  onSubmit: async ({ value }) => {
    await signIn(value.email, value.password);
  },
});
```

## Images

- Use `Image` from `expo-image` for every image rendered in the mobile app; do
  not import `Image` from `react-native`.
- Remote images must handle `onError` and provide a visible fallback, such as
  initials or a placeholder, so an unreachable URL never leaves a blank state.
- Track the failed image URL when the fallback depends on the current source;
  this allows a changed URL to be tried independently.

## Accessibility and icons

- For money amounts, use `@guallet/money` and `Money.format()` for display.
  Derive input and calculation precision from `Currency.decimalPlaces`; never
  hardcode two decimal places or create a local currency formatter.

- Every screen and component must work with VoiceOver and TalkBack. Give each
  interactive control a meaningful accessible name, role, and relevant state or
  value, even if its visible label is hidden or empty. Label icon-only actions.
- Keep text readable at larger font sizes and touch targets easy to reach. Make
  loading, empty, error, and disabled states understandable to a screen reader;
  expose field errors as accessible hints or text. Hide decorative icons from
  the accessibility tree, and check focus and keyboard behavior.
- Use icons from `@guallet/luna-mobile/icons`, including tab icons. When an
  icon is missing, add a named Luna export in
  `packages/guallet-luna-mobile/src/icons/` first. Avoid direct imports from
  icon libraries, `IconSymbol`, emoji, or Unicode glyphs for new UI icons.

---

## Routing Decision Table

| What you want            | File to create                                                 | Notes                                     |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------------- |
| New bottom tab           | `apps/mobile/app/(tabs)/{name}.tsx`                            | Also add `<Tabs.Screen>` in `_layout.tsx` |
| Stack screen under a tab | `apps/mobile/app/{name}/index.tsx`                             | Navigate with `router.push('/{name}')`    |
| Detail screen with param | `apps/mobile/app/{name}/[id].tsx`                              | Read param with `useLocalSearchParams()`  |
| Modal screen             | Create `apps/mobile/app/{name}.modal.tsx` or reuse `modal.tsx` |                                           |

---

## 1. Tab Screen – `app/(tabs)/{name}.tsx`

```typescript
import { StyleSheet, View } from 'react-native';
import { Stack, Title, Label } from '@guallet/luna-mobile';
import { use{Name}s } from '@guallet/api-react';

export default function {Name}sScreen() {
  const { {domains}, isLoading } = use{Name}s();

  return (
    <View style={styles.container}>
      <Title>{Names}</Title>
      {isLoading && <Label>Loading...</Label>}
      {!isLoading && {domains}.length === 0 && (
        <Label>No {names} yet.</Label>
      )}
      {/* Render list items here */}
      <Stack>
        {!isLoading && {domains}.map((item) => (
          <Label key={item.id}>{item.name}</Label>
        ))}
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

### Register the new tab in `app/(tabs)/_layout.tsx`

```typescript
import { HomeIcon } from '@guallet/luna-mobile/icons';

<Tabs.Screen
  name="{name}"
  options={{
    title: '{Names}',
    tabBarIcon: ({ color }) => <HomeIcon size={28} color={color} />,
  }}
/>
```

Choose a Luna icon that matches the destination; `HomeIcon` is only an example.

---

## 2. Stack Screen – `app/{name}/index.tsx`

```typescript
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack, Title, Button } from '@guallet/luna-mobile';
import { use{Name}s } from '@guallet/api-react';

export default function {Name}ListScreen() {
  const router = useRouter();
  const { {domains}, isLoading } = use{Name}s();

  return (
    <View style={styles.container}>
      <Stack>
        <Title>{Names}</Title>
        <Button onClick={() => router.push('/{name}/new')}>
          New {Name}
        </Button>
      </Stack>
      <FlatList
        data={{domains}}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Button
            variant="subtle"
            onClick={() => router.push(`/{name}/${item.id}`)}
          >
            {item.name}
          </Button>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
```

---

## 3. Detail Screen with Param – `app/{name}/[id].tsx`

```typescript
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack, Title, Label, Button } from '@guallet/luna-mobile';
import { use{Name} } from '@guallet/api-react';

export default function {Name}DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { {domain}, isLoading } = use{Name}(id);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Label>Loading...</Label>
      </View>
    );
  }

  if (!{domain}) {
    return (
      <View style={styles.container}>
        <Label>Not found.</Label>
        <Button onClick={() => router.back()}>Go back</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack>
        <Title>{domain}?.name</Title>
        {/* Add detail fields here */}
        <Button onClick={() => router.back()}>Back</Button>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
```

---

## Luna UI Component Reference

Import from `@guallet/luna-mobile`.

| Component            | Category   | Use for                                                                                       |
| -------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `Stack`              | Layout     | Vertical container (VStack equivalent)                                                        |
| `Group`              | Layout     | Horizontal container (HStack equivalent)                                                      |
| `Divider`            | Layout     | Horizontal separator line                                                                     |
| `Title`              | Typography | Bold page/section headings                                                                    |
| `Label`              | Typography | Body text and descriptions                                                                    |
| `Button`             | Buttons    | Tappable buttons; `variant` = `"filled" \| "light" \| "outline" \| "subtle" \| "transparent"` |
| `TextInput`          | Inputs     | Text input field                                                                              |
| `OtpInput`           | Inputs     | OTP/PIN entry                                                                                 |
| `Visibility`         | Utility    | Conditionally show/hide children: `<Visibility isVisible={bool}>`                             |
| `ModalLoaderOverlay` | Overlays   | Full-screen loading overlay                                                                   |

### Theme hooks

```typescript
import { useTheme } from '@guallet/luna-mobile';
const theme = useTheme(); // access theme.colors, theme.spacing, etc.
```

---

## Navigation

```typescript
import { useRouter } from 'expo-router';
const router = useRouter();

router.push('/{name}'); // navigate forward
router.push(`/{name}/${id}`); // navigate to detail
router.back(); // go back
router.replace('/login'); // replace current screen
```

For reading route params in `[id].tsx`:

```typescript
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams<{ id: string }>();
```

---

## Using API Hooks

Both webapp and mobile use the same `@guallet/api-react` hooks — no platform-specific layer needed:

```typescript
import { use{Name}s, use{Name}, use{Name}Mutations } from '@guallet/api-react';

// List
const { {domains}, isLoading } = use{Name}s();

// Single item
const { {domain}, isLoading } = use{Name}(id);

// Mutations
const { create{Name}Mutation, update{Name}Mutation, delete{Name}Mutation } = use{Name}Mutations();

create{Name}Mutation.mutate(
  { request: { name: 'New item' } },
  { onSuccess: () => router.back(), onError: console.error },
);
```

---

## Auth

Auth is handled globally by the `(tabs)/_layout.tsx`:

- It checks `useAuth()` from `@guallet/auth` and redirects to `/login` if not authenticated.
- Individual screens **do not** need their own auth checks.

---

## Checklist

- [ ] New forms use `useForm`/`form.Field` directly with controlled Luna inputs
- [ ] Field values/validation are form-owned; requests are awaited and button
      and keyboard submission share a guarded `form.handleSubmit()` handler
- [ ] Validation, failed requests, corrections, and concurrent submissions are
      covered by focused tests when adding a form
- [ ] Route file uses `export default function` (not named export)
- [ ] Screen wrapped in `<View style={{ flex: 1 }}>` to fill available space
- [ ] Styles defined with `StyleSheet.create({})`, not inline objects
- [ ] Tab screen registered in `(tabs)/_layout.tsx` if it's a new tab
- [ ] Navigation uses `useRouter()` from `expo-router`, not `react-navigation` directly
- [ ] Params read with `useLocalSearchParams()` for `[id]` route files
- [ ] No auth logic in the screen — layout handles it
- [ ] No ternary expressions in screens; use early returns, `&&`, or named
      conditional values instead
- [ ] Images use `expo-image` and remote image failures have a visible fallback
- [ ] Controls, screen states, and navigation are accessible with VoiceOver and
      TalkBack, including empty labels, errors, and icon-only actions
- [ ] Icons use `@guallet/luna-mobile/icons`; missing icons are added to Luna
