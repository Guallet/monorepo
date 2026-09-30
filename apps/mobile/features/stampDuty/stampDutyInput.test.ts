import { describe, expect, it } from 'vitest';
import {
  formatStampDutyPriceText,
  parseStampDutyPrice,
} from './stampDutyInput';

describe('stamp duty property price input', () => {
  it('accepts plain and grouped whole-pound prices', () => {
    expect(parseStampDutyPrice('350000')).toEqual({
      price: 350_000,
      error: null,
    });
    expect(parseStampDutyPrice(' 350,000 ')).toEqual({
      price: 350_000,
      error: null,
    });
    expect(parseStampDutyPrice('1,000,000,000,000').price).toBe(
      1_000_000_000_000,
    );
  });

  it('rejects missing, malformed, negative, fractional, and out-of-range prices', () => {
    for (const text of [
      '',
      '0',
      '-1',
      '350,00',
      '350.50',
      '£350,000',
      '1000000000001',
      '99999999999999999',
    ]) {
      const parsed = parseStampDutyPrice(text);
      expect(parsed.price, text).toBeNull();
      expect(parsed.error, text).toBeTruthy();
    }
  });

  it('groups digits as the user edits a price', () => {
    expect(formatStampDutyPriceText('350000')).toBe('350,000');
    expect(formatStampDutyPriceText('350,0001')).toBe('3,500,001');
    expect(formatStampDutyPriceText('')).toBe('');
    expect(formatStampDutyPriceText('350.50')).toBe('350.50');
  });
});
