import { BudgetDto } from "@guallet/api-client";
import { Group, Text } from "@mantine/core";
import { useMemo } from "react";

interface BudgetListHeaderProps {
  budgets: BudgetDto[];
}

export function BudgetListHeader({ budgets }: Readonly<BudgetListHeaderProps>) {
  const { totalBudget, totalSpent, remaining } = useMemo(() => {
    const totalBudget = budgets.reduce(
      (acc, budget) => acc + Number(budget.amount),
      0
    );
    const totalSpent = budgets.reduce(
      (acc, budget) => acc + Number(budget.spent),
      0
    );
    const remaining = totalBudget - totalSpent;
    return { totalBudget, totalSpent, remaining };
  }, [budgets]);

  return (
    <Group justify="space-between" mb="md" align="center">
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
    </Group>
  );
}
