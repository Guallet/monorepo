import { BankConnectionDto, BankProviderDto } from '@guallet/api-client';
import {
  useBankConnectionMutations,
  useBankOperation,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Alert, Button, Divider, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BankOperationStatus } from './BankOperationStatus';
import { BankCredentialsForm } from './BankCredentialsForm';
import { LinkedBankAccounts } from './LinkedBankAccounts';

interface BankConnectionSettingsCardProps {
  provider: BankProviderDto;
  connection?: BankConnectionDto;
  onClose: () => void;
}

export function BankConnectionSettingsCard({
  provider,
  connection,
  onClose,
}: Readonly<BankConnectionSettingsCardProps>) {
  const { t } = useTranslation();
  const { spacing, colors } = useTheme();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mutations = useBankConnectionMutations();
  const operation = useBankOperation(connection?.id);
  const locked =
    operation.busy || operation.job.isError || mutations.remove.isPending;
  async function disconnect() {
    if (!connection || locked) return;
    try {
      await mutations.remove.mutateAsync(connection.id);
      notifications.show({
        message: t(
          'openbanking.disconnect.success',
          'Provider disconnected. Your imported data has been kept.',
        ),
        color: 'green',
      });
      onClose();
    } catch {
      notifications.show({
        message: t(
          'openbanking.credentials.deleteError',
          'Could not disconnect. Please try again.',
        ),
        color: 'red',
      });
    }
  }
  return (
    <Stack gap={spacing.lg}>
      {connection && (
        <Stack gap={spacing.xs}>
          <Text size="sm" c={colors.support.dark}>
            {t('openbanking.connections.saved', 'Credentials saved')}
          </Text>
          <Group justify="space-between">
            <Text size="sm">
              {t('openbanking.credentials.savedKey', 'Saved key')}
            </Text>
            <Text ff="monospace">
              {connection.credentialHint
                ? `••••${connection.credentialHint}`
                : t('openbanking.credentials.hidden', 'Hidden')}
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            {t(
              'openbanking.credentials.noReveal',
              'Saved keys cannot be revealed.',
            )}
          </Text>
        </Stack>
      )}
      <BankCredentialsForm
        key={connection?.id ?? provider.id}
        provider={provider}
        connection={connection}
        disabled={locked}
        onSavingChange={setSaving}
        onSaved={onClose}
        onCancel={onClose}
      />
      {connection && (
        <>
          <Divider />
          <Group>
            <Button
              variant="outline"
              disabled={locked || saving}
              onClick={() =>
                void navigate({
                  to: '/accounts/new',
                  search: { provider: provider.id },
                })
              }
            >
              {t('openbanking.connections.addAccounts', 'Add accounts')}
            </Button>
            <Button
              variant="outline"
              loading={operation.busy}
              disabled={locked || saving}
              onClick={() => operation.start.mutate({ operation: 'sync' })}
            >
              {t('openbanking.sync', 'Sync now')}
            </Button>
          </Group>
          {operation.start.isError && (
            <Alert color="red" role="alert">
              {t(
                'openbanking.job.startError',
                'Could not start the operation. Please try again.',
              )}
            </Alert>
          )}
          <BankOperationStatus
            job={operation.job.data}
            busy={operation.busy}
            error={operation.job.isError}
            onRetry={() => void operation.job.refetch()}
          />
          <LinkedBankAccounts
            connectionId={connection.id}
            disabled={locked || saving}
          />
          <Divider />
          {confirmDelete ? (
            <Alert
              color="red"
              title={t(
                'openbanking.disconnect.title',
                'Disconnect bank provider?',
              )}
            >
              <Stack gap={spacing.md}>
                <Text size="sm">
                  {t(
                    'openbanking.disconnect.description',
                    'Saved credentials will be deleted and syncing will stop. Imported accounts and transactions will remain in Guallet.',
                  )}
                </Text>
                <Group>
                  <Button
                    variant="outline"
                    disabled={mutations.remove.isPending}
                    onClick={() => setConfirmDelete(false)}
                  >
                    {t('common.cancel', 'Cancel')}
                  </Button>
                  <Button
                    color="red"
                    loading={mutations.remove.isPending}
                    disabled={operation.busy || operation.job.isError}
                    onClick={() => void disconnect()}
                  >
                    {t('openbanking.disconnect.button', 'Disconnect')}
                  </Button>
                </Group>
              </Stack>
            </Alert>
          ) : (
            <Stack gap={spacing.sm}>
              <Button
                variant="outline"
                color="red"
                disabled={locked || saving}
                onClick={() => setConfirmDelete(true)}
                style={{ alignSelf: 'flex-start' }}
              >
                {t('openbanking.disconnect.provider', 'Disconnect provider')}
              </Button>
              <Text size="sm" c="dimmed">
                {t(
                  'openbanking.disconnect.summary',
                  'Stops syncing. Imported accounts and transactions are kept.',
                )}
              </Text>
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}
