import { Money } from '@guallet/money';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import {
  TransactionDataProvider,
  TransactionMetadata,
} from './entities/transaction-metadata.model';

export type PersonalProviderTransaction = {
  id: string | number;
  amount: number | string;
  currency?: string | null;
  date: string;
  merchant?: string | null;
  description?: string | null;
  name?: string | null;
};

export async function persistPersonalProviderTransactions({
  repository,
  accountId,
  provider,
  userId,
  remoteAccountId,
  currency,
  transactions,
}: {
  repository: Repository<Transaction>;
  accountId: string;
  provider: Extract<
    TransactionDataProvider,
    'lunchflow' | 'synci' | 'banksync'
  >;
  userId: string;
  remoteAccountId: string;
  currency: string;
  transactions: PersonalProviderTransaction[];
}): Promise<void> {
  const externalId = (id: string | number) =>
    `${provider}:${userId}:${remoteAccountId}:${id}`;
  const legacyExternalIds = transactions.map(
    (transaction) => `${provider}:${accountId}:${transaction.id}`,
  );
  const existing =
    legacyExternalIds.length > 0
      ? await repository
          .createQueryBuilder('transaction')
          .where('transaction.accountId = :accountId', { accountId })
          .andWhere("transaction.metadata ->> 'provider' = :provider", {
            provider,
          })
          .andWhere('transaction.externalId IN (:...legacyExternalIds)', {
            legacyExternalIds,
          })
          .getMany()
      : [];
  const existingByRemoteId = new Map(
    existing.flatMap((transaction) => {
      const data = transaction.metadata?.data;
      if (typeof data !== 'object' || data === null || !('id' in data)) {
        return [];
      }
      return [[String(data.id), transaction] as const];
    }),
  );
  const externalIdUpdates = transactions.flatMap((transaction) => {
    const row = existingByRemoteId.get(String(transaction.id));
    const nextExternalId = externalId(transaction.id);
    return row && row.externalId !== nextExternalId
      ? [{ id: row.id, externalId: nextExternalId }]
      : [];
  });
  if (externalIdUpdates.length > 0) {
    const driver = repository.manager.connection.driver;
    const escape = (name: string) => driver.escape(name);
    const idColumn = repository.metadata.primaryColumns[0].databaseName;
    const externalIdColumn =
      repository.metadata.findColumnWithPropertyName(
        'externalId',
      )!.databaseName;
    const cases = externalIdUpdates
      .map(
        (_, index) =>
          `WHEN ${escape(idColumn)} = $${index * 2 + 1} THEN $${index * 2 + 2}`,
      )
      .join(' ');
    const values = externalIdUpdates.flatMap((update) => [
      update.id,
      update.externalId,
    ]);
    const ids = externalIdUpdates
      .map((_, index) => `$${index * 2 + 1}`)
      .join(', ');
    await repository.query(
      `UPDATE ${escape(repository.metadata.tableName)} SET ${escape(externalIdColumn)} = CASE ${cases} END WHERE ${escape(idColumn)} IN (${ids})`,
      values,
    );
  }
  const rows = transactions.map((transaction) => {
    const money = Money.fromCurrencyCode({
      amount: Number(transaction.amount),
      currencyCode: transaction.currency || currency,
    });
    const date = /^\d{4}-\d{2}-\d{2}$/.test(transaction.date)
      ? new Date(`${transaction.date}T12:00:00.000Z`)
      : new Date(transaction.date);
    return {
      accountId,
      externalId: externalId(transaction.id),
      amount: money.amount,
      currency: money.currency.code,
      date,
      description:
        transaction.merchant ||
        transaction.description ||
        transaction.name ||
        '',
      metadata: {
        provider,
        data: transaction as TransactionMetadata['data'],
      },
    };
  });
  if (rows.length > 0) {
    await repository.upsert(rows, {
      conflictPaths: ['externalId'],
      skipUpdateIfNoValuesChanged: true,
    });
  }
}
