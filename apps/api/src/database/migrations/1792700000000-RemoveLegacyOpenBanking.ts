import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLegacyOpenBanking1792700000000 implements MigrationInterface {
  name = 'RemoveLegacyOpenBanking1792700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "institutions" DROP CONSTRAINT IF EXISTS "UQ_d2c9753bf4a8d160e1f6e3ee1b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "institutions" DROP COLUMN IF EXISTS "nordigen_id"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "nordigen_credentials" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "nordigen_token" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "nordigen_requisitions" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "nordigen_accounts" CASCADE`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."nordigen_accounts_cashaccounttype_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."nordigen_accounts_cashaccounttype_enum" AS ENUM('CACC', 'CARD', 'CASH', 'CHAR', 'CISH', 'COMM', 'CPAC', 'LLSV', 'LOAN', 'MGLD', 'MOMA', 'NREX', 'ODFT', 'ONDP', 'OTHR', 'SACC', 'SLRY', 'SVGS', 'TAXE', 'TRAN', 'TRAS', 'VACC', 'NFCA', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "nordigen_accounts" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" character varying NOT NULL, "resource_id" character varying, "created" TIMESTAMP, "last_accessed" TIMESTAMP, "last_refreshed" TIMESTAMP, "iban" character varying, "institution_id" character varying NOT NULL, "status" character varying, "bic" character varying, "owner_name" character varying, "metadata_status" character varying, "metadata_raw" jsonb, "details_raw" jsonb, "currency" character varying, "name" character varying, "product" character varying, "cashAccountType" "public"."nordigen_accounts_cashaccounttype_enum" DEFAULT 'UNKNOWN', "maskedPan" character varying, "details" character varying, "linked_account_id" character varying, CONSTRAINT "PK_0694e94eb8c80d33698f181dcf0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nordigen_requisitions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" character varying NOT NULL, "created" TIMESTAMP NOT NULL, "redirect" character varying NOT NULL, "status" character varying NOT NULL, "institution_id" character varying NOT NULL, "agreement" character varying NOT NULL, "reference" character varying NOT NULL, "user_id" character varying NOT NULL, "accounts" text NOT NULL, "user_language" character varying, "link" character varying NOT NULL, "ssn" character varying, "account_selection" boolean, "redirect_immediate" boolean, CONSTRAINT "PK_877df2653dcdba274df1e50e62f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nordigen_token" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "access" text NOT NULL, "refresh" text NOT NULL, "access_expires_on" TIMESTAMP NOT NULL, "refresh_expires_on" TIMESTAMP NOT NULL, "user_id" text NOT NULL, CONSTRAINT "PK_bc2732184c5778e6380add85a17" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_nordigen_token_user_id" ON "nordigen_token" ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_token" ADD CONSTRAINT "FK_nordigen_token_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `CREATE TABLE "nordigen_credentials" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "encrypted_credentials" text NOT NULL, "credential_hint" text, CONSTRAINT "PK_nordigen_credentials" PRIMARY KEY ("id"), CONSTRAINT "UQ_nordigen_credentials_user_id" UNIQUE ("user_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_credentials" ADD CONSTRAINT "FK_nordigen_credentials_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "institutions" ADD "nordigen_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "institutions" ADD CONSTRAINT "UQ_d2c9753bf4a8d160e1f6e3ee1b5" UNIQUE ("nordigen_id")`,
    );
  }
}
