import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface DeleteButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
  modalTitle: string;
  modalMessage: string;
  onDelete: () => void;
  onCancel?: () => void;
}

export function DeleteButton({
  children,
  modalTitle,
  modalMessage,
  onDelete,
  onCancel,
}: Readonly<DeleteButtonProps>) {
  const [isModalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  return (
    <>
      <Modal
        centered
        opened={isModalOpened}
        onClose={closeModal}
        title={modalTitle}
        size="auto"
      >
        <DeleteDialog
          message={modalMessage}
          onDelete={() => {
            closeModal();
            onDelete();
          }}
          onCancel={() => {
            closeModal();

            if (onCancel) {
              onCancel();
            }
          }}
        />
      </Modal>
      <Button
        variant="outline"
        color="red"
        onClick={() => {
          openModal();
        }}
      >
        {children}
      </Button>
    </>
  );
}

interface DeleteDialogProps {
  message: string;
  cancelLabel?: string;
  deleteLabel?: string;
  onCancel: () => void;
  onDelete: () => void;
}
function DeleteDialog({
  message,
  cancelLabel = "Cancel",
  deleteLabel = "Delete",
  onCancel,
  onDelete,
}: Readonly<DeleteDialogProps>) {
  return (
    <Stack>
      <Text>{message}</Text>
      <Text size="sm"> This action and cannot be undone.</Text>
      <Group justify="flex-end">
        <Button onClick={onCancel}>{cancelLabel}</Button>
        <Button
          color="red"
          onClick={() => {
            onDelete();
          }}
        >
          {deleteLabel}
        </Button>
      </Group>
    </Stack>
  );
}
