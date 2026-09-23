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
  decimalPlaces: number,
  padDecimals: boolean,
): string {
  if (value === null || !Number.isFinite(value)) {
    return '';
  }

  const fixed = value.toFixed(decimalPlaces);
  if (padDecimals || decimalPlaces === 0) {
    return fixed;
  }

  return fixed.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}
