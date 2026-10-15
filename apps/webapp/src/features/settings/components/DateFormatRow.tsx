import { IconChevronRight } from '@tabler/icons-react';
import { Modal, Stack, Select, Group, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useUserSettings, useUserSettingsMutations } from '@guallet/api-react';
import { ALLOWED_DATE_FORMATS, DateFormat } from '@guallet/api-client';
import { notifications } from '@mantine/notifications';
import { BaseRow } from '@guallet/ui-react';
import { useTranslation } from 'react-i18next';

export function DateFormatRow() {
  const { t } = useTranslation();
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
            title: t(
              'screens.settings.preferences.dateFormat.success.title',
              'Success',
            ),
            message: t(
              'screens.settings.preferences.dateFormat.success.message',
              'Date format updated',
            ),
            color: 'green',
          });
        },
        onError: () => {
          notifications.show({
            title: t(
              'screens.settings.preferences.dateFormat.error.title',
              'Error',
            ),
            message: t(
              'screens.settings.preferences.dateFormat.error.message',
              'Failed to update date format',
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
        opened={isOpen}
        onClose={close}
        title={t(
          'screens.settings.preferences.dateFormat.modal.title',
          'Select date format',
        )}
        centered
      >
        <Stack>
          <Select
            data={ALLOWED_DATE_FORMATS}
            value={settings?.date_format ?? ''}
            placeholder={t(
              'screens.settings.preferences.dateFormat.placeholder',
              'Select date format',
            )}
            onChange={(newDateFormat) => {
              save(newDateFormat as DateFormat);
              close();
            }}
            clearable
          />
          <Group style={{ justifyContent: 'flex-end' }}>
            <Button onClick={close}>
              {t(
                'screens.settings.preferences.dateFormat.cancelButton',
                'Cancel',
              )}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <BaseRow
        label={t(
          'screens.settings.preferences.dateFormat.label',
          'Date format',
        )}
        value={settings?.date_format ?? ''}
        rightSection={<IconChevronRight size={20} strokeWidth={1.5} />}
        onClick={() => open()}
      />
    </>
  );
}
