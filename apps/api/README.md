## Description

Guallet API — backend for the Guallet personal-finance app (NestJS + TypeScript).

### Quick summary

- Exposes REST endpoints for accounts, transactions, categories, budgets, rules, reports and integrations (Nordigen, webhooks, CSV importer).
- AI features: user-owned provider connections (OpenAI, OpenRouter, Vercel AI Gateway), agents, and a streaming AI Assistant chat grounded on a server-built financial summary. Provider tokens are AES-256-GCM encrypted at rest; chat sessions are purged after 30 days.
- Authentication via Better-Auth (magic links / OTP / Social).
- DB: PostgreSQL (TypeORM). Background jobs: BullMQ + Redis. Scheduled jobs via `@nestjs/schedule` cron.

---

## Quick start — run locally 🚀

Prerequisites: Node >= 22, pnpm; Docker is recommended for DB/Redis.

From repository root (recommended):

```bash
pnpm install
pnpm --filter api dev
```

Or from the API folder:

```bash
cd apps/api
pnpm install
pnpm start
```

Open the API docs: http://localhost:5000/docs

---

## Environment & configuration 🔧

- Copy the sample env files and update values as needed:

```bash
cp api.env.sample apps/api/.env       # API runtime env (repo root -> apps/api)
cp database.env.sample .env           # DB / docker-compose (repo root)
```

- Important env vars: `DATABASE_*`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_BASE_URL`, `ALLOWED_CORS_ORIGINS`, `NORDIGEN_*`, `DATABASE_CREDENTIALS_ENCRYPTION_KEY`, `SMTP_*`.
- The app loads `.env.local` then `.env` (see `ConfigModule` in `src/app.module.ts`).

---

## Database & migrations 🗃️

Bring up local services with Docker Compose (Postgres + Redis):

```bash
docker-compose up -d
```

Prepare DB & auth schema:

```bash
# from apps/api
pnpm db:init
```

or

```bash
# from apps/api
pnpm db:generate    # generate Better-Auth migrations
pnpm db:migrate     # apply migrations
```

---

## Useful commands

- Start (dev/watch): `pnpm --filter api dev` or `cd apps/api && pnpm dev`
- Build: `pnpm --filter api build`
- Tests: `pnpm --filter api test` / `pnpm --filter api test:e2e`
- DB tasks: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`

---

## Admin scripts 🛠️

Utility scripts live in `apps/api/scripts/` and are run with `ts-node` directly against the database — no server startup required.

### `set-user-role` — promote or demote a user

Sets the `roles` field on a user record. Useful for granting the first user admin access after a fresh deployment.

**Valid roles:** `admin`, `beta` (or `""` to clear all roles)

```bash
# From apps/api — by email
pnpm script:set-role -- --email user@example.com --role admin

# By user ID
pnpm script:set-role -- --id <user-id> --role admin

# Grant beta access
pnpm script:set-role -- --email user@example.com --role beta

# Clear all roles
pnpm script:set-role -- --email user@example.com --role ""
```

The script reads DB credentials from `apps/api/.env` (`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`). Make sure the env file is populated before running.

---

## How it works — architecture overview 🧭

- Entry point: `src/main.ts` — configures Express, CORS, middleware and Swagger (`/docs`).
- Configuration: `src/configuration.ts` + `ConfigModule` with Joi validation.
- Auth: `src/auth/better-auth.ts` integrates Better-Auth for user flows and CLI migrations.
- Persistence: TypeORM + PostgreSQL; entities auto-loaded, migrations handled via CLI scripts.
- Background jobs: BullMQ + Redis for async tasks (imports/exports/notifications).
- Features: implemented as Nest modules — `accounts`, `transactions`, `categories`, `budgets`, `rules`, `reports`, `ai`, `nordigen`, `data-importer`, `notifications`, `webhooks`, `email`, etc.
- AI: `src/features/ai` — provider connections and agents (CRUD, token encryption), plus the assistant chat: `/ai/chat/sessions` endpoints stream replies through the Vercel AI SDK (`ai` + `@ai-sdk/openai-compatible`). The model only ever sees aggregated finance data (no raw transactions) behind a server-owned policy prompt, and is never given tools. AI endpoints are rate-limited per user via `@nestjs/throttler`.
- API docs: OpenAPI (Swagger) generated from decorators — visit `/docs`.

---

## Key files

- `src/main.ts`, `src/app.module.ts`, `src/configuration.ts`
- `src/auth/` — Better-Auth integration
- `src/features/*` — domain modules (controllers/services)
- `apps/api/Dockerfile`, `docker-compose.yml` — container/dev stack

---

## Troubleshooting / tips ⚠️

- DB connection refused: ensure `docker-compose up -d` finished and env vars match.
- Swagger not available: confirm server started on configured `PORT` (default `5000`).
- Run only API in the monorepo: `pnpm --filter api dev`.

---

## Tests

- Unit: `pnpm --filter api test`
- E2E: `pnpm --filter api test:e2e`

---

## License

This package is covered by the repository Apache-2.0 license — see the root `LICENSE`.
