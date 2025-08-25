import { DeleteDialogConfirmation } from "@/components/Dialogs/DeleteDialogConfirmation";
import { Button } from "@mantine/core";
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
