import { describe, expect, it } from 'vitest';
import {
  getYearPickerValue,
  serializeCashflowDateRange,
  updateCashflowYearSearch,
} from './cashflowSearch';

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

  it('includes the whole final day of a selected date range', () => {
    const endDate = new Date(2025, 9, 16);
    const expectedEndDate = new Date(endDate);
    expectedEndDate.setHours(23, 59, 59, 999);

    expect(
      serializeCashflowDateRange({
        startDate: new Date(2025, 9, 1),
        endDate,
      }),
    ).toEqual({
      startDate: new Date(2025, 9, 1).toISOString(),
      endDate: expectedEndDate.toISOString(),
    });
  });
});
