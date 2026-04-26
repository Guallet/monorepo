import { formatDate } from '@/utils/dateUtils';
import { useConnectedAccount } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Badge, Card, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconChevronRight, IconPlugConnected } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

interface OpenBankingCardProps {
  accountId: string;
}

export function OpenBankingCard({ accountId }: Readonly<OpenBankingCardProps>) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const navigate = useNavigate();
  const { connectedAccount, isLoading } = useConnectedAccount(accountId);

  if (isLoading || !connectedAccount) {
    return null;
  }

  const hasValidUpdatedAt =
    !!connectedAccount.updated_at &&
    !Number.isNaN(new Date(connectedAccount.updated_at).getTime());

  return (
    <UnstyledButton onClick={() => navigate({ to: '/connections' })}>
      <Card
        withBorder
        shadow="sm"
        radius="lg"
        padding={{ base: 'md', sm: 'lg' }}
      >
        <Group justify="space-between" align="center">
          <Group gap={spacing.sm}>
            <IconPlugConnected size={20} />
            <Stack gap={2}>
              <Group gap="xs">
                <Text fw={600}>
                  {t(
                    'feature.accounts.details.openBanking.title',
                    'Open Banking connection',
                  )}
                </Text>
                <Badge size="xs" color="green">
                  {t('feature.accounts.details.openBanking.synced', 'Synced')}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {t(
                  'feature.accounts.details.openBanking.lastSynced',
                  'Last synced: {{date}}',
                  {
                    date: hasValidUpdatedAt
                      ? formatDate(connectedAccount.updated_at, 'L LT')
                      : t(
                          'feature.accounts.details.openBanking.unknownDate',
                          'Unknown',
                        ),
                  },
                )}
              </Text>
            </Stack>
          </Group>
          <IconChevronRight size={16} />
        </Group>
      </Card>
    </UnstyledButton>
  );
}
