import { SavingGoalForm } from '@/features/savingGoals/components/SavingGoalForm';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useSavingGoal } from '@guallet/api-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SavingGoalDto } from '@guallet/api-client/src/savingGoals';
import { Alert } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_app/saving-goals/$id_/edit')({
  component: EditSavingGoalPage,
});

function EditSavingGoalPage() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { savingGoal, isLoading, error } = useSavingGoal(id);

  const title = t('screens.savingGoals.edit.title', 'Edit saving goal');

  const handleSuccess = (goal: SavingGoalDto) => {
    console.log('Updated goal:', goal.id);
    navigate({ to: '/saving-goals' });
  };

  const handleCancel = () => {
    navigate({ to: '/saving-goals' });
  };

  if (error) {
    return (
      <BaseScreen title={title}>
        <Alert color="red" title="Error">
          Failed to load saving goal
        </Alert>
      </BaseScreen>
    );
  }

  if (isLoading || !savingGoal) {
    return (
      <BaseScreen isLoading={isLoading} title={title}>
        <div />
      </BaseScreen>
    );
  }

  return (
    <BaseScreen title={title}>
      <SavingGoalForm
        savingGoal={savingGoal}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </BaseScreen>
  );
}
