import { describe, expect, it } from 'vitest';
import { formatMoney } from './formatMoney';

describe('formatMoney', () => {
  it('uses Money formatting and forwards options for supported currencies', () => {
    expect(
      formatMoney(12.5, 'USD', { locale: 'en-GB', useSymbol: false }),
    ).toBe('USD 12.50');
    expect(
      formatMoney(12.5, 'CAD', { locale: 'en-GB', useSymbol: false }),
    ).toBe('CAD 12.50');
  });

  it('shows the original amount and unsupported code without throwing', () => {
    expect(formatMoney(12.5, 'ZZZ')).toBe('12.5 ZZZ');
  });

  it('does not hide invalid amounts', () => {
    expect(() => formatMoney(Number.NaN, 'USD')).toThrow();
  });
});
