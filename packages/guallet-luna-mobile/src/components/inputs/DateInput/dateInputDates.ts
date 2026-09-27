function calendarDay(date: Date): number {
  return (
    date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate()
  );
}

/** Compare calendar dates in the device's local time zone, ignoring time. */
export function isDateWithinBounds(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  const day = calendarDay(date);
  if (minDate && day < calendarDay(minDate)) return false;
  if (maxDate && day > calendarDay(maxDate)) return false;
  return true;
}

/** Start at the controlled value, or today, clamped to the allowed range. */
export function getPickerInitialDate(
  value: Date | null,
  minDate?: Date,
  maxDate?: Date,
  today = new Date(),
): Date {
  const initialDate = value ?? today;
  if (minDate && calendarDay(initialDate) < calendarDay(minDate)) {
    return minDate;
  }
  if (maxDate && calendarDay(initialDate) > calendarDay(maxDate)) {
    return maxDate;
  }
  return initialDate;
}
