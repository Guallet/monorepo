import { Currency } from './Currency';

export type RoundingMode =
  | 'HALF_UP' // ties away from zero (Math.round behavior)
  | 'HALF_EVEN' // bankers rounding (ties to even)
  | 'DOWN' // towards -Infinity
  | 'UP' // towards +Infinity
  | 'TOWARDS_ZERO'; // truncation

/**
 * Rounds to the nearest integer or specified decimal places with multiple modes
 * @param decimalPlaces - number of decimal places to round to (defaults to currency decimal places)
 * @param mode - rounding mode (defaults to 'HALF_UP' for backward compatibility)
 */
function roundNumber(
  amount: number,
  places: number,
  mode: RoundingMode,
): number {
  const factor = Math.pow(10, places);
  const scaled = amount * factor;
  const EPS = 1e-9;

  switch (mode) {
    case 'HALF_UP': {
      const floorVal = Math.floor(scaled);
      const frac = scaled - floorVal;
      if (Math.abs(frac - 0.5) < EPS) {
        // tie: move away from zero
        return (scaled >= 0 ? floorVal + 1 : floorVal) / factor;
      }
      return Math.round(scaled) / factor;
    }

    case 'HALF_EVEN': {
      const floorVal = Math.floor(scaled);
      const frac = scaled - floorVal;
      if (Math.abs(frac - 0.5) < EPS) {
        // tie: choose the nearest even integer
        const evenCandidate =
          Math.abs(floorVal) % 2 === 0 ? floorVal : floorVal + 1;
        return evenCandidate / factor;
      }
      return Math.round(scaled) / factor;
    }

    case 'DOWN':
      return Math.floor(scaled) / factor;

    case 'UP':
      return Math.ceil(scaled) / factor;

    case 'TOWARDS_ZERO':
      return (scaled >= 0 ? Math.floor(scaled) : Math.ceil(scaled)) / factor;

    default:
      return Math.round(scaled) / factor;
  }
}

/**
 * Formatting options for money display
 */
export interface MoneyFormatOptions {
  locale?: string;
  useSymbol?: boolean;
  useGrouping?: boolean;
  showPositiveSign?: boolean;
}

import { getDefaultLocale } from '../utils/localeUtils';
import {
  InvalidAmountError,
  DivideByZeroError,
  CurrencyMismatchError,
  InvalidExchangeRateError,
} from '../errors';

/**
 * (moved to localeUtils)
 * See `src/utils/localeUtils.ts` for locale helpers
 */

/**
 * Represents a monetary value with its currency
 * Immutable class for safe currency calculations
 */
export class Money {
  readonly amount: number;
  readonly currency: Currency;

  private constructor(amount: number, currency: Currency) {
    if (!Number.isFinite(amount)) {
      throw new InvalidAmountError(
        `Invalid amount: ${amount}. Amount must be a valid number.`,
      );
    }
    this.amount = amount;
    this.currency = currency;
  }

  /**
   * Creates Money from amount and currency code
   * @param amount - The monetary amount
   * @param currencyCode - ISO 4217 currency code
   */
  static fromCurrencyCode({
    amount,
    currencyCode,
  }: {
    amount: number;
    currencyCode: string;
  }): Money {
    const currency = Currency.fromISOCode(currencyCode);
    return new Money(amount, currency);
  }

  /**
   * Creates Money from amount and Currency instance
   * @param amount - The monetary amount
   * @param currency - Currency instance
   */
  static from({
    amount,
    currency,
  }: {
    amount: number;
    currency: Currency;
  }): Money {
    return new Money(amount, currency);
  }

  /**
   * Creates zero money for a given currency
   */
  static zero(currency: Currency): Money {
    return new Money(0, currency);
  }

