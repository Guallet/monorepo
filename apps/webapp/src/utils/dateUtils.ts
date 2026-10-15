import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

const SUPPORTED_DATE_FORMATS = [
  'YYYY-MM-DD',
  'YYYY-MM-DDTHH:mm:ss',
  'YYYY-MM-DDTHH:mm:ssZ',
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'DD-MM-YYYY',
  'YYYY/MM/DD',
  'DD.MM.YYYY',
];

export function isDate(value: string): boolean {
  const customFormat = dayjs(value, SUPPORTED_DATE_FORMATS, true);
  if (customFormat.isValid()) return true;
  return dayjs(value).isValid();
}

export function formatDate(date: Date | string, format: string = 'LL'): string {
  const day = dayjs(date);
  return day.format(format);
}

export function parseDate(value: string, format?: string): Date | null {
  if (!value) return null;

  let day;
  if (format) {
    day = dayjs(value, format, true); // true = strict mode
  } else {
    // Try to auto-detect common formats
    day = dayjs(value, SUPPORTED_DATE_FORMATS, true);

    // If still invalid, try native Date.parse as fallback
    if (!day.isValid()) {
      day = dayjs(value);
    }
  }

  return day.isValid() ? day.toDate() : null;
}
