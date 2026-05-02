import { AccountTypeDto } from '@guallet/api-client';
import { useTheme } from '@guallet/ui-react';
import { Box, Center, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import {
  IconBuildingBank,
  IconCheck,
  IconCreditCard,
  IconPigMoney,
  IconTrendingUp,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getAccountTypeTitleSingular } from '../../models/Account';

function getAccountTypeIcon(type: AccountTypeDto): ReactNode {
  switch (type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return <IconBuildingBank size={18} />;
    case AccountTypeDto.SAVINGS:
      return <IconPigMoney size={18} />;
    case AccountTypeDto.CREDIT_CARD:
      return <IconCreditCard size={18} />;
    case AccountTypeDto.INVESTMENT:
      return <IconTrendingUp size={18} />;
    case AccountTypeDto.MORTGAGE:
      return <IconBuildingBank size={18} />;
    case AccountTypeDto.LOAN:
      return <IconCreditCard size={18} />;
    default:
      return <IconBuildingBank size={18} />;
  }
}

function getAccountTypeDesc(
  type: AccountTypeDto,
  t: (key: string, fallback: string) => string,
): string {
  switch (type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return t('feature.accounts.add.typeDesc.current', 'Everyday spending & income');
    case AccountTypeDto.SAVINGS:
      return t('feature.accounts.add.typeDesc.savings', 'Pots, ISAs, easy-access');
    case AccountTypeDto.CREDIT_CARD:
      return t('feature.accounts.add.typeDesc.credit', 'Revolving credit balance');
    case AccountTypeDto.INVESTMENT:
      return t('feature.accounts.add.typeDesc.investment', 'ISA, broker, pension');
    case AccountTypeDto.MORTGAGE:
      return t('feature.accounts.add.typeDesc.mortgage', 'Property-secured loan');
    case AccountTypeDto.LOAN:
      return t('feature.accounts.add.typeDesc.loan', 'Personal, student, car');
    default:
      return '';
  }
}

interface TypeTileProps {
  type: AccountTypeDto;
  selected: boolean;
  onClick: () => void;
}

export function TypeTile({ type, selected, onClick }: Readonly<TypeTileProps>) {
  const { t } = useTranslation();
  const { colors, borderRadius, spacing } = useTheme();

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        padding: spacing.md,
        border: `2px solid ${selected ? colors.primary : colors.paleGrey}`,
        borderRadius: borderRadius.md,
        background: selected
          ? `color-mix(in oklab, ${colors.primary} 7%, ${colors.white})`
          : colors.white,
        cursor: 'pointer',
        transition: 'all 150ms',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
        position: 'relative',
      }}
    >
      <ThemeIcon
        size={36}
        radius="sm"
        color={selected ? 'blue' : 'gray'}
        variant={selected ? 'filled' : 'light'}
        style={{ transition: 'all 150ms' }}
      >
        {getAccountTypeIcon(type)}
      </ThemeIcon>
      <Box>
        <Text size="sm" fw={700} c={selected ? colors.primary : undefined}>
          {getAccountTypeTitleSingular(type)}
        </Text>
        <Text size="xs" c="dimmed" mt={spacing.xs / 2}>
          {getAccountTypeDesc(type, t)}
        </Text>
      </Box>
      {selected && (
        <Center
          style={{
            position: 'absolute',
            top: spacing.sm,
            right: spacing.sm,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: colors.primary,
          }}
        >
          <IconCheck size={10} color={colors.white} />
        </Center>
      )}
    </UnstyledButton>
  );
}
