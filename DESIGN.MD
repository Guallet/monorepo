# Guallet Design System

> Open-source personal finances, made transparent.

Guallet is a free, open-source personal finance manager. The visual system is
**blue-led, generous whitespace, soft cards, and clear income-vs-expense
semantics**. Brand voice: honest, calm, and practical. No hustle copy, no
jargon, no dark patterns.

This document is the design source-of-truth for engineering. Every value here
is implemented in `packages/guallet-theme/` and wired into Mantine via
`packages/guallet-ui-react/src/theme/createMantineTheme.ts`.

---

## Hard rules (never violate)

1. **Money colour** — positive amounts → `--gu-money-pos` / `colors.support`
   (green). Negative → `--gu-money-neg` / `colors.error` (red). Tabular-nums
   always. Same colour, same meaning, everywhere.
2. **Card signature** — white bg + 1 px `--gu-border` hairline + `radius="lg"`
   (16 px) + `shadow="sm"` or `shadow="md"`. Drop none of the three.
3. **Gradients** — only on the marketing hero. Nowhere else in the app.
4. **Typography** — **Inter Variable** (loaded via `@fontsource-variable/inter`
   in `App.tsx`). Weights 400 / 500 / 600 / 700 only. Negative tracking on
   headings (`-0.02em` h1 → `-0.01em` h3).
5. **No emoji** in chrome. No AI/Smart/Magic copy. No purple, pink, or warm
   orange in the brand palette.
6. **Icons** — Tabler Icons, `1.5` stroke, `24 px`. Import from
   `@tabler/icons-react`.
7. **No hardcoded values** — always pull spacing, colour, and radius from
   `useTheme()` (from `@guallet/ui-react`), not raw numbers/strings.
8. **Sentence case** for all UI labels and buttons. UPPERCASE only for eyebrow
   widget labels (`TOTAL WEALTH`). Title Case in nav items only.

---

## Colour palette

| Token (CSS var) | Hex | Usage |
|---|---|---|
| `--gu-primary` | `#005EB8` | Buttons, links, logo, nav active |
| `--gu-secondary` | `#41B6E6` | Accents, badges |
| `--gu-accent-dark` | `#003087` | Deep blue hover |
| `--gu-accent-bright` | `#0072CE` | Interactive highlights |
| `--gu-accent-light` | `#41B6E6` | Light chip/badge fills |
| `--gu-accent-aqua` | `#00A9CE` | Tertiary accent — use sparingly |
| `--gu-support` | `#009639` | **Income / positive deltas / success** |
| `--gu-support-light` | `#78BE20` | Secondary positive |
| `--gu-support-dark` | `#006747` | Darkest green |
| `--gu-support-aqua` | `#00A499` | Teal variant |
| `--gu-error` | `#DA291C` | **Expense / destructive / failed states** |
| `--gu-success` | `#78BE20` | Success toasts |
| `--gu-warning` | `#FAE100` | Warnings |
| `--gu-black` | `#231F20` | Primary text |
| `--gu-grey-dark` | `#425563` | Secondary text |
| `--gu-grey-mid` | `#768692` | Tertiary / dimmed text |
| `--gu-grey-pale` | `#E8EDEE` | Dividers, content hairlines |
| `--gu-page` | `#F7FAFC` | App shell page background |
| `--gu-surface` | `#F5F5F5` | Row hover, subtle fills |
| `--gu-border` | `#E5E7EB` | Card border |

The palette is NHS-derived (cool, trustworthy blue family). There is no purple,
pink, or warm orange in the brand.

### Guallet theme tokens → Mantine

The `defaultColors` in `packages/guallet-theme/src/colors.ts` maps to:

| Theme key | Mantine color name | Mantine `primaryColor` |
|---|---|---|
| `colors.primary` | `"primary"` | ✅ yes |
| `colors.error` | `"error"` | — |
| `colors.success` | `"success"` | — |
| `colors.warning` | `"warning"` | — |

`primaryShade: 6` — Mantine uses shade index 6 as the default interactive
state (matches `#005EB8` after `generateColors` processing).

---

## Typography

**Typeface**: Inter Variable — self-hosted via `@fontsource-variable/inter`,
imported in `apps/webapp/src/App.tsx`.

| Scale token | px | Usage |
|---|---|---|
| `xs` | 12 | Captions, metadata |
| `sm` | 14 | Secondary body, row meta |
| `md` | 16 | Primary body |
| `lg` | 20 | Large body / small headings |
| `xl` | 24 | Section headings |
| `xxl` | 32 | Page titles |

### Heading scale

