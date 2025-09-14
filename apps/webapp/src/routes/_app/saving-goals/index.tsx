import { SavingGoalsListScreen } from "@/features/savingGoals/screens/SavingGoalsListScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/saving-goals/")({
  component: SavingGoalsPage,
});

function SavingGoalsPage() {
  return <SavingGoalsListScreen />;
}
