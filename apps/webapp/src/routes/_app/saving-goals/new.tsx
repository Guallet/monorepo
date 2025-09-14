import { SavingGoalForm } from "@/features/savingGoals/components/SavingGoalForm";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SavingGoalDto } from "@guallet/api-client/src/savingGoals";

export const Route = createFileRoute("/_app/saving-goals/new")({
  component: NewSavingGoalPage,
});

function NewSavingGoalPage() {
  const navigate = useNavigate();

  const handleSuccess = (goal: SavingGoalDto) => {
    // Navigate to goal detail when types are updated
    console.log("Created goal:", goal.id);
    navigate({ to: "/saving-goals" });
  };

  const handleCancel = () => {
    navigate({ to: "/saving-goals" });
  };

  return (
    <BaseScreen>
      <SavingGoalForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </BaseScreen>
  );
}
