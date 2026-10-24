import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  createPersonalProviderTables,
  dropPersonalProviderTables,
  PersonalProviderMigrationConfig,
} from '../migration-helpers/personal-provider-migration';

const config: PersonalProviderMigrationConfig = {
  credentialsTable: 'banksync_credentials',
  credentialPrimaryKey: 'PK_banksync_credentials',
  credentialUniqueIndex: 'banksync_credentials_user_id_unique',
  credentialOwnerConstraint: 'banksync_credential_owner',
  accountsTable: 'banksync_accounts',
  accountPrimaryKey: 'PK_banksync_accounts',
  accountUniqueIndex: 'banksync_accounts_user_remote_unique',
  accountOwnerConstraint: 'banksync_accounts_owner',
  accountReferenceConstraint: 'banksync_accounts_guallet_account',
  remoteColumns: [
    { name: 'remote_bank_id', type: 'text' },
    { name: 'remote_account_id', type: 'text' },
  ],
  uniqueRemoteColumns: ['remote_bank_id', 'remote_account_id'],
  additionalAccountColumns: [
    { name: 'last_synced_at', type: 'TIMESTAMP', nullable: true },
  ],
};

export class AddBankSyncPersonalApi1792520000000 implements MigrationInterface {
  name = 'AddBankSyncPersonalApi1792520000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createPersonalProviderTables(queryRunner, config);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropPersonalProviderTables(queryRunner, config);
  }
}