| Level | px | Weight | Letter-spacing |
|---|---|---|---|
| h1 | 32 | 700 bold | −0.02em |
| h2 | 28 | 700 bold | −0.015em |
| h3 | 24 | 600 semibold | −0.01em |
| h4 | 20 | 600 semibold | 0 |
| h5 | 18 | 500 medium | 0 |
| h6 | 16 | 500 medium | 0 |

**Eyebrow labels** — `text-transform: uppercase`, `letter-spacing: 0.04em`,
`font-weight: 600`, colour `--gu-fg-3` (grey-mid). Used for dashboard widget
headers (`TOTAL WEALTH`, `RECENT TRANSACTIONS`).

**Money amounts** — `font-variant-numeric: tabular-nums`, `font-weight: 700`.
Use the `.gu-money` utility class or `fontVariant="tabular-nums"` on
`<NumberFormatter>`.

### Font stack

```
"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif
```

Set in `defaultTypography.fontFamily` and propagated to Mantine via
`createMantineGualletTheme`.

---

## Spacing

Linear scale: 0 / 4 / 8 / 16 / 24 / 32 / 40 px.
**16 px (`md`) is the canonical gutter** — card padding, row padding, sidebar
padding all snap to it.

| Token | px | CSS var |
|---|---|---|
| `none` | 0 | `--gu-space-0` |
| `xs` | 4 | `--gu-space-xs` |
| `sm` | 8 | `--gu-space-sm` |
| `md` | 16 | `--gu-space-md` |
| `lg` | 24 | `--gu-space-lg` |
| `xl` | 32 | `--gu-space-xl` |
| `xxl` | 40 | `--gu-space-xxl` |

---

## Border radius

| Token | px | CSS var | Usage |
|---|---|---|---|
| `xs` | 2 | `--gu-radius-xs` | — |
| `sm` | 4 | `--gu-radius-sm` | — |
| `md` | 8 | `--gu-radius-md` | Buttons, inputs, badges |
| `lg` | 16 | `--gu-radius-lg` | **Widget cards, modals, dashboard tiles** |
| `xl` | 32 | `--gu-radius-xl` | Hero badges, date-range pill only |

---

## Elevation (shadows)

| Token | Value | Usage |
|---|---|---|
| `xs` | `0 1px 2px rgba(0,0,0,.04)` | Chips, small raised elements |
| `sm` | `0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.04)` | Default card shadow |
| `md` | `0 4px 12px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04)` | Dashboard widget cards |
| `lg` | `0 12px 24px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04)` | Elevated panels |
| `xl` | `0 24px 48px rgba(0,0,0,.10), 0 4px 8px rgba(0,0,0,.04)` | Modals, overlays |

Cards on hover animate from `md` → `xl` with `translateY(-2px)`.

---

## Breakpoints

| Token | em | px equiv. |
|---|---|---|
| `xs` | 36em | ~576 px |
| `sm` | 48em | ~768 px |
| `md` | 62em | ~992 px |
| `lg` | 75em | ~1200 px |
| `xl` | 88em | ~1408 px |

Navbar collapses below `sm` (48em). Passed directly to Mantine via
`createMantineGualletTheme`.

---

## Motion

| Purpose | Duration | Easing |
|---|---|---|
| Hover state changes | `150ms` | `cubic-bezier(0.2, 0, 0, 1)` |
| State transitions | `200ms` | same |
| Landing scroll-in | `600ms` | same |

