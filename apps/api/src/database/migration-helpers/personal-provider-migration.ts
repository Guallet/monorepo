import { QueryRunner } from 'typeorm';

type ProviderColumn = {
  name: string;
  type: string;
  nullable?: boolean;
  default?: string;
};

export type PersonalProviderMigrationConfig = {
  credentialsTable: string;
  credentialPrimaryKey: string;
  credentialUniqueIndex: string;
  credentialOwnerConstraint: string;
  accountsTable: string;
  accountPrimaryKey: string;
  accountUniqueIndex: string;
  accountOwnerConstraint: string;
  accountReferenceConstraint: string;
  remoteColumns: ProviderColumn[];
  uniqueRemoteColumns: string[];
  additionalAccountColumns?: ProviderColumn[];
};

const quote = (identifier: string) => `"${identifier}"`;

export async function createPersonalProviderTables(
  queryRunner: QueryRunner,
  config: PersonalProviderMigrationConfig,
): Promise<void> {
  await queryRunner.query(
    `CREATE TABLE ${quote(config.credentialsTable)} ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "encrypted_api_key" text NOT NULL, "api_key_hint" text NOT NULL, CONSTRAINT ${quote(config.credentialPrimaryKey)} PRIMARY KEY ("id"))`,
  );
  await queryRunner.query(
    `CREATE UNIQUE INDEX ${quote(config.credentialUniqueIndex)} ON ${quote(config.credentialsTable)} ("user_id")`,
  );

  const columns = [
    { name: 'created_at', type: 'TIMESTAMP', default: 'now()' },
    { name: 'updated_at', type: 'TIMESTAMP', default: 'now()' },
    { name: 'deleted_at', type: 'TIMESTAMP', nullable: true },
    { name: 'id', type: 'uuid', default: 'uuid_generate_v4()' },
    { name: 'user_id', type: 'text' },
    ...config.remoteColumns,
    { name: 'guallet_account_id', type: 'uuid' },
    { name: 'is_linked', type: 'boolean', default: 'true' },
    ...(config.additionalAccountColumns ?? []),
  ];
  const columnDefinitions = columns
    .map((column) => {
      const nullable = column.nullable ? '' : ' NOT NULL';
      const defaultValue = column.default ? ` DEFAULT ${column.default}` : '';
      return `${quote(column.name)} ${column.type}${nullable}${defaultValue}`;
    })
    .join(', ');
  await queryRunner.query(
    `CREATE TABLE ${quote(config.accountsTable)} (${columnDefinitions}, CONSTRAINT ${quote(config.accountPrimaryKey)} PRIMARY KEY ("id"))`,
  );
  const uniqueColumns = ['user_id', ...config.uniqueRemoteColumns]
    .map(quote)
    .join(', ');
  await queryRunner.query(
    `CREATE UNIQUE INDEX ${quote(config.accountUniqueIndex)} ON ${quote(config.accountsTable)} (${uniqueColumns})`,
  );
  await queryRunner.query(
    `ALTER TABLE ${quote(config.credentialsTable)} ADD CONSTRAINT ${quote(config.credentialOwnerConstraint)} FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
  );
  await queryRunner.query(
    `ALTER TABLE ${quote(config.accountsTable)} ADD CONSTRAINT ${quote(config.accountOwnerConstraint)} FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
  );
  await queryRunner.query(
    `ALTER TABLE ${quote(config.accountsTable)} ADD CONSTRAINT ${quote(config.accountReferenceConstraint)} FOREIGN KEY ("guallet_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE`,
  );
}

export async function dropPersonalProviderTables(
  queryRunner: QueryRunner,
  config: PersonalProviderMigrationConfig,
): Promise<void> {
  await queryRunner.query(
    `ALTER TABLE ${quote(config.accountsTable)} DROP CONSTRAINT ${quote(config.accountReferenceConstraint)}`,
  );
  await queryRunner.query(
    `ALTER TABLE ${quote(config.accountsTable)} DROP CONSTRAINT ${quote(config.accountOwnerConstraint)}`,
  );
  await queryRunner.query(
    `ALTER TABLE ${quote(config.credentialsTable)} DROP CONSTRAINT ${quote(config.credentialOwnerConstraint)}`,
  );
  await queryRunner.query(`DROP INDEX ${quote(config.accountUniqueIndex)}`);
  await queryRunner.query(`DROP TABLE ${quote(config.accountsTable)}`);
  await queryRunner.query(`DROP INDEX ${quote(config.credentialUniqueIndex)}`);
  await queryRunner.query(`DROP TABLE ${quote(config.credentialsTable)}`);
}
