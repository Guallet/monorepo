import {
  useBankSyncCredential,
  useBankSyncMutations,
} from '@guallet/api-react';
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

export function BankSyncSettingsCard() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { credential, isLoading } = useBankSyncCredential();
  const { saveCredentialMutation, deleteCredentialMutation, syncMutation } =
    useBankSyncMutations();
  const [apiKey, setApiKey] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function saveKey() {
    try {
      await saveCredentialMutation.mutateAsync({ apiKey: apiKey.trim() });
      setApiKey('');
      notifications.show({
        message: t(
          'screens.settings.bankSync.saveSuccess',
          'BankSync API key saved.',
        ),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t(
          'screens.settings.bankSync.saveErrorTitle',
          'Could not save API key',
        ),
        message: t(
          'screens.settings.bankSync.saveErrorMessage',
          'Check that your key has REST API access and the banks:read scope.',
        ),
        color: 'red',
      });
    }
  }

  async function removeKey() {
    try {
      await deleteCredentialMutation.mutateAsync();
      setConfirmDelete(false);
      notifications.show({
        message: t(
          'screens.settings.bankSync.deleteSuccess',
          'BankSync key removed. Imported accounts remain in Guallet.',
        ),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t(
          'screens.settings.bankSync.deleteErrorTitle',
          'Could not remove API key',
        ),
        message: t(
          'screens.settings.bankSync.deleteErrorMessage',
          'Please try again.',
        ),
        color: 'red',
      });
    }
  }

  async function syncNow() {
    try {
      const result = await syncMutation.mutateAsync();
      notifications.show({
        message: t(
          'screens.settings.bankSync.syncSuccess',
          '{{count}} accounts synced.',
          { count: result.accountsSynced },
        ),
        color: result.errors.length === 0 ? 'green' : 'yellow',
      });
    } catch {
      notifications.show({
        title: t(
          'screens.settings.bankSync.syncErrorTitle',
          'Could not sync accounts',
        ),
        message: t(
          'screens.settings.bankSync.syncErrorMessage',
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
          {t(
            'screens.settings.bankSync.instructions',
            'Connect your banks in BankSync, then create an API key with the banks:read scope. BankSync REST API access requires Standard or higher.',
          )}{' '}
          <Anchor
            href="https://banksync.io/docs/api/authentication"
            target="_blank"
            rel="noreferrer"
          >
            {t(
              'screens.settings.bankSync.learnMore',
              'View BankSync instructions',
            )}
          </Anchor>
        </Text>
        <Alert icon={<IconInfoCircle size={18} />}>
          {t(
            'screens.settings.bankSync.keySecurity',
            'Your key is encrypted in Guallet and is only used to read your connected bank data.',
          )}
        </Alert>
        {!isLoading && credential.configured && (
          <Text size="sm">
            {t('screens.settings.bankSync.keyConfigured', 'API key configured')}{' '}
            ••••{credential.keyHint}
          </Text>
        )}
        <PasswordInput
          label={t('screens.settings.bankSync.apiKeyLabel', 'BankSync API key')}
          placeholder={t(
            'screens.settings.bankSync.apiKeyPlaceholder',
            'Enter a new key to replace it or paste your API key',
          )}
          value={apiKey}
          onChange={(event) => setApiKey(event.currentTarget.value)}
          autoComplete="new-password"
        />
        <Group>
          {credential.configured && (
            <Button
              variant="outline"
              onClick={() => void syncNow()}
              loading={syncMutation.isPending}
            >
              {t('screens.settings.bankSync.syncButton', 'Sync now')}
            </Button>
          )}
          <Button
            onClick={() => void saveKey()}
            loading={saveCredentialMutation.isPending}
            disabled={!apiKey.trim()}
          >
            {t('screens.settings.bankSync.saveButton', 'Save and validate key')}
          </Button>
          {credential.configured && (
            <Button
              variant="outline"
              color="red"
              onClick={() => setConfirmDelete(true)}
              loading={deleteCredentialMutation.isPending}
            >
              {t('screens.settings.bankSync.deleteButton', 'Remove key')}
            </Button>
          )}
        </Group>
      </Stack>
      <Modal
        opened={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t(
          'screens.settings.bankSync.confirmDeleteTitle',
          'Remove BankSync key?',
        )}
      >
        <Stack gap={spacing.md}>
          <Text>
            {t(
              'screens.settings.bankSync.confirmDeleteBody',
              'Guallet will stop syncing these accounts. Imported accounts and transactions will remain.',
            )}
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              color="red"
              onClick={() => void removeKey()}
              loading={deleteCredentialMutation.isPending}
            >
              {t('screens.settings.bankSync.deleteButton', 'Remove key')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
