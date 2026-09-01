import { InboxTransaction } from '../entities/inbox-transaction.model.js';
import { ApiProperty } from '@nestjs/swagger';

export class InboxTransactionDto {
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
  @ApiProperty({ required: false, format: 'uuid' })
  processedCategoryId?: string; // TODO: Processed category id based by rules
  @ApiProperty({ required: false, format: 'uuid' })
  ruleId?: string; // TODO: Rule that processed this transaction

  static fromDomain(domain: InboxTransaction): InboxTransactionDto {
    return {
      id: domain.id,
      accountId: domain.accountId,
      amount: domain.amount,
      currency: domain.currency,
      date: domain.date,
      description: domain.description,
      notes: domain.notes,
      processedCategoryId: domain.processed_category_id,
      ruleId: domain.rule_id,
    };
  }
}

export class InboxTransactionsResultMetadataDto {
  @ApiProperty()
  total: number;
  @ApiProperty()
  page: number;
  @ApiProperty()
  pageSize: number;
  @ApiProperty()
  hasMore: boolean;
}

export class InboxTransactionsResultDto {
  @ApiProperty({ type: () => InboxTransactionsResultMetadataDto })
  meta: InboxTransactionsResultMetadataDto;
  @ApiProperty({ type: () => [InboxTransactionDto] })
  transactions: InboxTransactionDto[];

  static fromDomain({
    transactions,
    total,
    page,
    pageSize,
  }: {
    transactions: InboxTransaction[];
    total: number;
    page: number;
    pageSize: number;
  }): InboxTransactionsResultDto {
    return {
      meta: {
        total: total,
        page: page,
        pageSize: pageSize,
        hasMore: total > page * pageSize,
      },
      transactions: transactions.map((x) => InboxTransactionDto.fromDomain(x)),
    };
  }
}
