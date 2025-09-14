import { BaseScreen } from "@/components/Screens/BaseScreen";
import { SavingGoalDto } from "@guallet/api-client/src/savingGoals";
import { useSavingGoal, useAccounts } from "@guallet/api-react";
import {
  Stack,
  Button,
  Text,
  Group,
  Card,
  Progress,
  Badge,
  Grid,
  ActionIcon,
  List,
  Alert,
} from "@mantine/core";
import {
  IconPigMoney,
  IconEdit,
  IconArrowLeft,
  IconCalendar,
  IconCurrencyDollar,
  IconBuildingBank,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Money } from "@guallet/money";

function getDaysRemainingText(
  daysRemaining: number,
  isCompleted: boolean
): string {
  if (daysRemaining > 0) {
    return `${daysRemaining} days remaining to reach your goal`;
  }
  if (isCompleted) {
    return "Congratulations! You've reached your goal!";
  }
  return `${Math.abs(daysRemaining)} days overdue`;
}

interface SavingGoalDetailScreenProps {
  goalId: string;
  onEdit?: (goal: SavingGoalDto) => void;
  onBack?: () => void;
}

export function SavingGoalDetailScreen({
  goalId,
  onEdit,
  onBack,
}: Readonly<SavingGoalDetailScreenProps>) {
  const { savingGoal, isLoading, error } = useSavingGoal(goalId);
  const { accounts } = useAccounts();

  if (error) {
    return (
      <BaseScreen>
        <Alert color="red" title="Error">
          Failed to load saving goal details
        </Alert>
      </BaseScreen>
    );
  }

  if (!savingGoal) {
    return (
      <BaseScreen isLoading={isLoading}>
        <div />
      </BaseScreen>
    );
  }

  // Calculate progress and status
  const currentAmount = 0; // This will be calculated from linked accounts in the future
  const progress =
    savingGoal.target_amount > 0
      ? (currentAmount / savingGoal.target_amount) * 100
      : 0;
  const isCompleted = progress >= 100;
  const remainingAmount = Math.max(0, savingGoal.target_amount - currentAmount);

  const targetDate = new Date(savingGoal.target_date);
  const today = new Date();
  const isOverdue = targetDate < today && !isCompleted;
  const daysRemaining = Math.ceil(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Get linked account details
  const linkedAccounts = accounts.filter((account) =>
    savingGoal.accounts.includes(account.id)
  );

  // Calculate monthly savings needed (simplified calculation)
  const monthsRemaining = Math.max(1, daysRemaining / 30);
  const monthlySavingsNeeded = remainingAmount / monthsRemaining;

  const getProgressColor = () => {
    if (isCompleted) return "green";
    if (isOverdue) return "red";
    if (progress > 75) return "blue";
    if (progress > 50) return "yellow";
    return "gray";
  };

  const getStatusBadge = () => {
    if (isCompleted)
      return (
        <Badge color="green" size="lg">
          Completed
        </Badge>
      );
    if (isOverdue)
      return (
        <Badge color="red" size="lg">
          Overdue
        </Badge>
      );
    if (daysRemaining <= 30)
      return (
        <Badge color="orange" size="lg">
          Due Soon
        </Badge>
      );
    return (
      <Badge color="blue" size="lg">
        On Track
      </Badge>
    );
  };

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            {onBack && (
              <ActionIcon variant="subtle" size="lg" onClick={onBack}>
                <IconArrowLeft size={20} />
              </ActionIcon>
            )}
            <IconPigMoney size={28} />
            <Text size="xl" fw={700}>
              {savingGoal.name}
            </Text>
          </Group>

          <Group>
            {getStatusBadge()}
            {onEdit && (
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => onEdit(savingGoal)}
              >
                Edit Goal
              </Button>
            )}
          </Group>
        </Group>

        {/* Progress Overview */}
        <Card withBorder shadow="sm" radius="lg" p="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="lg" fw={600}>
                Progress Overview
              </Text>
              <Text size="sm" c="dimmed">
                {progress.toFixed(1)}% complete
              </Text>
            </Group>

            <Progress
              value={progress}
              size="xl"
              color={getProgressColor()}
              striped={!isCompleted}
              animated={!isCompleted}
            />

            <Grid>
              <Grid.Col span={6}>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconCurrencyDollar size={16} />
                    <Text size="sm" c="dimmed">
                      Current Amount
                    </Text>
                  </Group>
                  <Text size="lg" fw={600}>
                    {Money.fromCurrencyCode({
                      amount: currentAmount,
                      currencyCode: "USD",
                    }).format()}
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={6}>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconPigMoney size={16} />
                    <Text size="sm" c="dimmed">
                      Target Amount
                    </Text>
                  </Group>
                  <Text size="lg" fw={600}>
                    {Money.fromCurrencyCode({
                      amount: savingGoal.target_amount,
                      currencyCode: "USD",
                    }).format()}
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={6}>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconCalendar size={16} />
                    <Text size="sm" c="dimmed">
                      Target Date
                    </Text>
                  </Group>
                  <Text size="lg" fw={600}>
                    {targetDate.toLocaleDateString()}
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={6}>
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconCurrencyDollar size={16} />
                    <Text size="sm" c="dimmed">
                      Remaining
                    </Text>
                  </Group>
                  <Text
                    size="lg"
                    fw={600}
                    c={isCompleted ? "green" : undefined}
                  >
                    {Money.fromCurrencyCode({
                      amount: remainingAmount,
                      currencyCode: "USD",
                    }).format()}
                  </Text>
                </Stack>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Description */}
        {savingGoal.description && (
          <Card withBorder shadow="sm" radius="lg" p="lg">
            <Stack gap="md">
              <Text size="lg" fw={600}>
                Description
              </Text>
              <Text>{savingGoal.description}</Text>
            </Stack>
          </Card>
        )}

        {/* Insights */}
        <Card withBorder shadow="sm" radius="lg" p="lg">
          <Stack gap="md">
            <Text size="lg" fw={600}>
              Insights
            </Text>

            {!isCompleted && daysRemaining > 0 && (
              <Group>
                <IconInfoCircle size={16} />
                <Text size="sm">
                  You need to save approximately{" "}
                  <Text span fw={600}>
                    {Money.fromCurrencyCode({
                      amount: monthlySavingsNeeded,
                      currencyCode: "USD",
                    }).format()}
                  </Text>{" "}
                  per month to reach your goal.
                </Text>
              </Group>
            )}

            <Group>
              <IconCalendar size={16} />
              <Text size="sm">
                {getDaysRemainingText(daysRemaining, isCompleted)}
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Linked Accounts */}
        <Card withBorder shadow="sm" radius="lg" p="lg">
          <Stack gap="md">
            <Group>
              <IconBuildingBank size={20} />
              <Text size="lg" fw={600}>
                Linked Accounts
              </Text>
            </Group>

            {linkedAccounts.length > 0 ? (
              <List spacing="sm">
                {linkedAccounts.map((account) => (
                  <List.Item key={account.id}>
                    <Group justify="space-between">
                      <Text>{account.name}</Text>
                      <Text size="sm" c="dimmed">
                        {Money.fromCurrencyCode({
                          amount: account.balance.amount,
                          currencyCode: account.balance.currency,
                        }).format()}
                      </Text>
                    </Group>
                  </List.Item>
                ))}
              </List>
            ) : (
              <Text size="sm" c="dimmed" fs="italic">
                No accounts linked to this goal. Link accounts to automatically
                track your progress.
              </Text>
            )}
          </Stack>
        </Card>
      </Stack>
    </BaseScreen>
  );
}
