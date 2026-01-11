export enum RecurringPaymentType {
  SUBSCRIPTION = 'subscription',
  REGULAR_PAYMENT = 'regular_payment',
  REGULAR_INCOME = 'regular_income',
}

export enum RecurrenceCadence {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export type SubscriptionDto = {
  id: string;
  user_id: string;
  type: RecurringPaymentType;
  name: string;
  amount: number;
  currency: string;
  cadence: RecurrenceCadence;
  startDate: Date;
  imageUrl?: string;
  categoryId?: string;
};

export type CreateSubscriptionRequest = {
  name: string;
  amount: number;
  currency: string;
  cadence: RecurrenceCadence;
  startDate: string;
  type: RecurringPaymentType;
  imageUrl?: string;
  categoryId?: string;
};

export type UpdateSubscriptionRequest = {
  name?: string;
  amount?: number;
  currency?: string;
  cadence?: RecurrenceCadence;
  startDate?: string;
  type?: RecurringPaymentType;
  imageUrl?: string;
  categoryId?: string;
};
