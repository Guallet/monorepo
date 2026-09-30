import type { MoneyFormatOptions } from '@guallet/money';
import { formatMoney } from '@/utils/formatMoney';

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
  return formatMoney(value, currency, options);
}
