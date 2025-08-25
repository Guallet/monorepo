import { Modal, Group, Button, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface DeleteDialogConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  title: string;
  message: string;
  cancelLabel?: string;
  deleteLabel?: string;
  onCancel?: () => void;
}

export function DeleteDialogConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  cancelLabel,
  deleteLabel,
}: Readonly<DeleteDialogConfirmationProps>) {
  const { t } = useTranslation();

  const cancelButtonLabel = cancelLabel
    ? t(cancelLabel)
    : t("components.dialogs.delete.cancelButton.label", "Cancel");
  const deleteButtonLabel = deleteLabel
    ? t(deleteLabel)
    : t("components.dialogs.delete.deleteButton.label", "Delete");

  return (
    <Modal opened={isOpen} onClose={onClose} title={title} centered>
      <Text>{message}</Text>
      <Text size="sm">
        {t(
          "components.dialogs.delete.subWarning.text",
          "This action cannot be undone."
        )}
      </Text>
      <Group>
        <Button variant="outline" onClick={onClose}>
          {cancelButtonLabel}
        </Button>
        <Button variant="filled" color="red" onClick={onConfirm}>
          {deleteButtonLabel}
        </Button>
      </Group>
    </Modal>
  );
}
