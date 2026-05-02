import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useOpenBankingConnections } from '@guallet/api-react';
import { Button, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { ConnectionCard } from '../components/ConnectionCard';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from 'react-i18next';

export function ConnectionsScreen() {
  const { connections, isLoading } = useOpenBankingConnections();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <BaseScreen
      isLoading={isLoading}
      title={t('screens.connections.list.title', 'Connections')}
      actions={
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            navigate({ to: '/connections/connect' });
          }}
        >
          {t('screens.connections.list.addButton', 'Add a new connection')}
        </Button>
      }
    >
      {connections.length === 0 && !isLoading ? (
        <EmptyState
          title={t(
            'screens.connections.list.emptyState.title',
            'No connections yet',
          )}
          description={t(
            'screens.connections.list.emptyState.description',
            'Connect your bank accounts via open banking to automatically import transactions.',
          )}
          primaryAction={{
            label: t('screens.connections.list.addButton', 'Connect a bank'),
            onClick: () => navigate({ to: '/connections/connect' }),
          }}
        />
      ) : (
        <Stack gap="xs">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connectionId={connection.id}
              onClick={() => navigate({ to: `/connections/${connection.id}` })}
            />
          ))}
        </Stack>
      )}
    </BaseScreen>
  );
}
