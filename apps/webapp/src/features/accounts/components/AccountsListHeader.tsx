import { AccountDto, AccountTypeDto } from '@guallet/api-client';
import { Money } from '@guallet/money';
import { Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
  IconBriefcase,
  IconBuildingBank,
  IconChartBar,
  IconCreditCard,
  IconHome,
  IconPigMoney,
  IconReceipt,
} from '@tabler/icons-react';
import { ReactNode } from 'react';
import { getAccountTypeTitle } from '@/features/accounts/models/Account';

function renderGroupIcon(type: AccountTypeDto): ReactNode {
  switch (type) {
    case AccountTypeDto.CURRENT_ACCOUNT:
      return <IconBuildingBank size={20} />;
    case AccountTypeDto.SAVINGS:
      return <IconPigMoney size={20} />;
    case AccountTypeDto.CREDIT_CARD:
      return <IconCreditCard size={20} />;
    case AccountTypeDto.INVESTMENT:
      return <IconChartBar size={20} />;
    case AccountTypeDto.MORTGAGE:
      return <IconHome size={20} />;
    case AccountTypeDto.LOAN:
      return <IconReceipt size={20} />;
    case AccountTypeDto.PENSION:
      return <IconBriefcase size={20} />;
    default:
      return <IconBuildingBank size={20} />;
  }
}

function groupByCurrency(accounts: AccountDto[]): Record<string, AccountDto[]> {
  return accounts.reduce(
    (acc, account) => {
      const key = account.currency;
      if (!acc[key]) acc[key] = [];
      acc[key].push(account);
      return acc;
    },
    {} as Record<string, AccountDto[]>,
  );
}

function GroupTotals({ accounts }: Readonly<{ accounts: AccountDto[] }>) {
  const { t } = useTranslation();
  const byCurrency = groupByCurrency(accounts);
  const currencies = Object.entries(byCurrency);

  if (currencies.length > 2) {
    return (
      <Text size="xs" c="dimmed" fs="italic" ta="right" maw={220}>
        {t(
          'feature.accounts.list.header.multipleCurrencies',
          'Multiple currencies — totals hidden',
        )}
      </Text>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 2,
      }}
    >
      {currencies.map(([currency, accs], i) => {
        const total = accs.reduce(
          (sum, a) => sum + Number(a.balance.amount),
          0,
        );
        const money = Money.fromCurrencyCode({
          amount: total,
          currencyCode: currency,
        });
        const isPrimary = i === 0;
        return (
          <Text
            key={currency}
            fz={isPrimary ? 22 : 14}
            fw={700}
            c={money.isNegative() ? 'red' : undefined}
            style={{
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
              opacity: isPrimary ? 1 : 0.7,
              lineHeight: 1.15,
            }}
          >
            {money.format()}
          </Text>
        );
      })}
    </div>
  );
}

interface HeaderProps {
  accountType: AccountTypeDto;
  accounts: AccountDto[];
}

export function AccountsListHeader({
  accountType,
  accounts,
}: Readonly<HeaderProps>) {
  const { t } = useTranslation();
  const byCurrency = groupByCurrency(accounts);
  const currencyCount = Object.keys(byCurrency).length;

  const accountCountText = t('feature.accounts.list.header.accountCount', {
    count: accounts.length,
    defaultValue_one: '{{count}} account',
    defaultValue_other: '{{count}} accounts',
  });
  const currencySuffix =
    currencyCount > 1
      ? ` · ${t('feature.accounts.list.header.currencyCount', { count: currencyCount, defaultValue_one: '{{count}} currency', defaultValue_other: '{{count}} currencies' })}`
      : '';

  return (
    <Group
      justify="space-between"
      align="center"
      gap={14}
      px="md"
      py="sm"
      style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
    >
      <Group gap={12} align="center" style={{ flex: 1, minWidth: 0 }}>
        <ThemeIcon variant="light" size={36} radius={10}>
          {renderGroupIcon(accountType)}
        </ThemeIcon>
        <Stack gap={2}>
          <Text fw={700} size="md" style={{ letterSpacing: '-0.01em' }}>
            {getAccountTypeTitle(accountType)}
          </Text>
          <Text size="xs" c="dimmed">
            {accountCountText}
            {currencySuffix}
          </Text>
        </Stack>
      </Group>
      <GroupTotals accounts={accounts} />
    </Group>
  );
}
