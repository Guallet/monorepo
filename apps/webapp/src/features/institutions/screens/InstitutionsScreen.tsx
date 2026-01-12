import {
  useGualletClient,
  useInstitutions,
  useInstitutionMutations,
} from "@guallet/api-react";
import InstitutionsTable from "../components/InstitutionsTable";
import InstitutionForm from "../components/InstitutionForm";
import { Stack, Button, Group, Title, Modal } from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { AppSection } from "@/components/Cards/AppSection";
import { InstitutionDto } from "@guallet/api-client";
import { modals } from "@mantine/modals";

export function InstitutionsScreen() {
  const [isSyncingBanks, setIsSyncingBanks] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingInstitution, setEditingInstitution] =
    useState<InstitutionDto | null>(null);

  const client = useGualletClient();
  const { institutions, isLoading } = useInstitutions();
  const {
    createInstitutionMutation,
    updateInstitutionMutation,
    deleteInstitutionMutation,
  } = useInstitutionMutations();

  async function onSyncBanks() {
    try {
      setIsSyncingBanks(true);
      const response = await client.admin.syncOpenBankingInstitutions();
      console.log("Sync institutions response", response);
      if (response.status === 403) {
        console.error("Forbidden: You do not have permission to sync banks.");
        notifications.show({
          title: "Error",
          message: "You need to be an admin to sync institutions",
          color: "red",
        });
        throw new Error("You need to be an admin to sync institutions");
      }
      if (!response.ok) {
        notifications.show({
          title: "Error",
          message: "Failed to sync banks",
          color: "red",
        });
        throw new Error("Failed to sync banks");
      } else {
        notifications.show({
          title: "Success",
          message: "Banks synced successfully",
          color: "green",
        });
      }
    } catch (error) {
      console.error("Error syncing banks:", error);
    } finally {
      setIsSyncingBanks(false);
    }
  }

  function handleCreateClick() {
    setEditingInstitution(null);
    setIsFormModalOpen(true);
  }

  function handleEditClick(institution: InstitutionDto) {
    setEditingInstitution(institution);
    setIsFormModalOpen(true);
  }

  function handleDeleteClick(institution: InstitutionDto) {
    modals.openConfirmModal({
      title: "Delete Institution",
      children: `Are you sure you want to delete "${institution.name}"? This action cannot be undone.`,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteInstitutionMutation.mutate(
          { id: institution.id },
          {
            onSuccess: () => {
              notifications.show({
                title: "Success",
                message: "Institution deleted successfully",
                color: "green",
              });
            },
            onError: (error) => {
              console.error("Error deleting institution:", error);
              notifications.show({
                title: "Error",
                message: "Failed to delete institution",
                color: "red",
              });
            },
          }
        );
      },
    });
  }

  function handleFormSubmit(data: {
    name: string;
    image_src: string;
    country: string;
  }) {
    if (editingInstitution) {
      updateInstitutionMutation.mutate(
        {
          id: editingInstitution.id,
          request: {
            name: data.name,
            image_src: data.image_src,
            country: data.country,
          },
        },
        {
          onSuccess: () => {
            notifications.show({
              title: "Success",
              message: "Institution updated successfully",
              color: "green",
            });
            setIsFormModalOpen(false);
            setEditingInstitution(null);
          },
          onError: (error) => {
            console.error("Error updating institution:", error);
            notifications.show({
              title: "Error",
              message: "Failed to update institution",
              color: "red",
            });
          },
        }
      );
    } else {
      createInstitutionMutation.mutate(
        {
          request: {
            name: data.name,
            image_src: data.image_src,
            country: data.country,
          },
        },
        {
          onSuccess: () => {
            notifications.show({
              title: "Success",
              message: "Institution created successfully",
              color: "green",
            });
            setIsFormModalOpen(false);
          },
          onError: (error) => {
            console.error("Error creating institution:", error);
            notifications.show({
              title: "Error",
              message: "Failed to create institution",
              color: "red",
            });
          },
        }
      );
    }
  }

  function handleFormCancel() {
    setIsFormModalOpen(false);
    setEditingInstitution(null);
  }

  const isMutating =
    createInstitutionMutation.isPending ||
    updateInstitutionMutation.isPending ||
    deleteInstitutionMutation.isPending;

  return (
    <BaseScreen isLoading={isLoading || isMutating}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Institutions</Title>
          <Button loading={isSyncingBanks} onClick={onSyncBanks} variant="light">
            Sync Banks with Nordigen
          </Button>
        </Group>

        <AppSection>
          <InstitutionsTable
            institutions={institutions}
            onCreateClick={handleCreateClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        </AppSection>
      </Stack>

      <Modal
        opened={isFormModalOpen}
        onClose={handleFormCancel}
        title={editingInstitution ? "Edit Institution" : "Create Institution"}
        size="lg"
      >
        <InstitutionForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialValues={editingInstitution || undefined}
          isLoading={isMutating}
        />
      </Modal>
    </BaseScreen>
  );
}
