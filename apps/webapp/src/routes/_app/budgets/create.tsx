import { CreateBudgetScreen } from "@/features/budgets/screens/CreateBudgetScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/budgets/create")({
  component: CreateBudgetPage,
});

function CreateBudgetPage() {
  return <CreateBudgetScreen />;
}
