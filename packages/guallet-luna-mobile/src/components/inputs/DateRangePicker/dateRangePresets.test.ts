import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DATE_RANGE_PRESETS,
  matchingPreset,
  selectDraftDate,
  sameCalendarDay,
} from './dateRangePresets';

const today = new Date(2026, 8, 26, 15);

function preset(id: string) {
  const found = DEFAULT_DATE_RANGE_PRESETS.find((item) => item.id === id);
  if (!found) throw new Error(`Missing preset ${id}`);
  const range = found.getRange(today);
  if (!range) throw new Error(`Preset ${id} has no fixed range`);
  return range;
}

describe('DateRangePicker web presets', () => {
  it('includes all 13 web choices', () => {
    expect(DEFAULT_DATE_RANGE_PRESETS.map((item) => item.id)).toEqual([
      'today',
      'yesterday',
      'last-7-days',
      'last-30-days',
      'last-365-days',
      'last-month',
      'last-12-months',
      'last-year',
      'week-to-date',
      'month-to-date',
      'quarter-to-date',
      'year-to-date',
      'custom',
    ]);
  });

  it('uses inclusive calendar days for rolling periods', () => {
    const sevenDays = preset('last-7-days');
    expect(sameCalendarDay(sevenDays.startDate, new Date(2026, 8, 20))).toBe(
      true,
    );
    expect(sameCalendarDay(sevenDays.endDate, today)).toBe(true);
    expect(sevenDays.startDate.getHours()).toBe(0);
    expect(sevenDays.endDate.getHours()).toBe(23);

    const thirtyDays = preset('last-30-days');
    expect(sameCalendarDay(thirtyDays.startDate, new Date(2026, 7, 28))).toBe(
      true,
    );
  });

  it('matches previous month and Monday-start week to date', () => {
    const lastMonth = preset('last-month');
    expect(sameCalendarDay(lastMonth.startDate, new Date(2026, 7, 1))).toBe(
      true,
    );
    expect(sameCalendarDay(lastMonth.endDate, new Date(2026, 7, 31))).toBe(
      true,
    );
    expect(
      sameCalendarDay(preset('week-to-date').startDate, new Date(2026, 8, 21)),
    ).toBe(true);
  });

  it('recognizes a controlled range by its calendar dates', () => {
    expect(
      matchingPreset(preset('last-30-days'), DEFAULT_DATE_RANGE_PRESETS, today)
        ?.id,
    ).toBe('last-30-days');
  });

  it('keeps a custom range incomplete until an end day is chosen', () => {
    const start = selectDraftDate(
      { startDate: new Date(2026, 8, 1), endDate: new Date(2026, 8, 5) },
      'from',
      new Date(2026, 8, 7),
    );
    expect(start.endDate).toBeNull();
    const complete = selectDraftDate(start, 'to', new Date(2026, 8, 7));
    expect(complete.endDate?.getDate()).toBe(7);
  });

  it('restarts the range when the second day is before its start', () => {
    const result = selectDraftDate(
      { startDate: new Date(2026, 8, 23), endDate: null },
      'to',
      new Date(2026, 8, 7),
    );
    expect(result.startDate?.getDate()).toBe(7);
    expect(result.endDate).toBeNull();
  });
});
