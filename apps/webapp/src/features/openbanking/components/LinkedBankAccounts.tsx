import {
  useBankAccounts,
  useBankConnectionMutations,
} from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Alert, Button, Divider, Group, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LinkedBankAccountsProps {
  connectionId: string;
  disabled: boolean;
}

export function LinkedBankAccounts({
  connectionId,
  disabled,
}: Readonly<LinkedBankAccountsProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const accounts = useBankAccounts(connectionId);
  const { unlink } = useBankConnectionMutations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const linked =
    accounts.data?.accounts.filter((account) => account.linkedAccountId) ?? [];
  return (
    <Stack gap={spacing.sm}>
      <Text fw={600}>
        {t('openbanking.connections.linkedAccounts', 'Linked accounts')}
      </Text>
      {accounts.isLoading && (
        <Text size="sm">{t('common.loading', 'Loading…')}</Text>
      )}
      {accounts.isError && (
        <Alert color="red">
          {t(
            'openbanking.connections.accountsError',
            'Could not load linked accounts.',
          )}
          <Button variant="subtle" onClick={() => void accounts.refetch()}>
            {t('common.retry', 'Retry')}
          </Button>
        </Alert>
      )}
      {!accounts.isLoading && !accounts.isError && !linked.length && (
        <Text size="sm" c="dimmed">
          {t(
            'openbanking.connections.noLinkedAccounts',
            'No accounts imported yet. Choose Add accounts to get started.',
          )}
        </Text>
      )}
      {linked.map((account) => (
        <Stack key={account.id} gap={spacing.xs}>
          <Divider />
          <Group justify="space-between">
            <Stack gap={spacing.xs}>
              <Text size="sm" fw={500}>
                {account.name}
              </Text>
              <Text size="xs" c="dimmed">
                {[account.institutionName, account.currency]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </Stack>
            <Button
              variant="subtle"
              disabled={disabled || unlink.isPending}
              onClick={() => {
                unlink.reset();
                setSelectedId(account.id);
              }}
            >
              {t('openbanking.unlink', 'Unlink')}
            </Button>
          </Group>
          {account.status === 'unavailable' && (
            <Text size="sm" c="dimmed">
              {t(
                'openbanking.import.unavailable',
                'This account is unavailable. Check your bank consent or unlink it and authorize the bank again.',
              )}
            </Text>
          )}
          {selectedId === account.id && (
            <Alert title={t('openbanking.unlinkTitle', 'Unlink this account?')}>
              <Stack gap={spacing.sm}>
                <Text size="sm">
                  {t(
                    'openbanking.unlinkDescription',
                    'Syncing will stop for this account. Its imported transactions and account history will remain.',
                  )}
                </Text>
                {unlink.isError && (
                  <Text c="red" role="alert">
                    {t(
                      'openbanking.unlinkError',
                      'Could not unlink the account. Please try again.',
                    )}
                  </Text>
                )}
                <Group>
                  <Button
                    variant="outline"
                    disabled={unlink.isPending}
                    onClick={() => setSelectedId(null)}
                  >
                    {t('common.cancel', 'Cancel')}
                  </Button>
                  <Button
                    color="red"
                    disabled={disabled}
                    loading={unlink.isPending}
                    onClick={() =>
                      unlink.mutate(
                        { id: connectionId, accountId: account.id },
                        { onSuccess: () => setSelectedId(null) },
                      )
                    }
                  >
                    {t('openbanking.unlink', 'Unlink')}
                  </Button>
                </Group>
              </Stack>
            </Alert>
          )}
        </Stack>
      ))}
    </Stack>
  );
}
