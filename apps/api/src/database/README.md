# Database migrations

TypeORM owns both the application and Better Auth schema. Automatic schema
synchronization is disabled in every environment. Run migrations before starting
the API. The PostgreSQL database must already exist; the database user needs DDL
permissions, including permission to install the `uuid-ossp` extension for a fresh
schema. Migrations use the `public` schema.

## Empty database

Build the API, then apply all checked-in migrations:

```bash
pnpm --filter api build
pnpm --filter api db:migrate
```

The migration command uses compiled JavaScript and installed runtime dependencies.
It does not start NestJS, contact Redis, or download an auth CLI. Repeated runs
apply only pending migrations. Errors return a nonzero exit code. A PostgreSQL
advisory lock serializes commands; do not edit the database concurrently outside
this migration workflow.

From the API directory, including `/app/apps/api` in the Docker image:

```bash
pnpm db:migrate
pnpm db:show
```

`pnpm db:init` aliases `db:migrate`; it no longer generates schema at deployment.
Commands read the API directory's optional `.env` using Node's env-file loader.
Existing process environment variables take precedence. They require only:

```text
DATABASE_HOST
DATABASE_PORT
DATABASE_USERNAME
DATABASE_PASSWORD
DATABASE_NAME
DATABASE_SSL_ENABLED
```

Host defaults to `localhost`, port to `5432`, and SSL to `false`. Set the host to
the PostgreSQL service hostname when running in a separate container.
`DATABASE_URL` is not consumed. The API itself still requires its full runtime
configuration.

## Existing database previously created by synchronization

Back up the database and stop the old API so it cannot synchronize the schema
while adopting migrations. Deploy/build the new version without starting it,
then run:

```bash
pnpm --filter api db:baseline
pnpm --filter api db:migrate
pnpm --filter api db:show
```

Baselining checks application tables against the frozen initial schema, ignoring
constraint names and allowing the shared `users.email` unique constraint to be
present or absent. Auth-only tables must all be absent or all match the frozen
auth schema. Baseline validation also rejects duplicate emails. Existing rows,
password hashes, and session tokens are preserved.

Only the initial application migration is recorded, inside a transaction after
validation succeeds. The subsequent auth migration creates missing auth tables
and adds email uniqueness when needed. Existing compatible auth tables are
validated and preserved. The migration runner does not silently baseline a
nonempty database when `db:migrate` is called.

Empty databases, schema differences, partial auth tables, duplicate emails, and
existing migration history cause baselining to fail without recording a baseline.
Read the discrepancy report, resolve the problem through a separately reviewed
schema/data upgrade, and retry. Do not use TypeORM's blanket `--fake` migration
command: it could skip migrations that have not actually been applied.

Baselines support the repository's current synchronized application schema.
Older or customized schemas require a separate upgrade. Test adoption on a
restored copy before applying it to a populated deployment.

## Dokploy / Nixpacks

The repository-root `nixpacks.toml` builds the webapp. For an API deployment,
override its build and start phases using an API-specific Nixpacks configuration:

```toml
[phases.setup]
nixPkgs = ["nodejs_24", "pnpm"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile"]

[phases.build]
cmds = ["pnpm --filter api build"]

[start]
cmd = "pnpm --filter api start:dockploy"
```

Remove the inherited webapp static-directory variable for the API deployment.
Use Node 24.20 or newer in the Node 24 series and pnpm 12.4.1. Include the API
`package.json`, compiled `dist`, and dependencies in the runtime image.

For an empty database or an already-baselined database, use the migration-first
Dokploy start command:

```bash
pnpm --filter api start:dockploy
```

For an existing database without history, run `db:baseline` once before enabling
that start command. From `/app/apps/api`, use `pnpm start:dockploy`.
The script runs `pnpm db:migrate && pnpm start:prod`, so migration failures prevent
the API from starting. `start:prod` remains available for starting the API directly.

## Creating future migrations

Register new application entities in `entities.ts` as well as their feature
modules. Keep database options shared between the API and standalone DataSource.
Against a migrated development database, from `apps/api`:

```bash
pnpm db:generate AddAccountStatus
```

This builds the current entities and writes a timestamped TypeScript migration.
Review both `up` and `down`, format the file, build again, and run `db:migrate`.
Generation compares application entities only and leaves auth-only tables alone.
The `users` entity describes the shared user table, including email uniqueness.
Commit migrations; never edit previously applied migrations or regenerate the
frozen baseline descriptions when entities change.

For Better Auth upgrades or plugin schema changes, inspect the schema required
by the installed version in development and write reviewed SQL in a new TypeORM
migration. Do not run Better Auth's migration engine against deployed databases.
The historical `better-auth_migrations` SQL file is not used by the runner.
The frozen auth snapshot came from Better Auth 1.7.4 with the current plugins;
IDs remain text and the session table remains named `session`.

## Rollback and tests

`pnpm db:revert` reverts the most recently applied migration. The initial
application and auth rollbacks drop tables and data; do not use them as a routine
production recovery mechanism. They also drop adopted tables when reverting a
baseline. Use backups or a reviewed forward migration for production recovery.
The shared `uuid-ossp` extension is left installed on rollback.

Run the integration suite in an isolated temporary PostgreSQL cluster:

```bash
pnpm --filter api build
DATABASE_MIGRATION_TEST=1 pg_virtualenv pnpm --filter api exec vitest run src/database/migrations.database.spec.ts --maxWorkers=1
```

The suite drops and recreates `public`; never point it at a development or
production database. It requires both the explicit test flag and `pg_virtualenv`
environment variables. Ordinary test runs skip it.
