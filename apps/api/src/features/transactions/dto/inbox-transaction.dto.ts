import { InboxTransaction } from '../entities/inbox-transaction.model';

export class InboxTransactionDto {
  id: string;
  accountId: string;
  description: string;
  notes?: string;
  amount: number;
  currency: string;
  date: Date;
  processedCategoryId?: string; // Processed category id based by rules
  ruleId?: string; // Rule that processed this transaction

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

export type InboxTransactionsResultMetadataDto = {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export class InboxTransactionsResultDto {
  meta: InboxTransactionsResultMetadataDto;
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