- **Hover lift**: `translateY(-2px)` + shadow step up. Used on widget cards.
- **Chevron open/close**: `rotate(-90deg)` at 200ms.
- **Press (web)**: `transform: scale(0.99)`.
- No bounces, no spring, no marquee, no parallax.

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  AppShell.Header — 60 px sticky                     │
├──────────────────┬──────────────────────────────────┤
│ AppShell.Navbar  │  AppShell.Main                   │
│ 300 px           │  padding="md" (16 px)            │
│ collapses < sm   │  bg=colors.pageBackground (#F7FAFC)│
└──────────────────┴──────────────────────────────────┘
```

- Page background: `colors.pageBackground` (`#F7FAFC`)
- Cards: `bg="white"` + `radius="lg"` + `shadow="sm"` + `withBorder`
- Grid: 12-col Mantine grid, `gutter="md"`. Dashboard tiles: `12 / 6 / 3`.
- Max container width: `xl` (88em).

---

## Backgrounds

| Surface | Value |
|---|---|
| Page / app shell | `#F7FAFC` flat — never gradient, never patterned |
| Cards / sheets | White, `radius="lg"`, `shadow="sm/md"`, 1 px `#E5E7EB` border |
| Row hover | `#F8F9FA` (`gray.0`) |
| Marketing hero | Blue → violet 135° gradient — **only here** |
| Sticky landing header | `rgba(255,255,255,0.85)` + `backdrop-filter: blur(10px)` |

---

## Borders

| Usage | Value |
|---|---|
| Card border | `1px solid #E5E7EB` |
| Content divider | `1px solid #E8EDEE` |
| Empty-state dashed border | `2px dashed #D1D5DB` |

Never use a coloured left-border stripe as an accent.

---

## Iconography

- **Set**: Tabler Icons — outline, `strokeWidth={1.5}`, default size 24 px
- **Package**: `@tabler/icons-react`
- **Wrapper**: `<GualletIcon iconName="IconBuildingBank">` type-checks against
  Tabler exports and falls back to `IconQuestionMark`
- **No emoji** in chrome (emoji only in user-generated content like category names)
- **No Unicode glyph substitutions** for currency — use `Intl.NumberFormat`

---

## Components

### Card / widget (design signature)

```tsx
<Card radius="lg" shadow="sm" withBorder padding="lg">
  ...
</Card>
```

Must have all three: `withBorder` + `shadow` + `radius="lg"`. This three-piece
combination is the Guallet card signature.

### AmountLabel

Positive amounts use `color={colors.support}`, negative use `color={colors.error}`.
Always `fontVariant="tabular-nums"` / `font-variant-numeric: tabular-nums`.

### TransactionRow

- **Left avatar (40 px circle)**: institution logo (bank brand mark). Falls
  back to coloured initial when no logo.
- **Category badge (20 px, bottom-right of avatar)**: coloured chip with Tabler
  icon for the category. White ring around it.
- **Meta line**: category name (coloured to match badge) + account name after `·`
- **Amount**: right-aligned, bold, green or red per money colour rule.

### EmptyState

Centred panel with a 48 px greyed Tabler icon + dashed `2 px #D1D5DB` border.
`icon`, `title`, and `description` props.

### Button variants

Mantine `variant` prop:

| Variant | When to use |
|---|---|
| `filled` | Primary action |
| `light` | Secondary action in filled context |
| `outline` | Secondary in white context |
| `subtle` | Tertiary / nav actions |
| `transparent` | Icon-only actions |

Hover: filled darkens 6%, light/outline darken bg 4%.  
Disabled: `bg="#D1D5DB"`, `color="#9CA3AF"`. Never opacity hack.

---

## Content voice

- **UK English**. Sentence case everywhere (buttons, labels, titles).
- No marketing exclamation marks. No "Just" / "Simply" / "Easy".
- No "AI", "Smart", or "Magic" — the product is deterministic.
- Currency formatted via `Money.fromCurrencyCode` (symbol first, locale thousands
  separator): `£1,234.56` / `€1.234,56`.
- Numbers ≤ 10 spelled out; ≥ 11 as digits.

### Canonical copy examples

| Surface | Copy |
|---|---|
| App tagline | "Your finances, under control." |
| CTA | "Get started — it's free." |
| Privacy | "Your financial data stays yours." |
| Auth | "Log in" · "Create account" · "Create your free account" |
| Empty state | "No transactions found." |
| Open-source pitch | "Open Source & Free Forever" |

---

## Implementation files

| File | Purpose |
|---|---|
| `packages/guallet-theme/src/colors.ts` | `defaultColors` — all hex values |
| `packages/guallet-theme/src/typography.ts` | Font family + scale |
| `packages/guallet-theme/src/spacing.ts` | Spacing tokens |
| `packages/guallet-theme/src/borderRadius.ts` | Radius tokens |
| `packages/guallet-theme/src/breakpoints.ts` | Breakpoint tokens |
| `packages/guallet-ui-react/src/theme/createMantineTheme.ts` | Wires guallet-theme into Mantine |
| `packages/guallet-ui-react/src/theme/GualletThemeProvider.tsx` | React provider — wrap app with this |
| `apps/webapp/src/App.tsx` | Imports `@fontsource-variable/inter` + `GualletThemeProvider` |
| `apps/webapp/src/index.css` | CSS custom properties mirror of all tokens |

### Consuming tokens in components

```tsx
import { useTheme } from '@guallet/ui-react';

export function MyComponent() {
  const { spacing, colors, borderRadius } = useTheme();
  return (
    <Box style={{ padding: spacing.md, borderRadius: borderRadius.lg, background: colors.pageBackground }}>
      ...
    </Box>
  );
}
```

Never hardcode `16`, `#F7FAFC`, or `16px` — always go through `useTheme()`.

---

## Caveats

- **Dark mode** — not yet shipped. Mantine's `light-dark()` is used in some
  component overrides; full dark tokens are not in `@guallet/theme`. System is
  light-only until dark tokens are added.
- **Imagery** — no photography or illustration in the codebase. Empty states
  use a greyed Tabler icon on a dashed border panel.
- **Landing page gradient** — blue → violet 135°. This is the only gradient in
  the product; do not replicate elsewhere.
