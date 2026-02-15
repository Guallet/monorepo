import { Money } from './Money';
import { Currency } from './Currency';
import {
  InvalidAmountError,
  InvalidCurrencyError,
  CurrencyMismatchError,
  DivideByZeroError,
  InvalidExchangeRateError,
} from '../errors';

describe('Money', () => {
  let gbp: Currency;
  let eur: Currency;

  beforeEach(() => {
    gbp = Currency.fromISOCode('GBP');
    eur = Currency.fromISOCode('EUR');
  });

  describe('Factory Methods', () => {
    it('should create money from currency code', () => {
      const money = Money.fromCurrencyCode({
        amount: 100,
        currencyCode: 'GBP',
      });
      expect(money.amount).toBe(100);
      expect(money.currency.code).toBe('GBP');
    });

    it('should create money from currency instance', () => {
      const money = Money.from({ amount: 250.5, currency: eur });
      expect(money.amount).toBe(250.5);
      expect(money.currency).toBe(eur);
    });

    it('should create zero money', () => {
      const zero = Money.zero(gbp);
      expect(zero.amount).toBe(0);
      expect(zero.isZero()).toBe(true);
    });

    it('should throw InvalidAmountError for NaN', () => {
      expect(() =>
        Money.fromCurrencyCode({ amount: Number.NaN, currencyCode: 'GBP' }),
      ).toThrow(InvalidAmountError);
    });

    it('should throw InvalidAmountError for Infinity', () => {
      expect(() =>
        Money.fromCurrencyCode({
          amount: Number.POSITIVE_INFINITY,
          currencyCode: 'GBP',
        }),
      ).toThrow(InvalidAmountError);
      expect(() =>
        Money.fromCurrencyCode({
          amount: Number.NEGATIVE_INFINITY,
          currencyCode: 'GBP',
        }),
      ).toThrow(InvalidAmountError);
    });

    it('should throw InvalidCurrencyError for invalid currency code', () => {
      expect(() =>
        Money.fromCurrencyCode({ amount: 100, currencyCode: 'INVALID' }),
      ).toThrow(InvalidCurrencyError);
    });
  });

  describe('Arithmetic Operations', () => {
    it('should add money', () => {
      const m1 = Money.from({ amount: 100, currency: gbp });
      const m2 = Money.from({ amount: 50, currency: gbp });
      const result = m1.add(m2);

      expect(result.amount).toBe(150);
      expect(m1.amount).toBe(100); // immutable
    });

    it('should subtract money', () => {
      const m1 = Money.from({ amount: 100, currency: gbp });
      const m2 = Money.from({ amount: 30, currency: gbp });
      const result = m1.subtract(m2);

      expect(result.amount).toBe(70);
    });

    it('should multiply by number', () => {
      const money = Money.from({ amount: 25, currency: gbp });
      expect(money.multiply(4).amount).toBe(100);
      expect(money.multiply(1.5).amount).toBe(37.5);
      expect(money.multiply(-2).amount).toBe(-50);
    });

    it('should divide by number', () => {
      const money = Money.from({ amount: 100, currency: gbp });
      expect(money.divide(4).amount).toBe(25);
      expect(money.divide(2.5).amount).toBe(40);
      expect(money.divide(-2).amount).toBe(-50);
    });

    it('should throw CurrencyMismatchError when operating on different currencies', () => {
      const gbpMoney = Money.from({ amount: 100, currency: gbp });
      const eurMoney = Money.from({ amount: 100, currency: eur });

      expect(() => gbpMoney.add(eurMoney)).toThrow(CurrencyMismatchError);
      expect(() => gbpMoney.subtract(eurMoney)).toThrow(CurrencyMismatchError);
    });

    it('should throw DivideByZeroError when dividing by zero', () => {
      const money = Money.from({ amount: 100, currency: gbp });
      expect(() => money.divide(0)).toThrow(DivideByZeroError);
      expect(() => money.divide(0)).toThrow('Cannot divide by zero');
    });

    it('should throw InvalidAmountError for invalid multiplier/divisor', () => {
      const money = Money.from({ amount: 100, currency: gbp });
      expect(() => money.multiply(Number.NaN)).toThrow(InvalidAmountError);
      expect(() => money.divide(Number.NaN)).toThrow(InvalidAmountError);
      expect(() => money.multiply(Number.POSITIVE_INFINITY)).toThrow(
        InvalidAmountError,
      );
      expect(() => money.multiply(Number.NEGATIVE_INFINITY)).toThrow(
        InvalidAmountError,
      );
      expect(() => money.divide(Number.POSITIVE_INFINITY)).toThrow(
        InvalidAmountError,
      );
      expect(() => money.divide(Number.NEGATIVE_INFINITY)).toThrow(
        InvalidAmountError,
      );
    });
  });

  describe('Helper Methods', () => {
    it('should return absolute value', () => {
      const negative = Money.from({ amount: -50, currency: gbp });
      expect(negative.abs().amount).toBe(50);

      const positive = Money.from({ amount: 50, currency: gbp });
      expect(positive.abs().amount).toBe(50);
    });

    it('should negate amount', () => {
      const positive = Money.from({ amount: 50, currency: gbp });
      expect(positive.negate().amount).toBe(-50);

      const negative = Money.from({ amount: -50, currency: gbp });
      expect(negative.negate().amount).toBe(50);
    });

    it('should round to decimal places', () => {
      const money = Money.from({ amount: 10.556, currency: gbp });
      expect(money.round(2).amount).toBe(10.56);
      expect(money.round(1).amount).toBe(10.6);
      expect(money.round(0).amount).toBe(11);
    });

    it('should round to currency default decimal places', () => {
      const money = Money.from({ amount: 10.556, currency: gbp });
      expect(money.round().amount).toBe(10.56);
    });

    describe('rounding modes', () => {
      it('HALF_UP should round 1.005 to 1.01', () => {
        const m = Money.from({ amount: 1.005, currency: gbp });
        expect(m.round(2, 'HALF_UP').amount).toBe(1.01);
        expect(m.round(2, 'HALF_UP').amount).not.toBe(1);
      });

      it('HALF_EVEN should round 1.005 to 1.00 (bankers rounding)', () => {
        const m = Money.from({ amount: 1.005, currency: gbp });
        expect(m.round(2, 'HALF_EVEN').amount).toBe(1);
      });

      it('HALF_UP vs HALF_EVEN with negative ties', () => {
        const m = Money.from({ amount: -1.005, currency: gbp });
        expect(m.round(2, 'HALF_UP').amount).toBe(-1.01);
        expect(m.round(2, 'HALF_EVEN').amount).toBe(-1);
      });

      it('DOWN, UP, and TOWARDS_ZERO behave as expected', () => {
        const m = Money.from({ amount: 1.2345, currency: gbp });
        expect(m.round(3, 'DOWN').amount).toBe(1.234);
        expect(m.round(3, 'UP').amount).toBe(1.235);
        expect(m.round(3, 'TOWARDS_ZERO').amount).toBe(1.234);
      });
    });

    it('should throw InvalidAmountError for negative decimalPlaces', () => {
      const money = Money.from({ amount: 10.556, currency: gbp });
      expect(() => money.round(-1)).toThrow(InvalidAmountError);
      expect(() => money.round(-1)).toThrow(
        'Decimal places must be a non-negative integer',
      );
    });

    it('should throw InvalidAmountError for non-integer decimalPlaces', () => {
      const money = Money.from({ amount: 10.556, currency: gbp });
      expect(() => money.round(1.5)).toThrow(InvalidAmountError);
      expect(() => money.round(2.7)).toThrow(InvalidAmountError);
    });

    it('should throw InvalidAmountError for invalid decimalPlaces values', () => {
      const money = Money.from({ amount: 10.556, currency: gbp });
      expect(() => money.round(Number.NaN)).toThrow(InvalidAmountError);
      expect(() => money.round(Number.POSITIVE_INFINITY)).toThrow(
        InvalidAmountError,
      );
      expect(() => money.round(Number.NEGATIVE_INFINITY)).toThrow(
        InvalidAmountError,
      );
    });
  });

  describe('Comparison Methods', () => {
    it('should check equality', () => {
      const m1 = Money.from({ amount: 100, currency: gbp });
      const m2 = Money.from({ amount: 100, currency: gbp });
      const m3 = Money.from({ amount: 50, currency: gbp });
      const m4 = Money.from({ amount: 100, currency: eur });

      expect(m1.equals(m2)).toBe(true);
      expect(m1.equals(m3)).toBe(false);
      expect(m1.equals(m4)).toBe(false);
    });

    it('should compare greater than', () => {
      const m1 = Money.from({ amount: 100, currency: gbp });
      const m2 = Money.from({ amount: 50, currency: gbp });
      const m3 = Money.from({ amount: 100, currency: gbp });

      expect(m1.greaterThan(m2)).toBe(true);
      expect(m2.greaterThan(m1)).toBe(false);
      expect(m1.greaterThan(m3)).toBe(false);
    });

    it('should compare greater than or equal', () => {
      const m1 = Money.from({ amount: 100, currency: gbp });
      const m2 = Money.from({ amount: 50, currency: gbp });
      const m3 = Money.from({ amount: 100, currency: gbp });

      expect(m1.greaterThanOrEqual(m2)).toBe(true);
      expect(m1.greaterThanOrEqual(m3)).toBe(true);
      expect(m2.greaterThanOrEqual(m1)).toBe(false);
    });

    it('should compare less than', () => {
      const m1 = Money.from({ amount: 50, currency: gbp });
      const m2 = Money.from({ amount: 100, currency: gbp });
      const m3 = Money.from({ amount: 50, currency: gbp });

      expect(m1.lessThan(m2)).toBe(true);
      expect(m2.lessThan(m1)).toBe(false);
      expect(m1.lessThan(m3)).toBe(false);
    });

    it('should compare less than or equal', () => {
      const m1 = Money.from({ amount: 50, currency: gbp });
      const m2 = Money.from({ amount: 100, currency: gbp });
      const m3 = Money.from({ amount: 50, currency: gbp });

      expect(m1.lessThanOrEqual(m2)).toBe(true);
      expect(m1.lessThanOrEqual(m3)).toBe(true);
      expect(m2.lessThanOrEqual(m1)).toBe(false);
    });

    it('should throw Error when comparing different currencies', () => {
      const gbpMoney = Money.from({ amount: 100, currency: gbp });
      const eurMoney = Money.from({ amount: 50, currency: eur });

      expect(() => gbpMoney.greaterThan(eurMoney)).toThrow(Error);
    });
  });

  describe('State Check Methods', () => {
    it('should check if zero', () => {
      expect(Money.zero(gbp).isZero()).toBe(true);
      expect(Money.from({ amount: 10, currency: gbp }).isZero()).toBe(false);
      expect(Money.from({ amount: -10, currency: gbp }).isZero()).toBe(false);
    });

    it('should check if positive', () => {
      expect(Money.from({ amount: 10, currency: gbp }).isPositive()).toBe(true);
      expect(Money.zero(gbp).isPositive()).toBe(false);
      expect(Money.from({ amount: -10, currency: gbp }).isPositive()).toBe(
        false,
      );
    });

    it('should check if negative', () => {
      expect(Money.from({ amount: -10, currency: gbp }).isNegative()).toBe(
        true,
      );
      expect(Money.zero(gbp).isNegative()).toBe(false);
      expect(Money.from({ amount: 10, currency: gbp }).isNegative()).toBe(
        false,
      );
    });
  });

  describe('Currency Conversion', () => {
    it('should convert to another currency', () => {
      const gbpMoney = Money.from({ amount: 100, currency: gbp });
      const eurMoney = gbpMoney.convertTo(eur, 0.85);

      expect(eurMoney.amount).toBe(85);
      expect(eurMoney.currency.code).toBe('EUR');
      expect(gbpMoney.amount).toBe(100); // immutable
    });

    it('should throw InvalidExchangeRateError for invalid exchange rate', () => {
      const money = Money.from({ amount: 100, currency: gbp });
      expect(() => money.convertTo(eur, 0)).toThrow(InvalidExchangeRateError);
      expect(() => money.convertTo(eur, -1)).toThrow(InvalidExchangeRateError);
      expect(() => money.convertTo(eur, Number.NaN)).toThrow(
        InvalidExchangeRateError,
      );
      expect(() => money.convertTo(eur, Number.POSITIVE_INFINITY)).toThrow(
        InvalidExchangeRateError,
      );
      expect(() => money.convertTo(eur, Number.NEGATIVE_INFINITY)).toThrow(
        InvalidExchangeRateError,
      );
    });
  });

  describe('Formatting', () => {
    it('should format with default options', () => {
      const money = Money.from({ amount: 1234.56, currency: gbp });
      const formatted = money.format();

      expect(formatted).toContain('£');
      expect(formatted).toContain('1,234.56');
    });

    it('should format in different locales', () => {
      const money = Money.from({ amount: 1000, currency: gbp });
      const usFormat = money.format({ locale: 'en-US' });
      const deFormat = money.format({ locale: 'de-DE' });

      expect(usFormat).toContain('£');
      expect(deFormat).toContain('£');
    });

    it('should respect currency decimal places', () => {
      const jpy = Currency.fromISOCode('JPY');
      const money = Money.from({ amount: 1234, currency: jpy });
      const formatted = money.format();

      expect(formatted).not.toContain('.');
    });

    it('should handle negative amounts', () => {
      const money = Money.from({ amount: -100, currency: gbp });
      const formatted = money.format();

      expect(formatted).toContain('-');
    });

    it('should convert to string', () => {
      const money = Money.from({ amount: 100.5, currency: gbp });
      const str = money.toString();
      expect(str).toContain('£');
      expect(str).toContain('100.50');
    });

    it('should convert to JSON', () => {
      const money = Money.from({ amount: 100, currency: gbp });
      expect(money.toJSON()).toEqual({
        amount: 100,
        currency: 'GBP',
      });
      expect(JSON.stringify(money)).toBe('{"amount":100,"currency":"GBP"}');
    });

    it('should format with currency symbol by default', () => {
      const money = Money.from({ amount: 100, currency: gbp });
      const formatted = money.format();
      expect(formatted).toContain('£');
      expect(formatted).not.toContain('GBP');
    });

    it('should format with currency code when useSymbol is false', () => {
      const money = Money.from({ amount: 100, currency: gbp });
      const formatted = money.format({ useSymbol: false });
      expect(formatted).toContain('GBP');
      expect(formatted).toContain('100');
    });

    it('should format with currency symbol when useSymbol is true', () => {
      const money = Money.from({ amount: 100, currency: gbp });
      const formatted = money.format({ useSymbol: true });
      expect(formatted).toContain('£');
    });
  });

  describe('Immutability', () => {
    it('should not modify original on operations', () => {
      const original = Money.from({ amount: 100, currency: gbp });
      const other = Money.from({ amount: 50, currency: gbp });

      original.add(other);
      original.subtract(other);
      original.multiply(2);
      original.divide(2);
      original.abs();
      original.negate();
      original.round(2);

      expect(original.amount).toBe(100);
    });
  });

  describe('Complex Scenarios', () => {
    it('should calculate tax and total', () => {
      const price = Money.from({ amount: 100, currency: gbp });
      const tax = price.multiply(0.2); // 20% tax
      const total = price.add(tax);

      expect(tax.amount).toBe(20);
      expect(total.amount).toBe(120);
    });

    it('should split amount evenly', () => {
      const total = Money.from({ amount: 100, currency: gbp });
      const perPerson = total.divide(3).round(2);

      expect(perPerson.amount).toBe(33.33);
    });

    it('should chain multiple operations', () => {
      const result = Money.from({ amount: 100, currency: gbp })
        .add(Money.from({ amount: 50, currency: gbp }))
        .subtract(Money.from({ amount: 25, currency: gbp }))
        .multiply(2)
        .divide(5)
        .round(2);

      expect(result.amount).toBe(50);
    });

    it('should find max and min', () => {
      const amounts = [
        Money.from({ amount: 100, currency: gbp }),
        Money.from({ amount: 50, currency: gbp }),
        Money.from({ amount: 150, currency: gbp }),
        Money.from({ amount: 75, currency: gbp }),
      ];

      const max = amounts.reduce(
        (a, b) => (a.greaterThan(b) ? a : b),
        amounts[0],
      );
      const min = amounts.reduce((a, b) => (a.lessThan(b) ? a : b), amounts[0]);

      expect(max.amount).toBe(150);
      expect(min.amount).toBe(50);
    });

    it('should handle floating point precision', () => {
      const m1 = Money.from({ amount: 0.1, currency: gbp });
      const m2 = Money.from({ amount: 0.2, currency: gbp });
      const result = m1.add(m2).round(2);

      expect(result.amount).toBe(0.3);
    });
  });
});
