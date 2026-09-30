import type { MoneyFormatOptions } from '@guallet/money';
import { Money } from '@guallet/money';

export function getLoanCurrencyDecimalPlaces(currency: string): number {
  try {
    const digits = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).resolvedOptions().maximumFractionDigits;
    return digits ?? 2;
  } catch {
    return 2;
  }
}

export function formatLoanMoney(
  value: number,
  currency: string,
  options?: MoneyFormatOptions,
): string {
  return Money.fromCurrencyCode({
    amount: value,
    currencyCode: currency,
  }).format(options);
}
