import {
  useLunchFlowCredential,
  useLunchFlowMutations,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Anchor,
  Button,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function LunchFlowSettingsCard() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { credential, isLoading } = useLunchFlowCredential();
  const { saveCredentialMutation, deleteCredentialMutation } =
    useLunchFlowMutations();
  const [apiKey, setApiKey] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function saveKey() {
    try {
      await saveCredentialMutation.mutateAsync({ apiKey });
      setApiKey('');
      notifications.show({
        message: t(
          'screens.settings.lunchFlow.saveSuccess',
          'Lunch Flow API key saved.',
        ),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t(
          'screens.settings.lunchFlow.saveErrorTitle',
          'Could not save API key',
        ),
        message: t(
          'screens.settings.lunchFlow.saveErrorMessage',
          'Check the key and try again.',
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
          'screens.settings.lunchFlow.deleteSuccess',
          'Lunch Flow key removed. Imported accounts remain in Guallet.',
        ),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t(
          'screens.settings.lunchFlow.deleteErrorTitle',
          'Could not remove API key',
        ),
        message: t(
          'screens.settings.lunchFlow.deleteErrorMessage',
          'Please try again.',
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
            'screens.settings.lunchFlow.instructions',
            'Connect your banks in Lunch Flow, create a REST API destination, and enable the accounts you want Guallet to access.',
          )}{' '}
          <Anchor
            href="https://www.lunchflow.app/docs/api/personal-api-overview"
            target="_blank"
            rel="noreferrer"
          >
            {t(
              'screens.settings.lunchFlow.learnMore',
              'View Lunch Flow instructions',
            )}
          </Anchor>
        </Text>
        {!isLoading && credential.configured && (
          <Text size="sm">
            {t(
              'screens.settings.lunchFlow.keyConfigured',
              'API key configured',
            )}{' '}
            ••••
            {credential.keyHint}
          </Text>
        )}
        <PasswordInput
          label={t(
            'screens.settings.lunchFlow.apiKeyLabel',
            'Lunch Flow API key',
          )}
          placeholder={t(
            'screens.settings.lunchFlow.apiKeyPlaceholder',
            'Enter a new key to replace it or paste your API key',
          )}
          value={apiKey}
          onChange={(event) => setApiKey(event.currentTarget.value)}
          autoComplete="new-password"
        />
        <Group>
          <Button
            onClick={saveKey}
            loading={saveCredentialMutation.isPending}
            disabled={!apiKey.trim()}
          >
            {t(
              'screens.settings.lunchFlow.saveButton',
              'Save and validate key',
            )}
          </Button>
          {credential.configured && (
            <Button
              variant="outline"
              color="red"
              onClick={() => setConfirmDelete(true)}
              loading={deleteCredentialMutation.isPending}
            >
              {t('screens.settings.lunchFlow.deleteButton', 'Remove key')}
            </Button>
          )}
        </Group>
      </Stack>
      <Modal
        opened={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t(
          'screens.settings.lunchFlow.confirmDeleteTitle',
          'Remove Lunch Flow key?',
        )}
      >
        <Stack gap={spacing.md}>
          <Text>
            {t(
              'screens.settings.lunchFlow.confirmDeleteBody',
              'Guallet will stop syncing these accounts. Imported accounts and transactions will remain.',
            )}
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              color="red"
              onClick={removeKey}
              loading={deleteCredentialMutation.isPending}
            >
              {t('screens.settings.lunchFlow.deleteButton', 'Remove key')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
