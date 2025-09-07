import { useUserSettings, useUserSettingsMutations } from "@guallet/api-react";
import { IconChevronRight } from "@tabler/icons-react";
import { Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CurrencyPickerModal } from "@/components/CurrencyPicker/CurrencyPickerModal";
import { Currency } from "@guallet/money";
import { notifications } from "@mantine/notifications";
import { BaseRow } from "@guallet/ui-react/";

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
            title: "Success",
            message: "Default currency updated successfully",
            color: "green",
          });
        },
        onError: (error) => {
          notifications.show({
            title: "Error",
            message: "Failed to update default currency",
            color: "red",
          });
        },
      }
    );
  };

  return (
    <>
      <Modal
        opened={isModalOpen}
        onClose={closeModal}
        title="Select Default Currency"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack>
          <CurrencyPickerModal
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
        label="Default Currency"
        value={settings?.currencies.default_currency ?? ""}
        rightSection={<IconChevronRight />}
        onClick={() => {
          openModal();
        }}
      />
    </>
  );
}
