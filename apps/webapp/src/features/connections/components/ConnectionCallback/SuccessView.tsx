import { ObAccountDto } from '@guallet/api-client';
import {
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AccountImportRow } from './AccountImportRow';

interface SuccessViewProps {
  accounts: ObAccountDto[];
  selectedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
  onImport: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function SuccessView({
  accounts,
  selectedIds,
  onToggle,
  onImport,
  onBack,
  isLoading,
}: Readonly<SuccessViewProps>) {
  const { t } = useTranslation();
  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  return (
    <Box maw={560} mx="auto">
      <Stack>
        <Group gap="md" align="flex-start">
          <ThemeIcon size={52} radius="md" color="green" variant="light">
            <IconCheck size={28} />
          </ThemeIcon>
          <Box style={{ flex: 1 }}>
            <Title order={4} mb={4}>
              {t('screens.connections.callback.success.title', 'Accounts found!')}
            </Title>
            <Text size="sm" c="dimmed">
              {t('screens.connections.callback.success.subtitle', 'Found {{count}} accounts. Choose which to import.', { count: accounts.length })}
            </Text>
          </Box>
        </Group>

        <Card withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
          {accounts.map((account, i) => (
            <AccountImportRow
              key={account.id}
              account={account}
              selected={!!selectedIds[account.id]}
              last={i === accounts.length - 1}
              onToggle={() => onToggle(account.id)}
            />
          ))}
        </Card>

        <Text size="sm" c="dimmed" ta="center">
          {t('screens.connections.callback.success.selectedCount', '{{selected}} of {{total}} accounts selected', {
            selected: selectedCount,
            total: accounts.length,
          })}
        </Text>

        <Stack gap="xs">
          <Button fullWidth loading={isLoading} disabled={selectedCount === 0} onClick={onImport}>
            {selectedCount > 0
              ? t('screens.connections.callback.success.import', 'Import {{count}} account', {
                  count: selectedCount,
                  defaultValue_one: 'Import {{count}} account',
                  defaultValue_other: 'Import {{count}} accounts',
                })
              : t('screens.connections.callback.success.importNone', 'Select accounts to import')}
          </Button>
          <Button fullWidth variant="outline" onClick={onBack}>
            {t('common.startOver', 'Start over')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
