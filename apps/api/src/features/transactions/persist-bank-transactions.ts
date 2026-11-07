import { In, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

type BankTransaction = Pick<
  Transaction,
  | 'accountId'
  | 'externalId'
  | 'amount'
  | 'currency'
  | 'date'
  | 'description'
  | 'metadata'
>;

/** Returns newly imported, uncategorized transactions for this local account. */
export async function persistBankTransactions(
  repository: Repository<Transaction>,
  accountId: string,
  rows: BankTransaction[],
): Promise<number> {
  const uniqueRows = [
    ...new Map(rows.map((row) => [row.externalId, row])).values(),
  ];
  if (!uniqueRows.length) return 0;
  const existingIds = new Set<string>();
  // Keep the lookup bounded even for providers returning years of history.
  for (let offset = 0; offset < uniqueRows.length; offset += 1000) {
    const existing = await repository.find({
      select: { externalId: true },
      where: {
        accountId,
        externalId: In(
          uniqueRows.slice(offset, offset + 1000).map((row) => row.externalId),
        ),
      },
      withDeleted: true,
    });
    for (const row of existing) existingIds.add(row.externalId);
  }
  await repository.upsert(uniqueRows, {
    conflictPaths: ['externalId'],
    skipUpdateIfNoValuesChanged: true,
  });
  return uniqueRows.filter((row) => !existingIds.has(row.externalId)).length;
}
