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

export interface RecurringPaymentDto {
  id: string;
  userId: string;
  type: RecurringPaymentType;
  name: string;
  amount: number;
  currency: string;
  cadence: RecurrenceCadence;
  nextDate: Date;
  imageUrl?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    icon?: string;
    colour?: string;
  };
  metadata?: {
    confidenceScore?: number;
    detectedFromTransactionId?: string;
    averageAmount?: number;
    lastOccurrence?: Date;
  };
  created_at: Date;
  updated_at: Date;
}

export interface CreateRecurringPaymentRequest {
  type: RecurringPaymentType;
  name: string;
  amount: number;
  currency: string;
  cadence: RecurrenceCadence;
  nextDate: Date;
  imageUrl?: string;
  categoryId?: string;
  fromTransactionId?: string;
}

export interface UpdateRecurringPaymentRequest {
  type?: RecurringPaymentType;
  name?: string;
  amount?: number;
  currency?: string;
  cadence?: RecurrenceCadence;
  nextDate?: Date;
  imageUrl?: string;
  categoryId?: string;
}

export interface DetectedRecurringPaymentDto {
  description: string;
  averageAmount: number;
  currency: string;
  suggestedCadence: RecurrenceCadence;
  nextExpectedDate: Date;
  confidenceScore: number;
  occurrenceCount: number;
  transactionIds: string[];
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    icon?: string;
    colour?: string;
  };
}
