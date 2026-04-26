# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Guallet is a personal finance management platform built as a TypeScript monorepo with pnpm + Turborepo. It has three apps: a NestJS REST API, a Vite/React web app, and an Expo React Native mobile app.

## Common Commands

### Monorepo-wide (run from root)
```bash
pnpm dev           # Start all apps in dev mode
pnpm build         # Build all packages/apps
pnpm lint          # Lint all packages/apps
pnpm check-types   # TypeScript type-check all packages/apps
pnpm format        # Prettier format all TS/TSX/MD files
```

### Docker (development environment)
```bash
pnpm docker:compose:up     # Start PostgreSQL, Redis, pgAdmin
pnpm docker:compose:down   # Stop services
pnpm docker:compose:reset  # Stop and remove volumes
```

### API (apps/api)
```bash
pnpm --filter api dev          # Start with watch mode
pnpm --filter api build        # Compile with nest build
pnpm --filter api lint         # ESLint fix
pnpm --filter api test         # Run Jest unit tests
pnpm --filter api test:watch   # Jest watch mode
pnpm --filter api test:cov     # Jest with coverage
pnpm --filter api db:init      # Generate + migrate auth schema (Better Auth)
pnpm --filter api db:generate  # Generate Better Auth schema
pnpm --filter api db:migrate   # Run Better Auth migrations
```

### Webapp (apps/webapp)
```bash
pnpm --filter webapp dev       # Vite dev server
pnpm --filter webapp build     # tsc + vite build (runs i18n:extract first)
pnpm --filter webapp lint      # ESLint fix
pnpm --filter webapp i18n:extract  # Extract i18n keys
```

### Mobile (apps/mobile)
```bash
pnpm --filter mobile start     # Expo dev server
pnpm --filter mobile ios       # Run on iOS simulator
pnpm --filter mobile android   # Run on Android emulator
pnpm --filter mobile test      # Jest watch mode
```

### Money package (packages/guallet-money)
```bash
pnpm --filter guallet-money test      # Jest tests (80% coverage threshold enforced)
pnpm --filter guallet-money test:cov  # With coverage report
```

## Architecture

### Monorepo Structure

- `apps/api` — NestJS 11 backend (PostgreSQL + TypeORM, Redis + BullMQ, Better Auth)
- `apps/webapp` — Vite 7 + React 19 web frontend (TanStack Router + Query, Mantine UI 8, Zustand)
- `apps/mobile` — Expo 54 + React Native 0.81 mobile app (Expo Router, Luna UI)
- `packages/guallet-api-client` — TypeScript API client with type definitions
- `packages/guallet-api-react` — TanStack Query hooks wrapping the API client
- `packages/guallet-auth` — Better Auth configuration shared across apps
- `packages/guallet-money` — Type-safe money/currency library (tested to 80% coverage)
- `packages/guallet-theme` — Platform-agnostic design token types and default values
- `packages/guallet-ui-react` — Shared Mantine-based React components (web)
- `packages/guallet-ui-react-native` — Custom Luna UI React Native component library

### API Architecture (NestJS)

Feature-based modules under `apps/api/src/features/`: `accounts`, `budgets`, `categories`, `transactions`, `institutions`, `reports`, `rules`, `saving-goals`, `subscriptions`, `regular-payments`, `data-importer`, `data-exporter`, `openbanking`, `nordigen`, `webhooks`, `notifications`, `email`, `users`.

Auth lives in `apps/api/src/auth/` using Better Auth. Database configuration in `apps/api/src/database/`. Background jobs via BullMQ + Redis.

### Web Frontend Architecture

Routing is file-system based via TanStack Router in `apps/webapp/src/routes/`. Server state managed by TanStack Query (via `packages/guallet-api-react` hooks). Client state via Zustand. The React Compiler is enabled in the Vite config for automatic memoization.

Components organized in `apps/webapp/src/components/` (generic) and `apps/webapp/src/features/` (domain-specific). i18n via i18next — keys are auto-extracted on `prebuild`.

### Internal Package Usage

Internal packages are referenced via `workspace:*` protocol. The API client types flow from `guallet-api-client` → `guallet-api-react` hooks → webapp/mobile components. When changing API contracts, update `guallet-api-client` types first.

## Environment Setup

Copy the sample files before starting:
```bash
cp database.env.sample .env
cp api.env.sample apps/api/.env
cp webapp.env.sample apps/webapp/.env
```

Required services (start with Docker): PostgreSQL 18, Redis 8. Optional integrations (Nordigen for open banking, Resend for email, Sentry, Apitally) can be left blank.

## Testing

- API tests use Jest with `ts-jest`. No e2e tests are currently wired up (jest-e2e config exists but the npm script is commented out).
- `guallet-money` enforces 80% coverage thresholds on branches, functions, lines, and statements.
- Mobile tests run with `--watchAll` by default.

## Code Style

Prettier config: single quotes, trailing commas. ESLint 9 with shared config from `packages/eslint-config-custom`. Pre-commit hook (Husky) runs lint. TypeScript strict mode is used across all packages.

## UI & Design System

**Always consult [DESIGN.MD](./DESIGN.MD) before making any UI changes.** It is the single source of truth for colours, typography, spacing, radius, elevation, motion, and component rules.

Key rules at a glance:
- Use `useTheme()` from `@guallet/ui-react` for all design tokens — no hardcoded values
- Cards: `radius="lg"`, `shadow="sm"`, `withBorder`, white background
- Money: positive → `colors.support` (green), negative → `colors.error` (red), always `fontVariantNumeric: 'tabular-nums'`
- Every user-visible string must go through `t()` from `react-i18next`
