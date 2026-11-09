import { BankConnectionDto, BankProviderDto } from '@guallet/api-client';
import { useTheme } from '@guallet/ui-react';
import { Avatar, Box, Button, Grid, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface BankConnectionRowProps {
  provider: BankProviderDto;
  connection?: BankConnectionDto;
  onManage: () => void;
}

export function BankConnectionRow({
  provider,
  connection,
  onManage,
}: Readonly<BankConnectionRowProps>) {
  const { t, i18n } = useTranslation();
  const { spacing, colors } = useTheme();
  return (
    <Box p={spacing.md}>
      <Grid align="center" gap={spacing.md}>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Group wrap="nowrap">
            <Avatar radius="md" color="gray">
              {provider.name.charAt(0)}
            </Avatar>
            <Text fw={600}>{provider.name}</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={{ base: 7, sm: 4 }}>
          <Text size="sm" c={connection ? colors.support.dark : 'dimmed'}>
            {connection
              ? t('openbanking.connections.saved', 'Credentials saved')
              : t('openbanking.connections.notConfigured', 'Not configured')}
          </Text>
          {connection?.credentialHint && (
            <Text size="sm" ff="monospace">
              ••••{connection.credentialHint}
            </Text>
          )}
        </Grid.Col>
        <Grid.Col span={{ base: 5, sm: 3 }}>
          <Text size="xs" c="dimmed" hiddenFrom="sm">
            {t('openbanking.connections.lastSynced', 'Last synced')}
          </Text>
          <Text size="sm" c="dimmed">
            {connection?.lastSyncedAt
              ? new Date(connection.lastSyncedAt).toLocaleString(i18n.language)
              : t('openbanking.connections.neverSynced', 'Not synced yet')}
          </Text>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 2 }}>
          <Button
            variant="outline"
            fullWidth
            onClick={onManage}
            aria-label={t(
              'openbanking.connections.manageProvider',
              'Manage {{provider}}',
              { provider: provider.name },
            )}
          >
            {connection
              ? t('openbanking.connections.manage', 'Manage')
              : t('openbanking.connections.setUp', 'Set up')}
          </Button>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
