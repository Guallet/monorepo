import { useMemo, useState } from 'react';
import { useUserSettings, useUserSettingsMutations } from '@guallet/api-react';
import { BaseRow } from '@guallet/ui-react';
import { IconChevronRight } from '@tabler/icons-react';
import { Modal, Stack, MultiSelect, Group, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ISO4217Currencies } from '@guallet/money';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';

export function PreferredCurrenciesRow() {
  const { t } = useTranslation();
  const { settings } = useUserSettings();
  const { updateUserSettingsMutation } = useUserSettingsMutations();
  const [isModalOpen, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(
    settings?.currencies.preferred_currencies ?? [],
  );

  const currencyOptions = useMemo(() => {
    return Object.values(ISO4217Currencies)
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((currency) => ({
        value: currency.code,
        label: `${currency.code} - ${currency.name}`,
      }));
  }, []);

  const openPreferredCurrenciesModal = () => {
    setSelectedCurrencies(settings?.currencies.preferred_currencies ?? []);
    openModal();
  };

  const savePreferredCurrencies = () => {
    updateUserSettingsMutation.mutate(
      {
        currencies: {
          preferred_currencies: selectedCurrencies,
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
          <MultiSelect
            searchable
            clearable
            data={currencyOptions}
            value={selectedCurrencies}
            onChange={setSelectedCurrencies}
            placeholder={t(
              'components.preferredCurrenciesRow.modal.input.placeholder',
            )}
            nothingFoundMessage={t(
              'components.preferredCurrenciesRow.modal.input.nothingFoundMessage',
            )}
            maxDropdownHeight={300}
          />

          <Group justify="end">
            <Button variant="default" onClick={closeModal}>
              {t('components.preferredCurrenciesRow.modal.buttons.cancel')}
            </Button>
            <Button
              onClick={savePreferredCurrencies}
              loading={updateUserSettingsMutation.isPending}
            >
              {t('components.preferredCurrenciesRow.modal.buttons.save')}
            </Button>
          </Group>
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
