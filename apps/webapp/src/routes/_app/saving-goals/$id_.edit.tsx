import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SavingGoalForm } from '@/features/savingGoals/components/SavingGoalForm';
import { SavingGoalDto } from '@guallet/api-client/src/savingGoals';
import { useSavingGoal } from '@guallet/api-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/saving-goals/$id_/edit')({
  component: EditSavingGoalPage,
});

function EditSavingGoalPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { savingGoal, isLoading, error } = useSavingGoal(id);

  const handleSuccess = (goal: SavingGoalDto) => {
    console.log('Updated goal:', goal.id);
    navigate({ to: '/saving-goals' });
  };

  const handleCancel = () => {
    navigate({ to: '/saving-goals' });
  };

  if (error) {
    return (
      <BaseScreen>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load saving goal</AlertDescription>
        </Alert>
      </BaseScreen>
    );
  }

  if (isLoading || !savingGoal) {
    return (
      <BaseScreen isLoading={isLoading}>
        <div />
      </BaseScreen>
    );
  }

  return (
    <BaseScreen>
      <SavingGoalForm
        savingGoal={savingGoal}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </BaseScreen>
  );
}
