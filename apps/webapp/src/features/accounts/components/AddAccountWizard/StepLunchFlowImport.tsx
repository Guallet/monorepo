import {
  useLunchFlowAccounts,
  useLunchFlowCredential,
  useLunchFlowMutations,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StepLunchFlowImportProps {
  onBack: () => void;
  onDone: () => void;
  onConfigure: () => void;
}

export function StepLunchFlowImport({
  onBack,
  onDone,
  onConfigure,
}: Readonly<StepLunchFlowImportProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { credential, isLoading: isCredentialLoading } =
    useLunchFlowCredential();
  const { accounts, isLoading, isError, refetch } = useLunchFlowAccounts(
    credential.configured,
  );
  const { importAccountsMutation, unlinkAccountMutation } =
    useLunchFlowMutations();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  async function handleImport() {
    try {
      await importAccountsMutation.mutateAsync({ accountIds: selectedIds });
      notifications.show({
        message: t(
          'feature.accounts.add.lunchFlow.importSuccess',
          'Selected accounts imported from Lunch Flow.',
        ),
        color: 'green',
      });
      onDone();
    } catch {
      notifications.show({
        title: t(
          'feature.accounts.add.lunchFlow.importErrorTitle',
          'Could not import accounts',
        ),
        message: t(
          'feature.accounts.add.lunchFlow.importErrorMessage',
          'Refresh the account list and try again.',
        ),
        color: 'red',
      });
    }
  }

  async function handleUnlink(accountId: string) {
    try {
      await unlinkAccountMutation.mutateAsync(accountId);
      setSelectedIds((current) => current.filter((id) => id !== accountId));
      notifications.show({
        message: t(
          'feature.accounts.add.lunchFlow.unlinkSuccess',
          'Account unlinked from Lunch Flow sync. Its Guallet data remains.',
        ),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t(
          'feature.accounts.add.lunchFlow.unlinkErrorTitle',
          'Could not unlink account',
        ),
        message: t(
          'feature.accounts.add.lunchFlow.unlinkErrorMessage',
          'Please try again.',
        ),
        color: 'red',
      });
    }
  }

  if (isCredentialLoading) {
    return <Text>{t('common.loading', 'Loading…')}</Text>;
  }

  if (!credential.configured) {
    return (
      <Stack gap={spacing.md}>
        <Title order={3}>
          {t('feature.accounts.add.lunchFlow.title', 'Import from Lunch Flow')}
        </Title>
        <Alert icon={<IconInfoCircle size={18} />}>
          {t(
            'feature.accounts.add.lunchFlow.configureMessage',
            'Add your Lunch Flow API key in Settings before importing accounts. Connect your banks and enable them for the API destination in Lunch Flow first.',
          )}
        </Alert>
        <Group justify="space-between">
          <Button variant="outline" onClick={onBack}>
            {t('common.back', 'Back')}
          </Button>
          <Button onClick={onConfigure}>
            {t(
              'feature.accounts.add.lunchFlow.configureButton',
              'Open settings',
            )}
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap={spacing.md}>
      <Title order={3}>
        {t('feature.accounts.add.lunchFlow.title', 'Import from Lunch Flow')}
      </Title>
      <Text size="sm" c="dimmed">
        {t(
          'feature.accounts.add.lunchFlow.subtitle',
          'Choose the accounts enabled in your Lunch Flow API destination.',
        )}
      </Text>
      {isError ? (
        <Alert color="red" icon={<IconInfoCircle size={18} />}>
          {t(
            'feature.accounts.add.lunchFlow.listError',
            'Could not load Lunch Flow accounts. Check your key and account access settings.',
          )}
          <Button variant="subtle" onClick={() => void refetch()}>
            {t('common.retry', 'Retry')}
          </Button>
        </Alert>
      ) : isLoading ? (
        <Text>{t('common.loading', 'Loading…')}</Text>
      ) : accounts.length === 0 ? (
        <Alert icon={<IconInfoCircle size={18} />}>
          {t(
            'feature.accounts.add.lunchFlow.empty',
            'No accounts are available. Connect a bank in Lunch Flow and enable it in your API destination.',
          )}
        </Alert>
      ) : (
        <Checkbox.Group value={selectedIds} onChange={setSelectedIds}>
          <Stack gap={spacing.xs}>
            {accounts.map((account) => (
              <Card key={account.id} withBorder p={spacing.sm} radius="md">
                <Group wrap="nowrap" align="center">
                  <Checkbox
                    value={account.id}
                    disabled={Boolean(account.linkedAccountId)}
                    aria-label={account.name}
                  />
                  <Avatar
                    src={account.institutionLogo}
                    radius="sm"
                    color="blue"
                  >
                    {account.institutionName?.slice(0, 2).toUpperCase() ?? 'LF'}
                  </Avatar>
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Text fw={500}>{account.name}</Text>
                    <Text size="sm" c="dimmed">
                      {[
                        account.institutionName,
                        account.currency,
                        account.provider,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </Stack>
                  {account.linkedAccountId && (
                    <Button
                      variant="subtle"
                      color="red"
                      onClick={() => void handleUnlink(account.id)}
                      loading={unlinkAccountMutation.isPending}
                    >
                      {t(
                        'feature.accounts.add.lunchFlow.unlinkButton',
                        'Unlink',
                      )}
                    </Button>
                  )}
                </Group>
              </Card>
            ))}
          </Stack>
        </Checkbox.Group>
      )}
      <Group justify="space-between">
        <Button variant="outline" onClick={onBack}>
          {t('common.back', 'Back')}
        </Button>
        <Group>
          <Button
            variant="subtle"
            onClick={() => void refetch()}
            loading={isLoading}
          >
            {t('common.refresh', 'Refresh')}
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedIds.length === 0}
            loading={importAccountsMutation.isPending}
          >
            {t(
              'feature.accounts.add.lunchFlow.importButton',
              'Import selected',
            )}
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
