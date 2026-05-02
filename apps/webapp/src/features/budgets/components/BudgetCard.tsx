import { GualletIcon } from '@/components/GualletIcon/GualletIcon';
import { useBudget } from '@guallet/api-react';
import { Money } from '@guallet/money';
import { useTheme } from '@guallet/ui-react';
import {
  Box,
  Card,
  Group,
  Progress,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface BudgetCardProps {
  budgetId: string;
  onClick?: () => void;
  month?: number;
  year?: number;
}

function spendingColor(
  percent: number,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  if (percent >= 100) return colors.error;
  if (percent >= 80) return colors.warning;
  return colors.support;
}

export function BudgetCard({
  budgetId,
  onClick,
  month,
  year,
}: Readonly<BudgetCardProps>) {
  const { budget } = useBudget(
    budgetId,
    month !== undefined && year !== undefined ? { month, year } : undefined,
  );
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();

  if (!budget) {
    return <Skeleton radius="lg" height={110} />;
  }

  // API returns numeric fields as strings despite the DTO typing them as number
  const spent = Number(budget.spent ?? 0);
  const amount = Number(budget.amount ?? 0);

  const percent = amount > 0 ? (spent / amount) * 100 : 0;
  const isOverBudget = percent >= 100;
  const progressColor = spendingColor(percent, colors);

  const spentMoney = Money.fromCurrencyCode({
    amount: spent,
    currencyCode: budget.currency,
  });
  const budgetMoney = Money.fromCurrencyCode({
    amount: amount,
    currencyCode: budget.currency,
  });
  const remainingMoney = Money.fromCurrencyCode({
    amount: Math.abs(amount - spent),
    currencyCode: budget.currency,
  });

  const statusLabel = isOverBudget
    ? t('screens.budgets.card.overBudget', 'over budget')
    : t('screens.budgets.card.remaining', 'left');

  return (
    <Card
      withBorder
      shadow="sm"
      radius="lg"
      padding="lg"
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {/* Header row: icon + name + remaining amount */}
      <Group mb={spacing.sm} align="flex-start" wrap="nowrap">
        {/* Budget icon chip */}
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: budget.colour ?? colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {budget.icon ? (
            <GualletIcon
              iconName={budget.icon}
              iconColor="#ffffff"
              size={20}
              strokeWidth={1.5}
            />
          ) : (
            <IconWallet size={20} color="#ffffff" strokeWidth={1.5} />
          )}
        </Box>

        {/* Name */}
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} truncate>
            {budget.name}
          </Text>
          {budget.categories.length > 0 && (
            <Text size="xs" c="dimmed">
              {t('screens.budgets.card.categoryCount', {
                count: budget.categories.length,
                defaultValue_one: '{{count}} category',
                defaultValue_other: '{{count}} categories',
              })}
            </Text>
          )}
        </Stack>

        {/* Remaining / over */}
        <Stack gap={2} align="flex-end" style={{ flexShrink: 0 }}>
          <Text
            fw={700}
            style={{
              fontVariantNumeric: 'tabular-nums',
              color: progressColor,
            }}
          >
            {remainingMoney.format()}
          </Text>
          <Text size="xs" c="dimmed">
            {statusLabel}
          </Text>
        </Stack>
      </Group>

      {/* Progress bar */}
      <Progress
        value={Math.min(percent, 100)}
        size="sm"
        radius="xl"
        color={progressColor}
        mb={spacing.xs}
      />

      {/* Footer row: spent / budget · percentage */}
      <Group justify="space-between">
        <Text
          size="xs"
          c="dimmed"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {t('screens.budgets.card.spentOf', '{{spent}} of {{budget}} spent', {
            spent: spentMoney.format(),
            budget: budgetMoney.format(),
          })}
        </Text>
        <Text
          size="xs"
          fw={500}
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: progressColor,
          }}
        >
          {Math.min(percent, 100).toFixed(0)}%
        </Text>
      </Group>
    </Card>
  );
}
