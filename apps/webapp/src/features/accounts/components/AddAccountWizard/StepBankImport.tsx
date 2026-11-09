import { BankProvider } from '@guallet/api-client';
import {
  useBankAccounts,
  useBankConnections,
  useBankOperation,
  useBankProviders,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BankAuthorizationForm } from '@/features/openbanking/components/BankAuthorizationForm';
import { BankOperationStatus } from '@/features/openbanking/components/BankOperationStatus';
import { BankCredentialsForm } from '@/features/openbanking/components/BankCredentialsForm';
import { BankConnectionProgress } from '@/features/openbanking/components/BankConnectionProgress';

interface StepBankImportProps {
  providerId: BankProvider;
  onBack: () => void;
  onDone: () => void;
}

export function StepBankImport({
  providerId,
  onBack,
  onDone,
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const available = accounts.data?.accounts ?? [];
  const selected = selectedIds.filter((id) =>
    available.some(
      (account) =>
        account.id === id &&
        !account.linkedAccountId &&
        account.status !== 'unavailable',
    ),
  );
  const locked = operation.busy || operation.job.isError;
  const imported =
    operation.job.data?.operation === 'import' &&
    operation.job.data.status === 'completed' &&
    !operation.job.data.result?.errors?.length;
  if (providers.isLoading || connections.isLoading)
    return <Skeleton height={spacing.xxl} />;
  if (providers.isError || connections.isError || !provider)
    return (
      <Stack>
        <Alert color="red">
          {t('openbanking.loadError', 'Could not load bank connections.')}
          <Button
            variant="subtle"
            onClick={() => {
              void providers.refetch();
              void connections.refetch();
            }}
          >
            {t('common.retry', 'Retry')}
          </Button>
        </Alert>
        <Button variant="outline" onClick={onBack}>
          {t('common.back', 'Back')}
        </Button>
      </Stack>
    );
  return (
    <Stack gap={spacing.lg}>
      <Stack gap={spacing.xs}>
        <Title order={2}>
          {connection
            ? t('openbanking.import.chooseAccounts', 'Choose accounts')
            : t('openbanking.credentials.setup', 'Set up {{provider}}', {
                provider: provider.name,
              })}
        </Title>
        {connection && (
          <Text c="dimmed" size="sm">
            {provider.name}
          </Text>
        )}
      </Stack>
      <BankConnectionProgress active={connection ? 2 : 1} />
      {!connection ? (
        <BankCredentialsForm
          provider={provider}
          continueToAccounts
          onSaved={() => {
            void connections.refetch();
          }}
          onCancel={onBack}
        />
      ) : (
        <>
          {provider.supportsBankAuthorization && (
            <Card withBorder radius="lg" shadow="sm" p={spacing.md}>
              <Stack gap={spacing.md}>
                <Text fw={600}>
                  {t('openbanking.authorization.connectBank', 'Connect a bank')}
                </Text>
                <Text size="sm" c="dimmed">
                  {t(
                    'openbanking.authorization.redirectHelp',
                    'Choose your bank, then authorise access on its website. You will return here to choose accounts.',
                  )}
                </Text>
                <BankAuthorizationForm
                  connectionId={connection.id}
                  provider={provider}
                  disabled={locked}
                />
              </Stack>
            </Card>
          )}
          <Text size="sm" c="dimmed">
            {t(
              'openbanking.import.chooseHelp',
              'Choose which accounts to import into Guallet.',
            )}
          </Text>
          {(accounts.isError || operation.start.isError) && (
            <Alert color="red" role="alert">
              {t(
                'openbanking.import.loadError',
                'Could not load accounts or start the operation. Please try again.',
              )}
              <Button variant="subtle" onClick={() => void accounts.refetch()}>
                {t('common.retry', 'Retry')}
              </Button>
            </Alert>
          )}
          <BankOperationStatus
            job={operation.job.data}
            busy={operation.busy}
            error={operation.job.isError}
            onRetry={() => void operation.job.refetch()}
          />
          {accounts.isLoading && <Skeleton height={spacing.xxl} />}
          {!available.length && !accounts.isLoading && !accounts.isError && (
            <Card withBorder radius="lg" shadow="sm" p={spacing.lg}>
              <Stack gap={spacing.sm}>
                <Text fw={600}>
                  {t('openbanking.import.noAccounts', 'No accounts found yet')}
                </Text>
                <Text size="sm" c="dimmed">
                  {t(
                    'openbanking.import.empty',
                    'No accounts listed yet. Connect your banks with the provider, then refresh.',
                  )}
                </Text>
              </Stack>
            </Card>
          )}
          {available.length > 0 && (
            <Card withBorder radius="lg" shadow="sm" p={spacing.none}>
              <Stack gap={spacing.none}>
                {available.map((account, index) => (
                  <Stack key={account.id} gap={spacing.none}>
                    {index > 0 && <Divider />}
                    <Stack p={spacing.md} gap={spacing.sm}>
                      <Group justify="space-between" wrap="nowrap">
                        {account.linkedAccountId ? (
                          <Checkbox
                            checked
                            disabled
                            label={account.name}
                            description={[
                              account.institutionName,
                              account.currency,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          />
                        ) : (
                          <Checkbox
                            checked={selected.includes(account.id)}
                            onChange={(event) =>
                              setSelectedIds(
                                event.currentTarget.checked
                                  ? [...selected, account.id]
                                  : selected.filter((id) => id !== account.id),
                              )
                            }
                            label={account.name}
                            description={[
                              account.institutionName,
                              account.currency,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                            disabled={
                              locked || account.status === 'unavailable'
                            }
                          />
                        )}
                        {account.linkedAccountId && (
                          <Badge
                            variant="light"
                            color="gray"
                            style={{ flexShrink: 0 }}
                          >
                            {t(
                              'openbanking.import.alreadyLinked',
                              'Already linked',
                            )}
                          </Badge>
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
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Card>
          )}
          <Group justify="space-between">
            <Button
              variant="subtle"
              loading={
                operation.busy &&
                operation.start.variables?.operation === 'refresh'
              }
              disabled={locked}
              onClick={() => operation.start.mutate({ operation: 'refresh' })}
            >
              {t('openbanking.refresh', 'Refresh accounts')}
            </Button>
            <Anchor component={Link} to="/settings/connections" size="sm">
              {t('openbanking.connections.manageAll', 'Manage connections')}
            </Anchor>
          </Group>
          <Group justify="space-between">
            <Button variant="outline" onClick={onBack} disabled={locked}>
              {t('common.back', 'Back')}
            </Button>
            {imported && !selected.length ? (
              <Button onClick={onDone}>
                {t('openbanking.import.viewAccounts', 'View accounts')}
              </Button>
            ) : (
              <Button
                disabled={
                  !selected.length ||
                  locked ||
                  accounts.isError ||
                  accounts.isFetching
                }
                loading={
                  operation.busy &&
                  operation.start.variables?.operation === 'import'
                }
                onClick={() =>
                  operation.start.mutate({
                    operation: 'import',
                    accountIds: selected,
                  })
                }
              >
                {t('openbanking.import.count', {
                  count: selected.length,
                  defaultValue_one: 'Import {{count}} account',
                  defaultValue_other: 'Import {{count}} accounts',
                })}
              </Button>
            )}
          </Group>
          <Text size="sm" c="dimmed">
            {t('openbanking.import.dailySync', 'Linked accounts sync daily.')}
          </Text>
        </>
      )}
    </Stack>
  );
}
