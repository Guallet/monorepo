import 'reflect-metadata';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { DataSource } from 'typeorm';
import type { MigrationInterface } from 'typeorm';

// Build first. Run only against a disposable pg_virtualenv cluster.
const enabled =
  process.env.INITIAL_SCHEMA_DATABASE_TEST === '1' &&
  Boolean(process.env.PGPORT);
const load = createRequire(resolve('package.json'));
const execute = promisify(execFile);

describe.skipIf(!enabled)(
  'Initial schema migration and Better Auth compatibility',
  () => {
    let database: DataSource;
    beforeAll(async () => {
      const { InitialSchema1791190000000 } = load(
        resolve('dist/migrations/1791190000000-InitialSchema.js'),
      ) as { InitialSchema1791190000000: new () => MigrationInterface };
      database = new DataSource({
        type: 'postgres',
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT),
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        installExtensions: false,
        synchronize: false,
        entities: [resolve('dist/features/**/entities/*.entity.js')],
        migrations: [InitialSchema1791190000000],
      });
      await database.initialize();
    }, 30000);
    beforeEach(async () => {
      await database.query('DROP SCHEMA public CASCADE');
      await database.query('CREATE SCHEMA public');
    });
    afterAll(async () => {
      await database?.destroy();
    });

    it(
      'creates all entities and applies only once',
      { timeout: 20000 },
      async () => {
        expect(await database.runMigrations()).toHaveLength(1);
        expect(await database.runMigrations()).toHaveLength(0);
        expect(database.entityMetadatas).toHaveLength(22);
        expect(
          (await database.driver.createSchemaBuilder().log()).upQueries,
        ).toEqual([]);
        const runner = database.createQueryRunner();
        try {
          const users = await runner.getTable('users');
          expect(users?.findColumnByName('id')?.type).toBe('text');
          expect(users?.findColumnByName('email')?.isUnique).toBe(true);
          expect(users?.findColumnByName('created_at')?.type).toBe(
            'timestamp with time zone',
          );
          expect(users?.findColumnByName('updated_at')?.type).toBe(
            'timestamp with time zone',
          );
        } finally {
          await runner.release();
        }
      },
    );

    it(
      'matches Better Auth schema and supports signup, signin, session lookup, and OTP',
      { timeout: 20000 },
      async () => {
        await database.runMigrations();
        const source = `
      const { createAuth } = require('./dist/auth/better-auth.js');
      const auth = createAuth({ databaseConfig: {
        host: process.env.DATABASE_HOST, port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USERNAME, password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME, ssl: false,
      }, authConfig: { secret: process.env.BETTER_AUTH_SECRET, baseUrl: process.env.BETTER_AUTH_BASE_URL, allowedOrigins: [] } });
      (async () => {
        const { getMigrations } = await import('better-auth/db/migration');
        const plan = await getMigrations(auth.options);
        for (const key of ['toBeCreated','toBeAdded','toBeAddedIndexes','schemaProblems','unsafeChanges']) {
          if (plan[key].length) throw new Error(key + ': ' + JSON.stringify(plan[key]));
        }
        const body = { email: 'auth@example.com', password: 'secure-integration-password', name: 'Auth Test' };
        const signup = await auth.api.signUpEmail({body});
        if (!signup.user || !signup.token) throw new Error('Signup failed');
        const signin = await auth.api.signInEmail({body,asResponse:true});
        if (!signin.ok) throw new Error('Signin failed');
        const cookie = signin.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
        const session = await auth.api.getSession({headers:new Headers({cookie})});
        if (session?.user.email !== body.email) throw new Error('Session lookup failed');
        await auth.api.sendVerificationOTP({body:{email:body.email,type:'sign-in'}});
        process.exit(0);
      })().catch(error => { console.error(error); process.exit(1); });
    `;
        await execute(process.execPath, ['-e', source], {
          env: {
            ...process.env,
            DATABASE_HOST: process.env.PGHOST,
            DATABASE_PORT: process.env.PGPORT,
            DATABASE_USERNAME: process.env.PGUSER,
            DATABASE_PASSWORD: process.env.PGPASSWORD,
            DATABASE_NAME: process.env.PGDATABASE,
            DATABASE_SSL_ENABLED: 'false',
            BETTER_AUTH_SECRET:
              'integration-test-secret-at-least-32-characters',
            BETTER_AUTH_BASE_URL: 'http://localhost:5000',
          },
        });
        expect(await database.query('SELECT id FROM users')).toHaveLength(1);
        expect(
          await database.query('SELECT id FROM auth_accounts'),
        ).toHaveLength(1);
        expect(await database.query('SELECT id FROM session')).toHaveLength(2);
        expect(
          await database.query('SELECT id FROM verification'),
        ).toHaveLength(1);
        await database.query('DELETE FROM users');
        expect(
          await database.query('SELECT id FROM auth_accounts'),
        ).toHaveLength(0);
        expect(await database.query('SELECT id FROM session')).toHaveLength(0);
      },
    );

    it(
      'reverts in dependency order and can migrate again',
      { timeout: 20000 },
      async () => {
        await database.runMigrations();
        await database.undoLastMigration();
        expect(
          await database.query("SELECT to_regclass('public.users') AS users"),
        ).toEqual([{ users: null }]);
        expect(await database.runMigrations()).toHaveLength(1);
      },
    );
  },
);
