import { BaseRow } from "./BaseRow/BaseRow";
import { IconChevronRight } from "@tabler/icons-react";
import { Modal, Stack, Select, Group, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useUserSettings, useUserSettingsMutations } from "@guallet/api-react";
import { ALLOWED_DATE_FORMATS, DateFormat } from "@guallet/api-client";
import { notifications } from "@mantine/notifications";

export function DateFormatRow() {
  const { settings } = useUserSettings();
  const { updateUserSettingsMutation } = useUserSettingsMutations();
  const [isOpen, { open, close }] = useDisclosure(false);

  const save = (value: DateFormat | null) => {
    if (!value) return;
    updateUserSettingsMutation.mutate(
      { date_format: value },
      {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Date format updated",
            color: "green",
          });
        },
        onError: () => {
          notifications.show({
            title: "Error",
            message: "Failed to update date format",
            color: "red",
          });
        },
      }
    );
  };

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={close}
        title="Select date format"
        centered
      >
        <Stack>
          <Select
            data={ALLOWED_DATE_FORMATS}
            value={settings?.date_format ?? ""}
            placeholder="Select date format"
            onChange={(newDateFormat) => {
              save(newDateFormat as DateFormat);
              close();
            }}
            clearable
          />
          <Group style={{ justifyContent: "flex-end" }}>
            <Button onClick={close}>Cancel</Button>
          </Group>
        </Stack>
      </Modal>

      <BaseRow
        label="Date format"
        value={settings?.date_format ?? ""}
        rightSection={<IconChevronRight />}
        onClick={() => open()}
      />
    </>
  );
}
