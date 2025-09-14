import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

export function isDate(value: string): boolean {
  const date = Date.parse(value);
  return isNaN(date) === false;
}

export function formatDate(date: string, format: string = "LL"): string {
  const day = dayjs(date);
  return day.format(format);
}
