import { Transaction } from '../entities/transaction.entity';

export class TransactionDto {
  id: string;
  original_description: string;
  description: string;
  notes: string;
  amount: number;
  currency: string;
  date: Date;

  constructor(entity: Transaction) {
    this.id = entity.id;
    this.original_description = entity.original_desciption;
    this.description = entity.desciption;
    this.notes = entity.notes;
    this.amount = entity.amount;
    this.currency = entity.currency;
    this.date = entity.date;
  }
}
