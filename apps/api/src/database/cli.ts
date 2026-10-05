import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Migration, MigrationExecutor } from 'typeorm';
import dataSource from './data-source';
import { applicationBaseline } from './application-baseline';
import { authBaseline } from './auth-baseline';
import { validateSchema } from './schema-validation';

class DatabaseMigrationExecutor extends MigrationExecutor {
  async recordBaseline(): Promise<void> {
    if (!this.queryRunner) throw new Error('Baseline requires a query runner.');
    await this.createMigrationsTableIfNotExist(this.queryRunner);
    await this.insertMigration(
      new Migration(
        undefined,
        1780000000000,
        'InitialApplication1780000000000',
      ),
    );
  }
}

export const runDatabaseCommand = async (
  command: string,
  name?: string,
): Promise<void> => {
  const supported = ['migrate', 'show', 'revert', 'baseline', 'generate'];
  if (!supported.includes(command))
    throw new Error(`Expected one of: ${supported.join(', ')}`);
  await dataSource.initialize();
  const runner = dataSource.createQueryRunner();
  let locked = false;
  try {
    await runner.connect();
    await runner.query('SET search_path TO public');
    // Session lock and MigrationExecutor must use the same physical connection.
    await runner.query('SELECT pg_advisory_lock(1780000000, 1)');
    locked = true;
    const executor = new DatabaseMigrationExecutor(dataSource, runner);
    executor.transaction = 'all';
    if (command === 'migrate') {
      const applied = await executor.executePendingMigrations();
      console.info(
        applied.length
          ? `Applied: ${applied.map((migration) => migration.name).join(', ')}`
          : 'Database is up to date.',
      );
    } else if (command === 'show') {
      const applied = new Set(
        (await executor.getExecutedMigrations()).map(
          (migration) => migration.name,
        ),
      );
      for (const migration of dataSource.migrations) {
        console.info(
          `[${applied.has(migration.name ?? migration.constructor.name) ? 'X' : ' '}] ${migration.name ?? migration.constructor.name}`,
        );
      }
    } else if (command === 'revert') {
      await executor.undoLastMigration();
    } else if (command === 'baseline') {
      await runner.startTransaction();
      try {
        if (await runner.hasTable('typeorm_migrations')) {
          const history = await runner.query(
            'SELECT 1 FROM typeorm_migrations LIMIT 1',
          );
          if (history.length)
            throw new Error(
              'Cannot baseline a database with migration history.',
            );
        }
        await validateSchema(runner, applicationBaseline, true);
        const present: boolean[] = [];
        for (const table of authBaseline)
          present.push(await runner.hasTable(table.name));
        if (present.some(Boolean) && !present.every(Boolean))
          throw new Error(
            'Partial authentication schema: expected all or none of the auth tables.',
          );
        if (present.every(Boolean)) await validateSchema(runner, authBaseline);
        const duplicates = await runner.query(
          'SELECT 1 FROM users GROUP BY email HAVING count(*) > 1 LIMIT 1',
        );
        if (duplicates.length)
          throw new Error(
            'Resolve duplicate users.email values before baselining.',
          );
        // Creates the history table only after validation. Never fake all pending migrations.
        await executor.recordBaseline();
        await runner.commitTransaction();
        console.info('Application schema baselined. Run pnpm db:migrate next.');
      } catch (error) {
        await runner.rollbackTransaction();
        throw error;
      }
    } else {
      if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name))
        throw new Error(
          'Provide a migration name, e.g. pnpm db:generate AddAccountStatus',
        );
      if ((await executor.getPendingMigrations()).length) {
        throw new Error(
          'Apply checked-in migrations before generating a new migration.',
        );
      }
      const sql = await dataSource.driver.createSchemaBuilder().log();
      if (!sql.upQueries.length) {
        console.info('No application schema changes found.');
        return;
      }
      const timestamp = Date.now();
      const directory = join(process.cwd(), 'src/database/migrations');
      await mkdir(directory, { recursive: true });
      const statements = (queries: typeof sql.upQueries) =>
        queries
          .map(
            (query) =>
              `    await queryRunner.query(${JSON.stringify(query.query)}, ${JSON.stringify(query.parameters ?? [])});`,
          )
          .join('\n');
      await writeFile(
        join(directory, `${timestamp}-${name}.ts`),
        `import type { MigrationInterface, QueryRunner } from 'typeorm';\n\nexport class ${name}${timestamp} implements MigrationInterface {\n  async up(queryRunner: QueryRunner): Promise<void> {\n${statements(sql.upQueries)}\n  }\n\n  async down(queryRunner: QueryRunner): Promise<void> {\n${statements([...sql.downQueries].reverse())}\n  }\n}\n`,
      );
      console.info(
        `Generated ${timestamp}-${name}.ts. Review the SQL before applying it.`,
      );
    }
  } finally {
    try {
      if (locked)
        await runner.query('SELECT pg_advisory_unlock(1780000000, 1)');
    } finally {
      await runner.release();
      await dataSource.destroy();
    }
  }
};

if (require.main === module) {
  runDatabaseCommand(process.argv[2] ?? '', process.argv[3]).catch(
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    },
  );
}
