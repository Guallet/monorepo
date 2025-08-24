import { Modal, Group, Button, Text } from "@mantine/core";

interface DeleteDialogConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function DeleteDialogConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: Readonly<DeleteDialogConfirmationProps>) {
  return (
    <Modal opened={isOpen} onClose={onClose} title={title} centered>
      <Text>{message}</Text>
      <Group>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="filled" color="red" onClick={onConfirm}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
