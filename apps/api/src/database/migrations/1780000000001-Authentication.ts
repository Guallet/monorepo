import type { MigrationInterface, QueryRunner } from 'typeorm';
import { authBaseline } from '../auth-baseline';
import { validateSchema } from '../schema-validation';

export class Authentication1780000000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const duplicates = await queryRunner.query(
      'SELECT 1 FROM users GROUP BY email HAVING count(*) > 1 LIMIT 1',
    );
    if (duplicates.length)
      throw new Error(
        'Duplicate users.email values must be resolved before migrating authentication.',
      );
    const users = await queryRunner.getTable('users');
    if (
      !users?.uniques.some(
        (key) => key.columnNames.length === 1 && key.columnNames[0] === 'email',
      )
    ) {
      await queryRunner.query(
        'ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")',
      );
    }
    const present: boolean[] = [];
    for (const table of authBaseline)
      present.push(await queryRunner.hasTable(table.name));
    if (present.every(Boolean)) {
      await validateSchema(queryRunner, authBaseline);
    } else if (present.some(Boolean)) {
      throw new Error(
        'Partial authentication schema: expected all or none of session, auth_accounts, verification.',
      );
    } else {
      await queryRunner.query(
        'create table "session" ("id" text not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references "users" ("id") on delete cascade)',
      );
      await queryRunner.query(
        'create table "auth_accounts" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "users" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null)',
      );
      await queryRunner.query(
        'create table "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null)',
      );
      await queryRunner.query(
        'create index "session_userId_idx" on "session" ("userId")',
      );
      await queryRunner.query(
        'create index "auth_accounts_userId_idx" on "auth_accounts" ("userId")',
      );
      await queryRunner.query(
        'create index "verification_identifier_idx" on "verification" ("identifier")',
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TABLE "verification", "auth_accounts", "session"',
    );
    const users = await queryRunner.getTable('users');
    const unique = users?.uniques.find(
      (key) => key.columnNames.length === 1 && key.columnNames[0] === 'email',
    );
    if (unique) await queryRunner.dropUniqueConstraint('users', unique);
  }
}
