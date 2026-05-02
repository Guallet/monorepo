import { BudgetDto } from '@guallet/api-client';
import { Money } from '@guallet/money';
import { useTheme } from '@guallet/ui-react';
import {
  Card,
  Divider,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface BudgetListHeaderProps {
  budgets: BudgetDto[];
}

export function BudgetListHeader({ budgets }: Readonly<BudgetListHeaderProps>) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();

  const { totalBudget, totalSpent, remaining, overallPercent, singleCurrency } =
    useMemo(() => {
      const currencies = new Set(budgets.map((b) => b.currency));
      const currency = currencies.size === 1 ? [...currencies][0] : null;

      const totalBudget = budgets.reduce(
        (acc, b) => acc + Number(b.amount ?? 0),
        0,
      );
      const totalSpent = budgets.reduce(
        (acc, b) => acc + Number(b.spent ?? 0),
        0,
      );
      const remaining = totalBudget - totalSpent;
      const overallPercent =
        totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      return {
        totalBudget,
        totalSpent,
        remaining,
        overallPercent,
        singleCurrency: currency,
      };
    }, [budgets]);

  const getProgressColor = (percent: number): string => {
    if (percent >= 100) return colors.error;
    if (percent >= 80) return colors.warning;
    return colors.support;
  };

  const progressColor = getProgressColor(overallPercent);

  function formatAmount(amount: number): string {
    if (!singleCurrency) return '—';
    return Money.fromCurrencyCode({
      amount,
      currencyCode: singleCurrency,
    }).format();
  }

  return (
    <Card withBorder shadow="sm" radius="lg" padding="lg">
      {/* Eyebrow label */}
      <Text
        size="xs"
        fw={600}
        tt="uppercase"
        c="dimmed"
        style={{ letterSpacing: '0.04em' }}
        mb={spacing.sm}
      >
        {t('screens.budgets.header.title', 'Budget overview')}
      </Text>

      {/* Overall progress bar */}
      <Progress
        value={Math.min(overallPercent, 100)}
        size="md"
        radius="xl"
        color={progressColor}
        mb={spacing.xs}
      />

      <Group justify="space-between" mb={spacing.md}>
        <Text size="xs" c="dimmed">
          {t('screens.budgets.header.budgetCount', {
            count: budgets.length,
            defaultValue_one: '{{count}} budget',
            defaultValue_other: '{{count}} budgets',
          })}
        </Text>
        <Text
          size="xs"
          fw={500}
          style={{ color: progressColor, fontVariantNumeric: 'tabular-nums' }}
        >
          {Math.min(overallPercent, 100).toFixed(0)}%{' '}
          {t('screens.budgets.header.used', 'used')}
        </Text>
      </Group>

      <Divider mb={spacing.md} />

      {/* Three stat columns */}
      <SimpleGrid cols={3}>
        <Stack gap={2}>
          <Text size="xs" c="dimmed">
            {t('screens.budgets.header.budgeted', 'Budgeted')}
          </Text>
          <Text fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatAmount(totalBudget)}
          </Text>
        </Stack>

        <Stack gap={2} align="center">
          <Text size="xs" c="dimmed">
            {t('screens.budgets.header.spent', 'Spent')}
          </Text>
          <Text
            fw={700}
            style={{
              fontVariantNumeric: 'tabular-nums',
              color: colors.error,
            }}
          >
            {formatAmount(totalSpent)}
          </Text>
        </Stack>

        <Stack gap={2} align="flex-end">
          <Text size="xs" c="dimmed">
            {t('screens.budgets.header.remaining', 'Remaining')}
          </Text>
          <Text
            fw={700}
            style={{
              fontVariantNumeric: 'tabular-nums',
              color: remaining >= 0 ? colors.support : colors.error,
            }}
          >
            {formatAmount(Math.abs(remaining))}
          </Text>
        </Stack>
      </SimpleGrid>
    </Card>
  );
}
