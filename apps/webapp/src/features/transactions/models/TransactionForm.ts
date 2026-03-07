import { z } from 'zod';

export const transactionFormSchema = z.object({
  type: z.enum(['expense', 'income']),
  accountId: z.string().min(2, { error: 'Account ID is invalid' }),
  description: z
    .string()
    .min(2, { error: 'Description should have at least 2 letters' }),
  notes: z.string().optional().nullable(),
  amount: z.number().gte(0, { error: 'Amount must be zero or greater' }),
  currency: z.string().nullable(),
  date: z.date(),
  categoryId: z.string().optional().nullable(),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;

export function getTransactionFormDefaultValues(): TransactionFormData {
  return {
    type: 'expense',
    accountId: '',
    description: '',
    notes: '',
    amount: 0,
    currency: null,
    date: new Date(),
    categoryId: null,
  };
}
