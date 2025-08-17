import { BaseScreen } from "@/components/Screens/BaseScreen";
import { useBudgets } from "@guallet/api-react";
import { BudgetCard } from "../components/BudgetCard";
import { Button, Stack } from "@mantine/core";
import { BudgetListHeader } from "../components/BudgetListHeader";
import { useNavigate } from "@tanstack/react-router";
import EmptyState from "@/components/EmptyState/EmptyState";
import { useTranslation } from "react-i18next";

export function BudgetListScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { budgets, isLoading } = useBudgets();

  return (
    <BaseScreen isLoading={isLoading}>
      {budgets.length === 0 ? (
        <EmptyState
          text={t(
            "screens.budget.list.emptyState",
            "No Budgets Found. Create a new budget to get started."
          )}
          iconName="IconPlus"
          onClick={() => {
            navigate({ to: "/budgets/create" });
          }}
        />
      ) : (
        <Stack>
          <Button
            onClick={() => {
              navigate({ to: "/budgets/create" });
            }}
          >
            {t(
              "screens.budget.list.createBudgetButton.label",
              "Create new Budget"
            )}
          </Button>
          <BudgetListHeader budgets={budgets} />
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budgetId={budget.id} />
          ))}
        </Stack>
      )}
    </BaseScreen>
  );
}
