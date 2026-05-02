import { OpenBankingCountryDto } from '@guallet/api-client';
import { useTheme } from '@guallet/ui-react';
import { Text, UnstyledButton } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { FlagEmoji } from '@/features/connections/components/FlagEmoji';

interface CountryRowProps {
  country: OpenBankingCountryDto;
  selected: boolean;
  last: boolean;
  onClick: () => void;
}

export function CountryRow({ country, selected, last, onClick }: Readonly<CountryRowProps>) {
  const { colors, spacing } = useTheme();

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        padding: `${spacing.sm}px ${spacing.md}px`,
        borderBottom: last ? 'none' : `1px solid ${colors.paleGrey}`,
        background: selected
          ? `color-mix(in oklab, ${colors.primary} 7%, ${colors.white})`
          : undefined,
        transition: 'background 100ms',
      }}
    >
      <FlagEmoji countryCode={country.code} />
      <Text
        size="sm"
        fw={selected ? 600 : 400}
        c={selected ? colors.primary : undefined}
        style={{ flex: 1 }}
      >
        {country.name}
      </Text>
      {selected && <IconCheck size={16} color={colors.primary} />}
    </UnstyledButton>
  );
}
