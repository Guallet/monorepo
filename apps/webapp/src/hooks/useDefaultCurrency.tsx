import { useUserSettings } from "@guallet/api-react";

export function useDefaultCurrency() {
  const { settings } = useUserSettings();
  return (
    settings?.currencies.default_currency ??
    getDefaultCurrencyFromLocale() ??
    null
  );
}

// Only works on web browsers. Find some equivalent for React native
function getDefaultCurrencyFromLocale(): string | undefined {
  const locale = navigator.language;
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "GBP",
  }).resolvedOptions();

  // Some browsers provide currency in resolvedOptions if style is "currency"
  return parts.currency;
}
