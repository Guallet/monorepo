export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface DateRangePreset {
  id: string;
  label: string;
  getRange: (today: Date) => DateRange | null;
}

export type DraftDateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function daysBefore(today: Date, days: number): Date {
  const date = startOfDay(today);
  date.setDate(date.getDate() - days);
  return date;
}

function range(start: Date, end: Date): DateRange {
  return { startDate: startOfDay(start), endDate: endOfDay(end) };
}

/** Choices and date calculations match the web DateListPicker. */
export const DEFAULT_DATE_RANGE_PRESETS: DateRangePreset[] = [
  { id: 'today', label: 'Today', getRange: (today) => range(today, today) },
  {
    id: 'yesterday',
    label: 'Yesterday',
    getRange: (today) => range(daysBefore(today, 1), daysBefore(today, 1)),
  },
  {
    id: 'last-7-days',
    label: 'Last 7 days',
    getRange: (today) => range(daysBefore(today, 6), today),
  },
  {
    id: 'last-30-days',
    label: 'Last 30 days',
    getRange: (today) => range(daysBefore(today, 29), today),
  },
  {
    id: 'last-365-days',
    label: 'Last 365 days',
    getRange: (today) => range(daysBefore(today, 364), today),
  },
  {
    id: 'last-month',
    label: 'Last month',
    getRange: (today) =>
      range(
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        new Date(today.getFullYear(), today.getMonth(), 0),
      ),
  },
  {
    id: 'last-12-months',
    label: 'Last 12 months',
    getRange: (today) =>
      range(new Date(today.getFullYear(), today.getMonth() - 11, 1), today),
  },
  {
    id: 'last-year',
    label: 'Last year',
    getRange: (today) =>
      range(
        new Date(today.getFullYear() - 1, 0, 1),
        new Date(today.getFullYear() - 1, 11, 31),
      ),
  },
  {
    id: 'week-to-date',
    label: 'Week to date',
    getRange: (today) => {
      const daysSinceMonday = (today.getDay() + 6) % 7;
      return range(daysBefore(today, daysSinceMonday), today);
    },
  },
  {
    id: 'month-to-date',
    label: 'Month to date',
    getRange: (today) =>
      range(new Date(today.getFullYear(), today.getMonth(), 1), today),
  },
  {
    id: 'quarter-to-date',
    label: 'Quarter to date',
    getRange: (today) =>
      range(
        new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1),
        today,
      ),
  },
  {
    id: 'year-to-date',
    label: 'Year to date',
    getRange: (today) => range(new Date(today.getFullYear(), 0, 1), today),
  },
  { id: 'custom', label: 'Custom range', getRange: () => null },
];

export function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function compareCalendarDays(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

export function selectDraftDate(
  draft: DraftDateRange,
  endpoint: 'from' | 'to',
  date: Date,
): DraftDateRange {
  if (endpoint === 'from') {
    return { startDate: startOfDay(date), endDate: null };
  }
  if (!draft.startDate || compareCalendarDays(date, draft.startDate) < 0) {
    return { startDate: startOfDay(date), endDate: null };
  }
  return { startDate: draft.startDate, endDate: endOfDay(date) };
}

export function matchingPreset(
  value: DateRange | null,
  presets: DateRangePreset[],
  today: Date,
): DateRangePreset | null {
  if (!value) return null;
  return (
    presets.find((preset) => {
      const candidate = preset.getRange(today);
      if (!candidate) return false;
      return (
        sameCalendarDay(candidate.startDate, value.startDate) &&
        sameCalendarDay(candidate.endDate, value.endDate)
      );
    }) ?? null
  );
}
