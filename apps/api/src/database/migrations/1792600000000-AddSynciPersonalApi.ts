import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  createPersonalProviderTables,
  dropPersonalProviderTables,
  PersonalProviderMigrationConfig,
} from '../migration-helpers/personal-provider-migration';

const config: PersonalProviderMigrationConfig = {
  credentialsTable: 'synci_credentials',
  credentialPrimaryKey: 'PK_synci_credentials',
  credentialUniqueIndex: 'synci_credentials_user_id_unique',
  credentialOwnerConstraint: 'synci_credential_owner',
  accountsTable: 'synci_accounts',
  accountPrimaryKey: 'PK_synci_accounts',
  accountUniqueIndex: 'synci_accounts_user_remote_unique',
  accountOwnerConstraint: 'synci_accounts_owner',
  accountReferenceConstraint: 'synci_accounts_guallet_account',
  remoteColumns: [
    { name: 'remote_account_id', type: 'text' },
    { name: 'remote_connection_id', type: 'text', nullable: true },
  ],
  uniqueRemoteColumns: ['remote_account_id'],
};

export class AddSynciPersonalApi1792600000000 implements MigrationInterface {
  name = 'AddSynciPersonalApi1792600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createPersonalProviderTables(queryRunner, config);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await dropPersonalProviderTables(queryRunner, config);
  }
}
