import { useTranslation } from 'react-i18next';

export function useLocale() {
  const { i18n } = useTranslation();

  return {
    locale: navigator.language,
    language: i18n.resolvedLanguage ?? i18n.language,
    setLocale: (lng: string) => i18n.changeLanguage(lng),
  };
}
