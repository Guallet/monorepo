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

type PersonalProviderSettingsLabels = {
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

type PersonalProvider = 'bankSync' | 'lunchFlow' | 'synci';

const providerSettingsDefaults: Record<
  PersonalProvider,
  PersonalProviderSettingsLabels
> = {
  bankSync: {
    instructions:
      'Connect your banks in BankSync, then create an API key with the banks:read scope. BankSync REST API access requires Standard or higher.',
    learnMore: 'View BankSync instructions',
    keySecurity:
      'Your key is encrypted in Guallet and is only used to read your connected bank data.',
    keyConfigured: 'API key configured',
    apiKeyLabel: 'BankSync API key',
    apiKeyPlaceholder: 'Enter a new key to replace it or paste your API key',
    saveButton: 'Save and validate key',
    saveSuccess: 'BankSync API key saved.',
    saveErrorTitle: 'Could not save API key',
    saveErrorMessage:
      'Check that your key has REST API access and the banks:read scope.',
    syncButton: 'Sync now',
    syncErrorTitle: 'Could not sync accounts',
    syncErrorMessage: 'Please try again later.',
    deleteButton: 'Remove key',
    deleteSuccess: 'BankSync key removed. Imported accounts remain in Guallet.',
    deleteErrorTitle: 'Could not remove API key',
    deleteErrorMessage: 'Please try again.',
    confirmDeleteTitle: 'Remove BankSync key?',
    confirmDeleteBody:
      'Guallet will stop syncing these accounts. Imported accounts and transactions will remain.',
  },
  lunchFlow: {
    instructions:
      'Connect your banks in Lunch Flow, create a REST API destination, and enable the accounts you want Guallet to access.',
    learnMore: 'View Lunch Flow instructions',
    keyConfigured: 'API key configured',
    apiKeyLabel: 'Lunch Flow API key',
    apiKeyPlaceholder: 'Enter a new key to replace it or paste your API key',
    saveButton: 'Save and validate key',
    saveSuccess: 'Lunch Flow API key saved.',
    saveErrorTitle: 'Could not save API key',
    saveErrorMessage: 'Check the key and try again.',
    syncButton: 'Sync now',
    syncErrorTitle: 'Could not sync accounts',
    syncErrorMessage: 'Please try again later.',
    deleteButton: 'Remove key',
    deleteSuccess:
      'Lunch Flow key removed. Imported accounts remain in Guallet.',
    deleteErrorTitle: 'Could not remove API key',
    deleteErrorMessage: 'Please try again.',
    confirmDeleteTitle: 'Remove Lunch Flow key?',
    confirmDeleteBody:
      'Guallet will stop syncing these accounts. Imported accounts and transactions will remain.',
  },
  synci: {
    instructions:
      'Create a personal access token in Synci under Developers > Tokens. Guallet uses it to read your connected accounts and transactions.',
    learnMore: 'View Synci API instructions',
    keySecurity:
      'Your token is encrypted in Guallet and is only used to read your Synci financial data.',
    keyConfigured: 'Personal access token configured',
    apiKeyLabel: 'Synci personal access token',
    apiKeyPlaceholder: 'Enter a new token to replace it or paste your token',
    saveButton: 'Save and validate token',
    saveSuccess: 'Synci token saved.',
    saveErrorTitle: 'Could not save token',
    saveErrorMessage: 'Check that your Synci personal access token is valid.',
    syncButton: 'Sync now',
    syncErrorTitle: 'Could not sync accounts',
    syncErrorMessage: 'Please try again later.',
    deleteButton: 'Remove token',
    deleteSuccess: 'Synci token removed. Imported accounts remain in Guallet.',
    deleteErrorTitle: 'Could not remove token',
    deleteErrorMessage: 'Please try again.',
    confirmDeleteTitle: 'Remove Synci token?',
    confirmDeleteBody:
      'Guallet will stop syncing these accounts. Imported accounts and transactions will remain.',
  },
};

type PersonalProviderSettingsCardProps = {
  provider: PersonalProvider;
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
  provider,
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
  const labelsByProvider: Record<
    PersonalProvider,
    PersonalProviderSettingsLabels
  > = {
    bankSync: {
      instructions: t(
        'screens.settings.bankSync.instructions',
        providerSettingsDefaults.bankSync.instructions,
      ),
      learnMore: t(
        'screens.settings.bankSync.learnMore',
        providerSettingsDefaults.bankSync.learnMore,
      ),
      keySecurity: t(
        'screens.settings.bankSync.keySecurity',
        providerSettingsDefaults.bankSync.keySecurity ?? '',
      ),
      keyConfigured: t(
        'screens.settings.bankSync.keyConfigured',
        providerSettingsDefaults.bankSync.keyConfigured,
      ),
      apiKeyLabel: t(
        'screens.settings.bankSync.apiKeyLabel',
        providerSettingsDefaults.bankSync.apiKeyLabel,
      ),
      apiKeyPlaceholder: t(
        'screens.settings.bankSync.apiKeyPlaceholder',
        providerSettingsDefaults.bankSync.apiKeyPlaceholder,
      ),
      saveButton: t(
        'screens.settings.bankSync.saveButton',
        providerSettingsDefaults.bankSync.saveButton,
      ),
      saveSuccess: t(
        'screens.settings.bankSync.saveSuccess',
        providerSettingsDefaults.bankSync.saveSuccess,
      ),
      saveErrorTitle: t(
        'screens.settings.bankSync.saveErrorTitle',
        providerSettingsDefaults.bankSync.saveErrorTitle,
      ),
      saveErrorMessage: t(
        'screens.settings.bankSync.saveErrorMessage',
        providerSettingsDefaults.bankSync.saveErrorMessage,
      ),
      syncButton: t(
        'screens.settings.bankSync.syncButton',
        providerSettingsDefaults.bankSync.syncButton ?? 'Sync now',
      ),
      syncErrorTitle: t(
        'screens.settings.bankSync.syncErrorTitle',
        providerSettingsDefaults.bankSync.syncErrorTitle ??
          'Could not sync accounts',
      ),
      syncErrorMessage: t(
        'screens.settings.bankSync.syncErrorMessage',
        providerSettingsDefaults.bankSync.syncErrorMessage ??
          'Please try again later.',
      ),
      deleteButton: t(
        'screens.settings.bankSync.deleteButton',
        providerSettingsDefaults.bankSync.deleteButton,
      ),
      deleteSuccess: t(
        'screens.settings.bankSync.deleteSuccess',
        providerSettingsDefaults.bankSync.deleteSuccess,
      ),
      deleteErrorTitle: t(
        'screens.settings.bankSync.deleteErrorTitle',
        providerSettingsDefaults.bankSync.deleteErrorTitle,
      ),
      deleteErrorMessage: t(
        'screens.settings.bankSync.deleteErrorMessage',
        providerSettingsDefaults.bankSync.deleteErrorMessage,
      ),
      confirmDeleteTitle: t(
        'screens.settings.bankSync.confirmDeleteTitle',
        providerSettingsDefaults.bankSync.confirmDeleteTitle,
      ),
      confirmDeleteBody: t(
        'screens.settings.bankSync.confirmDeleteBody',
        providerSettingsDefaults.bankSync.confirmDeleteBody,
      ),
    },
    lunchFlow: {
      instructions: t(
        'screens.settings.lunchFlow.instructions',
        providerSettingsDefaults.lunchFlow.instructions,
      ),
      learnMore: t(
        'screens.settings.lunchFlow.learnMore',
        providerSettingsDefaults.lunchFlow.learnMore,
      ),
      keyConfigured: t(
        'screens.settings.lunchFlow.keyConfigured',
        providerSettingsDefaults.lunchFlow.keyConfigured,
      ),
      apiKeyLabel: t(
        'screens.settings.lunchFlow.apiKeyLabel',
        providerSettingsDefaults.lunchFlow.apiKeyLabel,
      ),
      apiKeyPlaceholder: t(
        'screens.settings.lunchFlow.apiKeyPlaceholder',
        providerSettingsDefaults.lunchFlow.apiKeyPlaceholder,
      ),
      saveButton: t(
        'screens.settings.lunchFlow.saveButton',
        providerSettingsDefaults.lunchFlow.saveButton,
      ),
      saveSuccess: t(
        'screens.settings.lunchFlow.saveSuccess',
        providerSettingsDefaults.lunchFlow.saveSuccess,
      ),
      saveErrorTitle: t(
        'screens.settings.lunchFlow.saveErrorTitle',
        providerSettingsDefaults.lunchFlow.saveErrorTitle,
      ),
      saveErrorMessage: t(
        'screens.settings.lunchFlow.saveErrorMessage',
        providerSettingsDefaults.lunchFlow.saveErrorMessage,
      ),
      syncButton: t(
        'screens.settings.lunchFlow.syncButton',
        providerSettingsDefaults.lunchFlow.syncButton ?? 'Sync now',
      ),
      syncErrorTitle: t(
        'screens.settings.lunchFlow.syncErrorTitle',
        providerSettingsDefaults.lunchFlow.syncErrorTitle ??
          'Could not sync accounts',
      ),
      syncErrorMessage: t(
        'screens.settings.lunchFlow.syncErrorMessage',
        providerSettingsDefaults.lunchFlow.syncErrorMessage ??
          'Please try again later.',
      ),
      deleteButton: t(
        'screens.settings.lunchFlow.deleteButton',
        providerSettingsDefaults.lunchFlow.deleteButton,
      ),
      deleteSuccess: t(
        'screens.settings.lunchFlow.deleteSuccess',
        providerSettingsDefaults.lunchFlow.deleteSuccess,
      ),
      deleteErrorTitle: t(
        'screens.settings.lunchFlow.deleteErrorTitle',
        providerSettingsDefaults.lunchFlow.deleteErrorTitle,
      ),
      deleteErrorMessage: t(
        'screens.settings.lunchFlow.deleteErrorMessage',
        providerSettingsDefaults.lunchFlow.deleteErrorMessage,
      ),
      confirmDeleteTitle: t(
        'screens.settings.lunchFlow.confirmDeleteTitle',
        providerSettingsDefaults.lunchFlow.confirmDeleteTitle,
      ),
      confirmDeleteBody: t(
        'screens.settings.lunchFlow.confirmDeleteBody',
        providerSettingsDefaults.lunchFlow.confirmDeleteBody,
      ),
    },
    synci: {
      instructions: t(
        'screens.settings.synci.instructions',
        'Create a personal access token in Synci under Developers > Tokens. Guallet uses it to read your connected accounts and transactions.',
      ),
      learnMore: t(
        'screens.settings.synci.learnMore',
        'View Synci API instructions',
      ),
      keySecurity: t(
        'screens.settings.synci.keySecurity',
        'Your token is encrypted in Guallet and is only used to read your Synci financial data.',
      ),
      keyConfigured: t(
        'screens.settings.synci.keyConfigured',
        'Personal access token configured',
      ),
      apiKeyLabel: t(
        'screens.settings.synci.apiKeyLabel',
        'Synci personal access token',
      ),
      apiKeyPlaceholder: t(
        'screens.settings.synci.apiKeyPlaceholder',
        'Enter a new token to replace it or paste your token',
      ),
      saveButton: t(
        'screens.settings.synci.saveButton',
        'Save and validate token',
      ),
      saveSuccess: t(
        'screens.settings.synci.saveSuccess',
        'Synci token saved.',
      ),
      saveErrorTitle: t(
        'screens.settings.synci.saveErrorTitle',
        'Could not save token',
      ),
      saveErrorMessage: t(
        'screens.settings.synci.saveErrorMessage',
        'Check that your Synci personal access token is valid.',
      ),
      syncButton: t('screens.settings.synci.syncButton', 'Sync now'),
      syncErrorTitle: t(
        'screens.settings.synci.syncErrorTitle',
        'Could not sync accounts',
      ),
      syncErrorMessage: t(
        'screens.settings.synci.syncErrorMessage',
        'Please try again later.',
      ),
      deleteButton: t('screens.settings.synci.deleteButton', 'Remove token'),
      deleteSuccess: t(
        'screens.settings.synci.deleteSuccess',
        'Synci token removed. Imported accounts remain in Guallet.',
      ),
      deleteErrorTitle: t(
        'screens.settings.synci.deleteErrorTitle',
        'Could not remove token',
      ),
      deleteErrorMessage: t(
        'screens.settings.synci.deleteErrorMessage',
        'Please try again.',
      ),
      confirmDeleteTitle: t(
        'screens.settings.synci.confirmDeleteTitle',
        'Remove Synci token?',
      ),
      confirmDeleteBody: t(
        'screens.settings.synci.confirmDeleteBody',
        'Guallet will stop syncing these accounts. Imported accounts and transactions will remain.',
      ),
    },
  };
  const labels = labelsByProvider[provider];
  const docsUrlByProvider: Record<PersonalProvider, string> = {
    bankSync: 'https://banksync.io/docs/api/authentication',
    lunchFlow: 'https://www.lunchflow.app/docs/api/personal-api-overview',
    synci: 'https://docs.synci.io',
  };
  const docsUrl = docsUrlByProvider[provider];
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
