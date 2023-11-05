import { Transaction } from '../models/transaction.entity';

export class TransactionDto {
  accountId: string;
  description: string;
  notes?: string;
  amount: number;
  currency: string;
  date: Date;
  categoryId?: string;

  static fromDomain(domain: Transaction): TransactionDto {
    // mapping goes here
    return {
      accountId: domain.account.id,
      amount: domain.amount,
      currency: domain.currency,
      date: domain.date,
      description: domain.description,
      notes: domain.notes,
      categoryId: domain.category.id,
    } as TransactionDto;
  }
}
