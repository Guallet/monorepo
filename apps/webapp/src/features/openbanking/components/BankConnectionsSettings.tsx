import { useBankConnections, useBankProviders } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconLock } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BankProvider } from '@guallet/api-client';
import { BankConnectionSettingsCard } from './BankConnectionSettingsCard';
import { BankConnectionRow } from './BankConnectionRow';

export function BankConnectionsSettings() {
  const { t } = useTranslation();
  const { spacing, breakpoints } = useTheme();
  const narrow = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const providers = useBankProviders();
  const connections = useBankConnections();
  const [selectedId, setSelectedId] = useState<BankProvider | null>(null);
  const selected = providers.data?.find(
    (provider) => provider.id === selectedId,
  );
  if (providers.isError || connections.isError)
    return (
      <Alert color="red" role="alert">
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
    return (
      <Stack aria-label={t('common.loading', 'Loading…')}>
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} height={spacing.xxl} />
        ))}
      </Stack>
    );
  return (
    <>
      <Card withBorder radius="lg" shadow="sm" p={spacing.none}>
        <Box p={spacing.md} visibleFrom="sm">
          <Grid gap={spacing.md}>
            <Grid.Col span={3}>
              <Text size="sm" fw={600}>
                {t('openbanking.connections.provider', 'Provider')}
              </Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="sm" fw={600}>
                {t('openbanking.connections.credentials', 'Credentials')}
              </Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size="sm" fw={600}>
                {t('openbanking.connections.lastSynced', 'Last synced')}
              </Text>
            </Grid.Col>
          </Grid>
        </Box>
        {!providers.data?.length && (
          <Text p={spacing.md}>
            {t(
              'openbanking.connections.empty',
              'No bank providers are available right now.',
            )}
          </Text>
        )}
        {providers.data?.map((provider) => (
          <Box key={provider.id}>
            <Divider />
            <BankConnectionRow
              provider={provider}
              connection={connections.data?.find(
                (connection) => connection.providerId === provider.id,
              )}
              onManage={() => setSelectedId(provider.id)}
            />
          </Box>
        ))}
        <Divider />
        <Group gap={spacing.sm} p={spacing.md} wrap="nowrap">
          <IconLock strokeWidth={1.5} />
          <Text size="sm" c="dimmed">
            {t(
              'openbanking.connections.security',
              'Credentials are encrypted. Saved keys cannot be revealed.',
            )}
          </Text>
        </Group>
      </Card>
      <Modal
        opened={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.name}
        size="lg"
        radius="lg"
        fullScreen={narrow}
      >
        {selected && (
          <BankConnectionSettingsCard
            key={selected.id}
            provider={selected}
            connection={connections.data?.find(
              (connection) => connection.providerId === selected.id,
            )}
            onClose={() => setSelectedId(null)}
          />
        )}
      </Modal>
    </>
  );
}
