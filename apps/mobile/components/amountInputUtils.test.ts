import { Currency } from '@guallet/money';
import { describe, expect, it } from 'vitest';
import {
  formatAmount,
  isValidAmountText,
  parseAmountText,
} from './amountInputUtils';

describe('AmountInput text handling', () => {
  const eur = Currency.fromISOCode('EUR');
  const jpy = Currency.fromISOCode('JPY');
  const bhd = Currency.fromISOCode('BHD');

  it('parses numeric amounts and clears empty input', () => {
    expect(parseAmountText('')).toBeNull();
    expect(parseAmountText('-12.50')).toBe(-12.5);
    expect(parseAmountText('.5')).toBe(0.5);
    expect(parseAmountText('0')).toBe(0);
  });

  it('keeps incomplete values available for editing', () => {
    expect(parseAmountText('-')).toBeUndefined();
    expect(parseAmountText('.')).toBeUndefined();
    expect(parseAmountText('-.')).toBeUndefined();
  });

  it('limits fractional digits to the selected currency', () => {
    expect(isValidAmountText('-100', 0)).toBe(true);
    expect(isValidAmountText('100.', 0)).toBe(false);
    expect(isValidAmountText('12.34', 2)).toBe(true);
    expect(isValidAmountText('12.345', 2)).toBe(false);
    expect(isValidAmountText('12.345', 3)).toBe(true);
    expect(isValidAmountText('12.3.4', 3)).toBe(false);
    expect(isValidAmountText('1e3', 3)).toBe(false);
  });

  it('pads on blur and trims trailing zeros for editing', () => {
    expect(formatAmount(null, eur, true)).toBe('');
    expect(formatAmount(2, jpy, true)).toBe('2');
    expect(formatAmount(2, eur, true)).toBe('2.00');
    expect(formatAmount(2, eur, false)).toBe('2');
    expect(formatAmount(1.005, eur, true)).toBe('1.01');
    expect(formatAmount(-2.5, bhd, true)).toBe('-2.500');
    expect(formatAmount(-2.5, bhd, false)).toBe('-2.5');
  });
});
