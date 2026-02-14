## Description

Guallet API — backend for the Guallet personal-finance app (NestJS + TypeScript).

### Quick summary
- Exposes REST endpoints for accounts, transactions, categories, budgets, rules, reports and integrations (Nordigen, webhooks, CSV importer).
- Authentication via Better-Auth (magic links / OTP / Social).
- DB: PostgreSQL (TypeORM). Background jobs: BullMQ + Redis.

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

- Important env vars: `DATABASE_*`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_BASE_URL`, `ALLOWED_CORS_ORIGINS`, `NORDIGEN_*`, `SMTP_*`.
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

## How it works — architecture overview 🧭
- Entry point: `src/main.ts` — configures Express, CORS, middleware and Swagger (`/docs`).
- Configuration: `src/configuration.ts` + `ConfigModule` with Joi validation.
- Auth: `src/auth/better-auth.ts` integrates Better-Auth for user flows and CLI migrations.
- Persistence: TypeORM + PostgreSQL; entities auto-loaded, migrations handled via CLI scripts.
- Background jobs: BullMQ + Redis for async tasks (imports/exports/notifications).
- Features: implemented as Nest modules — `accounts`, `transactions`, `categories`, `budgets`, `rules`, `reports`, `nordigen`, `data-importer`, `notifications`, `webhooks`, `email`, etc.
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

---

If you want, I can run the API tests now or add a short example showing DB + Docker setup.
