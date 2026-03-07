import { RecurringPaymentType, RecurrenceCadence } from '@guallet/api-client';
import { z } from 'zod';

export const subscriptionFormSchema = z.object({
  name: z.string().min(1, { error: 'Name is required' }),
  amount: z.number().min(0, { error: 'Amount must be positive' }),
  currency: z.string().nullable(),
  cadence: z.enum(RecurrenceCadence),
  type: z.enum(RecurringPaymentType),
  startDate: z.date({ error: 'Start date is required' }),
  imageUrl: z.string().optional(),
});

export type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;

export const paymentTypeOptions = [
  { label: 'Subscription', value: RecurringPaymentType.SUBSCRIPTION },
  { label: 'Regular Payment', value: RecurringPaymentType.REGULAR_PAYMENT },
  { label: 'Regular Income', value: RecurringPaymentType.REGULAR_INCOME },
];

export const cadenceOptions = [
  { label: 'Weekly', value: RecurrenceCadence.WEEKLY },
  { label: 'Bi-weekly', value: RecurrenceCadence.BIWEEKLY },
  { label: 'Monthly', value: RecurrenceCadence.MONTHLY },
  { label: 'Quarterly', value: RecurrenceCadence.QUARTERLY },
  { label: 'Yearly', value: RecurrenceCadence.YEARLY },
];

export function getSubscriptionFormDefaultValues(
  defaultCurrency: string,
): SubscriptionFormData {
  return {
    name: '',
    amount: 0,
    currency: defaultCurrency,
    cadence: RecurrenceCadence.MONTHLY,
    type: RecurringPaymentType.SUBSCRIPTION,
    startDate: new Date(),
    imageUrl: '',
  };
}

export function mapSubscriptionToFormValues(subscription: {
  name: string;
  amount: number;
  currency: string;
  cadence: RecurrenceCadence;
  type: RecurringPaymentType;
  startDate: string;
  imageUrl?: string | null;
}): SubscriptionFormData {
  return {
    name: subscription.name,
    amount: Number(subscription.amount),
    currency: subscription.currency,
    cadence: subscription.cadence,
    type: subscription.type,
    startDate: new Date(subscription.startDate),
    imageUrl: subscription.imageUrl ?? '',
  };
}
