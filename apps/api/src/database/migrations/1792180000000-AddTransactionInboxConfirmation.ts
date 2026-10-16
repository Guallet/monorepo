import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionInboxConfirmation1792180000000
  implements MigrationInterface
{
  name = 'AddTransactionInboxConfirmation1792180000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "inboxConfirmedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "inboxConfirmedAt"`,
    );
  }
}
