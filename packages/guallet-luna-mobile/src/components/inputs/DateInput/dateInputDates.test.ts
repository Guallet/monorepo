import { describe, expect, it } from 'vitest';
import { getPickerInitialDate, isDateWithinBounds } from './dateInputDates';

describe('DateInput calendar bounds', () => {
  it('includes the boundary dates regardless of their time of day', () => {
    const minDate = new Date(2026, 8, 1, 18);
    const maxDate = new Date(2026, 8, 26, 8);

    expect(isDateWithinBounds(new Date(2026, 8, 1, 0), minDate, maxDate)).toBe(
      true,
    );
    expect(
      isDateWithinBounds(new Date(2026, 8, 26, 23), minDate, maxDate),
    ).toBe(true);
    expect(isDateWithinBounds(new Date(2026, 7, 31), minDate, maxDate)).toBe(
      false,
    );
    expect(isDateWithinBounds(new Date(2026, 8, 27), minDate, maxDate)).toBe(
      false,
    );
  });

  it('starts an empty picker at today clamped to the allowed range', () => {
    const minDate = new Date(2026, 8, 10);
    const maxDate = new Date(2026, 8, 20);

    expect(
      getPickerInitialDate(null, minDate, maxDate, new Date(2026, 8, 1)),
    ).toBe(minDate);
    expect(
      getPickerInitialDate(null, minDate, maxDate, new Date(2026, 8, 30)),
    ).toBe(maxDate);
  });

  it('uses an existing selected date when it is within bounds', () => {
    const selected = new Date(2026, 8, 15);
    expect(
      getPickerInitialDate(
        selected,
        new Date(2026, 8, 10),
        new Date(2026, 8, 20),
      ),
    ).toBe(selected);
  });

  it('clamps an existing selected date when bounds change', () => {
    const maxDate = new Date(2026, 8, 20);
    expect(
      getPickerInitialDate(new Date(2026, 8, 23), undefined, maxDate),
    ).toBe(maxDate);
  });
});
