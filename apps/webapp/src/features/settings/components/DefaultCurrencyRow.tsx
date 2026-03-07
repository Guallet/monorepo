import { useUserSettings, useUserSettingsMutations } from '@guallet/api-react';
import { BaseRow, ResponsiveModal } from '@guallet/ui-react';
import { IconChevronRight } from '@tabler/icons-react';
import { useDisclosure } from '@/hooks/useDisclosure';
import { CurrencyPickerModal } from '@/components/CurrencyPicker/CurrencyPickerModal';
import { Currency } from '@guallet/money';
import { notifications } from '@/lib/notifications';

export function DefaultCurrencyRow() {
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
            title: 'Success',
            message: 'Default currency updated successfully',
            color: 'green',
          });
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to update default currency',
            color: 'red',
          });
        },
      },
    );
  };

  return (
    <>
      <ResponsiveModal
        opened={isModalOpen}
        onClose={closeModal}
        title="Select Default Currency"
        size="lg"
      >
        <CurrencyPickerModal
          selectionMode="single"
          onCurrencySelected={(currency: Currency) => {
            saveSelectedCurrency(currency);
            closeModal();
          }}
          onCancel={closeModal}
        />
      </ResponsiveModal>
      <BaseRow
        label="Default Currency"
        value={settings?.currencies.default_currency ?? ''}
        rightSection={<IconChevronRight />}
        onClick={() => {
          openModal();
        }}
      />
    </>
  );
}
