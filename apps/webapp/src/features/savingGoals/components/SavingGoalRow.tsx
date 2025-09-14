import { SavingGoalDto } from "@guallet/api-client/src/savingGoals";
import {
  Card,
  Group,
  Stack,
  Text,
  Progress,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { IconPigMoney, IconEdit, IconTrash } from "@tabler/icons-react";
import { Money } from "@guallet/money";

function getProgressColor(isCompleted: boolean, isOverdue: boolean): string {
  if (isCompleted) return "green";
  if (isOverdue) return "red";
  return "blue";
}

interface SavingGoalRowProps {
  savingGoal: SavingGoalDto;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SavingGoalRow({
  savingGoal,
  onClick,
  onEdit,
  onDelete,
}: Readonly<SavingGoalRowProps>) {
  // For now, we'll calculate progress as 0% since we don't have current amount
  // This should be calculated based on the actual amount saved from linked accounts
  const currentAmount = 0; // This will be calculated from linked accounts in the future
  const progress =
    savingGoal.target_amount > 0
      ? (currentAmount / savingGoal.target_amount) * 100
      : 0;
  const isCompleted = progress >= 100;

  const targetDate = new Date(savingGoal.target_date);
  const isOverdue = targetDate < new Date() && !isCompleted;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click when clicking action buttons
    if ((e.target as HTMLElement).closest("[data-action-button]")) {
      return;
    }
    onClick();
  };

  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      p="lg"
      style={{ cursor: "pointer" }}
      onClick={handleCardClick}
    >
      <Group justify="space-between" mb="xs">
        <Group>
          <IconPigMoney size={20} />
          <Text fw={500} size="lg">
            {savingGoal.name}
          </Text>
        </Group>
        <Group gap="xs">
          {isCompleted && (
            <Badge color="green" size="sm">
              Completed
            </Badge>
          )}
          {isOverdue && (
            <Badge color="red" size="sm">
              Overdue
            </Badge>
          )}
          {onEdit && (
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              data-action-button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <IconEdit size={16} />
            </ActionIcon>
          )}
          {onDelete && (
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              data-action-button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>

      {savingGoal.description && (
        <Text size="sm" c="dimmed" mb="sm">
          {savingGoal.description}
        </Text>
      )}

      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Progress
          </Text>
          <Text size="sm" fw={500}>
            {Money.fromCurrencyCode({
              amount: currentAmount,
              currencyCode: "USD",
            }).format()}{" "}
            /{" "}
            {Money.fromCurrencyCode({
              amount: savingGoal.target_amount,
              currencyCode: "USD",
            }).format()}
          </Text>
        </Group>

        <Progress
          value={progress}
          size="lg"
          color={getProgressColor(isCompleted, isOverdue)}
          striped={!isCompleted}
          animated={!isCompleted}
        />

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {progress.toFixed(1)}% complete
          </Text>
          <Text size="xs" c="dimmed">
            Target: {targetDate.toLocaleDateString()}
          </Text>
        </Group>

        {savingGoal.accounts.length > 0 && (
          <Text size="xs" c="dimmed">
            {savingGoal.accounts.length} account
            {savingGoal.accounts.length !== 1 ? "s" : ""} linked
          </Text>
        )}
      </Stack>
    </Card>
  );
}
