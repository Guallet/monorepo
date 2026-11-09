import { persistBankTransactions } from './persist-bank-transactions';
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
}): Promise<number> {
  const externalId = (id: string | number) =>
    `${provider}:${userId}:${remoteAccountId}:${id}`;
  const rows = transactions.map((transaction) => {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(transaction.date)
      ? new Date(`${transaction.date}T12:00:00.000Z`)
      : new Date(transaction.date);
    return {
      accountId,
      externalId: externalId(transaction.id),
      amount: Number(transaction.amount),
      currency: transaction.currency || currency,
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
  return await persistBankTransactions(repository, accountId, rows);
}
