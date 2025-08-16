import { BaseScreen } from "@/components/Screens/BaseScreen";
import { useBudgets } from "@guallet/api-react";
import { BudgetCard } from "../components/BudgetCard";
import { Stack } from "@mantine/core";
import { BudgetListHeader } from "../components/BudgetListHeader";

export function BudgetListScreen() {
  const { budgets, isLoading } = useBudgets();
  return (
    <BaseScreen isLoading={isLoading}>
      <Stack>
        <BudgetListHeader budgets={budgets} />
        {budgets.map((budget) => (
          <BudgetCard key={budget.id} budgetId={budget.id} />
        ))}
      </Stack>
    </BaseScreen>
  );
}
