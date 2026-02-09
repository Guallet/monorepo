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
    if (!code || typeof code !== 'string') {
      throw new InvalidCurrencyError(
        'Currency code is required and must be a string',
      );
    }

    const upperCode = code.toUpperCase().trim();
    const currencyData = CURRENCIES[upperCode];

    if (!currencyData) {
      throw new InvalidCurrencyError(
        `Invalid currency code: "${code}". Must be a valid ISO 4217 code. ` +
          `See https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml`,
      );
    }

    const symbol = getCurrencySymbol(upperCode, locale);
    const decimalPlaces = Number(currencyData.decimalPlaces);

    if (Number.isNaN(decimalPlaces) || decimalPlaces < 0) {
      throw new InvalidCurrencyError(
        `Invalid decimal places for currency ${upperCode}: ${currencyData.decimalPlaces}`,
      );
    }

    return new Currency(currencyData.name, symbol, upperCode, decimalPlaces);
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
