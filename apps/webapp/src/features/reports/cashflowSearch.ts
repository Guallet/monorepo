export function getYearPickerValue(year: number): string {
  return `${year}-01-01`;
}

export function updateCashflowYearSearch<T extends { year: number }>(
  previous: T,
  value: string | null,
): T {
  const match = value?.match(/^(\d{4})-\d{2}-\d{2}$/);
  if (!match) return previous;

  const year = Number(match[1]);
  return Number.isInteger(year) ? { ...previous, year } : previous;
}

export function serializeCashflowDateRange(
  range: { startDate: Date; endDate: Date } | null,
): { startDate: string | undefined; endDate: string | undefined } {
  if (!range) return { startDate: undefined, endDate: undefined };

  const startDate = new Date(range.startDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(range.endDate);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}
