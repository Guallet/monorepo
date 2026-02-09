import {
  InvalidCurrencyError,
  InvalidAmountError,
  CurrencyMismatchError,
  DivideByZeroError,
  InvalidExchangeRateError,
} from '.';

describe('errors public API', () => {
  it('should export error classes from package root', () => {
    expect(typeof InvalidCurrencyError).toBe('function');
    expect(typeof InvalidAmountError).toBe('function');
    expect(typeof CurrencyMismatchError).toBe('function');
    expect(typeof DivideByZeroError).toBe('function');
    expect(typeof InvalidExchangeRateError).toBe('function');

    expect(new InvalidCurrencyError('x')).toBeInstanceOf(Error);
    expect(new InvalidAmountError('x')).toBeInstanceOf(Error);
    expect(new CurrencyMismatchError('x')).toBeInstanceOf(Error);
    expect(new DivideByZeroError('x')).toBeInstanceOf(Error);
    expect(new InvalidExchangeRateError('x')).toBeInstanceOf(Error);
  });
});
