export function monthIndex(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

export function adjacentMonth(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

export function isMonthInBounds(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  const month = monthIndex(date);
  return (
    (minDate === undefined || month >= monthIndex(minDate)) &&
    (maxDate === undefined || month <= monthIndex(maxDate))
  );
}

export function yearHasSelectableMonth(
  year: number,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  return (
    (minDate === undefined || year * 12 + 11 >= monthIndex(minDate)) &&
    (maxDate === undefined || year * 12 <= monthIndex(maxDate))
  );
}
