# Guallet Monorepo – Agent Reference

Use this file as the canonical repository guidance for all coding agents. Skill
files under `.agents/skills/` contain detailed, task-specific workflows.

## Repo at a Glance

| App / Package     | Tech                                                 | Path                           |
| ----------------- | ---------------------------------------------------- | ------------------------------ |
| API               | NestJS 11, TypeORM, Better Auth, BullMQ              | `apps/api`                     |
| Webapp            | Vite 7, React 19, TanStack Router + Query, Mantine 8 | `apps/webapp`                  |
| Mobile            | Expo 54, React Native 0.81, Expo Router, Luna UI     | `apps/mobile`                  |
| API client types  | TypeScript (no runtime, types + fetch wrappers)      | `packages/guallet-api-client`  |
| React query hooks | TanStack Query wrappers over the API client          | `packages/guallet-api-react`   |
| Authentication    | Better Auth configuration shared across apps         | `packages/guallet-auth`        |
| Design tokens     | Platform-agnostic theme types and default values     | `packages/guallet-theme`       |
| Shared React UI   | Mantine-based components (web)                       | `packages/guallet-ui-react`    |
| Luna UI (web)     | Web design-system icons                              | `packages/guallet-luna`        |
| Luna UI (native)  | React Native components and icons                    | `packages/guallet-luna-mobile` |
| Money / currency  | Type-safe money library (80 % coverage threshold)    | `packages/guallet-money`       |

## Common Commands

Run commands from the monorepo root unless a command specifies a package.

```bash
pnpm dev                          # start all apps
pnpm build                        # build everything
pnpm lint                         # lint all packages
pnpm check-types                  # TypeScript check all packages
pnpm format                       # format supported files with Oxfmt
pnpm docker:compose:up            # start PostgreSQL, Redis, and pgAdmin
pnpm docker:compose:down          # stop development services
pnpm docker:compose:reset         # stop services and remove volumes
pnpm --filter api dev             # API watch mode
pnpm --filter api build           # compile API
pnpm --filter api lint            # type-aware Oxlint
pnpm --filter api test            # API Vitest tests
pnpm --filter api test:watch      # API Vitest watch mode
pnpm --filter api test:cov        # API coverage
pnpm --filter api db:init         # initialize Better Auth schema
pnpm --filter api db:generate     # generate Better Auth schema
pnpm --filter api db:migrate      # run Better Auth migrations
pnpm --filter webapp dev          # Vite dev server; regenerates the route tree
pnpm --filter webapp build        # i18n extraction, TypeScript, and Vite build
pnpm --filter webapp lint         # Oxlint
pnpm --filter webapp i18n:extract # extract translation keys
pnpm --filter mobile start        # Expo dev server
pnpm --filter mobile ios          # run on the iOS simulator
pnpm --filter mobile android      # run on the Android emulator
pnpm --filter @guallet/money test # money package tests (80% coverage enforced)
pnpm --filter @guallet/money test:cov # money package coverage
```

## Architecture

### API

API features live under `apps/api/src/features/`: `accounts`, `ai`, `budgets`,
`categories`, `transactions`, `institutions`, `reports`, `rules`,
`saving-goals`, `subscriptions`, `regular-payments`, `data-importer`,
`data-exporter`, `openbanking`, `nordigen`, `webhooks`, `notifications`,
`email`, and `users`. Authentication uses Better Auth; database configuration
is in `apps/api/src/database/`, and background jobs use BullMQ with Redis.

The AI feature manages user-owned connections and agents for OpenAI, OpenRouter,
and Vercel AI Gateway. Provider credentials are encrypted at rest with
`DATABASE_CREDENTIALS_ENCRYPTION_KEY`; API responses expose only a token hint.
The AI assistant chat streams through the Vercel AI SDK. It receives a
server-built aggregate summary of the user's finances, not raw transactions,
and a server-owned policy prompt; no tools are passed. Chat sessions are
user-scoped and purged after 30 days. AI endpoints use controller-level rate
limiting where configured; there is no global throttle guard.

### Webapp

The webapp uses TanStack Router for file-based routes, TanStack Query for server
state, and Zustand for client state. Generic components live in
`apps/webapp/src/components/`; feature-specific screens and components live in
`apps/webapp/src/features/`. Its AI chat uses a raw streaming `fetch` hook for
streamed messages and TanStack Query for session and message CRUD.

See [apps/webapp/AGENTS.md](apps/webapp/AGENTS.md) for web-specific routing,
Mantine, forms, localization, and component conventions.

### Internal packages

Workspace packages use the `workspace:*` protocol. API types flow from
`guallet-api-client` to `guallet-api-react` hooks and then to the web or mobile
app. Update API client types before consuming a changed API contract.

## Data-Flow Contract

When adding a new backend resource, **always proceed in this order**:

1. Add the feature module in `apps/api/src/features/{name}/`
2. Add types + API class in `packages/guallet-api-client/src/{domain}/` and register in `GualletClient.ts`
3. Add TanStack Query hooks in `packages/guallet-api-react/src/{domain}/` and export from `index.ts`
4. Consume the hooks in `apps/webapp` and/or `apps/mobile`

Skipping step 2 or 3 before step 4 breaks the type-chain.

## Auth in the API

```typescript
// Extract the logged-in user in any controller handler:
@Get()
async myHandler(@RequestUser() user: UserPrincipal) {
  // user.id  – UUID, use this to scope ALL queries
  // user.email
}
```

