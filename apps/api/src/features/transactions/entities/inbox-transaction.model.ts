import { Transaction } from './transaction.entity.js';

export type InboxTransaction = {
  rule_id?: string;
  processed_category_id?: string;
} & Omit<Transaction, 'categoryId' | 'externalId' | 'metadata'>;
