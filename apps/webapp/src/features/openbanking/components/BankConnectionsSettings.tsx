import { useBankConnections, useBankProviders } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Alert, Button, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { BankConnectionSettingsCard } from './BankConnectionSettingsCard';
export function BankConnectionsSettings() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const providers = useBankProviders();
  const connections = useBankConnections();
  if (providers.isError || connections.isError)
    return (
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
    );
  if (providers.isLoading || connections.isLoading)
    return <Text>{t('common.loading', 'Loading…')}</Text>;
  return (
    <Stack gap={spacing.md}>
      {providers.data?.map((provider) => (
        <BankConnectionSettingsCard
          key={provider.id}
          provider={provider}
          connection={connections.data?.find(
            (connection) => connection.providerId === provider.id,
          )}
        />
      ))}
    </Stack>
  );
}
