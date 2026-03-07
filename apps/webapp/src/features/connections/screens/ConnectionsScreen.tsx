import EmptyState from '@/components/EmptyState/EmptyState';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { ObConnection } from '@guallet/api-client';
import { useOpenBankingConnections } from '@guallet/api-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ConnectionCard } from '../components/ConnectionCard';

export function ConnectionsScreen() {
  const { connections, isLoading } = useOpenBankingConnections();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <BaseScreen isLoading={isLoading}>
      {connections.length === 0 && !isLoading ? (
        <EmptyState
          text={t(
            'screens.connections.list.emptyState',
            'No Connections Found. Create a new connection to get started.',
          )}
          iconName="IconPlugConnected"
          onClick={() => {
            navigate({ to: '/connections/connect' });
          }}
        />
      ) : (
        <ConnectionList connections={connections} />
      )}
    </BaseScreen>
  );
}

function ConnectionList({
  connections,
}: Readonly<{ connections: ObConnection[] }>) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t('screens.connections.list.title', 'Connections')}
      </h1>
      <Button
        onClick={() => {
          navigate({ to: '/connections/connect' });
        }}
      >
        {t('screens.connections.list.addButton', 'Add a new connection')}
      </Button>
      <div className="space-y-2">
        {connections.map((connection) => (
          <ConnectionCard
            key={connection.id}
            connectionId={connection.id}
            onClick={() => navigate({ to: `/connections/${connection.id}` })}
          />
        ))}
      </div>
    </div>
  );
}
