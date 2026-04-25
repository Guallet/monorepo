import { useTheme } from '@guallet/ui-react';
import {
  Box,
  Button,
  Card,
  Center,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { EmptyIllustration } from './EmptyIllustration';
import { EmptyTrait } from './EmptyTrait';

interface AccountsEmptyStateProps {
  onConnectBank: () => void;
  onAddManual: () => void;
}

export function AccountsEmptyState({
  onConnectBank,
  onAddManual,
}: Readonly<AccountsEmptyStateProps>) {
  const { spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <Box maw={720} mx="auto" pt={spacing.xl} pb={spacing.xxl}>
      <Card
        withBorder
        shadow="sm"
        radius="lg"
        p={0}
        style={{ overflow: 'hidden' }}
      >
        <Stack
          align="center"
          gap={spacing.xs}
          p={spacing.xl}
          style={{
            textAlign: 'center',
            background:
              'radial-gradient(120% 100% at 50% 0%, var(--mantine-color-blue-0) 0%, var(--mantine-color-white) 60%)',
            borderBottom: '1px solid var(--mantine-color-gray-2)',
          }}
        >
          <Center>
            <EmptyIllustration />
          </Center>
          <Text
            fz={24}
            fw={700}
            mt={spacing.md}
            style={{ letterSpacing: '-0.01em' }}
          >
            {t('feature.accounts.list.emptyState.title', 'No accounts yet')}
          </Text>
          <Text size="sm" c="dimmed" maw={420} style={{ lineHeight: 1.6 }}>
            {t(
              'feature.accounts.list.emptyState.description',
              "Track all your bank accounts, credit cards and savings in one place. Connect through open banking, or add an account manually if your provider isn't supported.",
            )}
          </Text>
          <Group justify="center" gap={spacing.xs} mt={spacing.md} wrap="wrap">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={onConnectBank}
            >
              {t(
                'feature.accounts.list.emptyState.connectBank',
                'Connect a bank',
              )}
            </Button>
            <Button variant="outline" onClick={onAddManual}>
              {t(
                'feature.accounts.list.emptyState.addManually',
                'Add manually',
              )}
            </Button>
          </Group>
        </Stack>

        <SimpleGrid cols={3} p={spacing.md}>
          <EmptyTrait
            title={t(
              'feature.accounts.list.emptyState.trait1.title',
              'Read-only by design',
            )}
            body={t(
              'feature.accounts.list.emptyState.trait1.body',
              'Guallet never moves money. We only read balances and transactions.',
            )}
          />
          <EmptyTrait
            title={t(
              'feature.accounts.list.emptyState.trait2.title',
              'Multi-currency',
            )}
            body={t(
              'feature.accounts.list.emptyState.trait2.body',
              'Hold accounts in different currencies — totals stay separate, never converted behind your back.',
            )}
          />
          <EmptyTrait
            title={t(
              'feature.accounts.list.emptyState.trait3.title',
              'Self-host or cloud',
            )}
            body={t(
              'feature.accounts.list.emptyState.trait3.body',
              'Your financial data stays yours. Use our hosted version or run Guallet on your own server.',
            )}
          />
        </SimpleGrid>
      </Card>
    </Box>
  );
}
