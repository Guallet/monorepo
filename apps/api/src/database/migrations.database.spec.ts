import 'reflect-metadata';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { DataSource } from 'typeorm';
import type { MigrationInterface } from 'typeorm';

const enabled =
  process.env.DATABASE_MIGRATION_TEST === '1' && Boolean(process.env.PGPORT);
const execute = promisify(execFile);
const environment = {
  ...process.env,
  DATABASE_HOST: process.env.PGHOST,
  DATABASE_PORT: process.env.PGPORT,
  DATABASE_USERNAME: process.env.PGUSER,
  DATABASE_PASSWORD: process.env.PGPASSWORD,
  DATABASE_NAME: process.env.PGDATABASE,
  DATABASE_SSL_ENABLED: 'false',
  BETTER_AUTH_SECRET: 'integration-test-secret-at-least-32-characters',
  BETTER_AUTH_BASE_URL: 'http://localhost:5000',
};
const compiled = resolve('dist/database/cli.js');
const command = (name: string, ...args: string[]) =>
  execute(process.execPath, [compiled, name, ...args], { env: environment });
const load = createRequire(resolve('package.json'));
const initial = () => {
  const migration = load(
    resolve('dist/database/migrations/1780000000000-InitialApplication.js'),
  ) as { InitialApplication1780000000000: new () => MigrationInterface };
  return new migration.InitialApplication1780000000000();
};

