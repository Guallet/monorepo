import { useState } from 'react';
import { useUserSettings, useUserSettingsMutations } from '@guallet/api-react';
import { BaseRow } from '@guallet/ui-react';
import { IconChevronRight } from '@tabler/icons-react';
import { Modal, Stack } from '@mantine/core';
import { useDisclosure } from '@/hooks/useDisclosure';
import { Currency } from '@guallet/money';
import { notifications } from '@/lib/notifications';
import { useTranslation } from 'react-i18next';
import { CurrencyPickerModal } from '@/components/CurrencyPicker/CurrencyPickerModal';

export function PreferredCurrenciesRow() {
  const { t } = useTranslation();
  const { settings } = useUserSettings();
  const { updateUserSettingsMutation } = useUserSettingsMutations();
  const [isModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>([]);

  const mapCodesToCurrencies = (codes: string[]) => {
    return codes.map((code) => Currency.fromISOCode(code));
  };

  const openPreferredCurrenciesModal = () => {
    setSelectedCurrencies(
      mapCodesToCurrencies(settings?.currencies.preferred_currencies ?? []),
    );
    openModal();
  };

  const savePreferredCurrencies = (currencies: Currency[]) => {
    updateUserSettingsMutation.mutate(
      {
        currencies: {
          preferred_currencies: currencies.map((currency) => currency.code),
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            title: t(
              'components.preferredCurrenciesRow.notifications.success.title',
            ),
            message: t(
              'components.preferredCurrenciesRow.notifications.success.message',
            ),
            color: 'green',
          });
          closeModal();
        },
        onError: () => {
          notifications.show({
            title: t(
              'components.preferredCurrenciesRow.notifications.error.title',
            ),
            message: t(
              'components.preferredCurrenciesRow.notifications.error.message',
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
        title={t('components.preferredCurrenciesRow.modal.title')}
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack>
          <CurrencyPickerModal
            key={`${isModalOpen}-${selectedCurrencies.map((currency) => currency.code).join(',')}`}
            selectionMode="multiple"
            initialCurrencies={selectedCurrencies}
            onCurrenciesSelected={(currencies) => {
              setSelectedCurrencies(currencies);
              savePreferredCurrencies(currencies);
            }}
            onCancel={closeModal}
          />
        </Stack>
      </Modal>

      <BaseRow
        label={t('components.preferredCurrenciesRow.row.label')}
        value={t('components.preferredCurrenciesRow.row.value', {
          count: settings?.currencies.preferred_currencies.length ?? 0,
        })}
        rightSection={<IconChevronRight />}
        onClick={openPreferredCurrenciesModal}
      />
    </>
  );
}
