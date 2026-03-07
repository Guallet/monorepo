import { DeleteDialogConfirmation } from '@/components/Dialogs/DeleteDialogConfirmation';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SavingGoalDto } from '@guallet/api-client/src/savingGoals';
import { useSavingGoalMutations, useSavingGoals } from '@guallet/api-react';
import { useDisclosure } from '@/hooks/useDisclosure';
import { notifications } from '@/lib/notifications';
import { useNavigate } from '@tanstack/react-router';
import { IconPlus, IconPigMoney } from '@tabler/icons-react';
import { useState } from 'react';
import { SavingGoalRow } from '../components/SavingGoalRow';

export function SavingGoalsListScreen() {
  const navigate = useNavigate();
  const { savingGoals, isLoading } = useSavingGoals();
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [goalToDelete, setGoalToDelete] = useState<SavingGoalDto | null>(null);

  const handleDelete = async (goal: SavingGoalDto) => {
    setGoalToDelete(goal);
    openDeleteModal();
  };

  const { deleteSavingGoalMutation } = useSavingGoalMutations();

  const confirmDelete = async () => {
    if (!goalToDelete) return;

    deleteSavingGoalMutation.mutate(
      {
        id: goalToDelete.id,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: `Saving goal "${goalToDelete.name}" has been deleted`,
            color: 'green',
          });
        },
        onError: (error) => {
          console.error('Failed to delete saving goal:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to delete saving goal',
            color: 'red',
          });
        },
      },
    );

    closeDeleteModal();
    setGoalToDelete(null);
  };

  const handleEdit = (goal: SavingGoalDto) => {
    navigate({ to: `/saving-goals/${goal.id}/edit` });
  };

  const handleGoalClick = (goal: SavingGoalDto) => {
    navigate({ to: `/saving-goals/${goal.id}` });
  };

  return (
    <BaseScreen isLoading={isLoading}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <IconPigMoney className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Saving Goals</h1>
          </div>
          <Button
            type="button"
            className="gap-2"
            onClick={() => navigate({ to: '/saving-goals/new' })}
          >
            <IconPlus className="h-4 w-4" />
            New Saving Goal
          </Button>
        </div>

        {savingGoals.length === 0 ? (
          <Card className="rounded-lg border p-6 shadow-sm">
            <div className="flex flex-col items-center gap-3 text-center">
              <IconPigMoney className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                No saving goals yet
              </p>
              <p className="max-w-[560px] text-sm text-muted-foreground">
                Create your first saving goal to start tracking your progress
                towards your financial targets.
              </p>
              <Button
                type="button"
                className="gap-2"
                onClick={() => navigate({ to: '/saving-goals/new' })}
              >
                <IconPlus className="h-4 w-4" />
                Create Your First Goal
              </Button>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {savingGoals.map((goal) => (
              <SavingGoalRow
                key={goal.id}
                savingGoal={goal}
                onClick={() => handleGoalClick(goal)}
                onEdit={() => handleEdit(goal)}
                onDelete={() => handleDelete(goal)}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteDialogConfirmation
        isOpen={deleteModalOpened}
        onClose={() => {
          closeDeleteModal();
          setGoalToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Saving Goal"
        message={`Are you sure you want to delete the saving goal "${goalToDelete?.name ?? ''}"? This action cannot be undone.`}
      />
    </BaseScreen>
  );
}
