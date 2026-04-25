import { AccountDto } from '@guallet/api-client';
import { Money } from '@guallet/money';
import { useTheme } from '@guallet/ui-react';
import { Card, Divider, Group, Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SummaryBlock } from './SummaryBlock';

function formatMoney(amount: number, currency: string): string {
  return Money.fromCurrencyCode({ amount, currencyCode: currency }).format();
}

interface NetWorthSummaryProps {
  accounts: AccountDto[];
}

export function NetWorthSummary({ accounts }: Readonly<NetWorthSummaryProps>) {
  const { spacing } = useTheme();
  const { t } = useTranslation();

  const { totals, assets, liabilities, primary, currencies } = useMemo(() => {
    const totals: Record<string, number> = {};
    const assets: Record<string, number> = {};
    const liabilities: Record<string, number> = {};
    const counts: Record<string, number> = {};

    for (const account of accounts) {
      const { currency } = account;
      const amount = Number(account.balance.amount);
      totals[currency] = (totals[currency] ?? 0) + amount;
      counts[currency] = (counts[currency] ?? 0) + 1;
      if (amount > 0) assets[currency] = (assets[currency] ?? 0) + amount;
      else if (amount < 0)
        liabilities[currency] = (liabilities[currency] ?? 0) + Math.abs(amount);
    }

    const primary =
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'GBP';

    return { totals, assets, liabilities, primary, currencies: Object.keys(totals) };
  }, [accounts]);

  const primaryTotal = totals[primary] ?? 0;
  const secondaryCurrencies = currencies.filter((c) => c !== primary);

  return (
    <Card withBorder shadow="sm" radius="lg" p="lg">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
        <Stack gap={spacing.xs} miw={240}>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>
            {t('feature.accounts.list.summary.netWorth', 'Net worth')}
          </Text>
          <Group align="baseline" gap="md" wrap="wrap">
            <Text
              fz={36}
              fw={700}
              c={primaryTotal < 0 ? 'red' : undefined}
              style={{
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {formatMoney(primaryTotal, primary)}
            </Text>
            {secondaryCurrencies.map((c) => (
              <Text
                key={c}
                fz={16}
                fw={600}
                c="dimmed"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatMoney(totals[c], c)}
              </Text>
            ))}
          </Group>
          <Text size="xs" c="dimmed">
            {t('feature.accounts.list.summary.coverage', {
              count: accounts.length,
              accountCount: accounts.length,
              currencyCount: currencies.length,
              defaultValue_one: 'Across {{accountCount}} account in {{currencyCount}} currencies',
              defaultValue_other: 'Across {{accountCount}} accounts in {{currencyCount}} currencies',
            })}
          </Text>
        </Stack>

        <Group gap="lg" align="flex-start">
          <SummaryBlock
            label={t('feature.accounts.list.summary.assets', 'Assets')}
            totals={assets}
            positive
          />
          <Divider orientation="vertical" />
          <SummaryBlock
            label={t('feature.accounts.list.summary.liabilities', 'Liabilities')}
            totals={liabilities}
            positive={false}
          />
        </Group>
      </Group>
    </Card>
  );
}
