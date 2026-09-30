import { Money } from '@guallet/money';

export function formatMortgageMoney(value: number, currency: string): string {
  return Money.fromCurrencyCode({
    amount: value,
    currencyCode: currency,
  }).format();
}
