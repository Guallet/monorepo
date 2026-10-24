import { describe, expect, it } from 'vitest';
import { getYearPickerValue, updateCashflowYearSearch } from './cashflowYear';

describe('cash flow year picker search', () => {
  it('updates the report year from the picker date value', () => {
    const previous = { year: 2026, accounts: ['account-1'] };
    const pickerValue = getYearPickerValue(2025);

    expect(pickerValue).toBe('2025-01-01');
    expect(updateCashflowYearSearch(previous, pickerValue)).toEqual({
      year: 2025,
      accounts: ['account-1'],
    });
  });
});
