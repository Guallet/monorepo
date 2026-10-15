import type { MoneyFormatOptions } from '@guallet/money';
import { formatMoney } from '@/utils/formatMoney';

export function formatMortgageMoney(
  value: number,
  currency: string,
  options?: MoneyFormatOptions,
): string {
  return formatMoney(value, currency, options);
}