  /**
   * Formats the money value as a localized string
   * @param options - Formatting options or locale string
   */
  format(options?: MoneyFormatOptions | string): string {
    const locale =
      typeof options === 'string'
        ? options
        : (options?.locale ?? getDefaultLocale());
    const useGrouping =
      typeof options === 'object' ? (options.useGrouping ?? true) : true;
    const showPositiveSign =
      typeof options === 'object' ? (options.showPositiveSign ?? false) : false;

    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency.code,
      currencySign: 'standard',
      currencyDisplay: 'narrowSymbol',
      useGrouping,
    }).format(this.amount);

    if (showPositiveSign && this.amount > 0) {
      return '+' + formatted;
    }

    return formatted;
  }

  /**
   * Adds another money value (must be same currency)
   */
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * Subtracts another money value (must be same currency)
   */
  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  /**
   * Multiplies money by a factor
   */
  multiply(factor: number): Money {
    if (!Number.isFinite(factor)) {
      throw new InvalidAmountError(
        `Invalid factor: ${factor}. Factor must be a finite number.`,
      );
    }
    return new Money(this.amount * factor, this.currency);
  }

  /**
   * Divides money by a divisor
   */
  divide(divisor: number): Money {
    if (!Number.isFinite(divisor)) {
      throw new InvalidAmountError(
        `Invalid divisor: ${divisor}. Divisor must be a finite number.`,
      );
    }
    if (divisor === 0) {
      throw new DivideByZeroError('Cannot divide by zero');
    }
    return new Money(this.amount / divisor, this.currency);
  }

  /**
   * Returns absolute value (positive)
   */
  abs(): Money {
    return new Money(Math.abs(this.amount), this.currency);
  }

  /**
   * Negates the money value
   */
  negate(): Money {
    return new Money(-this.amount, this.currency);
  }

  /**
   * Rounds to the nearest integer or specified decimal places with multiple modes
   */
  round(decimalPlaces?: number, mode: RoundingMode = 'HALF_UP'): Money {
    if (
      decimalPlaces !== undefined &&
      (!Number.isInteger(decimalPlaces) || decimalPlaces < 0)
    ) {
      throw new InvalidAmountError(
        `Invalid decimalPlaces: ${decimalPlaces}. Decimal places must be a non-negative integer.`,
      );
    }
    const places = decimalPlaces ?? this.currency.decimalPlaces;
    const rounded = roundNumber(this.amount, places, mode);
    return new Money(rounded, this.currency);
  }

  /**
   * Checks if equals another money value
   */
  equals(other: Money): boolean {
    return this.currency.equals(other.currency) && this.amount === other.amount;
  }

  /**
   * Checks if greater than another money value
   */
  greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  /**
   * Checks if greater than or equal to another money value
   */
  greaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount >= other.amount;
  }

  /**
   * Checks if less than another money value
   */
  lessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  /**
   * Checks if less than or equal to another money value
   */
  lessThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount <= other.amount;
  }

  /**
   * Checks if the amount is zero
   */
  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Checks if the amount is positive
   */
  isPositive(): boolean {
    return this.amount > 0;
  }

  /**
   * Checks if the amount is negative
   */
  isNegative(): boolean {
    return this.amount < 0;
  }

  /**
   * Converts to a different currency (requires conversion rate)
   */
  convertTo(targetCurrency: Currency, rate: number): Money {
    if (this.currency.equals(targetCurrency)) {
      return this;
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new InvalidExchangeRateError(
        `Invalid conversion rate: ${rate}. Rate must be a positive finite number.`,
      );
    }
    return new Money(this.amount * rate, targetCurrency);
  }

  /**
   * Returns a plain object representation
   */
  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency.code,
    };
  }

  /**
   * Returns a string representation
   */
  toString(): string {
    return this.format();
  }

  /**
   * Asserts that two money values have the same currency
   */
  private assertSameCurrency(other: Money): void {
    if (!this.currency.equals(other.currency)) {
      throw new CurrencyMismatchError(
        `Currency mismatch: Cannot operate on ${this.currency.code} and ${other.currency.code}`,
      );
    }
  }
}
