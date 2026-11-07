import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  createPersonalProviderTables,
  dropPersonalProviderTables,
  PersonalProviderMigrationConfig,
} from '../migration-helpers/personal-provider-migration';

const config: PersonalProviderMigrationConfig = {
  credentialsTable: 'lunchflow_credentials',
  credentialPrimaryKey: 'PK_lunchflow_credentials',
  credentialUniqueIndex: 'lunchflow_credentials_user_id_unique',
  credentialOwnerConstraint: 'lunchflow_credential_owner',
  accountsTable: 'lunchflow_accounts',
  accountPrimaryKey: 'PK_lunchflow_accounts',
  accountUniqueIndex: 'lunchflow_accounts_user_remote_unique',
  accountOwnerConstraint: 'lunchflow_accounts_owner',
  accountReferenceConstraint: 'lunchflow_accounts_guallet_account',
  remoteColumns: [
    { name: 'remote_account_id', type: 'text' },
    { name: 'remote_connection_id', type: 'text', nullable: true },
  ],
  uniqueRemoteColumns: ['remote_account_id'],
};

export class AddLunchFlowPersonalApi1792412381654 implements MigrationInterface {
  name = 'AddLunchFlowPersonalApi1792412381654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createPersonalProviderTables(queryRunner, config);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropPersonalProviderTables(queryRunner, config);
  }
}
