import type { DateFormat } from '@guallet/api-client';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatPreferenceDate(
  date: Date | string,
  dateFormat: DateFormat,
): string {
  const value = typeof date === 'string' ? new Date(date) : date;
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
