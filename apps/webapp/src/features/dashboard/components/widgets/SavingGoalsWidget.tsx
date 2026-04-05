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
  useMantineTheme,
  Center,
} from '@mantine/core';
import { IconPigMoney, IconFlag } from '@tabler/icons-react';

export function SavingGoalsWidget() {
  const { savingGoals, isLoading: goalsLoading } = useSavingGoals();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const theme = useMantineTheme();

  const isLoading = goalsLoading || accountsLoading;

  // Calculate current amount for each saving goal
  const goalsWithProgress = savingGoals.map((goal) => {
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
  });

  return (
    <WidgetCard title="Saving Goals" icon={<IconPigMoney size={20} />}>
      {isLoading ? (
        <Center h={150}>
          <Loader size="md" />
        </Center>
      ) : goalsWithProgress.length > 0 ? (
        <Stack gap="md">
          {goalsWithProgress.map((goal) => {
            const isComplete = goal.progressPercentage >= 100;
            const current = Money.fromCurrencyCode({
              currencyCode: goal.currency,
              amount: goal.currentAmount,
            });
            const target = Money.fromCurrencyCode({
              currencyCode: goal.currency,
              amount: Number(goal.targetAmount),
            });

            return (
              <Box
                key={goal.id}
                p="sm"
                style={{
                  borderRadius: theme.radius.md,
                  backgroundColor: isComplete
                    ? theme.colors.teal[0]
                    : theme.colors.gray[0],
                  border: `1px solid ${isComplete ? theme.colors.teal[2] : theme.colors.gray[2]}`,
                }}
              >
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <IconFlag
                      size={16}
                      color={
                        isComplete ? theme.colors.teal[6] : theme.colors.blue[6]
                      }
                    />
                    <Text fw={600} size="sm">
                      {goal.name}
                    </Text>
                  </Group>
                  <Text size="xs" c={isComplete ? 'teal' : 'dimmed'} fw={500}>
                    {goal.progressPercentage.toFixed(0)}%
                  </Text>
                </Group>

                {goal.description && (
                  <Text size="xs" c="dimmed" mb="xs">
                    {goal.description}
                  </Text>
                )}

                <Progress
                  value={goal.progressPercentage}
                  color={isComplete ? 'teal' : 'blue'}
                  size="lg"
                  radius="xl"
                  striped={isComplete}
                  animated={isComplete}
                />

                <Group justify="space-between" mt="xs">
                  <Text size="xs" c="dimmed">
                    {current.format()}
                  </Text>
                  <Text size="xs" fw={600} c={isComplete ? 'teal' : 'blue'}>
                    {target.format()}
                  </Text>
                </Group>

                {goal.targetDate && (
                  <Text size="xs" c="dimmed" mt="xs">
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </Text>
                )}
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Center h={150}>
          <Stack gap="xs" align="center">
            <IconPigMoney size={48} color={theme.colors.gray[4]} />
            <Text size="sm" c="dimmed" ta="center">
              No saving goals found.
            </Text>
          </Stack>
        </Center>
      )}
    </WidgetCard>
  );
}
