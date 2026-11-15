import { randomUUID } from 'node:crypto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, EntitySchema } from 'typeorm';
import type { UpdateAccountRequest } from './dto/update-account-request.dto';
import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';
import { AccountType } from './entities/accountType.model';
import { Transaction } from '../transactions/entities/transaction.entity';

function updateDto(
  fields: Partial<UpdateAccountRequest>,
): UpdateAccountRequest {
  return {
    name: 'Account',
    type: AccountType.CURRENT_ACCOUNT,
    currency: 'GBP',
    ...fields,
  };
}

// Exercise real transaction/row-lock behaviour in an isolated schema, never public.
const databaseUrl = process.env.GUALLET_TEST_DATABASE_URL;
describe.skipIf(!databaseUrl)('Accounts atomic ledger integration', () => {
  const schema = `account_fix_${randomUUID().replaceAll('-', '')}`;
  const userId = randomUUID();
  let bootstrap: DataSource;
  let database: DataSource;
  let service: AccountsService;
  let accountId: string;

  beforeAll(async () => {
    bootstrap = new DataSource({ type: 'postgres', url: databaseUrl });
    await bootstrap.initialize();
    await bootstrap.query(`CREATE SCHEMA "${schema}"`);
    database = new DataSource({
      type: 'postgres',
      url: databaseUrl,
      schema,
      synchronize: true,
      entities: [
        new EntitySchema<Account>({
          name: 'AccountFixture',
          target: Account,
          tableName: 'accounts',
          columns: {
            id: { type: 'uuid', primary: true, generated: 'uuid' },
            user_id: { type: String },
            name: { type: String },
            balance: { type: 'numeric' },
            currency: { type: String },
            type: { type: String },
          },
          checks: [{ expression: 'balance <= 2000' }],
        }),
        new EntitySchema<Transaction>({
          name: 'TransactionFixture',
          target: Transaction,
          tableName: 'transactions',
          columns: {
            id: { type: 'uuid', primary: true, generated: 'uuid' },
            accountId: { type: 'uuid' },
            amount: { type: 'numeric' },
            currency: { type: String },
            date: { type: 'timestamptz' },
            description: { type: String },
            notes: { type: String, nullable: true },
          },
          checks: [
            { expression: "description <> 'Initial balance' OR amount < 500" },
          ],
        }),
      ],
    });
    await database.initialize();
    service = new AccountsService(database.getRepository(Account));
  });

  beforeEach(async () => {
    await database.getRepository(Transaction).clear();
    await database.getRepository(Account).clear();
    accountId = randomUUID();
    await database.getRepository(Account).save({
      id: accountId,
      user_id: userId,
      name: 'Account',
      balance: 100,
      currency: 'GBP',
      type: AccountType.CURRENT_ACCOUNT,
    });
  });

  afterAll(async () => {
    if (database?.isInitialized) await database.destroy();
    if (bootstrap?.isInitialized) {
      await bootstrap.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await bootstrap.destroy();
    }
  });

  it.each([
    [150, 50],
    [50, -50],
    [100, 0],
  ])(
    'keeps balance %s consistent with its ledger delta',
    async (balance, expected) => {
      await service.update({
        accountId,
        userId,
        dto: updateDto({ balance, create_balance_transaction: true }),
      });
      const account = await database
        .getRepository(Account)
        .findOneByOrFail({ id: accountId });
      const rows = await database.getRepository(Transaction).find();
      expect(Number(account.balance)).toBe(balance);
      expect(rows.reduce((sum, row) => sum + Number(row.amount), 0)).toBe(
        expected,
      );
      expect(rows).toHaveLength(expected === 0 ? 0 : 1);
    },
  );

  it('rolls back the ledger insert when the account update fails', async () => {
    await expect(
      service.update({
        accountId,
        userId,
        dto: updateDto({ balance: 3000, create_balance_transaction: true }),
      }),
    ).rejects.toThrow();
    expect(
      Number(
        (
          await database
            .getRepository(Account)
            .findOneByOrFail({ id: accountId })
        ).balance,
      ),
    ).toBe(100);
    expect(await database.getRepository(Transaction).count()).toBe(0);
  });

  it('rolls back a new account when its opening transaction fails', async () => {
    await expect(
      service.create({
        user_id: userId,
        dto: {
          name: 'New account',
          type: AccountType.CURRENT_ACCOUNT,
          currency: 'GBP',
          initial_balance: 1000,
          create_balance_transaction: true,
        },
      }),
    ).rejects.toThrow();
    expect(await database.getRepository(Account).count()).toBe(1);
    expect(await database.getRepository(Transaction).count()).toBe(0);
  });

  it('serialises concurrent adjustments using the locked account balance', async () => {
    await Promise.all(
      [150, 200].map((balance) =>
        service.update({
          accountId,
          userId,
          dto: updateDto({ balance, create_balance_transaction: true }),
        }),
      ),
    );
    const account = await database
      .getRepository(Account)
      .findOneByOrFail({ id: accountId });
    const rows = await database.getRepository(Transaction).find();
    expect(rows).toHaveLength(2);
    expect(rows.reduce((sum, row) => sum + Number(row.amount), 0)).toBe(
      Number(account.balance) - 100,
    );
  });

  it('keeps ownership checks inside the transaction', async () => {
    await expect(
      service.update({
        accountId,
        userId: randomUUID(),
        dto: updateDto({ balance: 150, create_balance_transaction: true }),
      }),
    ).rejects.toThrow(NotFoundException);
    expect(await database.getRepository(Transaction).count()).toBe(0);
  });

  it('rejects recorded currency changes without modifying either table', async () => {
    await expect(
      service.update({
        accountId,
        userId,
        dto: updateDto({
          balance: 150,
          currency: 'USD',
          create_balance_transaction: true,
        }),
      }),
    ).rejects.toThrow(BadRequestException);
    const account = await database
      .getRepository(Account)
      .findOneByOrFail({ id: accountId });
    expect(account.currency).toBe('GBP');
    expect(Number(account.balance)).toBe(100);
    expect(await database.getRepository(Transaction).count()).toBe(0);
  });
});
