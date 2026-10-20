import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBankSyncPersonalApi1792520000000 implements MigrationInterface {
  name = 'AddBankSyncPersonalApi1792520000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "banksync_credentials" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "encrypted_api_key" text NOT NULL, "api_key_hint" text NOT NULL, CONSTRAINT "PK_banksync_credentials" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "banksync_credentials_user_id_unique" ON "banksync_credentials" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE TABLE "banksync_accounts" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "remote_bank_id" text NOT NULL, "remote_account_id" text NOT NULL, "guallet_account_id" uuid NOT NULL, "is_linked" boolean NOT NULL DEFAULT true, "last_synced_at" TIMESTAMP, CONSTRAINT "PK_banksync_accounts" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "banksync_accounts_user_remote_unique" ON "banksync_accounts" ("user_id", "remote_bank_id", "remote_account_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "banksync_credentials" ADD CONSTRAINT "banksync_credential_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "banksync_accounts" ADD CONSTRAINT "banksync_accounts_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "banksync_accounts" ADD CONSTRAINT "banksync_accounts_guallet_account" FOREIGN KEY ("guallet_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "banksync_accounts" DROP CONSTRAINT "banksync_accounts_guallet_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banksync_accounts" DROP CONSTRAINT "banksync_accounts_owner"`,
    );
    await queryRunner.query(
      `ALTER TABLE "banksync_credentials" DROP CONSTRAINT "banksync_credential_owner"`,
    );
    await queryRunner.query(
      `DROP INDEX "banksync_accounts_user_remote_unique"`,
    );
    await queryRunner.query(`DROP TABLE "banksync_accounts"`);
    await queryRunner.query(`DROP INDEX "banksync_credentials_user_id_unique"`);
    await queryRunner.query(`DROP TABLE "banksync_credentials"`);
  }
}
