import { IconChevronRight } from '@tabler/icons-react';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useUserSettings, useUserSettingsMutations } from '@guallet/api-react';
import { ALLOWED_DATE_FORMATS, DateFormat } from '@guallet/api-client';
import { BaseRow, ResponsiveModal } from '@guallet/ui-react';
import { Button } from '@/components/ui/button';
import { notifications } from '@/lib/notifications';

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
            title: 'Success',
            message: 'Date format updated',
            color: 'green',
          });
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to update date format',
            color: 'red',
          });
        },
      },
    );
  };

  return (
    <>
      <ResponsiveModal
        opened={isOpen}
        onClose={close}
        title="Select date format"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="date-format-select" className="text-sm font-medium">
              Date format
            </label>
            <select
              id="date-format-select"
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={settings?.date_format ?? ''}
              onChange={(event) => {
                const selectedFormat = event.target.value;
                if (selectedFormat !== '') {
                  save(selectedFormat as DateFormat);
                }

                close();
              }}
            >
              <option value="">Select date format</option>
              {ALLOWED_DATE_FORMATS.map((dateFormat) => (
                <option key={dateFormat} value={dateFormat}>
                  {dateFormat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      <BaseRow
        label="Date format"
        value={settings?.date_format ?? ''}
        rightSection={<IconChevronRight />}
        onClick={open}
      />
    </>
  );
}
