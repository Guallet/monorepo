import { useBudgets } from '@guallet/api-react';
import { WidgetCard } from './WidgetCard';
import {
  Loader,
  Stack,
  Text,
  Progress,
  Group,
  Box,
  Center,
  ScrollArea,
} from '@mantine/core';
import { IconTargetArrow } from '@tabler/icons-react';
import { useTheme } from '@guallet/ui-react';
import { useRouter } from '@tanstack/react-router';

const MAX_ITEMS = 6;

export function BudgetsWidget() {
  const { budgets, isLoading } = useBudgets();
  const { colors } = useTheme();
  const router = useRouter();

  const sortedBudgets = (budgets ?? [])
    .map((budget) => {
      const spent = Number(budget.spent ?? 0);
      const total = Number(budget.amount ?? 0);
      const remaining = total - spent;
      const percent = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
      const isOverBudget = percent > 100;
      const isNearLimit = percent > 90 && !isOverBudget;
      return {
        ...budget,
        spent,
        total,
        remaining,
        percent,
        isOverBudget,
        isNearLimit,
      };
    })
    .sort((a, b) => {
      if (a.isOverBudget !== b.isOverBudget) return a.isOverBudget ? -1 : 1;
      if (a.isNearLimit !== b.isNearLimit) return a.isNearLimit ? -1 : 1;
      return b.percent - a.percent;
    });

  const hasMore = sortedBudgets.length > MAX_ITEMS;
  const displayBudgets = sortedBudgets.slice(0, MAX_ITEMS);

  return (
    <WidgetCard
      title="Budgets"
      icon={<IconTargetArrow size={20} />}
      footer={
        sortedBudgets.length > 0 && (
          <Text
            component="a"
            size="sm"
            fw={500}
            style={{
              color: colors.primary,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'block',
              textAlign: 'center',
            }}
            onClick={() => router.navigate({ to: '/budgets' })}
          >
            View all budgets →
          </Text>
        )
      }
    >
      {isLoading ? (
        <Center h={100}>
          <Loader size="md" />
        </Center>
      ) : sortedBudgets.length > 0 ? (
        <ScrollArea.Autosize mah={280}>
          <Stack gap="sm">
            {displayBudgets.map((budget) => {
              const overBudgetBg = `${colors.error}15`;
              const nearLimitBg = `${colors.warning}30`;
              const normalBg = colors.surface;
              const overBudgetBorder = `${colors.error}40`;
              const nearLimitBorder = `${colors.warning}60`;
              const normalBorder = colors.paleGrey;

              const bgColor = budget.isOverBudget
                ? overBudgetBg
                : budget.isNearLimit
                  ? nearLimitBg
                  : normalBg;
              const borderColor = budget.isOverBudget
                ? overBudgetBorder
                : budget.isNearLimit
                  ? nearLimitBorder
                  : normalBorder;
              const progressColor = budget.isOverBudget
                ? 'red'
                : budget.isNearLimit
                  ? 'yellow'
                  : 'teal';
              const textColor = budget.isOverBudget
                ? colors.error
                : budget.isNearLimit
                  ? colors.warning
                  : colors.primary;

              return (
                <Box
                  key={budget.id}
                  p="sm"
                  style={{
                    borderRadius: '8px',
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <Group justify="space-between" mb="xs">
                    <Text fw={600} size="sm">
                      {budget.name}
                    </Text>
                    <Text size="sm" fw={500} style={{ color: textColor }}>
                      {budget.spent.toFixed(0)} / {budget.total.toFixed(0)}
                    </Text>
                  </Group>
                  <Progress
                    value={budget.percent}
                    color={progressColor}
                    size="md"
                    radius="xl"
                    striped={budget.isOverBudget}
                    animated={budget.isOverBudget}
                  />
                  <Group justify="space-between" mt="xs">
                    <Text size="xs" c="dimmed">
                      Remaining
                    </Text>
                    <Text
                      size="xs"
                      fw={500}
                      style={{
                        color:
                          budget.remaining < 0 ? colors.error : colors.support,
                      }}
                    >
                      {budget.remaining.toFixed(0)}
                    </Text>
                  </Group>
                </Box>
              );
            })}
            {hasMore && (
              <Text size="xs" c="dimmed" ta="center">
                +{sortedBudgets.length - MAX_ITEMS} more budget
                {sortedBudgets.length - MAX_ITEMS !== 1 ? 's' : ''}
              </Text>
            )}
          </Stack>
        </ScrollArea.Autosize>
      ) : (
        <Center h={100}>
          <Text size="sm" c="dimmed">
            No budgets found.
          </Text>
        </Center>
      )}
    </WidgetCard>
  );
}
