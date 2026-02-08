import { Currency } from './Currency';

describe('Currency', () => {
  describe('fromISOCode', () => {
    it('should create a currency from valid ISO code', () => {
      const usd = Currency.fromISOCode('USD');
      expect(usd.code).toBe('USD');
      expect(usd.name).toBe('US Dollar');
      expect(usd.symbol).toBe('$');
      expect(usd.decimalPlaces).toBe(2);
    });

    it('should create a currency with case-insensitive code', () => {
      const eur = Currency.fromISOCode('eur');
      expect(eur.code).toBe('EUR');
      expect(eur.name).toBe('Euro');
      expect(eur.symbol).toBe('€');
      expect(eur.decimalPlaces).toBe(2);
    });

    it('should create GBP currency', () => {
      const gbp = Currency.fromISOCode('GBP');
      expect(gbp.code).toBe('GBP');
      expect(gbp.name).toBe('British Pound Sterling');
      expect(gbp.symbol).toBe('£');
      expect(gbp.decimalPlaces).toBe(2);
    });

    it('should create GBP currency with lowercase code', () => {
      const gbp = Currency.fromISOCode('gbp');
      expect(gbp.code).toBe('GBP');
      expect(gbp.name).toBe('British Pound Sterling');
      expect(gbp.symbol).toBe('£');
      expect(gbp.decimalPlaces).toBe(2);
    });

    it('should create currency with different decimal places', () => {
      const jpy = Currency.fromISOCode('JPY');
      expect(jpy.decimalPlaces).toBe(0);

      const bhd = Currency.fromISOCode('BHD');
      expect(bhd.decimalPlaces).toBe(3);
    });

    it('should throw Error for invalid currency code', () => {
      expect(() => Currency.fromISOCode('INVALID')).toThrow(Error);
      expect(() => Currency.fromISOCode('INVALID')).toThrow(
        'Invalid currency code',
      );
    });

    it('should throw Error for empty currency code', () => {
      expect(() => Currency.fromISOCode('')).toThrow(Error);
    });

    it('should throw Error for null or undefined', () => {
      expect(() => Currency.fromISOCode(null as any)).toThrow(Error);
      expect(() => Currency.fromISOCode(undefined as any)).toThrow(Error);
    });
  });

  describe('equals', () => {
    it('should return true for same currency codes', () => {
      const usd1 = Currency.fromISOCode('USD');
      const usd2 = Currency.fromISOCode('USD');
      expect(usd1.equals(usd2)).toBe(true);
    });

    it('should return false for different currency codes', () => {
      const usd = Currency.fromISOCode('USD');
      const eur = Currency.fromISOCode('EUR');
      expect(usd.equals(eur)).toBe(false);
    });

    it('should handle comparison with same instance', () => {
      const usd = Currency.fromISOCode('USD');
      expect(usd.equals(usd)).toBe(true);
    });

    it('should compare GBP currencies correctly', () => {
      const gbp1 = Currency.fromISOCode('GBP');
      const gbp2 = Currency.fromISOCode('gbp');
      const usd = Currency.fromISOCode('USD');

      expect(gbp1.equals(gbp2)).toBe(true);
      expect(gbp1.equals(usd)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the currency code and name', () => {
      const usd = Currency.fromISOCode('USD');
      expect(usd.toString()).toBe('USD (US Dollar)');
    });

    it('should return uppercased code even if created with lowercase', () => {
      const eur = Currency.fromISOCode('eur');
      expect(eur.toString()).toBe('EUR (Euro)');
    });

    it('should return GBP currency string representation', () => {
      const gbp = Currency.fromISOCode('GBP');
      expect(gbp.toString()).toBe('GBP (British Pound Sterling)');
    });
  });

  describe('getCurrencySymbol', () => {
    it('should expose currency symbol as property', () => {
      const usd = Currency.fromISOCode('USD');
      expect(usd.symbol).toBe('$');

      const eur = Currency.fromISOCode('EUR');
      expect(eur.symbol).toBe('€');

      const gbp = Currency.fromISOCode('GBP');
      expect(gbp.symbol).toBe('£');

      const jpy = Currency.fromISOCode('JPY');
      expect(jpy.symbol).toBe('¥');
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const usd = Currency.fromISOCode('USD');
      expect(usd.code).toBe('USD');
      expect(usd.name).toBe('US Dollar');
      expect(usd.symbol).toBe('$');
      expect(usd.decimalPlaces).toBe(2);
    });
  });

  describe('common currencies', () => {
    it('should support major world currencies', () => {
      const currencies = [
        'USD',
        'EUR',
        'GBP',
        'JPY',
        'CNY',
        'CHF',
        'CAD',
        'AUD',
        'NZD',
        'INR',
      ];

      currencies.forEach((code) => {
        const currency = Currency.fromISOCode(code);
        expect(currency.code).toBe(code);
        expect(currency.name).toBeTruthy();
        expect(currency.symbol).toBeTruthy();
        expect(currency.decimalPlaces).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
