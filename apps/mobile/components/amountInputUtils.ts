import { Money, type Currency } from '@guallet/money';

/** Match the fraction digits used by Money.format's Intl currency formatter. */
export function getAmountDecimalPlaces(currency: Currency): number {
  const decimalPlaces = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
  }).resolvedOptions().maximumFractionDigits;
  if (decimalPlaces === undefined) {
    throw new Error(
      `Intl did not provide fraction digits for ${currency.code}`,
    );
  }
  return decimalPlaces;
}

export function isValidAmountText(
  text: string,
  decimalPlaces: number,
): boolean {
  const pattern = decimalPlaces === 0 ? /^-?\d*$/ : /^-?\d*(?:\.\d*)?$/;
  if (!pattern.test(text)) {
    return false;
  }

  const fractionalPart = text.split('.')[1];
  return fractionalPart === undefined || fractionalPart.length <= decimalPlaces;
}

/** Undefined represents an incomplete value such as "-" or ".". */
export function parseAmountText(text: string): number | null | undefined {
  if (text === '') {
    return null;
  }

  if (text === '-' || text === '.' || text === '-.') {
    return undefined;
  }

  const amount = Number(text);
  return Number.isFinite(amount) ? amount : undefined;
}

export function formatAmount(
  value: number | null,
  currency: Currency,
  padDecimals: boolean,
): string {
  if (value === null || !Number.isFinite(value)) {
    return '';
  }

  // A fixed decimal separator keeps the displayed value compatible with the
  // input parser. Money delegates currency fraction digits and rounding to Intl.
  const fixed = Money.from({ amount: value, currency })
    .format({ locale: 'en-US', useGrouping: false, useSymbol: false })
    .replace(currency.code, '')
    .replaceAll(/\s/g, '');
  if (padDecimals || getAmountDecimalPlaces(currency) === 0) {
    return fixed;
  }

  const decimalIndex = fixed.indexOf('.');
  if (decimalIndex === -1) return fixed;

  let end = fixed.length;
  while (end > decimalIndex + 1 && fixed[end - 1] === '0') end--;
  if (end === decimalIndex + 1) end = decimalIndex;
  return fixed.slice(0, end);
}

/** Keep the controlled number equal to the currency-precision display. */
export function normalizeAmount(
  value: number | null,
  currency: Currency,
): number | null {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  return Number(formatAmount(value, currency, true));
}
