import { useTranslation } from 'react-i18next';

export function useLocale() {
  const { i18n } = useTranslation();

  const locale =
    typeof navigator === 'undefined' ? i18n.language : navigator.language;

  return {
    locale,
    setLocale: (lng: string) => i18n.changeLanguage(lng),
  };
}
