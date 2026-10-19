import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLunchFlowPersonalApi1792412381654 implements MigrationInterface {
  name = 'AddLunchFlowPersonalApi1792412381654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "lunchflow_credentials" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "encrypted_api_key" text NOT NULL, "api_key_hint" text NOT NULL, CONSTRAINT "PK_lunchflow_credentials" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "lunchflow_credentials_user_id_unique" ON "lunchflow_credentials" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE TABLE "lunchflow_accounts" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "remote_account_id" text NOT NULL, "remote_connection_id" text, "guallet_account_id" uuid NOT NULL, "is_linked" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_lunchflow_accounts" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "lunchflow_accounts_user_remote_unique" ON "lunchflow_accounts" ("user_id", "remote_account_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "lunchflow_credentials" ADD CONSTRAINT "lunchflow_credential_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "lunchflow_accounts" ADD CONSTRAINT "lunchflow_accounts_owner" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "lunchflow_accounts" ADD CONSTRAINT "lunchflow_accounts_guallet_account" FOREIGN KEY ("guallet_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lunchflow_accounts" DROP CONSTRAINT "lunchflow_accounts_guallet_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lunchflow_accounts" DROP CONSTRAINT "lunchflow_accounts_owner"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lunchflow_credentials" DROP CONSTRAINT "lunchflow_credential_owner"`,
    );
    await queryRunner.query(
      `DROP INDEX "lunchflow_accounts_user_remote_unique"`,
    );
    await queryRunner.query(`DROP TABLE "lunchflow_accounts"`);
    await queryRunner.query(
      `DROP INDEX "lunchflow_credentials_user_id_unique"`,
    );
    await queryRunner.query(`DROP TABLE "lunchflow_credentials"`);
  }
}
