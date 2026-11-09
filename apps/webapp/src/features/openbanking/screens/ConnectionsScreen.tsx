import { BaseScreen } from '@/components/Screens/BaseScreen';
import { BankConnectionsSettings } from '@/features/openbanking/components/BankConnectionsSettings';
import { useTheme } from '@guallet/ui-react';
import { Anchor, Container, Stack, Text } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function ConnectionsScreen() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  return (
    <BaseScreen title={t('openbanking.connections.title', 'Connections')}>
      <Container size="lg" px={spacing.none}>
        <Stack gap={spacing.lg} pb={spacing.xl}>
          <Anchor component={Link} to="/settings" size="sm">
            {t('openbanking.connections.back', 'Back to settings')}
          </Anchor>
          <Text c="dimmed">
            {t(
              'openbanking.connections.description',
              'Manage the providers that connect your bank accounts.',
            )}
          </Text>
          <BankConnectionsSettings />
        </Stack>
      </Container>
    </BaseScreen>
  );
}
