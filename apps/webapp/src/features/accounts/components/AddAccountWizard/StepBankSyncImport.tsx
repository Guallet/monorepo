import {
  useBankSyncAccounts,
  useBankSyncCredential,
  useBankSyncMutations,
} from '@guallet/api-react';
import { BankSyncAccountDto } from '@guallet/api-client';
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

interface StepBankSyncImportProps {
  onBack: () => void;
  onDone: () => void;
  onConfigure: () => void;
}

const selectionKey = (account: BankSyncAccountDto) =>
  `${encodeURIComponent(account.bankId)}:${encodeURIComponent(account.id)}`;

export function StepBankSyncImport({
  onBack,
  onDone,
  onConfigure,
}: Readonly<StepBankSyncImportProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { credential, isLoading: isCredentialLoading } =
    useBankSyncCredential();
  const { accounts, isLoading, isError, refetch } = useBankSyncAccounts(
    credential.configured,
  );
  const { importAccountsMutation, unlinkAccountMutation } =
    useBankSyncMutations();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const accountByKey = new Map(
    accounts.map((account) => [selectionKey(account), account]),
  );

  async function handleImport() {
    const selections = selectedIds
      .map((id) => accountByKey.get(id))
      .filter((account): account is BankSyncAccountDto => account !== undefined)
      .map(({ bankId, id }) => ({ bankId, accountId: id }));
    try {
      await importAccountsMutation.mutateAsync({ accounts: selections });
      notifications.show({
        message: t(
          'feature.accounts.add.bankSync.importSuccess',
          'Selected accounts imported from BankSync.',
        ),
        color: 'green',
      });
      onDone();
    } catch {
      notifications.show({
        title: t(
          'feature.accounts.add.bankSync.importErrorTitle',
          'Could not import accounts',
        ),
        message: t(
          'feature.accounts.add.bankSync.importErrorMessage',
          'Refresh the account list and try again.',
        ),
        color: 'red',
      });
    }
  }

  async function handleUnlink(account: BankSyncAccountDto) {
    try {
      await unlinkAccountMutation.mutateAsync({
        bankId: account.bankId,
        accountId: account.id,
      });
      setSelectedIds((current) =>
        current.filter((id) => id !== selectionKey(account)),
      );
      notifications.show({
        message: t(
          'feature.accounts.add.bankSync.unlinkSuccess',
          'Account unlinked from BankSync sync. Its Guallet data remains.',
        ),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t(
          'feature.accounts.add.bankSync.unlinkErrorTitle',
          'Could not unlink account',
        ),
        message: t(
          'feature.accounts.add.bankSync.unlinkErrorMessage',
          'Please try again.',
        ),
        color: 'red',
      });
    }
  }

  if (isCredentialLoading)
    return <Text>{t('common.loading', 'Loading…')}</Text>;
  if (!credential.configured) {
    return (
      <Stack gap={spacing.md}>
        <Title order={3}>
          {t('feature.accounts.add.bankSync.title', 'Import from BankSync')}
        </Title>
        <Alert icon={<IconInfoCircle size={18} />}>
          {t(
            'feature.accounts.add.bankSync.configureMessage',
            'Add your BankSync API key in Settings before importing. Create a key with banks:read scope; API key access requires a Standard or higher BankSync plan.',
          )}
        </Alert>
        <Group justify="space-between">
          <Button variant="outline" onClick={onBack}>
            {t('common.back', 'Back')}
          </Button>
          <Button onClick={onConfigure}>
            {t(
              'feature.accounts.add.bankSync.configureButton',
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
        {t('feature.accounts.add.bankSync.title', 'Import from BankSync')}
      </Title>
      <Text size="sm" c="dimmed">
        {t(
          'feature.accounts.add.bankSync.subtitle',
          'Select the connected bank accounts to import. Guallet imports available transaction history and then syncs daily.',
        )}
      </Text>
      {isError && (
        <Alert color="red" icon={<IconInfoCircle size={18} />}>
          {t(
            'feature.accounts.add.bankSync.listError',
            'Could not load BankSync accounts. Check your API key, REST API plan, and banks:read scope.',
          )}{' '}
          <Button variant="subtle" onClick={() => void refetch()}>
            {t('common.retry', 'Retry')}
          </Button>
        </Alert>
      )}
      {!isError && isLoading && <Text>{t('common.loading', 'Loading…')}</Text>}
      {!isError && !isLoading && accounts.length === 0 && (
        <Alert icon={<IconInfoCircle size={18} />}>
          {t(
            'feature.accounts.add.bankSync.empty',
            'No connected bank accounts are available in BankSync.',
          )}
        </Alert>
      )}
      {!isError && !isLoading && accounts.length > 0 && (
        <Checkbox.Group value={selectedIds} onChange={setSelectedIds}>
          <Stack gap={spacing.xs}>
            {accounts.map((account) => {
              const key = selectionKey(account);
              return (
                <Card key={key} withBorder p={spacing.sm} radius="md">
                  <Group wrap="nowrap" align="center">
                    <Checkbox
                      value={key}
                      disabled={Boolean(account.linkedAccountId)}
                      aria-label={account.name}
                    />
                    <Avatar radius="sm" color="blue">
                      {account.institutionName.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Stack gap={0} style={{ flex: 1 }}>
                      <Text fw={500}>{account.name}</Text>
                      <Text size="sm" c="dimmed">
                        {[account.institutionName, account.currency]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </Stack>
                    {account.linkedAccountId && (
                      <Button
                        variant="subtle"
                        color="red"
                        onClick={() => void handleUnlink(account)}
                        loading={unlinkAccountMutation.isPending}
                      >
                        {t(
                          'feature.accounts.add.bankSync.unlinkButton',
                          'Unlink',
                        )}
                      </Button>
                    )}
                  </Group>
                </Card>
              );
            })}
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
            onClick={() => void handleImport()}
            loading={importAccountsMutation.isPending}
            disabled={selectedIds.length === 0}
          >
            {t(
              'feature.accounts.add.bankSync.importButton',
              'Import selected accounts',
            )}
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
