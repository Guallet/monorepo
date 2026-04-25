import { useTheme } from '@guallet/ui-react';
import { Box, Button, Group, TextInput, Title } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface AccountsHeaderProps {
  onAddNewAccount: () => void;
  searchQuery: string;
  onSearchQueryChanged: (searchQuery: string) => void;
}

export function AccountsHeader({
  onAddNewAccount,
  searchQuery,
  onSearchQueryChanged,
}: Readonly<AccountsHeaderProps>) {
  const { spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      style={{
        position: 'sticky',
        top: 'var(--app-shell-header-height, 60px)',
        zIndex: 100,
        background: 'var(--mantine-color-body)',
        borderBottom: '1px solid var(--mantine-color-gray-2)',
        // Break out of AppShell.Main's padding to go edge-to-edge
        marginLeft: 'calc(-1 * var(--app-shell-padding))',
        marginRight: 'calc(-1 * var(--app-shell-padding))',
        marginTop: 'calc(-1 * var(--app-shell-padding))',
        paddingLeft: 'var(--app-shell-padding)',
        paddingRight: 'var(--app-shell-padding)',
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
      }}
    >
      <Group justify="space-between" align="center" gap="md" wrap="nowrap">
        <Title order={2} style={{ letterSpacing: '-0.01em', flexShrink: 0 }}>
          {t('feature.accounts.list.title', 'Accounts')}
        </Title>
        <TextInput
          style={{ flex: 1, maxWidth: 420 }}
          value={searchQuery}
          leftSection={<IconSearch size={16} />}
          placeholder={t(
            'feature.accounts.list.searchPlaceholder',
            'Search accounts...',
          )}
          onChange={(e) => onSearchQueryChanged(e.target.value)}
        />
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onAddNewAccount}
          style={{ flexShrink: 0 }}
        >
          {t('feature.accounts.list.addAccount', 'Add account')}
        </Button>
      </Group>
    </Box>
  );
}
