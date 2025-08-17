import { BudgetDto } from "@guallet/api-client";
import { Group, Text, Paper, Progress, Stack } from "@mantine/core";

interface BudgetListHeaderProps {
  budgets: BudgetDto[];
}

export function BudgetListHeader({ budgets }: Readonly<BudgetListHeaderProps>) {
  const totalBudget = budgets.reduce((acc, budget) => acc + budget.amount, 0);
  const totalSpent = budgets.reduce((acc, budget) => acc + budget.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <Stack>
      <Group align="apart" mb="xs">
        <Text fz="md" fw={500}>
          Budget total
        </Text>
        <Text fz="md" fw={500}>
          £{remaining}
        </Text>
      </Group>

      <Group align="apart">
        <Text fz="sm" c="dimmed">
          £{totalSpent} / £{totalBudget}
        </Text>
        <Text fz="sm" c="dimmed">
          Left
        </Text>
      </Group>
    </Stack>
  );
}
