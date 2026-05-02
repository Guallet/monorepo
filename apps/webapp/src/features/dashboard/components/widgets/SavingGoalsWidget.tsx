import { useSavingGoals, useAccounts } from '@guallet/api-react';
import { WidgetCard } from './WidgetCard';
import { Money } from '@guallet/money';
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
import { IconPigMoney, IconFlag } from '@tabler/icons-react';
import { useTheme } from '@guallet/ui-react';
import { useRouter } from '@tanstack/react-router';

const MAX_ITEMS = 5;

export function SavingGoalsWidget() {
  const { savingGoals, isLoading: goalsLoading } = useSavingGoals();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { colors } = useTheme();
  const router = useRouter();

  const isLoading = goalsLoading || accountsLoading;

  const goalsWithProgress = savingGoals
    .map((goal) => {
      const goalAccounts = accounts.filter((acc) =>
        goal.accounts.includes(acc.id),
      );

      const currentAmount = goalAccounts.reduce(
        (sum, acc) => sum + Number(acc.balance.amount),
        0,
      );

      const currency = goalAccounts[0]?.currency || 'GBP';

      return {
        ...goal,
        currentAmount,
        progressPercentage: Math.min(goal.progressPercentage, 100),
        currency,
      };
    })
    .sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const aPriority =
        priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
      const bPriority =
        priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
      if (aPriority !== bPriority) return aPriority - bPriority;
      if (a.isCompleted !== b.isCompleted) return b.isCompleted ? -1 : 1;
      return b.progressPercentage - a.progressPercentage;
    });

  const hasMore = goalsWithProgress.length > MAX_ITEMS;
  const displayGoals = goalsWithProgress.slice(0, MAX_ITEMS);

  return (
    <WidgetCard
      title="Saving Goals"
      icon={<IconPigMoney size={20} />}
      footer={
        goalsWithProgress.length > 0 && (
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
            onClick={() => router.navigate({ to: '/saving-goals' })}
          >
            View all saving goals →
          </Text>
        )
      }
    >
      {isLoading ? (
        <Center h={150}>
          <Loader size="md" />
        </Center>
      ) : goalsWithProgress.length > 0 ? (
        <ScrollArea.Autosize mah={280}>
          <Stack gap="sm">
            {displayGoals.map((goal) => {
              const isComplete = goal.progressPercentage >= 100;
              return (
                <Box
                  key={goal.id}
                  p="sm"
                  style={{
                    borderRadius: '8px',
                    backgroundColor: isComplete
                      ? `${colors.support}12`
                      : colors.surface,
                    border: `1px solid ${isComplete ? `${colors.support}40` : colors.paleGrey}`,
                  }}
                >
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <IconFlag
                        size={14}
                        style={{
                          color: isComplete ? colors.support : colors.primary,
                        }}
                      />
                      <Text fw={600} size="sm">
                        {goal.name}
                      </Text>
                    </Group>
                    <Text
                      size="xs"
                      fw={500}
                      style={{ color: isComplete ? colors.support : undefined }}
                      c={isComplete ? undefined : 'dimmed'}
                    >
                      {goal.progressPercentage.toFixed(0)}%
                    </Text>
                  </Group>

                  <Progress
                    value={goal.progressPercentage}
                    color={isComplete ? 'teal' : 'blue'}
                    size="md"
                    radius="xl"
                    striped={isComplete}
                    animated={isComplete}
                  />

                  <Group justify="space-between" mt="xs">
                    <Text size="xs" c="dimmed">
                      {Money.fromCurrencyCode({
                        currencyCode: goal.currency,
                        amount: goal.currentAmount,
                      }).format()}
                    </Text>
                    <Text
                      size="xs"
                      fw={600}
                      style={{
                        color: isComplete ? colors.support : colors.primary,
                      }}
                    >
                      {Money.fromCurrencyCode({
                        currencyCode: goal.currency,
                        amount: Number(goal.targetAmount),
                      }).format()}
                    </Text>
                  </Group>
                </Box>
              );
            })}
            {hasMore && (
              <Text size="xs" c="dimmed" ta="center">
                +{goalsWithProgress.length - MAX_ITEMS} more goal
                {goalsWithProgress.length - MAX_ITEMS !== 1 ? 's' : ''}
              </Text>
            )}
          </Stack>
        </ScrollArea.Autosize>
      ) : (
        <Center h={150}>
          <Stack gap="xs" align="center">
            <IconPigMoney size={48} style={{ color: colors.paleGrey }} />
            <Text size="sm" c="dimmed" ta="center">
              No saving goals found.
            </Text>
          </Stack>
        </Center>
      )}
    </WidgetCard>
  );
}
