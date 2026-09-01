import { Transaction } from '../entities/transaction.entity.js';
import type { TransactionsQueryFilter } from './transaction.query.js';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ format: 'uuid' })
  accountId: string;
  @ApiProperty()
  description: string;
  @ApiProperty({ required: false })
  notes?: string;
  @ApiProperty()
  amount: number;
  @ApiProperty()
  currency: string;
  @ApiProperty({ type: String, format: 'date-time' })
  date: Date;
  @ApiProperty({ required: false, nullable: true, format: 'uuid' })
  categoryId?: string | null;

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

export class TransactionsResultMetadataDto {
  @ApiProperty()
  total: number;
  @ApiProperty()
  page: number;
  @ApiProperty()
  pageSize: number;
  @ApiProperty()
  hasMore: boolean;
  @ApiProperty({ type: Object })
  query: TransactionsQueryFilter;
}

export class TransactionsResultDto {
  @ApiProperty({ type: Object })
  meta: TransactionsResultMetadataDto;
  @ApiProperty({ type: () => [TransactionDto] })
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
