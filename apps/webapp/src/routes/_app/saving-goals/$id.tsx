import { SavingGoalDetailScreen } from "@/features/savingGoals/screens/SavingGoalDetailScreen";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SavingGoalDto } from "@guallet/api-client/src/savingGoals";

export const Route = createFileRoute("/_app/saving-goals/$id")({
  component: SavingGoalDetailPage,
});

function SavingGoalDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const handleEdit = (goal: SavingGoalDto) => {
    console.log("Edit goal:", goal.id);
  };

  const handleBack = () => {
    navigate({ to: "/saving-goals" });
  };

  return (
    <SavingGoalDetailScreen
      goalId={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  );
}
