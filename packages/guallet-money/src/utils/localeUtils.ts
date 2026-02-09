/**
 * Default locale to use when no locale is specified
 * Can be overridden by environment or user preference
 */
const DEFAULT_LOCALE = 'en-US';

/**
 * Gets the locale from the environment, with fallback to default
 */
export function getDefaultLocale(): string {
  if (typeof navigator !== 'undefined' && (navigator as any).language) {
    return (navigator as any).language;
  }
  return DEFAULT_LOCALE;
}

/**
 * Extracts the currency symbol from a formatted currency string
 */
export function getCurrencySymbol(code: string, locale?: string): string {
  try {
    const formatted = (0)
      .toLocaleString(locale || getDefaultLocale(), {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        currencySign: 'standard',
        currencyDisplay: 'narrowSymbol',
        useGrouping: true,
      })
      .replaceAll(/\d/g, '')
      .trim();
    return formatted || code;
  } catch (error) {
    console.warn(
      `Failed to get currency symbol for ${code}, using code as fallback`,
      error,
    );
    return code;
  }
}
