export class CreateTransactionDto {
  accountId: string;
  description: string;
  notes?: string;
  amount: number;
  currency: string;
  date: Date;
  categoryId?: string;
}
