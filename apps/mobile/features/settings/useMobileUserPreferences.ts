import { useUserSettings } from '@guallet/api-react';
import { useLocales } from 'expo-localization';
import { useMemo } from 'react';
import { ISO4217Currencies } from '@guallet/money';
import type { DateFormat } from '@guallet/api-client';

export const DEFAULT_CURRENCY = 'GBP';
export const DEFAULT_DATE_FORMAT: DateFormat = 'DD/MM/YYYY';

function getDateFormatFromLocale(languageTag?: string | null): DateFormat {
  if (!languageTag) return DEFAULT_DATE_FORMAT;

  try {
    const parts = new Intl.DateTimeFormat(languageTag, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
      .formatToParts(new Date(Date.UTC(2006, 10, 22)))
      .filter((part) => ['day', 'month', 'year'].includes(part.type))
      .map((part) => part.type);
    const order = parts.join('/');

    if (order === 'month/day/year') return 'MM/DD/YYYY';
    if (order === 'year/month/day') return 'YYYY/MM/DD';
    if (order === 'day/month/year') return 'DD/MM/YYYY';
  } catch {
    return DEFAULT_DATE_FORMAT;
  }

  return DEFAULT_DATE_FORMAT;
}

export function useMobileUserPreferences() {
  const { settings, ...settingsQuery } = useUserSettings();
  const locales = useLocales();
  const locale = locales[0];
  const localeDefaults = useMemo(() => {
    const localeCurrency = locale?.currencyCode;
    const defaultCurrency =
      localeCurrency && ISO4217Currencies[localeCurrency]
        ? localeCurrency
        : DEFAULT_CURRENCY;

    return {
      defaultCurrency,
      dateFormat: getDateFormatFromLocale(locale?.languageTag),
      languageTag: locale?.languageTag ?? 'en-GB',
    };
  }, [locale?.currencyCode, locale?.languageTag]);

  return {
    settings,
    defaultCurrency:
      settings?.currencies.default_currency ?? localeDefaults.defaultCurrency,
    preferredCurrencies: settings?.currencies.preferred_currencies ?? [],
    dateFormat: settings?.date_format ?? localeDefaults.dateFormat,
    languageTag: localeDefaults.languageTag,
    ...settingsQuery,
  };
}
