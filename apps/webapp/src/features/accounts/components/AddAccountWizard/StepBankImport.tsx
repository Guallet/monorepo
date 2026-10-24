import { BankProviderId } from '@guallet/api-client';
import {
  useBankAccounts,
  useBankConnections,
  useBankConnectionMutations,
  useBankOperation,
  useBankProviders,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BankAuthorizationForm } from '@/features/openbanking/components/BankAuthorizationForm';
import { BankOperationStatus } from '@/features/openbanking/components/BankOperationStatus';
interface StepBankImportProps {
  providerId: BankProviderId;
  onBack: () => void;
  onDone: () => void;
  onConfigure: () => void;
}
export function StepBankImport({
  providerId,
  onBack,
  onDone,
  onConfigure,
}: Readonly<StepBankImportProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const providers = useBankProviders();
  const connections = useBankConnections();
  const provider = providers.data?.find((item) => item.id === providerId);
  const connection = connections.data?.find(
    (item) => item.providerId === providerId,
  );
  const accounts = useBankAccounts(connection?.id);
  const operation = useBankOperation(connection?.id);
  const { unlink } = useBankConnectionMutations();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const available = accounts.data?.accounts ?? [];
  const selected = selectedIds.filter((id) =>
    available.some((account) => account.id === id && !account.linkedAccountId),
  );
  async function unlinkAccount(accountId: string) {
    if (!connection) return;
    try {
      await unlink.mutateAsync({ id: connection.id, accountId });
    } catch {
      notifications.show({
        message: t(
          'openbanking.unlinkError',
          'Could not unlink the account. Please try again.',
        ),
        color: 'red',
      });
    }
  }
  return (
    <Stack gap={spacing.md}>
      <Title order={3}>
        {t('openbanking.import.title', 'Import from {{provider}}', {
          provider: provider?.name ?? providerId,
        })}
      </Title>
      {(connections.isLoading || providers.isLoading) && (
        <Text>{t('common.loading', 'Loading…')}</Text>
      )}
      {(connections.isError || providers.isError) && (
        <Alert color="red">
          {t('openbanking.loadError', 'Could not load bank connections.')}
          <Button
            variant="subtle"
            onClick={() => {
              void connections.refetch();
              void providers.refetch();
            }}
          >
            {t('common.retry', 'Retry')}
          </Button>
        </Alert>
      )}
      {!connections.isLoading && !connections.isError && !connection && (
        <Alert>
          <Text>
            {t(
              'openbanking.import.configure',
              'Add your provider credentials in Settings before importing bank accounts.',
            )}
          </Text>
          <Button onClick={onConfigure}>
            {t('openbanking.import.settings', 'Open settings')}
          </Button>
        </Alert>
      )}
      {connection && (
        <>
          {provider?.supportsBankAuthorization && (
            <BankAuthorizationForm
              connectionId={connection.id}
              provider={provider}
            />
          )}
          <Text size="sm" c="dimmed">
            {t(
              'openbanking.import.help',
              'Refresh to find available accounts, then select the accounts to import. Linked accounts sync daily.',
            )}
          </Text>
          {(accounts.isError || operation.start.isError) && (
            <Alert color="red">
              {t(
                'openbanking.import.loadError',
                'Could not load accounts or start the operation. Please try again.',
              )}
              <Button variant="subtle" onClick={() => void accounts.refetch()}>
                {t('common.retry', 'Retry')}
              </Button>
            </Alert>
          )}
          {accounts.isLoading && <Text>{t('common.loading', 'Loading…')}</Text>}
          <BankOperationStatus
            job={operation.job.data}
            busy={operation.busy}
            error={operation.job.isError}
            onRetry={() => void operation.job.refetch()}
          />
          {available.length === 0 && !accounts.isLoading && (
            <Text>
              {t(
                'openbanking.import.empty',
                'No accounts listed yet. Connect your banks with the provider, then refresh.',
              )}
            </Text>
          )}
          <Checkbox.Group value={selected} onChange={setSelectedIds}>
            <Stack gap={spacing.sm}>
              {available.map((account) => (
                <Card
                  key={account.id}
                  withBorder
                  radius="lg"
                  shadow="sm"
                  padding={spacing.sm}
                >
                  <Group justify="space-between">
                    <Checkbox
                      value={account.id}
                      label={account.name}
                      description={[account.institutionName, account.currency]
                        .filter(Boolean)
                        .join(' · ')}
                      disabled={
                        Boolean(account.linkedAccountId) || operation.busy
                      }
                    />
                    {account.linkedAccountId && (
                      <Button
                        variant="subtle"
                        loading={unlink.isPending}
                        disabled={operation.busy}
                        onClick={() => void unlinkAccount(account.id)}
                      >
                        {t('openbanking.unlink', 'Unlink')}
                      </Button>
                    )}
                  </Group>
                  {account.status === 'unavailable' && (
                    <Text size="sm" c="dimmed">
                      {t(
                        'openbanking.import.unavailable',
                        'This account is unavailable. Check your bank consent or unlink it and authorize the bank again.',
                      )}
                    </Text>
                  )}
                </Card>
              ))}
            </Stack>
          </Checkbox.Group>
          <Group>
            <Button
              variant="outline"
              loading={operation.busy}
              onClick={() => operation.start.mutate({ operation: 'refresh' })}
            >
              {t('openbanking.refresh', 'Refresh accounts')}
            </Button>
            <Button
              disabled={!selected.length || operation.busy}
              onClick={() =>
                operation.start.mutate({
                  operation: 'import',
                  accountIds: selected,
                })
              }
            >
              {t('openbanking.import.selected', 'Import selected accounts')}
            </Button>
          </Group>
        </>
      )}
      <Group justify="space-between">
        <Button variant="outline" onClick={onBack}>
          {t('common.back', 'Back')}
        </Button>
        <Button onClick={onDone}>{t('common.done', 'Done')}</Button>
      </Group>
    </Stack>
  );
}
