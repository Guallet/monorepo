import { useTheme } from '@guallet/ui-react';
import { Box, Button, Card, Center, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { EmptyIllustration } from './EmptyIllustration';
import { EmptyTrait } from './EmptyTrait';

interface AccountsEmptyStateProps {
  onAdd: () => void;
}

export function AccountsEmptyState({ onAdd }: Readonly<AccountsEmptyStateProps>) {
  const { spacing } = useTheme();

  return (
    <Box maw={720} mx="auto" pt={spacing.xl} pb={spacing.xxl}>
      <Card withBorder shadow="sm" radius="lg" p={0} style={{ overflow: 'hidden' }}>
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
          <Text fz={24} fw={700} mt={spacing.md} style={{ letterSpacing: '-0.01em' }}>
            No accounts yet
          </Text>
          <Text size="sm" c="dimmed" maw={420} style={{ lineHeight: 1.6 }}>
            Track all your bank accounts, credit cards and savings in one place. Connect through
            open banking, or add an account manually if your provider isn't supported.
          </Text>
          <Group justify="center" gap={spacing.xs} mt={spacing.md} wrap="wrap">
            <Button leftSection={<IconPlus size={16} />} onClick={onAdd}>
              Connect a bank
            </Button>
            <Button variant="outline" onClick={onAdd}>
              Add manually
            </Button>
          </Group>
        </Stack>

        <SimpleGrid cols={3} p={spacing.md}>
          <EmptyTrait
            title="Read-only by design"
            body="Guallet never moves money. We only read balances and transactions."
          />
          <EmptyTrait
            title="Multi-currency"
            body="Hold accounts in different currencies — totals stay separate, never converted behind your back."
          />
          <EmptyTrait
            title="Self-host or cloud"
            body="Your financial data stays yours. Use our hosted version or run Guallet on your own server."
          />
        </SimpleGrid>
      </Card>
    </Box>
  );
}
