import {
  useNordigenCredentialMutations,
  useNordigenCredentials,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
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

export function NordigenSettingsCard() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { credentialStatus, isLoading } = useNordigenCredentials();
  const { saveCredentialsMutation, deleteCredentialsMutation } =
    useNordigenCredentialMutations();
  const [secretId, setSecretId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    try {
      await saveCredentialsMutation.mutateAsync({ secretId, secretKey });
      setSecretId('');
      setSecretKey('');
      notifications.show({
        message: t(
          'screens.settings.nordigen.saved',
          'Nordigen credentials validated and saved.',
        ),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t(
          'screens.settings.nordigen.errorTitle',
          'Could not save credentials',
        ),
        message: t(
          'screens.settings.nordigen.errorMessage',
          'Check your Nordigen credentials and try again.',
        ),
        color: 'red',
      });
    }
  }

  async function remove() {
    try {
      await deleteCredentialsMutation.mutateAsync();
      setConfirmDelete(false);
      notifications.show({
        message: t(
          'screens.settings.nordigen.removed',
          'Nordigen credentials removed.',
        ),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t(
          'screens.settings.nordigen.errorTitle',
          'Could not remove credentials',
        ),
        message: t(
          'screens.settings.nordigen.errorMessage',
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
            'screens.settings.nordigen.description',
            'Use your own Nordigen credentials to connect and sync bank accounts. Existing bank links must be reconnected after setup.',
          )}
        </Text>
        {!isLoading && credentialStatus?.configured && (
          <Text size="sm">
            {t(
              'screens.settings.nordigen.configured',
              'Credentials configured',
            )}
            : {credentialStatus.credentialHint}
          </Text>
        )}
        <PasswordInput
          label={t('screens.settings.nordigen.secretId', 'Secret ID')}
          value={secretId}
          onChange={(event) => setSecretId(event.currentTarget.value)}
          autoComplete="new-password"
        />
        <PasswordInput
          label={t('screens.settings.nordigen.secretKey', 'Secret key')}
          value={secretKey}
          onChange={(event) => setSecretKey(event.currentTarget.value)}
          autoComplete="new-password"
        />
        <Group>
          <Button
            onClick={save}
            loading={saveCredentialsMutation.isPending}
            disabled={!secretId.trim() || !secretKey.trim()}
          >
            {t('screens.settings.nordigen.save', 'Validate and save')}
          </Button>
          {credentialStatus?.configured && (
            <Button
              variant="outline"
              color="red"
              onClick={() => setConfirmDelete(true)}
            >
              {t('screens.settings.nordigen.remove', 'Remove credentials')}
            </Button>
          )}
        </Group>
      </Stack>
      <Modal
        opened={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t(
          'screens.settings.nordigen.confirmTitle',
          'Remove Nordigen credentials?',
        )}
      >
        <Stack gap={spacing.md}>
          <Text>
            {t(
              'screens.settings.nordigen.confirmBody',
              'Bank sync will stop. Existing bank links and imported data remain, but links must be reconnected after adding credentials again.',
            )}
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              color="red"
              onClick={remove}
              loading={deleteCredentialsMutation.isPending}
            >
              {t('screens.settings.nordigen.remove', 'Remove credentials')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
