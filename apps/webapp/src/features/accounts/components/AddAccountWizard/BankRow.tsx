import { ObInstitutionDto } from '@guallet/api-client';
import { useTheme } from '@guallet/ui-react';
import { Avatar, Text, UnstyledButton } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

interface BankRowProps {
  bank: ObInstitutionDto;
  selected: boolean;
  last: boolean;
  onClick: () => void;
}

export function BankRow({ bank, selected, last, onClick }: Readonly<BankRowProps>) {
  const { colors, spacing } = useTheme();

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        padding: `${spacing.md}px`,
        borderBottom: last ? 'none' : `1px solid ${colors.paleGrey}`,
        background: selected
          ? `color-mix(in oklab, ${colors.primary} 7%, ${colors.white})`
          : undefined,
        transition: 'background 100ms',
      }}
    >
      <Avatar src={bank.logo} size={40} radius="sm" color="blue">
        {bank.name.slice(0, 2).toUpperCase()}
      </Avatar>
      <Text
        size="sm"
        fw={selected ? 700 : 500}
        c={selected ? colors.primary : undefined}
        style={{ flex: 1 }}
      >
        {bank.name}
      </Text>
      {selected && <IconCheck size={18} color={colors.primary} />}
    </UnstyledButton>
  );
}
