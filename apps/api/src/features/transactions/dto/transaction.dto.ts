import { Transaction } from '../entities/transaction.entity';
import { TransactionsQueryFilter } from './transaction.query';

export class TransactionDto {
  id: string;
  accountId: string;
  description: string;
  notes?: string;
  amount: number;
  currency: string;
  date: Date;
  categoryId?: string;

  static fromDomain(domain: Transaction): TransactionDto {
    return {
      id: domain.id,
      accountId: domain.accountId,
      amount: domain.amount,
      currency: domain.currency,
      date: domain.date,
      description: domain.description,
      notes: domain.notes,
      categoryId: domain.categoryId,
    };
  }
}

export type TransactionsResultMetadataDto = {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  query: TransactionsQueryFilter;
};

export class TransactionsResultDto {
  meta: TransactionsResultMetadataDto;
  transactions: TransactionDto[];

  static fromDomain({
    transactions,
    total,
    hasMore,
    query,
  }: {
    transactions: Transaction[];
    total: number;
    hasMore: boolean;
    query: TransactionsQueryFilter;
  }): TransactionsResultDto {
    if (!query) {
      query = {
        page: 1,
        pageSize: 50,
      };
    }
    const { page = 1, pageSize = 50 } = query;
    return {
      meta: {
        total: total,
        page: page,
        pageSize: pageSize,
        hasMore: hasMore,
        query: query,
      },
      transactions: transactions.map((x) => TransactionDto.fromDomain(x)),
    };
  }
}
