import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBankConnectionErrorState1794052099545 implements MigrationInterface {
  name = 'AddBankConnectionErrorState1794052099545';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bank_connections" ADD "last_error" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bank_connections" DROP COLUMN "last_error"`,
    );
  }
}
