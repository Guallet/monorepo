import type { MoneyFormatOptions } from '@guallet/money';
import { Money } from '@guallet/money';

export function formatMortgageMoney(
  value: number,
  currency: string,
  options?: MoneyFormatOptions,
): string {
  return Money.fromCurrencyCode({
    amount: value,
    currencyCode: currency,
  }).format(options);
}
