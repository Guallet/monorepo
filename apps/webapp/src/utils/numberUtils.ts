export function parseNumber(
  value: string | number | boolean | null | undefined,
): number {
  if (value === null || value === undefined || value === '') return NaN;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return NaN;

  const str = String(value).trim();
  if (str === '') return NaN;

  // Try standard parsing first
  // Note: Number('123,45') is NaN in JS
  const standard = Number(str);
  if (!Number.isNaN(standard)) return standard;

  // Handle comma as decimal separator (European format)
  // e.g. "123,45" -> "123.45"
  // This simplistic approach assumes no thousands separators like "1.000,00"
  // If we needed to support that, we'd need more complex logic.
  // But this covers the reported user case of "-115,53".
  const withDot = str.replace(/,/g, '.');
  const asNumber = Number(withDot);

  return asNumber;
}

export function isValidNumber(
  value: string | number | boolean | null | undefined,
): boolean {
  const num = parseNumber(value);
  return !Number.isNaN(num);
}
