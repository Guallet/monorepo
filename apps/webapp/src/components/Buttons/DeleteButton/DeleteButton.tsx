import { DeleteDialogConfirmation } from '@/components/Dialogs/DeleteDialogConfirmation';
import { Button } from '@/components/ui/button';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/utils';

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
  className,
  variant = 'outline',
  ...props
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
        variant={variant}
        className={cn(
          'border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive',
          className,
        )}
        {...props}
        onClick={() => {
          openModal();
        }}
      >
        {children}
      </Button>
    </>
  );
}
