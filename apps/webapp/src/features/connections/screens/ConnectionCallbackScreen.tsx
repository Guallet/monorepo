import {
  useConnectionMutations,
  useOpenBankingAccountsForConnection,
} from '@guallet/api-react';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CancelledView } from '../components/ConnectionCallback/CancelledView';
import { ErrorView } from '../components/ConnectionCallback/ErrorView';
import { SuccessView } from '../components/ConnectionCallback/SuccessView';

interface ConnectionCallbackScreenProps {
  connectionId?: string | null;
  error?: string | null;
  details?: string | null;
}

export function ConnectionCallbackScreen({
  connectionId,
  error,
  details,
}: Readonly<ConnectionCallbackScreenProps>) {
  const { accounts, isLoading } = useOpenBankingAccountsForConnection(connectionId);
  const { linkObAccountsMutation } = useConnectionMutations();
  const navigate = useNavigate();
  const alreadyLinkedRef = useRef(false);
  const { t } = useTranslation();

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (accounts.length > 0 && Object.keys(selectedIds).length === 0) {
      setSelectedIds(accounts.reduce((acc, a) => ({ ...acc, [a.id]: true }), {}));
    }
  }, [accounts]);

  useEffect(() => {
    if (!connectionId || accounts.length === 0 || alreadyLinkedRef.current) {
      return;
    }
    alreadyLinkedRef.current = true;
  }, [connectionId, accounts]);

  function handleImport() {
    const accountIds = Object.entries(selectedIds)
      .filter(([, selected]) => selected)
      .map(([id]) => id);

    if (accountIds.length === 0) return;

    linkObAccountsMutation.mutate(
      { accountIds },
      {
        onSuccess: () => {
          notifications.show({
            title: t('screens.connections.callback.success.notification', 'Accounts linked successfully'),
            message: t('screens.connections.callback.success.notificationCount', '{{count}} accounts linked', {
              count: accountIds.length,
            }),
            color: 'green',
          });
          navigate({ to: '/accounts', replace: true });
        },
        onError: (mutationError) => {
          console.error('Error linking accounts:', mutationError);
          notifications.show({
            title: t('screens.connections.callback.error.title', 'Link failed'),
            message: t('screens.connections.callback.error.message', 'Could not link accounts. Please try again.'),
            color: 'red',
          });
        },
      },
    );
  }

  if (error) {
    return (
      <ErrorView
        error={error}
        details={details}
        onRetry={() => navigate({ to: '/accounts/new', replace: true })}
        onBack={() => navigate({ to: '/connections', replace: true })}
      />
    );
  }

  if (linkObAccountsMutation.isError) {
    return (
      <ErrorView
        error={linkObAccountsMutation.error?.message ?? t('screens.connections.callback.error.unknown', 'Unknown error')}
        details={linkObAccountsMutation.error?.cause?.toString()}
        onRetry={() => navigate({ to: '/accounts/new', replace: true })}
        onBack={() => navigate({ to: '/connections', replace: true })}
      />
    );
  }

  if (isLoading || linkObAccountsMutation.isPending) {
    return (
      <Center mih={200}>
        <Stack align="center" gap="md">
          <Loader />
          <Text size="sm" c="dimmed">
            {linkObAccountsMutation.isPending
              ? t('screens.connections.callback.linking', 'Linking accounts…')
              : t('screens.connections.callback.loading', 'Loading accounts…')}
          </Text>
        </Stack>
      </Center>
    );
  }

  if (accounts.length === 0) {
    return (
      <CancelledView
        onRetry={() => navigate({ to: '/accounts/new', replace: true })}
        onBack={() => navigate({ to: '/accounts', replace: true })}
      />
    );
  }

  return (
    <SuccessView
      accounts={accounts}
      selectedIds={selectedIds}
      onToggle={(id) => setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }))}
      onImport={handleImport}
      onBack={() => navigate({ to: '/accounts/new', replace: true })}
      isLoading={linkObAccountsMutation.isPending}
    />
  );
}
