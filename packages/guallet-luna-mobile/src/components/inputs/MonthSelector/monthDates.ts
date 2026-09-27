/** Number each local calendar month so day and time never affect comparisons. */
export function monthIndex(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

/** Return the first day of a neighboring local month, even across year ends. */
export function adjacentMonth(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

/** Include both boundary months, regardless of each boundary's day or time. */
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

/** Check whether at least one month of a year falls inside the bounds. */
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

/** Keep the picker in a year from which a valid month can be chosen. */
export function clampYearToBounds(
  year: number,
  minDate?: Date,
  maxDate?: Date,
): number {
  if (minDate && year < minDate.getFullYear()) {
    return minDate.getFullYear();
  }
  if (maxDate && year > maxDate.getFullYear()) {
    return maxDate.getFullYear();
  }
  return year;
}