describe.skipIf(!enabled)(
  'Compiled database migrations in isolated PostgreSQL',
  () => {
    let database: DataSource;
    beforeAll(async () => {
      database = new DataSource({
        type: 'postgres',
        host: environment.DATABASE_HOST,
        port: Number(environment.DATABASE_PORT),
        username: environment.DATABASE_USERNAME,
        password: environment.DATABASE_PASSWORD,
        database: environment.DATABASE_NAME,
        installExtensions: false,
      });
      await database.initialize();
    });
    beforeEach(async () => {
      await database.query('DROP SCHEMA public CASCADE');
      await database.query('CREATE SCHEMA public');
    });
    afterAll(async () => {
      await database?.destroy();
    });
    const legacy = async () => {
      const runner = database.createQueryRunner();
      try {
        await initial().up(runner);
      } finally {
        await runner.release();
      }
      await database.query(
        `INSERT INTO users (id, name, email) VALUES ('legacy-user', 'Legacy', 'legacy@example.com')`,
      );
    };

    it(
      'creates the full schema, records history, and is repeatable',
      { timeout: 20000 },
      async () => {
        await command('migrate');
        expect((await command('migrate')).stdout).toContain('up to date');
        expect(
          await database.query(
            'SELECT name FROM typeorm_migrations ORDER BY id',
          ),
        ).toHaveLength(2);
        expect((await command('show')).stdout).toContain('[X] Authentication');
        const { databaseEntities } = load(
          resolve('dist/database/entities.js'),
        ) as { databaseEntities: Function[] };
        const comparison = new DataSource({
          ...database.options,
          entities: databaseEntities,
        });
        await comparison.initialize();
        try {
          expect(
            (await comparison.driver.createSchemaBuilder().log()).upQueries,
          ).toEqual([]);
        } finally {
          await comparison.destroy();
        }
        expect((await command('generate', 'NoChanges')).stdout).toContain(
          'No application schema changes',
        );
      },
    );

    it(
      'supports Better Auth signup and session creation',
      { timeout: 20000 },
      async () => {
        await command('migrate');
        const source = `
      const { createAuth } = require('./dist/auth/better-auth.js');
      const auth = createAuth({ databaseConfig: {
        host: process.env.DATABASE_HOST, port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USERNAME, password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME, ssl: false,
      }, authConfig: { secret: process.env.BETTER_AUTH_SECRET, baseUrl: process.env.BETTER_AUTH_BASE_URL, allowedOrigins: [] } });
      auth.api.signUpEmail({ body: { email: 'test@example.com', password: 'secure-test-password', name: 'Test' } })
        .then(result => { if (!result.user || !result.token) throw new Error('Missing signup result'); process.exit(0); })
        .catch(error => { console.error(error); process.exit(1); });
    `;
        await execute(process.execPath, ['-e', source], { env: environment });
        expect(await database.query('SELECT id FROM users')).toHaveLength(1);
        expect(
          await database.query('SELECT id FROM auth_accounts'),
        ).toHaveLength(1);
        expect(await database.query('SELECT id FROM session')).toHaveLength(1);
      },
    );

    it(
      'adopts application data with absent auth tables',
      { timeout: 20000 },
      async () => {
        await legacy();
        await command('baseline');
        await command('migrate');
        expect(await database.query('SELECT id FROM users')).toEqual([
          { id: 'legacy-user' },
        ]);
        expect(
          await database.query('SELECT name FROM typeorm_migrations'),
        ).toHaveLength(2);
      },
    );

    it(
      'preserves existing auth data during adoption',
      { timeout: 20000 },
      async () => {
        await command('migrate');
        await database.query(
          `INSERT INTO users (id, name, email) VALUES ('legacy-user', 'Legacy', 'legacy@example.com')`,
        );
        await database.query(
          `INSERT INTO session (id, "expiresAt", token, "updatedAt", "userId") VALUES ('s', now() + interval '1 day', 'token', now(), 'legacy-user')`,
        );
        await database.query('DROP TABLE typeorm_migrations');
        await command('baseline');
        await command('migrate');
        expect(await database.query('SELECT token FROM session')).toEqual([
          { token: 'token' },
        ]);
      },
    );

    it(
      'rejects empty databases and schema drift without recording history',
      { timeout: 20000 },
      async () => {
        await expect(command('baseline')).rejects.toThrow('missing table');
        await legacy();
        await database.query('ALTER TABLE accounts ADD COLUMN unexpected text');
        await expect(command('baseline')).rejects.toThrow('accounts.columns');
        expect(
          await database.query(
            "SELECT to_regclass('public.typeorm_migrations') AS history",
          ),
        ).toEqual([{ history: null }]);
      },
    );

    it(
      'rejects partial auth tables and duplicate emails',
      { timeout: 20000 },
      async () => {
        await legacy();
        await database.query('CREATE TABLE session (id text)');
        await expect(command('baseline')).rejects.toThrow(
          'Partial authentication schema',
        );
        await database.query('DROP TABLE session');
        await database.query(
          `INSERT INTO users (id, name, email) VALUES ('duplicate', 'Duplicate', 'legacy@example.com')`,
        );
        await expect(command('baseline')).rejects.toThrow(
          'duplicate users.email',
        );
      },
    );

    it('rejects incompatible auth tables', { timeout: 20000 }, async () => {
      await command('migrate');
      await database.query('DROP TABLE typeorm_migrations');
      await database.query('ALTER TABLE session ADD COLUMN unexpected text');
      await expect(command('baseline')).rejects.toThrow('session.columns');
    });

    it(
      'refuses to baseline an existing migration history',
      { timeout: 20000 },
      async () => {
        await command('migrate');
        await expect(command('baseline')).rejects.toThrow('migration history');
      },
    );

    it(
      'rolls back failed auth changes and exits unsuccessfully',
      { timeout: 20000 },
      async () => {
        await legacy();
        await command('baseline');
        await database.query('CREATE TABLE session (id text)');
        await expect(command('migrate')).rejects.toThrow(
          'Partial authentication schema',
        );
        expect(
          await database.query('SELECT name FROM typeorm_migrations'),
        ).toHaveLength(1);
        const duplicates = `INSERT INTO users (id, name, email) VALUES ('duplicate', 'Duplicate', 'legacy@example.com')`;
        await database.query(duplicates); // Unique constraint was rolled back too.
      },
    );

    it('serializes concurrent commands', { timeout: 20000 }, async () => {
      await Promise.all([command('migrate'), command('migrate')]);
      expect(
        await database.query('SELECT name FROM typeorm_migrations'),
      ).toHaveLength(2);
    });

    it('reverts in dependency order', { timeout: 20000 }, async () => {
      await command('migrate');
      await command('revert');
      await command('revert');
      expect(
        await database.query("SELECT to_regclass('public.users') AS users"),
      ).toEqual([{ users: null }]);
      await command('migrate');
    });
  },
);
