import { useDisclosure } from '@mantine/hooks';
import { useLocale } from '@/i18n/useLocale';
import { BaseRow } from '@guallet/ui-react';
import { IconEdit } from '@tabler/icons-react';
import { Button, Group, Modal, Select, Stack } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageRow() {
  const { locale, language, setLocale } = useLocale();
  const { t } = useTranslation();
  const [isOpen, { open, close }] = useDisclosure(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const languageOptions = [
    {
      value: 'en',
      label: t(
        'screens.settings.preferences.language.options.english',
        'English',
      ),
    },
    {
      value: 'es',
      label: t(
        'screens.settings.preferences.language.options.spanish',
        'Spanish',
      ),
    },
  ];

  const openLanguageSelector = () => {
    setSelectedLanguage(language);
    open();
  };

  const saveLanguage = () => {
    if (!selectedLanguage) return;
    void setLocale(selectedLanguage);
    close();
  };

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={close}
        title={t(
          'screens.settings.preferences.language.modal.title',
          'Select language',
        )}
        centered
      >
        <Stack>
          <Select
            data={languageOptions}
            value={selectedLanguage}
            onChange={(value) => {
              if (value) setSelectedLanguage(value);
            }}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={saveLanguage}>{t('common.save', 'Save')}</Button>
          </Group>
        </Stack>
      </Modal>

      <BaseRow
        label={t(
          'screens.settings.preferences.language.label',
          'Default language',
        )}
        value={
          languageOptions.find((option) => option.value === language)?.label ??
          locale
        }
        onClick={openLanguageSelector}
        rightSection={<IconEdit size={20} strokeWidth={1.5} />}
      />
    </>
  );
}
