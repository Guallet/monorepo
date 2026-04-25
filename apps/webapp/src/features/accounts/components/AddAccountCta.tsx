import { useTheme } from '@guallet/ui-react';
import { Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface AddAccountCtaProps {
  onAdd: () => void;
}

export function AddAccountCta({ onAdd }: Readonly<AddAccountCtaProps>) {
  const { spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      style={{
        background: 'transparent',
        boxShadow: 'none',
        borderStyle: 'dashed',
        borderColor: 'var(--mantine-color-gray-4)',
      }}
    >
      <Group justify="space-between" align="center" gap={spacing.md} wrap="wrap">
        <Stack gap={spacing.xs}>
          <Text size="sm" fw={600}>
            {t('feature.accounts.list.addCta.title', 'Missing an account?')}
          </Text>
          <Text size="xs" c="dimmed">
            {t(
              'feature.accounts.list.addCta.description',
              'Connect via open banking, or add a manual account for cash, crypto or anything else.',
            )}
          </Text>
        </Stack>
        <Group gap={spacing.xs}>
          <Button variant="outline" size="sm" onClick={onAdd}>
            {t('feature.accounts.list.addCta.addManually', 'Add manually')}
          </Button>
          <Button size="sm" leftSection={<IconPlus size={14} />} onClick={onAdd}>
            {t('feature.accounts.list.addCta.connectBank', 'Connect a bank')}
          </Button>
        </Group>
      </Group>
    </Card>
  );
}
