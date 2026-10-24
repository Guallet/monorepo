import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserNordigenCredentials1792500000000 implements MigrationInterface {
  name = 'AddUserNordigenCredentials1792500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nordigen_credentials" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "encrypted_credentials" text NOT NULL, "credential_hint" text, CONSTRAINT "PK_nordigen_credentials" PRIMARY KEY ("id"), CONSTRAINT "UQ_nordigen_credentials_user_id" UNIQUE ("user_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_credentials" ADD CONSTRAINT "FK_nordigen_credentials_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(`DELETE FROM "nordigen_token"`);
    await queryRunner.query(`ALTER TABLE "nordigen_token" ADD "user_id" text`);
    await queryRunner.query(
      `ALTER TABLE "nordigen_token" ALTER COLUMN "user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_nordigen_token_user_id" ON "nordigen_token" ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_token" ADD CONSTRAINT "FK_nordigen_token_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_token" ALTER COLUMN "access" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_token" ALTER COLUMN "refresh" TYPE text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "nordigen_token"`);
    await queryRunner.query(
      `ALTER TABLE "nordigen_token" ALTER COLUMN "access" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_token" ALTER COLUMN "refresh" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_token" DROP CONSTRAINT "FK_nordigen_token_user"`,
    );
    await queryRunner.query(`DROP INDEX "UQ_nordigen_token_user_id"`);
    await queryRunner.query(
      `ALTER TABLE "nordigen_token" DROP COLUMN "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nordigen_credentials" DROP CONSTRAINT "FK_nordigen_credentials_user"`,
    );
    await queryRunner.query(`DROP TABLE "nordigen_credentials"`);
  }
}
