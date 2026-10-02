import { describe, expect, it } from 'vitest';
import {
  getCurrencySections,
  type CurrencyPickerCurrency,
} from './currencyPickerUtils';

const currencies: CurrencyPickerCurrency[] = [
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
];

describe('getCurrencySections', () => {
  it('puts the default and preferred currencies first without duplicates', () => {
    const sections = getCurrencySections(currencies, '', 'gbp', [
      'GBP',
      'USD',
      'EUR',
      'USD',
    ]);
    expect(
      sections.map((section) => [
        section.title,
        ...section.data.map((item) => item.code),
      ]),
    ).toEqual([
      ['Default currency', 'GBP'],
      ['Preferred', 'USD', 'EUR'],
      ['All currencies', 'JPY'],
    ]);
  });

  it('keeps currencies available in All when priority sections are hidden', () => {
    const sections = getCurrencySections(
      currencies,
      '',
      'GBP',
      ['EUR'],
      false,
      false,
    );
    expect(sections).toHaveLength(1);
    expect(sections[0].data.map((item) => item.code)).toEqual([
      'GBP',
      'EUR',
      'JPY',
      'USD',
    ]);
  });

  it('searches name, code, and symbol across all currencies', () => {
    expect(getCurrencySections(currencies, ' yen ')[0].data[0].code).toBe(
      'JPY',
    );
    expect(getCurrencySections(currencies, 'eur')[0].data[0].code).toBe('EUR');
    expect(getCurrencySections(currencies, '£')[0].data[0].code).toBe('GBP');
  });
});
