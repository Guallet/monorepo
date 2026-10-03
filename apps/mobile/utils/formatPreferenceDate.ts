import type { DateFormat } from '@guallet/api-client';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Interpret an API date's calendar portion without a timezone shift. */
export function parsePreferenceDate(date: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!match) return new Date(date);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** Encode the picked calendar day as a UTC deadline, matching API date display. */
export function endOfPreferenceDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

export function formatPreferenceDate(
  date: Date | string,
  dateFormat: DateFormat,
): string {
  const value = typeof date === 'string' ? parsePreferenceDate(date) : date;
  if (Number.isNaN(value.getTime())) return '';

  const day = pad(value.getDate());
  const month = pad(value.getMonth() + 1);
  const year = String(value.getFullYear());

  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
}
