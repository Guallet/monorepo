import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBankConnections1794070832529 implements MigrationInterface {
  name = 'AddBankConnections1794070832529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_credentials" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "key" text NOT NULL, "encrypted_credentials" text NOT NULL, "hint" text, "version" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_5cadc04d03e2d9fe76e1b44eb34" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "user_credentials_owner_key_unique" ON "user_credentials"  ("user_id", "key") `,
    );
    await queryRunner.query(
      `CREATE TABLE "bank_connections" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "provider_id" text NOT NULL, "accounts" jsonb NOT NULL DEFAULT '[]'::jsonb, "accounts_refreshed_at" TIMESTAMP, "last_synced_at" TIMESTAMP, "last_error" jsonb, CONSTRAINT "PK_e819ec14a4c20543aec5749da80" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "bank_connections_owner_provider_unique" ON "bank_connections"  ("user_id", "provider_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "connected_accounts" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "provider" text NOT NULL, "remote_account_id" text NOT NULL, "remote_connection_id" text, "guallet_account_id" uuid NOT NULL, "is_linked" boolean NOT NULL DEFAULT true, "last_synced_at" TIMESTAMP WITH TIME ZONE, "raw" jsonb, CONSTRAINT "PK_70416f1da0be645bb31da01c774" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "connected_accounts_owner_provider_remote_unique" ON "connected_accounts"  ("user_id", "provider", "remote_account_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "bank_authorizations" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "connection_id" uuid NOT NULL, "remote_id" text NOT NULL, "account_ids" jsonb NOT NULL DEFAULT '[]'::jsonb, "completed_at" TIMESTAMP, "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_ef476a3303d1280e4801e4023c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_connections" ADD CONSTRAINT "bank_connections_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_account" FOREIGN KEY ("guallet_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_authorizations" ADD CONSTRAINT "bank_authorizations_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_authorizations" ADD CONSTRAINT "bank_authorizations_connection" FOREIGN KEY ("connection_id") REFERENCES "bank_connections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    // The original baseline creates obsolete Nordigen tables. This feature
    // starts empty, so remove them without copying historical data.
    await queryRunner.query(`DROP TABLE "nordigen_accounts"`);
    await queryRunner.query(
      `DROP TYPE "public"."nordigen_accounts_cashaccounttype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "nordigen_requisitions"`);
    await queryRunner.query(`DROP TABLE "nordigen_token"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_credentials"`);
    await queryRunner.query(
      `ALTER TABLE "bank_authorizations" DROP CONSTRAINT "bank_authorizations_connection"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_authorizations" DROP CONSTRAINT "bank_authorizations_owner"`,
    );
    await queryRunner.query(
      `ALTER TABLE "connected_accounts" DROP CONSTRAINT "connected_accounts_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "connected_accounts" DROP CONSTRAINT "connected_accounts_owner"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_connections" DROP CONSTRAINT "bank_connections_owner"`,
    );
    await queryRunner.query(`DROP TABLE "bank_authorizations"`);
    await queryRunner.query(
      `DROP INDEX "public"."connected_accounts_owner_provider_remote_unique"`,
    );
    await queryRunner.query(`DROP TABLE "connected_accounts"`);
    await queryRunner.query(
      `DROP INDEX "public"."bank_connections_owner_provider_unique"`,
    );
    await queryRunner.query(`DROP TABLE "bank_connections"`);
    // Restore only the empty baseline schema on rollback.
    await queryRunner.query(
      `CREATE TABLE "nordigen_token" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "access" character varying NOT NULL, "refresh" character varying NOT NULL, "access_expires_on" TIMESTAMP NOT NULL, "refresh_expires_on" TIMESTAMP NOT NULL, CONSTRAINT "PK_bc2732184c5778e6380add85a17" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nordigen_requisitions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" character varying NOT NULL, "created" TIMESTAMP NOT NULL, "redirect" character varying NOT NULL, "status" character varying NOT NULL, "institution_id" character varying NOT NULL, "agreement" character varying NOT NULL, "reference" character varying NOT NULL, "user_id" character varying NOT NULL, "accounts" text NOT NULL, "user_language" character varying, "link" character varying NOT NULL, "ssn" character varying, "account_selection" boolean, "redirect_immediate" boolean, CONSTRAINT "PK_877df2653dcdba274df1e50e62f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."nordigen_accounts_cashaccounttype_enum" AS ENUM('CACC', 'CARD', 'CASH', 'CHAR', 'CISH', 'COMM', 'CPAC', 'LLSV', 'LOAN', 'MGLD', 'MOMA', 'NREX', 'ODFT', 'ONDP', 'OTHR', 'SACC', 'SLRY', 'SVGS', 'TAXE', 'TRAN', 'TRAS', 'VACC', 'NFCA', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "nordigen_accounts" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" character varying NOT NULL, "resource_id" character varying, "created" TIMESTAMP, "last_accessed" TIMESTAMP, "last_refreshed" TIMESTAMP, "iban" character varying, "institution_id" character varying NOT NULL, "status" character varying, "bic" character varying, "owner_name" character varying, "metadata_status" character varying, "metadata_raw" jsonb, "details_raw" jsonb, "currency" character varying, "name" character varying, "product" character varying, "cashAccountType" "public"."nordigen_accounts_cashaccounttype_enum" DEFAULT 'UNKNOWN', "maskedPan" character varying, "details" character varying, "linked_account_id" character varying, CONSTRAINT "PK_0694e94eb8c80d33698f181dcf0" PRIMARY KEY ("id"))`,
    );
  }
}
