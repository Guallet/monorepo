import { DeleteDialogConfirmation } from "@/components/Dialogs/DeleteDialogConfirmation";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface DeleteIconButtonProps {
  modalTitle: string;
  modalMessage: string;
  onDelete: () => void;
  onCancel?: () => void;
  tooltipText?: string;
}

export function DeleteIconButton({
  modalTitle,
  modalMessage,
  onDelete,
  onCancel,
  tooltipText,
}: Readonly<DeleteIconButtonProps>) {
  const { t } = useTranslation();
  const [isModalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const tooltipLabel =
    tooltipText || t("components.buttons.deleteIconButton.tooltip", "Delete");

  return (
    <>
      <DeleteDialogConfirmation
        isOpen={isModalOpened}
        onClose={() => {
          onCancel?.();
          closeModal();
        }}
        onConfirm={() => {
          onDelete();
          closeModal();
        }}
        title={modalTitle}
        message={modalMessage}
      />
      <Tooltip label={tooltipLabel}>
        <ActionIcon variant="light" color="red" onClick={openModal}>
          <IconTrash style={{ width: "70%", height: "70%" }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
