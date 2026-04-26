# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm --filter webapp dev          # Vite dev server on port 3000
pnpm --filter webapp build        # tsc + vite build (runs i18n:extract first)
pnpm --filter webapp lint         # ESLint fix
pnpm --filter webapp i18n:extract # Extract i18n keys from source
```

Run from the monorepo root. No test suite in the webapp itself.

## Architecture

### Routing

TanStack Router with file-system routing. **`src/routeTree.gen.ts` is auto-generated — never edit it manually.** The router plugin regenerates it on dev/build.

- `src/routes/__root.tsx` — root layout (providers, devtools)
- `src/routes/_app.tsx` — authenticated layout guard (redirects to `/login` if unauthenticated), wraps `GualletAppShell`
- `src/routes/_app/<feature>/` — protected feature routes
- `src/routes/login`, `register`, `privacy`, `terms` — public routes

Route files are thin: they define `createFileRoute(...)` and render the feature screen component. Business logic lives in the screen, not the route.

### Feature structure

```
src/features/<domain>/
  screens/     # Screen (container) components — fetch data, own layout
  components/  # Presentational sub-components for this feature
  models/      # Local type extensions or mappers (not API types)
```

Pattern: route file → screen component → sub-components. Screens use `BaseScreen` from `src/components/Screens/BaseScreen.tsx` to get a loading overlay.

### Data fetching

- API client singleton: `src/api/gualletClient.ts` (created once, injects the auth session token)
- TanStack Query hooks come from `@guallet/api-react` (workspace package)
- Never call `gualletClient` directly in components — use the hooks from `@guallet/api-react`

### Auth

`src/auth/auth.ts` creates the Better Auth client via `@guallet/auth`. Use `useAuth()` from `@guallet/auth` to read session state.

### UI

Mantine 8 is the component library. Forms use `@mantine/form` + `mantine-form-zod-resolver` + Zod. The `@/` path alias maps to `src/`.

### Design system

**Read [DESIGN.MD](../../DESIGN.MD) before any UI work.** It covers colors, typography, spacing, radius, elevation, motion, and component rules. The summary below captures the most frequently needed constraints, but the full spec lives there.

### Component conventions

**One component per file.** Every exported component lives in its own `.tsx` file named after it.

**Props interface extends the base Mantine component.** When a component wraps a Mantine element, its props interface must extend that element's props type so callers can pass through any native prop:

```tsx
// e.g. a component based on Avatar
interface AccountAvatarProps extends AvatarProps {
  account: AccountDto;
}

export function AccountAvatar({
  account,
  ...props
}: Readonly<AccountAvatarProps>) {
  return <Avatar {...props}>{/* ... */}</Avatar>;
}
```

- Always accept props as `Readonly<XxxProps>`.
- Spread `...props` onto the underlying Mantine component so size, radius, style, etc. can be overridden by the caller.
- Merge `style` explicitly (`{ ...defaultStyle, ...props.style }`) so callers can still add inline styles.

**Prefer Mantine layout components over HTML elements.** Use Mantine's layout primitives instead of raw `div`s for any structural element:

- `Stack` — vertical arrangement with consistent gap
- `Group` — horizontal arrangement with consistent gap
- `Flex` — flexible layout needing custom direction or alignment
- `Grid` / `SimpleGrid` — multi-column grids
- `Container` — centred, max-width content wrapper
- `Center` — single-child horizontal + vertical centering
- `Box` — generic styled wrapper (replaces unstyled `div`/`span`)

Only use raw HTML elements (`div`, `span`, `section`, etc.) when no Mantine component fits and the semantic element matters (e.g. `<main>`, `<nav>`, `<article>`).

**No hardcoded design values.** Never use raw numbers or strings for spacing, colors, or typography. Always pull values from the design system via `useTheme()` from `@guallet/ui-react`:

```tsx
import { useTheme } from '@guallet/ui-react';

export function MyComponent() {
  const { spacing, colors, typography, borderRadius } = useTheme();

  return (
    <Box style={{ padding: spacing.md, borderRadius: borderRadius.md }}>
      ...
    </Box>
  );
}
```

The available tokens are:

| Token group   | Keys |
|---------------|------|
| `spacing`     | `none` · `xs` (4) · `sm` (8) · `md` (16) · `lg` (24) · `xl` (32) · `xxl` (40) |
| `borderRadius`| `xs` · `sm` · `md` · `lg` · `xl` |
| `colors`      | `primary` · `secondary` · `error` · `success` · `warning` · `pageBackground` · … |
| `typography`  | `fontFamily` · `fontFamilyMono` · size/weight scales |

### React Compiler

`babel-plugin-react-compiler` is enabled in the Vite config. The compiler handles memoization automatically — avoid sprinkling `useMemo`/`useCallback` unless profiling shows a real need.

### i18n

English (default) and Spanish. Translation JSON files live in `public/locales/<lng>/translation.json`. Keys are extracted automatically (`prebuild` script) — use `useTranslation` + `t('key')` and let the extractor handle `en` keys. Don't hand-edit the generated JSON.

**No hardcoded user-visible strings.** Every string rendered to the UI must go through `t()`. Always provide a sensible English default as the second argument so the app works before translations are extracted:

```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <Text>{t('feature.myFeature.someLabel', 'My label')}</Text>
  );
}
```

For plurals, pass `count` and use `defaultValue_one` / `defaultValue_other`:

```tsx
t('feature.accounts.list.header.accountCount', {
  count: accounts.length,
  defaultValue_one: '{{count}} account',
  defaultValue_other: '{{count}} accounts',
})
```

Key naming convention: `<scope>.<feature>.<screen>.<element>` — e.g. `feature.accounts.list.title`, `screens.budgets.list.emptyState.description`.

### Environment variables

Must be prefixed `VITE_`. Copy `webapp.env.sample` (in monorepo root) to `apps/webapp/.env`. Required var: `VITE_API_URL` (default `http://localhost:5000`).
