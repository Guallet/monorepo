import { InvalidCurrencyError, Money } from '@guallet/money';
import type { MoneyFormatOptions } from '@guallet/money';

/** Keep unsupported saved codes visible so their records can still be edited. */
export function formatMoney(
  amount: number,
  currencyCode: string,
  options?: MoneyFormatOptions,
): string {
  try {
    return Money.fromCurrencyCode({ amount, currencyCode }).format(options);
  } catch (error) {
    if (!(error instanceof InvalidCurrencyError)) throw error;
    return `${amount} ${currencyCode}`;
  }
}
