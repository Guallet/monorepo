import { useTranslation } from "react-i18next";

export function useLocale() {
  const { i18n } = useTranslation();

  return {
    // locale: i18n.language,
    locale: navigator.language,
    setLocale: (lng: string) => i18n.changeLanguage(lng),
  };
}
