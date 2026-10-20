import { useTheme } from '@guallet/ui-react';
import {
  Anchor,
  Alert,
  Button,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type PersonalProviderSettingsLabels = {
  instructions: string;
  learnMore: string;
  keySecurity?: string;
  keyConfigured: string;
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  saveButton: string;
  saveSuccess: string;
  saveErrorTitle: string;
  saveErrorMessage: string;
  syncButton?: string;
  syncErrorTitle?: string;
  syncErrorMessage?: string;
  deleteButton: string;
  deleteSuccess: string;
  deleteErrorTitle: string;
  deleteErrorMessage: string;
  confirmDeleteTitle: string;
  confirmDeleteBody: string;
};

type PersonalProviderSettingsCardProps = {
  labels: PersonalProviderSettingsLabels;
  docsUrl: string;
  configured: boolean;
  keyHint: string | null;
  isLoading: boolean;
  savePending: boolean;
  deletePending: boolean;
  syncPending?: boolean;
  onSave: (apiKey: string) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
  onSync?: () => Promise<{ accountsSynced: number; errors: string[] }>;
};

export function PersonalProviderSettingsCard({
  labels,
  docsUrl,
  configured,
  keyHint,
  isLoading,
  savePending,
  deletePending,
  syncPending = false,
  onSave,
  onDelete,
  onSync,
}: Readonly<PersonalProviderSettingsCardProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function saveKey() {
    try {
      await onSave(apiKey.trim());
      setApiKey('');
      notifications.show({ message: labels.saveSuccess, color: 'green' });
    } catch {
      notifications.show({
        title: labels.saveErrorTitle,
        message: labels.saveErrorMessage,
        color: 'red',
      });
    }
  }

  async function removeKey() {
    try {
      await onDelete();
      setConfirmDelete(false);
      notifications.show({ message: labels.deleteSuccess, color: 'green' });
    } catch {
      notifications.show({
        title: labels.deleteErrorTitle,
        message: labels.deleteErrorMessage,
        color: 'red',
      });
    }
  }

  async function syncNow() {
    if (!onSync) return;
    try {
      const result = await onSync();
      notifications.show({
        message: t(
          'screens.settings.provider.syncSuccess',
          '{{count}} accounts synced.',
          {
            count: result.accountsSynced,
          },
        ),
        color: result.errors.length === 0 ? 'green' : 'yellow',
      });
    } catch {
      notifications.show({
        title:
          labels.syncErrorTitle ??
          t(
            'screens.settings.provider.syncErrorTitle',
            'Could not sync accounts',
          ),
        message:
          labels.syncErrorMessage ??
          t(
            'screens.settings.provider.syncErrorMessage',
            'Please try again later.',
          ),
        color: 'red',
      });
    }
  }

  return (
    <>
      <Stack gap={spacing.sm}>
        <Text size="sm" c="dimmed">
          {labels.instructions}{' '}
          <Anchor href={docsUrl} target="_blank" rel="noreferrer">
            {labels.learnMore}
          </Anchor>
        </Text>
        {labels.keySecurity && (
          <Alert icon={<IconInfoCircle size={18} />}>
            {labels.keySecurity}
          </Alert>
        )}
        {!isLoading && configured && (
          <Text size="sm">
            {labels.keyConfigured} ••••{keyHint}
          </Text>
        )}
        <PasswordInput
          label={labels.apiKeyLabel}
          placeholder={labels.apiKeyPlaceholder}
          value={apiKey}
          onChange={(event) => setApiKey(event.currentTarget.value)}
          autoComplete="new-password"
        />
        <Group>
          {configured && onSync && (
            <Button
              variant="outline"
              onClick={() => void syncNow()}
              loading={syncPending}
            >
              {labels.syncButton ??
                t('screens.settings.provider.syncButton', 'Sync now')}
            </Button>
          )}
          <Button
            onClick={() => void saveKey()}
            loading={savePending}
            disabled={!apiKey.trim()}
          >
            {labels.saveButton}
          </Button>
          {configured && (
            <Button
              variant="outline"
              color="red"
              onClick={() => setConfirmDelete(true)}
              loading={deletePending}
            >
              {labels.deleteButton}
            </Button>
          )}
        </Group>
      </Stack>
      <Modal
        opened={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={labels.confirmDeleteTitle}
      >
        <Stack gap={spacing.md}>
          <Text>{labels.confirmDeleteBody}</Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              color="red"
              onClick={() => void removeKey()}
              loading={deletePending}
            >
              {labels.deleteButton}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
