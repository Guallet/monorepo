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
import { useTranslation } from "react-i18next";

export function InstitutionsScreen() {
  const { t } = useTranslation();
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
          title: t("feature.institutions.notifications.sync.error.title"),
          message: t("feature.institutions.notifications.sync.error.forbidden"),
          color: "red",
        });
        throw new Error("You need to be an admin to sync institutions");
      }
      if (!response.ok) {
        notifications.show({
          title: t("feature.institutions.notifications.sync.error.title"),
          message: t("feature.institutions.notifications.sync.error.failed"),
          color: "red",
        });
        throw new Error("Failed to sync banks");
      } else {
        notifications.show({
          title: t("feature.institutions.notifications.sync.success.title"),
          message: t("feature.institutions.notifications.sync.success.message"),
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
      title: t("feature.institutions.deleteConfirm.title"),
      children: t("feature.institutions.deleteConfirm.message", { name: institution.name }),
      labels: { 
        confirm: t("feature.institutions.deleteConfirm.confirmButton"), 
        cancel: t("feature.institutions.deleteConfirm.cancelButton") 
      },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteInstitutionMutation.mutate(
          { id: institution.id },
          {
            onSuccess: () => {
              notifications.show({
                title: t("feature.institutions.notifications.delete.success.title"),
                message: t("feature.institutions.notifications.delete.success.message"),
                color: "green",
              });
            },
            onError: (error) => {
              console.error("Error deleting institution:", error);
              notifications.show({
                title: t("feature.institutions.notifications.delete.error.title"),
                message: t("feature.institutions.notifications.delete.error.message"),
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
      // Note: The API expects a single 'country' string for updates
      // The InstitutionDto has 'countries' array because system institutions can support multiple,
      // but custom institutions (user-created) only support one country
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
              title: t("feature.institutions.notifications.update.success.title"),
              message: t("feature.institutions.notifications.update.success.message"),
              color: "green",
            });
            setIsFormModalOpen(false);
            setEditingInstitution(null);
          },
          onError: (error) => {
            console.error("Error updating institution:", error);
            notifications.show({
              title: t("feature.institutions.notifications.update.error.title"),
              message: t("feature.institutions.notifications.update.error.message"),
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
              title: t("feature.institutions.notifications.create.success.title"),
              message: t("feature.institutions.notifications.create.success.message"),
              color: "green",
            });
            setIsFormModalOpen(false);
          },
          onError: (error) => {
            console.error("Error creating institution:", error);
            notifications.show({
              title: t("feature.institutions.notifications.create.error.title"),
              message: t("feature.institutions.notifications.create.error.message"),
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
          <Title order={2}>{t("feature.institutions.title")}</Title>
          <Button loading={isSyncingBanks} onClick={onSyncBanks} variant="light">
            {t("feature.institutions.syncButton")}
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
        title={editingInstitution ? t("feature.institutions.form.titleEdit") : t("feature.institutions.form.titleCreate")}
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
