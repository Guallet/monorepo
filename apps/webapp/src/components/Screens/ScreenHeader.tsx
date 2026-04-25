import { useTheme } from '@guallet/ui-react';
import { Box, Group, TextInput, Title } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { ReactNode } from 'react';

export interface ScreenHeaderSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ScreenHeaderProps {
  title: string;
  actions?: ReactNode;
  search?: ScreenHeaderSearch;
  pinned?: boolean;
}

export function ScreenHeader({
  title,
  actions,
  search,
  pinned = true,
}: Readonly<ScreenHeaderProps>) {
  const { spacing } = useTheme();

  const pinnedStyle = pinned
    ? {
        position: 'sticky' as const,
        top: 'var(--app-shell-header-height, 60px)',
        zIndex: 100,
        background: 'var(--mantine-color-body)',
        borderBottom: '1px solid var(--mantine-color-gray-2)',
        marginLeft: 'calc(-1 * var(--app-shell-padding))',
        marginRight: 'calc(-1 * var(--app-shell-padding))',
        marginTop: 'calc(-1 * var(--app-shell-padding))',
        paddingLeft: 'var(--app-shell-padding)',
        paddingRight: 'var(--app-shell-padding)',
      }
    : {};

  return (
    <Box
      style={{
        ...pinnedStyle,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
      }}
    >
      <Group justify="space-between" align="center" gap="md" wrap="nowrap">
        <Title order={2} style={{ letterSpacing: '-0.01em', flexShrink: 0 }}>
          {title}
        </Title>
        {search && (
          <TextInput
            style={{ flex: 1, maxWidth: 420 }}
            value={search.value}
            leftSection={<IconSearch size={16} />}
            placeholder={search.placeholder}
            onChange={(e) => search.onChange(e.target.value)}
          />
        )}
        {actions && (
          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            {actions}
          </Group>
        )}
      </Group>
    </Box>
  );
}
