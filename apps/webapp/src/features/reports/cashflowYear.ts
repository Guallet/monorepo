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
