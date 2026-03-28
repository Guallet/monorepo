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

---

## Routing Decision Table

| What you want | File to create | Notes |
|---|---|---|
| New bottom tab | `apps/mobile/app/(tabs)/{name}.tsx` | Also add `<Tabs.Screen>` in `_layout.tsx` |
| Stack screen under a tab | `apps/mobile/app/{name}/index.tsx` | Navigate with `router.push('/{name}')` |
| Detail screen with param | `apps/mobile/app/{name}/[id].tsx` | Read param with `useLocalSearchParams()` |
| Modal screen | Create `apps/mobile/app/{name}.modal.tsx` or reuse `modal.tsx` | |

---

## 1. Tab Screen – `app/(tabs)/{name}.tsx`

```typescript
import { StyleSheet, View } from 'react-native';
import { Stack, Title, Label } from '@luna-ui/react-native';
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
<Tabs.Screen
  name="{name}"
  options={{
    title: '{Names}',
    tabBarIcon: ({ color }) => (
      <IconSymbol size={28} name="LIST_ICON_NAME.fill" color={color} />
    ),
  }}
/>
```

> `IconSymbol` uses SF Symbols on iOS and MaterialIcons on Android. Common names:
> - `house.fill` – home
> - `list.bullet` – list
> - `chart.pie.fill` – chart
> - `gearshape.fill` – settings
> - `plus.circle.fill` – add
> - `person.fill` – profile
> - `dollarsign.circle.fill` – finance

---

## 2. Stack Screen – `app/{name}/index.tsx`

```typescript
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack, Title, Button } from '@luna-ui/react-native';
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
import { Stack, Title, Label, Button } from '@luna-ui/react-native';
import { use{Name} } from '@guallet/api-react';

export default function {Name}DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { {domain}, isLoading } = use{Name}(id);

  if (!isLoading && !{domain}) {
    return (
      <View style={styles.container}>
        <Label>Not found.</Label>
        <Button onClick={() => router.back()}>Go back</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Label>Loading...</Label>
      ) : (
        <Stack>
          <Title>{domain}?.name}</Title>
          {/* Add detail fields here */}
          <Button onClick={() => router.back()}>Back</Button>
        </Stack>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
```

---

## Luna UI Component Reference

Import from `@luna-ui/react-native`.

| Component | Category | Use for |
|---|---|---|
| `Stack` | Layout | Vertical container (VStack equivalent) |
| `Group` | Layout | Horizontal container (HStack equivalent) |
| `Divider` | Layout | Horizontal separator line |
| `Title` | Typography | Bold page/section headings |
| `Label` | Typography | Body text and descriptions |
| `Button` | Buttons | Tappable buttons; `variant` = `"filled" \| "light" \| "outline" \| "subtle" \| "transparent"` |
| `TextInput` | Inputs | Text input field |
| `OtpInput` | Inputs | OTP/PIN entry |
| `Visibility` | Utility | Conditionally show/hide children: `<Visibility isVisible={bool}>` |
| `ModalLoaderOverlay` | Overlays | Full-screen loading overlay |

### Theme hooks
```typescript
import { useTheme } from '@luna-ui/react-native';
const theme = useTheme(); // access theme.colors, theme.spacing, etc.
```

---

## Navigation

```typescript
import { useRouter } from 'expo-router';
const router = useRouter();

router.push('/{name}');                // navigate forward
router.push(`/{name}/${id}`);          // navigate to detail
router.back();                         // go back
router.replace('/login');              // replace current screen
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

- [ ] Route file uses `export default function` (not named export)
- [ ] Screen wrapped in `<View style={{ flex: 1 }}>` to fill available space
- [ ] Styles defined with `StyleSheet.create({})`, not inline objects
- [ ] Tab screen registered in `(tabs)/_layout.tsx` if it's a new tab
- [ ] Navigation uses `useRouter()` from `expo-router`, not `react-navigation` directly
- [ ] Params read with `useLocalSearchParams()` for `[id]` route files
- [ ] No auth logic in the screen — layout handles it
