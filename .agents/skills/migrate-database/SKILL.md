---
name: migrate-database
description: Generate and apply an API TypeORM migration from a described schema change. Use when the user invokes `/migrate-database` or asks to generate and run an API database migration.
---

# Migrate Database

Generate an API TypeORM migration from the current entity definitions, review it,
and apply pending migrations to the database configured for the API.

## Usage

Invoke with a short description of the schema change:

```text
/migrate-database Add transaction merchant names
```

Use the description to choose a concise PascalCase migration name, such as
`AddTransactionMerchantNames`. TypeORM derives the SQL from entity changes and
the current database schema; the description is the migration name, not SQL.

## Workflow

1. If the user did not provide a change description, ask for one.
2. Inspect the relevant entity changes and current migration files. Preserve
   unrelated working-tree changes. If the described schema change is not
   represented in the entity definitions, explain what is missing before
   generating a migration.
3. Generate the migration from the monorepo root:

   ```bash
   pnpm --filter api db:migrations:generate src/database/migrations/<MigrationName>
   ```

   The script builds the API and uses the compiled
   `dist/database/data-source.js`; the positional argument is the output path
   under `apps/api/src/database/migrations/`.

4. Review the generated `up` and `down` methods. Confirm the SQL matches the
   description and does not include unrelated schema changes. If the result is
   empty or unexpectedly destructive, do not run it; explain the finding and
   ask how the user wants to proceed.
5. Apply pending API migrations:

   ```bash
   pnpm --filter api db:migrations:run
   ```

6. Confirm the command reports the migration was applied and report the
   generated file and database result. Do not commit or push changes.

## Initial migration

For the initial schema migration, the configured `DATABASE_*` variables must
point to an empty database. Review that the generated `up` method creates the
expected application and Better Auth schema before applying it.
