import {
  BankConnectionDto,
  BankCredentials,
  BankProviderDto,
} from '@guallet/api-client';
import {
  useBankConnectionMutations,
  useBankOperation,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Alert,
  Button,
  Card,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { BankOperationStatus } from './BankOperationStatus';
interface BankConnectionSettingsCardProps {
  provider: BankProviderDto;
  connection?: BankConnectionDto;
}
export function BankConnectionSettingsCard({
  provider,
  connection,
}: Readonly<BankConnectionSettingsCardProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mutations = useBankConnectionMutations();
  const operation = useBankOperation(connection?.id);
  const labels = {
    apiKey: t(
      'openbanking.credentials.apiKey',
      'API key or personal access token',
    ),
    secretId: t('openbanking.credentials.secretId', 'Secret ID'),
    secretKey: t('openbanking.credentials.secretKey', 'Secret key'),
  };
  const schema = z
    .object({ apiKey: z.string(), secretId: z.string(), secretKey: z.string() })
    .superRefine((values, context) => {
      for (const field of provider.credentialFields) {
        if (!values[field.name].trim() || values[field.name].length > 4096)
          context.addIssue({
            code: 'custom',
            path: [field.name],
            message: t(
              'openbanking.credentials.required',
              'Enter a valid credential.',
            ),
          });
      }
    });
  const form = useForm({
    initialValues: { apiKey: '', secretId: '', secretKey: '' },
    validate: zod4Resolver(schema),
  });
  const saving =
    mutations.create.isPending || mutations.replaceCredentials.isPending;
  async function save(values: typeof form.values) {
    const credentials: BankCredentials = Object.fromEntries(
      provider.credentialFields.map((field) => [
        field.name,
        values[field.name].trim(),
      ]),
    );
    try {
      if (connection)
        await mutations.replaceCredentials.mutateAsync({
          id: connection.id,
          credentials,
        });
      else
        await mutations.create.mutateAsync({
          providerId: provider.id,
          credentials,
        });
      form.reset();
      mutations.create.reset();
      mutations.replaceCredentials.reset();
      notifications.show({
        message: t(
          'openbanking.credentials.saved',
          'Credentials validated and saved.',
        ),
        color: 'green',
      });
    } catch {
      notifications.show({
        message: t(
          'openbanking.credentials.saveError',
          'Could not save credentials. Check your provider details and try again.',
        ),
        color: 'red',
      });
    }
  }
  async function disconnect() {
    if (!connection) return;
    try {
      await mutations.remove.mutateAsync(connection.id);
      setConfirmDelete(false);
      operation.start.reset();
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
    <Card withBorder radius="lg" shadow="sm" padding={spacing.md}>
      <Stack gap={spacing.md}>
        <Title order={4}>{provider.name}</Title>
        <Text size="sm" c="dimmed">
          {t(
            'openbanking.credentials.help',
            'Use credentials from your own provider account. They are encrypted before being saved.',
          )}
        </Text>
        {connection && (
          <Text size="sm">
            {t(
              'openbanking.credentials.configured',
              'Configured: ••••{{hint}}',
              { hint: connection.credentialHint ?? '' },
            )}
          </Text>
        )}
        <form onSubmit={form.onSubmit(save)}>
          <Stack gap={spacing.sm}>
            {provider.credentialFields.map((field) =>
              field.secret ? (
                <PasswordInput
                  key={field.name}
                  label={labels[field.name]}
                  autoComplete="new-password"
                  {...form.getInputProps(field.name)}
                />
              ) : (
                <TextInput
                  key={field.name}
                  label={labels[field.name]}
                  autoComplete="off"
                  {...form.getInputProps(field.name)}
                />
              ),
            )}
            <Group>
              <Button
                type="submit"
                loading={saving}
                disabled={operation.busy || mutations.remove.isPending}
              >
                {t('openbanking.credentials.save', 'Save and validate')}
              </Button>
              {connection && (
                <>
                  <Button
                    variant="outline"
                    loading={operation.busy}
                    disabled={saving}
                    onClick={() =>
                      operation.start.mutate({ operation: 'sync' })
                    }
                  >
                    {t('openbanking.sync', 'Sync now')}
                  </Button>
                  <Button
                    variant="outline"
                    color="red"
                    disabled={operation.busy || saving}
                    onClick={() => setConfirmDelete(true)}
                  >
                    {t('openbanking.disconnect.button', 'Disconnect')}
                  </Button>
                </>
              )}
            </Group>
          </Stack>
        </form>
        {operation.start.isError && (
          <Alert color="red">
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
      </Stack>
      <Modal
        opened={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('openbanking.disconnect.title', 'Disconnect bank provider?')}
      >
        <Stack gap={spacing.md}>
          <Text>
            {t(
              'openbanking.disconnect.description',
              'Saved credentials will be deleted and syncing will stop. Imported accounts and transactions will remain in Guallet.',
            )}
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              color="red"
              loading={mutations.remove.isPending}
              onClick={() => void disconnect()}
            >
              {t('openbanking.disconnect.button', 'Disconnect')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}
