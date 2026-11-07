import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyBankConnections1792800000000 implements MigrationInterface {
  name = 'UnifyBankConnections1792800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nordigen_links" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "remote_account_id" text NOT NULL, "guallet_account_id" uuid NOT NULL, "is_linked" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_283e2ce64b518327dd31bfe8311" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "nordigen_links_owner_remote_unique" ON "nordigen_links"  ("user_id", "remote_account_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "bank_connections" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "provider_id" text NOT NULL, "encrypted_credentials" text NOT NULL, "credential_hint" text, "credential_version" integer NOT NULL DEFAULT '1', "accounts" jsonb NOT NULL DEFAULT '[]'::jsonb, "accounts_refreshed_at" TIMESTAMP, "last_synced_at" TIMESTAMP, CONSTRAINT "PK_e819ec14a4c20543aec5749da80" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "bank_connections_owner_provider_unique" ON "bank_connections"  ("user_id", "provider_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "bank_authorizations" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "connection_id" uuid NOT NULL, "remote_id" text NOT NULL, "account_ids" jsonb NOT NULL DEFAULT '[]'::jsonb, "completed_at" TIMESTAMP, "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_ef476a3303d1280e4801e4023c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_links" ADD CONSTRAINT "nordigen_links_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_links" ADD CONSTRAINT "nordigen_links_account" FOREIGN KEY ("guallet_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_connections" ADD CONSTRAINT "bank_connections_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_authorizations" ADD CONSTRAINT "bank_authorizations_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_authorizations" ADD CONSTRAINT "bank_authorizations_connection" FOREIGN KEY ("connection_id") REFERENCES "bank_connections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    // Preserve encrypted bytes: the connection reader understands the existing
    // API-key format and Nordigen's encrypted JSON secret pair.
    await queryRunner.query(
      `INSERT INTO "bank_connections" ("user_id", "provider_id", "encrypted_credentials", "credential_hint", "created_at", "updated_at") SELECT "user_id", 'lunchflow', "encrypted_api_key", "api_key_hint", "created_at", "updated_at" FROM "lunchflow_credentials" WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "bank_connections" ("user_id", "provider_id", "encrypted_credentials", "credential_hint", "created_at", "updated_at") SELECT "user_id", 'banksync', "encrypted_api_key", "api_key_hint", "created_at", "updated_at" FROM "banksync_credentials" WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "bank_connections" ("user_id", "provider_id", "encrypted_credentials", "credential_hint", "created_at", "updated_at") SELECT "user_id", 'synci', "encrypted_api_key", "api_key_hint", "created_at", "updated_at" FROM "synci_credentials" WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "bank_connections" ("user_id", "provider_id", "encrypted_credentials", "credential_hint", "created_at", "updated_at") SELECT "user_id", 'nordigen', "encrypted_credentials", "credential_hint", "created_at", "updated_at" FROM "nordigen_credentials" WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `INSERT INTO "nordigen_links" ("user_id", "remote_account_id", "guallet_account_id") SELECT a."user_id", n."id", a."id" FROM "nordigen_accounts" n JOIN "accounts" a ON a."id"::text = n."linked_account_id" JOIN "users" u ON u."id" = a."user_id" WHERE n."deleted_at" IS NULL AND a."deleted_at" IS NULL ON CONFLICT DO NOTHING`,
    );
    await queryRunner.query(
      `INSERT INTO "bank_authorizations" ("user_id", "connection_id", "remote_id", "account_ids", "completed_at", "expires_at") SELECT r."user_id", c."id", r."id", to_jsonb(COALESCE(string_to_array(NULLIF(r."accounts", ''), ','), ARRAY[]::text[])), CASE WHEN r."status" = 'LN' THEN now() ELSE NULL END, now() + interval '1 hour' FROM "nordigen_requisitions" r JOIN "bank_connections" c ON c."user_id" = r."user_id" AND c."provider_id" = 'nordigen' WHERE r."deleted_at" IS NULL`,
    );
    // Remove redundant secrets so disconnecting a new connection really removes
    // saved credentials. Keep legacy tables for a reversible schema migration.
    await queryRunner.query(`DELETE FROM "lunchflow_credentials"`);
    await queryRunner.query(`DELETE FROM "banksync_credentials"`);
    await queryRunner.query(`DELETE FROM "synci_credentials"`);
    await queryRunner.query(`DELETE FROM "nordigen_credentials"`);
    await queryRunner.query(`DELETE FROM "nordigen_token"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // The old model has globally unique provider IDs and requires bank metadata
    // that the new mapping model does not store. Refuse a lossy rollback after
    // new Nordigen authorizations/imports have been created.
    await queryRunner.query(`DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM "nordigen_links" l
        WHERE NOT EXISTS (
          SELECT 1 FROM "nordigen_accounts" n JOIN "accounts" a
            ON a."id"::text = n."linked_account_id"
          WHERE n."id" = l."remote_account_id" AND a."user_id" = l."user_id"
        )
      ) OR EXISTS (
        SELECT 1 FROM "bank_authorizations" b
        WHERE NOT EXISTS (
          SELECT 1 FROM "nordigen_requisitions" r
          WHERE r."id" = b."remote_id" AND r."user_id" = b."user_id"
        )
      ) THEN
        RAISE EXCEPTION 'Cannot roll back new Nordigen connections without losing bank links. Restore a database backup or migrate these links explicitly.';
      END IF;
    END $$`);
    await queryRunner.query(
      `UPDATE "nordigen_accounts" n SET "linked_account_id" = CASE WHEN l."is_linked" THEN l."guallet_account_id"::text ELSE NULL END FROM "nordigen_links" l WHERE n."id" = l."remote_account_id"`,
    );
    await queryRunner.query(
      `UPDATE "nordigen_requisitions" r SET "accounts" = COALESCE((SELECT string_agg(value, ',') FROM jsonb_array_elements_text(b."account_ids")), ''), "status" = CASE WHEN b."completed_at" IS NOT NULL THEN 'LN' ELSE r."status" END FROM "bank_authorizations" b WHERE r."id" = b."remote_id" AND r."user_id" = b."user_id"`,
    );
    // Copy current credentials back before removing the shared connection table.
    await queryRunner.query(
      `INSERT INTO "lunchflow_credentials" ("user_id", "encrypted_api_key", "api_key_hint") SELECT "user_id", "encrypted_credentials", COALESCE("credential_hint", '') FROM "bank_connections" WHERE "provider_id" = 'lunchflow' AND "deleted_at" IS NULL ON CONFLICT ("user_id") DO UPDATE SET "encrypted_api_key" = EXCLUDED."encrypted_api_key", "api_key_hint" = EXCLUDED."api_key_hint"`,
    );
    await queryRunner.query(
      `INSERT INTO "banksync_credentials" ("user_id", "encrypted_api_key", "api_key_hint") SELECT "user_id", "encrypted_credentials", COALESCE("credential_hint", '') FROM "bank_connections" WHERE "provider_id" = 'banksync' AND "deleted_at" IS NULL ON CONFLICT ("user_id") DO UPDATE SET "encrypted_api_key" = EXCLUDED."encrypted_api_key", "api_key_hint" = EXCLUDED."api_key_hint"`,
    );
    await queryRunner.query(
      `INSERT INTO "synci_credentials" ("user_id", "encrypted_api_key", "api_key_hint") SELECT "user_id", "encrypted_credentials", COALESCE("credential_hint", '') FROM "bank_connections" WHERE "provider_id" = 'synci' AND "deleted_at" IS NULL ON CONFLICT ("user_id") DO UPDATE SET "encrypted_api_key" = EXCLUDED."encrypted_api_key", "api_key_hint" = EXCLUDED."api_key_hint"`,
    );
    await queryRunner.query(
      `INSERT INTO "nordigen_credentials" ("user_id", "encrypted_credentials", "credential_hint") SELECT "user_id", "encrypted_credentials", COALESCE("credential_hint", '') FROM "bank_connections" WHERE "provider_id" = 'nordigen' AND "deleted_at" IS NULL ON CONFLICT ("user_id") DO UPDATE SET "encrypted_credentials" = EXCLUDED."encrypted_credentials", "credential_hint" = EXCLUDED."credential_hint"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_authorizations" DROP CONSTRAINT "bank_authorizations_connection"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_authorizations" DROP CONSTRAINT "bank_authorizations_owner"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_connections" DROP CONSTRAINT "bank_connections_owner"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_links" DROP CONSTRAINT "nordigen_links_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_links" DROP CONSTRAINT "nordigen_links_owner"`,
    );
    await queryRunner.query(`DROP TABLE "bank_authorizations"`);
    await queryRunner.query(
      `DROP INDEX "public"."bank_connections_owner_provider_unique"`,
    );
    await queryRunner.query(`DROP TABLE "bank_connections"`);
    await queryRunner.query(
      `DROP INDEX "public"."nordigen_links_owner_remote_unique"`,
    );
    await queryRunner.query(`DROP TABLE "nordigen_links"`);
  }
}
