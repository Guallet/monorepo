import { z } from 'zod';

const dateQuery = z.string().pipe(z.coerce.date());

export const accountChartQuerySchema = z
  .object({
    startDate: z.preprocess(
      (value) => (value === '' ? undefined : value),
      dateQuery.default(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 3);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        return date;
      }),
    ),
    endDate: z.preprocess(
      (value) => (value === '' ? undefined : value),
      dateQuery.default(() => new Date()),
    ),
  })
  .refine(({ startDate, endDate }) => startDate <= endDate, {
    message: 'startDate must be before or equal to endDate',
    path: ['startDate'],
  });

export type AccountChartQuery = z.infer<typeof accountChartQuerySchema>;
