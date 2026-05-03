import { useUserSettings, useUserSettingsMutations } from '@guallet/api-react';
import { IconChevronRight } from '@tabler/icons-react';
import { Modal, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CurrencyPickerModal } from '@/components/CurrencyPicker/CurrencyPickerModal';
import { Currency } from '@guallet/money';
import { notifications } from '@mantine/notifications';
import { BaseRow } from '@guallet/ui-react/';
import { useTranslation } from 'react-i18next';

export function DefaultCurrencyRow() {
  const { t } = useTranslation();
  const { settings } = useUserSettings();
  const { updateUserSettingsMutation } = useUserSettingsMutations();
  const [isModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const saveSelectedCurrency = (currency: Currency) => {
    updateUserSettingsMutation.mutate(
      {
        currencies: { default_currency: currency.code },
      },
      {
        onSuccess: () => {
          notifications.show({
            title: t('screens.settings.preferences.defaultCurrency.success.title', 'Success'),
            message: t(
              'screens.settings.preferences.defaultCurrency.success.message',
              'Default currency updated successfully',
            ),
            color: 'green',
          });
        },
        onError: () => {
          notifications.show({
            title: t('screens.settings.preferences.defaultCurrency.error.title', 'Error'),
            message: t(
              'screens.settings.preferences.defaultCurrency.error.message',
              'Failed to update default currency',
            ),
            color: 'red',
          });
        },
      },
    );
  };

  return (
    <>
      <Modal
        opened={isModalOpen}
        onClose={closeModal}
        title={t(
          'screens.settings.preferences.defaultCurrency.modal.title',
          'Select default currency',
        )}
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack>
          <CurrencyPickerModal
            selectionMode="single"
            onCurrencySelected={(currency: Currency) => {
              saveSelectedCurrency(currency);
              closeModal();
            }}
            onCancel={() => {
              closeModal();
            }}
          />
        </Stack>
      </Modal>
      <BaseRow
        label={t(
          'screens.settings.preferences.defaultCurrency.label',
          'Default currency',
        )}
        value={settings?.currencies.default_currency ?? ''}
        rightSection={<IconChevronRight size={20} strokeWidth={1.5} />}
        onClick={() => {
          openModal();
        }}
      />
    </>
  );
}
