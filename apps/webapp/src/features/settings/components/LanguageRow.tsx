import { useLocale } from '@/i18n/useLocale';
import { BaseRow } from '@guallet/ui-react';
import { IconEdit } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export function LanguageRow() {
  const { locale } = useLocale();
  const { t } = useTranslation();

  return (
    <BaseRow
      label={t('screens.settings.preferences.language.label', 'Default language')}
      value={locale}
      onClick={() => {
        console.log('Default Language clicked');
      }}
      rightSection={<IconEdit size={20} strokeWidth={1.5} />}
    />
  );
}
