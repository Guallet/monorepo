import { z } from 'zod';

export const transactionsQueryFilterSchema = z
  .object({
    page: z.number().min(1).catch(1),
    pageSize: z.number().catch(50),
    accounts: z
      .string()
      .transform((value) => {
        return value.split(',');
      })
      .optional(),
    categories: z
      .string()
      .transform((value) => {
        return value.split(',');
      })
      .optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .optional();

export type TransactionsQueryFilter = z.infer<
  typeof transactionsQueryFilterSchema
>;
