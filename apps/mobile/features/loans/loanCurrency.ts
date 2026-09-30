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

export function formatLoanMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}
