import { BaseScreen } from "@/components/Screens/BaseScreen";
import { SavingGoalDto } from "@guallet/api-client/src/savingGoals";
import { useSavingGoalMutations, useSavingGoals } from "@guallet/api-react";
import { Stack, Button, Text, Group, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SavingGoalRow } from "../components/SavingGoalRow";
import { IconPlus, IconPigMoney } from "@tabler/icons-react";

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
            title: "Success",
            message: `Saving goal "${goalToDelete.name}" has been deleted`,
            color: "green",
          });
        },
        onError: (error) => {
          console.error("Failed to delete saving goal:", error);
          notifications.show({
            title: "Error",
            message: "Failed to delete saving goal",
            color: "red",
          });
        },
      }
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
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group>
            <IconPigMoney size={24} />
            <Text size="xl" fw={700}>
              Saving Goals
            </Text>
          </Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate({ to: "/saving-goals/new" })}
          >
            New Saving Goal
          </Button>
        </Group>

        {savingGoals.length === 0 ? (
          <Stack align="center" gap="lg" py="xl">
            <IconPigMoney size={48} opacity={0.5} />
            <Text size="lg" c="dimmed" ta="center">
              No saving goals yet
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Create your first saving goal to start tracking your progress
              towards your financial targets.
            </Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate({ to: "/saving-goals/new" })}
            >
              Create Your First Goal
            </Button>
          </Stack>
        ) : (
          <Stack gap="md">
            {savingGoals.map((goal) => (
              <SavingGoalRow
                key={goal.id}
                savingGoal={goal}
                onClick={() => handleGoalClick(goal)}
                onEdit={() => handleEdit(goal)}
                onDelete={() => handleDelete(goal)}
              />
            ))}
          </Stack>
        )}
      </Stack>

      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Saving Goal"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete the saving goal "
            {goalToDelete?.name}"? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </BaseScreen>
  );
}
