# Auth

This uses [Better Auth](https://www.better-auth.com/).

## Database migrations

The initial TypeORM migration in `src/database/migrations/` creates the
application and authentication tables together. Auth entities are registered
in `UsersModule` and match the Better Auth mappings: `users`, `session`,
`auth_accounts`, and `verification`. Apply this migration only to an empty
database through TypeORM's migration runner. The API applies pending TypeORM
migrations automatically at startup; the standalone TypeORM CLI data source
can also run them manually.

The `users` table retains application preferences and soft deletion alongside
Better Auth's fields. Auth IDs are text; auth timestamps use `timestamptz`. The
initial migration's rollback drops the tables and their data.

The initial migration was generated with TypeORM's `migration:generate` command
against an empty PostgreSQL database. Its SQL comes from the entity metadata;
the UUID extension bootstrap is added explicitly before the generated queries.

For future migrations, run from `apps/api` with the database environment
variables pointing to a database at the current migration version. Generate
migrations with a path under `src/database/migrations`, for example:

```bash
pnpm db:migrations:generate src/database/migrations/DescriptiveChange
```

Review each generated migration before committing it; add a new migration for
later Better Auth schema changes.

For later Better Auth upgrades, inspect the required schema and add a new
TypeORM migration rather than reapplying or editing the initial migration.

Build the API, then verify schema compatibility in an isolated PostgreSQL cluster:

```bash
INITIAL_SCHEMA_DATABASE_TEST=1 pg_virtualenv pnpm --filter api exec vitest run src/database/initial-schema.database.spec.ts --maxWorkers=1
```

Run this test command from the monorepo root. The test drops and recreates the
`public` schema; use only a disposable test cluster.

## Email events

`createAuth` does not depend on `EmailService` directly. Instead, it emits events via NestJS `EventEmitter2` when Better Auth needs to send an email. `EmailEventListener` (in the `email` feature module) handles these events and calls the appropriate `EmailService` methods.

| Event                       | Trigger                      | Handler method           |
| --------------------------- | ---------------------------- | ------------------------ |
| `auth.email.password-reset` | User requests password reset | `sendPasswordResetEmail` |
| `auth.email.otp`            | Email OTP verification sent  | `sendAuthOtpEmail`       |
| `auth.email.magic-link`     | Magic link sign-in requested | `sendAuthMagicLinkEmail` |

The CLI export (`export const auth`) at the bottom of `better-auth.ts` omits the `eventEmitter`, so no emails are emitted when running migrations via the CLI — this is intentional.
