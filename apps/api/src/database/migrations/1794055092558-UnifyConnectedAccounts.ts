import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyConnectedAccounts1794055092558 implements MigrationInterface {
  name = 'UnifyConnectedAccounts1794055092558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Keep legacy writers out until every link has been copied and the old
    // tables have been removed. TypeORM runs this migration in a transaction.
    await queryRunner.query(
      `LOCK TABLE lunchflow_accounts, banksync_accounts, synci_accounts, nordigen_links IN ACCESS EXCLUSIVE MODE`,
    );

    await queryRunner.query(
      `CREATE TABLE "connected_accounts" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "provider" text NOT NULL, "remote_account_id" text NOT NULL, "remote_connection_id" text, "guallet_account_id" uuid NOT NULL, "is_linked" boolean NOT NULL DEFAULT true, "last_synced_at" TIMESTAMP WITH TIME ZONE, "raw" jsonb, CONSTRAINT "PK_70416f1da0be645bb31da01c774" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "connected_accounts_owner_provider_remote_unique" ON "connected_accounts"  ("user_id", "provider", "remote_account_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_account" FOREIGN KEY ("guallet_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`INSERT INTO connected_accounts
      (id, created_at, updated_at, deleted_at, user_id, provider, remote_account_id, remote_connection_id, guallet_account_id, is_linked, last_synced_at, raw)
      SELECT a.id, a.created_at, a.updated_at, a.deleted_at, a.user_id, 'lunchflow', a.remote_account_id, a.remote_connection_id, a.guallet_account_id, a.is_linked, b.last_synced_at AT TIME ZONE 'UTC', NULL
      FROM lunchflow_accounts a LEFT JOIN bank_connections b ON b.user_id = a.user_id AND b.provider_id = 'lunchflow' AND b.deleted_at IS NULL`);
    await queryRunner.query(`INSERT INTO connected_accounts
      (id, created_at, updated_at, deleted_at, user_id, provider, remote_account_id, remote_connection_id, guallet_account_id, is_linked, last_synced_at, raw)
      SELECT a.id, a.created_at, a.updated_at, a.deleted_at, a.user_id, 'banksync', '[' || to_json(a.remote_bank_id)::text || ',' || to_json(a.remote_account_id)::text || ']', a.remote_bank_id, a.guallet_account_id, a.is_linked, a.last_synced_at AT TIME ZONE 'UTC', NULL
      FROM banksync_accounts a`);
    await queryRunner.query(`INSERT INTO connected_accounts
      (id, created_at, updated_at, deleted_at, user_id, provider, remote_account_id, remote_connection_id, guallet_account_id, is_linked, last_synced_at, raw)
      SELECT a.id, a.created_at, a.updated_at, a.deleted_at, a.user_id, 'synci', a.remote_account_id, a.remote_connection_id, a.guallet_account_id, a.is_linked, a.last_synced_at, NULL
      FROM synci_accounts a`);
    await queryRunner.query(`INSERT INTO connected_accounts
      (id, created_at, updated_at, deleted_at, user_id, provider, remote_account_id, remote_connection_id, guallet_account_id, is_linked, last_synced_at, raw)
      SELECT a.id, a.created_at, a.updated_at, a.deleted_at, a.user_id, 'nordigen', a.remote_account_id, NULL, a.guallet_account_id, a.is_linked, b.last_synced_at AT TIME ZONE 'UTC', NULL
      FROM nordigen_links a LEFT JOIN bank_connections b ON b.user_id = a.user_id AND b.provider_id = 'nordigen' AND b.deleted_at IS NULL`);
    await queryRunner.query(`DROP TABLE "lunchflow_accounts"`);
    await queryRunner.query(`DROP TABLE "banksync_accounts"`);
    await queryRunner.query(`DROP TABLE "synci_accounts"`);
    await queryRunner.query(`DROP TABLE "nordigen_links"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `LOCK TABLE connected_accounts IN ACCESS EXCLUSIVE MODE`,
    );
    await queryRunner.query(
      `CREATE TABLE "lunchflow_accounts" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "remote_account_id" text NOT NULL, "remote_connection_id" text, "guallet_account_id" uuid NOT NULL, "is_linked" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_lunchflow_accounts" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "lunchflow_accounts_user_remote_unique" ON "lunchflow_accounts" ("user_id", "remote_account_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "lunchflow_accounts" ADD CONSTRAINT "lunchflow_accounts_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "lunchflow_accounts" ADD CONSTRAINT "lunchflow_accounts_guallet_account" FOREIGN KEY ("guallet_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(`INSERT INTO lunchflow_accounts (id, created_at, updated_at, deleted_at, user_id, guallet_account_id, is_linked, remote_account_id, remote_connection_id)
      SELECT id, created_at, updated_at, deleted_at, user_id, guallet_account_id, is_linked, remote_account_id, remote_connection_id FROM connected_accounts WHERE provider = 'lunchflow'`);
    await queryRunner.query(
      `CREATE TABLE "banksync_accounts" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "remote_bank_id" text NOT NULL, "remote_account_id" text NOT NULL, "last_synced_at" TIMESTAMP, "guallet_account_id" uuid NOT NULL, "is_linked" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_banksync_accounts" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "banksync_accounts_user_remote_unique" ON "banksync_accounts" ("user_id", "remote_bank_id", "remote_account_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "banksync_accounts" ADD CONSTRAINT "banksync_accounts_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "banksync_accounts" ADD CONSTRAINT "banksync_accounts_guallet_account" FOREIGN KEY ("guallet_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(`INSERT INTO banksync_accounts (id, created_at, updated_at, deleted_at, user_id, guallet_account_id, is_linked, remote_bank_id, remote_account_id, last_synced_at)
      SELECT id, created_at, updated_at, deleted_at, user_id, guallet_account_id, is_linked, remote_account_id::jsonb ->> 0, remote_account_id::jsonb ->> 1, last_synced_at AT TIME ZONE 'UTC' FROM connected_accounts WHERE provider = 'banksync'`);
    await queryRunner.query(
      `CREATE TABLE "synci_accounts" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "remote_account_id" text NOT NULL, "remote_connection_id" text, "last_synced_at" TIMESTAMPTZ, "guallet_account_id" uuid NOT NULL, "is_linked" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_synci_accounts" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "synci_accounts_user_remote_unique" ON "synci_accounts" ("user_id", "remote_account_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "synci_accounts" ADD CONSTRAINT "synci_accounts_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "synci_accounts" ADD CONSTRAINT "synci_accounts_guallet_account" FOREIGN KEY ("guallet_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(`INSERT INTO synci_accounts (id, created_at, updated_at, deleted_at, user_id, guallet_account_id, is_linked, remote_account_id, remote_connection_id, last_synced_at)
      SELECT id, created_at, updated_at, deleted_at, user_id, guallet_account_id, is_linked, remote_account_id, remote_connection_id, last_synced_at FROM connected_accounts WHERE provider = 'synci'`);
    await queryRunner.query(
      `CREATE TABLE "nordigen_links" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "remote_account_id" text NOT NULL, "guallet_account_id" uuid NOT NULL, "is_linked" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_283e2ce64b518327dd31bfe8311" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "nordigen_links_owner_remote_unique" ON "nordigen_links" ("user_id", "remote_account_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_links" ADD CONSTRAINT "nordigen_links_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_links" ADD CONSTRAINT "nordigen_links_account" FOREIGN KEY ("guallet_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(`INSERT INTO nordigen_links (id, created_at, updated_at, deleted_at, user_id, guallet_account_id, is_linked, remote_account_id)
      SELECT id, created_at, updated_at, deleted_at, user_id, guallet_account_id, is_linked, remote_account_id FROM connected_accounts WHERE provider = 'nordigen'`);
    await queryRunner.query(`DROP TABLE "connected_accounts"`);
  }
}
