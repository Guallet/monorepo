/** Locale-aware relative list timestamp, with an exact local date for older items. */
export function notificationTime(
  createdAt: string,
  locale: string,
  now = Date.now(),
) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  const seconds = Math.round((date.getTime() - now) / 1000);
  const RelativeTimeFormat = Intl.RelativeTimeFormat;
  if (typeof RelativeTimeFormat !== 'function')
    return notificationDate(createdAt, locale);
  const relative = new RelativeTimeFormat(locale, { numeric: 'auto' });
  if (Math.abs(seconds) < 60) return relative.format(0, 'minute');
  if (Math.abs(seconds) < 3600)
    return relative.format(Math.round(seconds / 60), 'minute');
  if (Math.abs(seconds) < 86400)
    return relative.format(Math.round(seconds / 3600), 'hour');
  return notificationDate(createdAt, locale);
}

export function notificationDate(createdAt: string, locale: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
