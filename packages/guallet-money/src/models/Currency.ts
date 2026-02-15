import { CURRENCIES } from './iso_4217';

import { getCurrencySymbol } from '../utils/localeUtils';
import { InvalidCurrencyError } from '../errors';

/**
 * (moved to localeUtils)
 * See `src/utils/localeUtils.ts` for locale helpers
 */

/**
 * Represents a currency with its properties
 * Immutable class following ISO 4217 standard
 */
export class Currency {
  readonly name: string;
  readonly symbol: string;
  readonly code: string;
  readonly decimalPlaces: number;

  private constructor(
    name: string,
    symbol: string,
    code: string,
    decimalPlaces: number,
  ) {
    this.name = name;
    this.symbol = symbol;
    this.code = code;
    this.decimalPlaces = decimalPlaces;
  }

  /**
   * Creates a Currency instance from an ISO 4217 currency code
   * @param code - ISO 4217 currency code (e.g., "USD", "EUR", "GBP")
   * @param locale - Optional locale for symbol formatting
   * @returns Currency instance
   * @throws Error if currency code is invalid
   */
  static fromISOCode(code: string, locale?: string): Currency {
    // input validation + normalization
    if (typeof code !== 'string' || code.trim().length === 0) {
      throw new InvalidCurrencyError(
        'Currency code is required and must be a non-empty string',
      );
    }

    const normalizedCode = code.trim().toUpperCase();
    const currencyData = CURRENCIES[normalizedCode];

    if (!currencyData) {
      throw new InvalidCurrencyError(
        `Invalid currency code: "${code}". Must be a valid ISO 4217 code. ` +
          `See https://www.six-group.com/en/pages/iso-4217-currency-table.html`,
      );
    }

    const symbol = getCurrencySymbol(normalizedCode, locale);

    const rawDecimal = Number(currencyData.decimalPlaces);
    const decimalPlaces =
      Number.isFinite(rawDecimal) && rawDecimal >= 0
        ? Math.trunc(rawDecimal)
        : 0;

    if (Number.isNaN(rawDecimal) || rawDecimal < 0) {
      console.warn(
        `Invalid decimal places for currency ${normalizedCode}, defaulting to 0`,
      );
    }

    return new Currency(
      currencyData.name,
      symbol,
      normalizedCode,
      decimalPlaces,
    );
  }

  /**
   * Checks if this currency equals another currency
   */
  equals(other: Currency): boolean {
    return this.code === other.code;
  }

  /**
   * Returns a string representation of the currency
   */
  toString(): string {
    return `${this.code} (${this.name})`;
  }
}
