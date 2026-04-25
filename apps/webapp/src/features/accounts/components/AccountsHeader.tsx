import { Button, Group, TextInput, Title } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';

interface AccountsHeaderProps {
  onAddNewAccount: () => void;
  onSearchQueryChanged: (searchQuery: string) => void;
}

export function AccountsHeader({
  onAddNewAccount,
  onSearchQueryChanged,
}: Readonly<AccountsHeaderProps>) {
  return (
    <div
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
        paddingTop: 12,
        paddingBottom: 12,
      }}
    >
      <Group justify="space-between" align="center" gap="md" wrap="nowrap">
        <Title order={2} style={{ letterSpacing: '-0.01em', flexShrink: 0 }}>
          Accounts
        </Title>
        <TextInput
          style={{ flex: 1, maxWidth: 420 }}
          leftSection={<IconSearch size={16} />}
          placeholder="Search transactions, accounts..."
          onChange={(e) => onSearchQueryChanged(e.target.value)}
        />
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onAddNewAccount}
          style={{ flexShrink: 0 }}
        >
          Add account
        </Button>
      </Group>
    </div>
  );
}
