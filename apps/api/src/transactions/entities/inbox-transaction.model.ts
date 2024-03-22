import { Transaction } from './transaction.entity';

export type InboxTransaction = {
  rule_id?: string;
  processed_category_id?: string;
} & Omit<Transaction, 'categoryId' | 'categoryId' | 'externalId' | 'metadata'>;
