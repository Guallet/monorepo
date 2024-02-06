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

  static fromDomain(args: {
    transactions: Transaction[];
    total: number;
    hasMore: boolean;
    query: TransactionsQueryFilter;
  }): TransactionsResultDto {
    const { transactions, total, hasMore, query } = args;
    return {
      meta: {
        total: total,
        page: query.page,
        pageSize: query.pageSize,
        hasMore: hasMore,
        query: query,
      },
      transactions: transactions.map((x) => TransactionDto.fromDomain(x)),
    };
  }
}
