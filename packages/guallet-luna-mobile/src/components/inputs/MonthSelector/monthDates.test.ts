import { describe, expect, it } from 'vitest';
import {
  adjacentMonth,
  isMonthInBounds,
  yearHasSelectableMonth,
} from './monthDates';

describe('month bounds', () => {
  it('ignores days and time at both bounds', () => {
    const min = new Date(2025, 0, 31, 23);
    const max = new Date(2025, 2, 1);
    expect(isMonthInBounds(new Date(2025, 0, 1), min, max)).toBe(true);
    expect(isMonthInBounds(new Date(2025, 2, 31), min, max)).toBe(true);
    expect(isMonthInBounds(new Date(2024, 11, 1), min, max)).toBe(false);
    expect(isMonthInBounds(new Date(2025, 3, 1), min, max)).toBe(false);
  });

  it('crosses years without retaining a day that overflows February', () => {
    expect(adjacentMonth(new Date(2025, 0, 31), 1)).toEqual(
      new Date(2025, 1, 1),
    );
    expect(adjacentMonth(new Date(2025, 0, 1), -1)).toEqual(
      new Date(2024, 11, 1),
    );
  });

  it('allows only years containing a selectable month', () => {
    const min = new Date(2024, 11, 31);
    const max = new Date(2026, 0, 1);
    expect(yearHasSelectableMonth(2023, min, max)).toBe(false);
    expect(yearHasSelectableMonth(2024, min, max)).toBe(true);
    expect(yearHasSelectableMonth(2026, min, max)).toBe(true);
    expect(yearHasSelectableMonth(2027, min, max)).toBe(false);
  });
});
