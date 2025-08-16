import { BudgetListScreen } from "@/features/budgets/screens/BudgetListScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/budgets/")({
  component: BudgetsPage,
});

function BudgetsPage() {
  return <BudgetListScreen />;
}
