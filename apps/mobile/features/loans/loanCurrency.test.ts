import { describe, expect, it } from 'vitest';
import { formatLoanMoney, getLoanCurrencyDecimalPlaces } from './loanCurrency';

describe('loan currency formatting', () => {
  it('uses currency-specific fraction digits', () => {
    expect(getLoanCurrencyDecimalPlaces('JPY')).toBe(0);
    expect(getLoanCurrencyDecimalPlaces('KWD')).toBe(3);
    expect(formatLoanMoney(1234.567, 'JPY')).not.toContain('.');
    expect(formatLoanMoney(1234.567, 'KWD')).toContain('567');
  });

  it('falls back safely for an invalid currency', () => {
    expect(getLoanCurrencyDecimalPlaces('INVALID')).toBe(2);
    expect(formatLoanMoney(12.34, 'INVALID')).toBe('12.34 INVALID');
  });
});
