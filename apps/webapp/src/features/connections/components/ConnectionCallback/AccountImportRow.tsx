import { ObAccountDto } from '@guallet/api-client';
import { useTheme } from '@guallet/ui-react';
import { Box, Checkbox, Text } from '@mantine/core';

interface AccountImportRowProps {
  account: ObAccountDto;
  selected: boolean;
  last: boolean;
  onToggle: () => void;
}

export function AccountImportRow({ account, selected, last, onToggle }: Readonly<AccountImportRowProps>) {
  const { colors, spacing } = useTheme();
  const displayName = account.details.name ?? account.details.ownerName ?? account.details.iban ?? account.id;

  return (
    <Box
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        padding: `${spacing.md}px ${spacing.md}px`,
        borderBottom: last ? 'none' : `1px solid ${colors.paleGrey}`,
        background: selected ? `color-mix(in oklab, ${colors.primary} 5%, ${colors.white})` : colors.white,
        cursor: 'pointer',
        transition: 'background 100ms',
      }}
    >
      <Checkbox
        checked={selected}
        onChange={onToggle}
        radius="sm"
        style={{ pointerEvents: 'none' }}
      />
      <Box style={{ flex: 1 }}>
        <Text size="sm" fw={600}>
          {displayName}
        </Text>
        {account.details.iban && (
          <Text size="xs" c="dimmed" mt={2}>
            {account.details.iban}
          </Text>
        )}
        {account.details.currency && (
          <Text size="xs" c="dimmed">
            {account.details.currency}
          </Text>
        )}
      </Box>
    </Box>
  );
}
