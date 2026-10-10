import {
  RecurrenceCadence,
  RecurringPaymentType,
  type SubscriptionDto,
} from '@guallet/api-client';
import { Currency, Money, ISO4217Currencies } from '@guallet/money';

export const TYPE_OPTIONS = [
  { id: RecurringPaymentType.SUBSCRIPTION, label: 'Subscription' },
  { id: RecurringPaymentType.REGULAR_PAYMENT, label: 'Payment' },
  { id: RecurringPaymentType.REGULAR_INCOME, label: 'Income' },
];
export const CADENCE_OPTIONS = [
  { id: RecurrenceCadence.WEEKLY, label: 'Weekly' },
  { id: RecurrenceCadence.BIWEEKLY, label: 'Every two weeks' },
  { id: RecurrenceCadence.MONTHLY, label: 'Monthly' },
  { id: RecurrenceCadence.QUARTERLY, label: 'Quarterly' },
  { id: RecurrenceCadence.YEARLY, label: 'Yearly' },
];
export function typeLabel(type: RecurringPaymentType): string {
  return TYPE_OPTIONS.find((option) => option.id === type)?.label ?? 'Payment';
}
export function cadenceLabel(cadence: RecurrenceCadence): string {
  return (
    CADENCE_OPTIONS.find((option) => option.id === cadence)?.label ?? cadence
  );
}
export function calendarDate(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function parseCalendarDate(value?: string | null): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
  if (!match) return null;
  const year = Number(match[1]),
    month = Number(match[2]) - 1,
    day = Number(match[3]);
  const date = new Date(year, month, day, 12);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  )
    return null;
  return date;
}
function dayNumber(date: Date): number {
  return (
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  );
}
export function addDays(date: Date, days: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    12,
  );
}
function occurrence(
  anchor: Date,
  cadence: RecurrenceCadence,
  index: number,
): Date {
  if (cadence === RecurrenceCadence.WEEKLY) return addDays(anchor, index * 7);
  if (cadence === RecurrenceCadence.BIWEEKLY)
    return addDays(anchor, index * 14);
  let months = 1;
  if (cadence === RecurrenceCadence.QUARTERLY) months = 3;
  if (cadence === RecurrenceCadence.YEARLY) months = 12;
  const first = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + index * months,
    1,
    12,
  );
  const lastDay = new Date(
    first.getFullYear(),
    first.getMonth() + 1,
    0,
  ).getDate();
  first.setDate(Math.min(anchor.getDate(), lastDay));
  return first;
}
function firstIndex(
  anchor: Date,
  cadence: RecurrenceCadence,
  from: Date,
): number {
  const days = dayNumber(from) - dayNumber(anchor);
  if (cadence === RecurrenceCadence.WEEKLY)
    return Math.max(0, Math.floor(days / 7));
  if (cadence === RecurrenceCadence.BIWEEKLY)
    return Math.max(0, Math.floor(days / 14));
  const months =
    (from.getFullYear() - anchor.getFullYear()) * 12 +
    from.getMonth() -
    anchor.getMonth();
  let step = 1;
  if (cadence === RecurrenceCadence.QUARTERLY) step = 3;
  if (cadence === RecurrenceCadence.YEARLY) step = 12;
  return Math.max(0, Math.floor(months / step));
}
export function nextPaymentDate(
  item: SubscriptionDto,
  from: Date,
): Date | null {
  const anchor = parseCalendarDate(item.startDate);
  if (!anchor) return null;
  let index = firstIndex(anchor, item.cadence, from);
  let date = occurrence(anchor, item.cadence, index);
  if (dayNumber(date) < dayNumber(from))
    date = occurrence(anchor, item.cadence, ++index);
  return date;
}
export type PaymentOccurrence = {
  item: SubscriptionDto;
  date: Date;
  key: string;
};
export function upcomingPayments(
  items: SubscriptionDto[],
  from: Date,
  through: Date,
): PaymentOccurrence[] {
  const result: PaymentOccurrence[] = [];
  for (const item of items) {
    const anchor = parseCalendarDate(item.startDate);
    if (!anchor) continue;
    let index = firstIndex(anchor, item.cadence, from);
    let date = occurrence(anchor, item.cadence, index);
    while (dayNumber(date) <= dayNumber(through)) {
      if (dayNumber(date) >= dayNumber(from))
        result.push({ item, date, key: `${item.id}:${calendarDate(date)}` });
      date = occurrence(anchor, item.cadence, ++index);
    }
  }
  return result.sort(
    (a, b) =>
      dayNumber(a.date) - dayNumber(b.date) ||
      a.item.name.localeCompare(b.item.name),
  );
}
export function signedMoney(item: SubscriptionDto): Money {
  const money = Money.fromCurrencyCode({
    amount: Number(item.amount),
    currencyCode: item.currency,
  });
  if (item.type === RecurringPaymentType.REGULAR_INCOME) return money.abs();
  return money.abs().negate();
}
export function yearlyEstimate(item: SubscriptionDto): Money {
  const factors = {
    weekly: 52,
    biweekly: 26,
    monthly: 12,
    quarterly: 4,
    yearly: 1,
  };
  return signedMoney(item).multiply(factors[item.cadence]);
}
export type CurrencySummary = {
  currency: string;
  payments: Money;
  income: Money;
};
export function summarise(
  items: SubscriptionDto[],
  monthlyEstimate: boolean,
): CurrencySummary[] {
  const totals = new Map<string, CurrencySummary>();
  for (const item of items) {
    // Unsupported legacy codes remain visible/editable but cannot be totalled.
    if (
      !ISO4217Currencies[item.currency] ||
      !Number.isFinite(Number(item.amount))
    )
      continue;
    const money = signedMoney(item);
    let value = money;
    if (monthlyEstimate) value = yearlyEstimate(item).divide(12);
    let total = totals.get(item.currency);
    if (!total) {
      total = {
        currency: item.currency,
        payments: Money.zero(money.currency),
        income: Money.zero(money.currency),
      };
      totals.set(item.currency, total);
    }
    if (item.type === RecurringPaymentType.REGULAR_INCOME)
      total.income = total.income.add(value);
    else total.payments = total.payments.add(value);
  }
  return [...totals.values()].sort((a, b) =>
    a.currency.localeCompare(b.currency),
  );
}
export type RecurringFormValues = {
  name: string;
  amount: number | null;
  currency: string;
  type: RecurringPaymentType;
  cadence: RecurrenceCadence;
  startDate: Date | null;
  categoryId: string | null;
};
export function validateRecurring(
  values: RecurringFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = 'Enter a name.';
  if (!ISO4217Currencies[values.currency])
    errors.amount = 'Select a supported currency.';
  else if (
    values.amount === null ||
    !Number.isFinite(values.amount) ||
    values.amount <= 0
  )
    errors.amount = 'Enter an amount above zero.';
  else {
    const precision = Currency.fromISOCode(values.currency).decimalPlaces;
    const scaled = values.amount * 10 ** precision;
    if (
      !Number.isSafeInteger(Math.round(scaled)) ||
      Math.abs(scaled - Math.round(scaled)) > 1e-7
    )
      errors.amount = `Use at most ${precision} decimal places.`;
  }
  if (values.startDate && !Number.isFinite(values.startDate.getTime()))
    errors.startDate = 'Select a valid date.';
  return errors;
}