- `@RequestUser()` reads from `request.session.user` (Better Auth session-based, not JWT)
- **Every service query must be scoped by `user_id`** – never return cross-user data

## OpenAPI Contracts

- Swagger compiler autodocumentation is intentionally disabled. Never add the
  `@nestjs/swagger` compiler plugin or generated metadata files.
- Every DTO property must use `@ApiProperty`. Primitive `string`, `number`, and
  `boolean` properties may omit `type` because Nest can reflect those basic
  types; use `required: false` for optional properties. Add explicit schema
  options whenever reflection is insufficient, including array element types,
  enums, formats, nullability, and nested DTOs.
- Every controller operation must explicitly declare its operation and response.
  Document request bodies, path parameters, and query parameters with Swagger
  decorators when the route actually defines them.
- Do not use Swagger mapped types such as `PartialType` or `OmitType`; define
  update DTO fields explicitly so validation and OpenAPI contracts stay visible.

## Environment Setup

Copy the sample files before starting:

```bash
cp database.env.sample .env
cp api.env.sample apps/api/.env
cp webapp.env.sample apps/webapp/.env
```

Local development uses PostgreSQL 18 and Redis 8 via Docker. Optional
integrations such as open banking, email, Sentry, and NestJS Observe can remain
unconfigured.
The API requires `DATABASE_CREDENTIALS_ENCRYPTION_KEY`; generate a 32-byte
base64 key with `openssl rand -base64 32`.

## Testing

- API unit tests use Vitest with SWC; end-to-end tests use a separate Vitest
  configuration.
- `guallet-money` enforces 80% coverage for branches, functions, lines, and
  statements.
- The mobile app does not currently have a configured test suite.

## Available Skills

Load the matching skill from `.agents/skills/` when implementing its task. Other
task-specific guidance is available there for authentication, Mantine, planning,
architecture, and skill authoring:

| Skill                            | When to use                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------- |
| `create-api-feature`             | Add a new NestJS feature module (entity + DTOs + service + controller + module) |
| `add-api-client-domain`          | Add a new domain to `guallet-api-client` + `guallet-api-react` hooks            |
| `create-webapp-feature`          | Add a new page/section to the web frontend (route + screen + components)        |
| `add-mobile-screen`              | Add a new screen to the Expo mobile app                                         |
| `create-react-native-component`  | Add or adapt a component in the Luna React Native package                      |

## Quick Pattern Index

### API feature files

```
apps/api/src/features/{name}/
  {name}.module.ts
  {name}.controller.ts
  {name}.service.ts
  dto/create-{name}.dto.ts
  dto/update-{name}.dto.ts
  dto/{name}.dto.ts
  entities/{name}.entity.ts
```

Register in: `apps/api/src/app.module.ts` under `// APP MODULES`

### API client domain files

```
packages/guallet-api-client/src/{domain}/
  {domain}.models.ts   – TS types only (Dto, CreateRequest, UpdateRequest)
  {domain}.api.ts      – class with getAll / get / create / update / delete
  index.ts             – re-exports
```

Register in: `packages/guallet-api-client/src/GualletClient.ts` (interface + class property + constructor)
Export from: `packages/guallet-api-client/src/index.ts`

### React query hooks

```
packages/guallet-api-react/src/{domain}/
  use{Domain}.tsx           – useQuery hooks
  use{Domain}Mutations.tsx  – useMutation hooks
  index.ts                  – re-exports
```

Export from: `packages/guallet-api-react/src/index.ts`

### Webapp feature files

```
apps/webapp/src/routes/_app/{name}/index.tsx   – list route
apps/webapp/src/routes/_app/{name}/$id.tsx     – detail route (if needed)
apps/webapp/src/features/{name}/
  screens/   – container components (hold state + hooks)
  components/ – presentational components
  models/    – local types (if needed)
  state/     – Zustand stores (only for complex multi-step UI)
```

Import alias: `@/` → `apps/webapp/src/`
Run `pnpm --filter webapp dev` after adding route files to regenerate `routeTree.gen.ts`.

### Mobile screen files

```
apps/mobile/app/(tabs)/{name}.tsx    – new tab screen
apps/mobile/app/{name}/index.tsx     – stack screen
apps/mobile/app/{name}/[id].tsx      – detail screen with param
```

Expo Router requires `export default function` (not named exports) for all route files.

### Mobile bottom sheets

- Use `BottomSheet` from `apps/mobile/components/ui/BottomSheet.tsx` for every
  mobile bottom sheet.
- Do not import `BottomSheet` directly from `@expo/ui` or use another bottom
  sheet implementation in the mobile app.
- `apps/mobile/components/ui/BottomSheet.tsx` is the only file allowed to use
  Expo's `BottomSheet`; it owns the Expo UI integration and theme mapping.

## Code Style Reminders

- TypeScript strict mode everywhere; no `any` unless unavoidable
- Oxfmt: single quotes, trailing commas, and an 80-character print width
- Oxlint uses the shared root config; warnings fail CI. Run `pnpm lint` before
  committing.
- Workspace dependencies: `"@guallet/api-client": "workspace:*"` protocol

## UI & Design System

Consult [DESIGN.MD](DESIGN.MD) before UI changes. Use the platform's theme hook
for design tokens: `@guallet/ui-react` on web and the Luna mobile theme on
React Native. Keep money colors semantically consistent (positive is green,
negative is red) and use tabular numerals for amounts.
