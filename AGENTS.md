# Guallet Monorepo – Agent Reference

> Companion to `CLAUDE.md`. This file is the quick-orientation layer for coding agents.
> Full code templates live in the skills listed below.

## Repo at a Glance

| App / Package     | Tech                                                 | Path                          |
| ----------------- | ---------------------------------------------------- | ----------------------------- |
| API               | NestJS 11, TypeORM, Better Auth, BullMQ              | `apps/api`                    |
| Webapp            | Vite 7, React 19, TanStack Router + Query, Mantine 8 | `apps/webapp`                 |
| Mobile            | Expo 54, React Native 0.81, Expo Router, Luna UI     | `apps/mobile`                 |
| API client types  | TypeScript (no runtime, types + fetch wrappers)      | `packages/guallet-api-client` |
| React query hooks | TanStack Query wrappers over the API client          | `packages/guallet-api-react`  |
| Design tokens     | Platform-agnostic theme types and default values     | `packages/guallet-theme`      |
| Shared React UI   | Mantine-based components (web)                       | `packages/guallet-ui-react`   |
| Luna UI (web)     | Web design-system icons                              | `packages/guallet-luna`       |
| Luna UI (native)  | React Native components and icons                    | `packages/guallet-luna-rn`    |
| Money / currency  | Type-safe money library (80 % coverage threshold)    | `packages/guallet-money`      |

## Common Commands

```bash
pnpm dev                          # start all apps
pnpm build                        # build everything
pnpm lint                         # lint all packages
pnpm check-types                  # TypeScript check all packages
pnpm --filter api dev             # API watch mode
pnpm --filter webapp dev          # Vite dev server (also regenerates TanStack Router routeTree)
pnpm --filter mobile start        # Expo dev server
pnpm --filter api test            # API Vitest tests
pnpm --filter @guallet/money test # money package tests (80 % threshold enforced)
```

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

## Available Skills

Load these on-demand with `/skill-name` when implementing the corresponding task:

| Skill                   | When to use                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| `create-api-feature`    | Add a new NestJS feature module (entity + DTOs + service + controller + module) |
| `add-api-client-domain` | Add a new domain to `guallet-api-client` + `guallet-api-react` hooks            |
| `create-webapp-feature` | Add a new page/section to the web frontend (route + screen + components)        |
| `add-mobile-screen`     | Add a new screen to the Expo mobile app                                         |

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

## Code Style Reminders

- TypeScript strict mode everywhere; no `any` unless unavoidable
- Oxfmt: single quotes, trailing commas, and an 80-character print width
- Run `pnpm lint` before committing; warnings fail the lint command
- Workspace dependencies: `"@guallet/api-client": "workspace:*"` protocol
