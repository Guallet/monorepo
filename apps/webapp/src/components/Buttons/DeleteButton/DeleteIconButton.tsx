import { DeleteDialogConfirmation } from '@/components/Dialogs/DeleteDialogConfirmation';
import { Button } from '@/components/ui/button';
import { useDisclosure } from '@/hooks/useDisclosure';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

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
    tooltipText ?? t('components.buttons.deleteIconButton.tooltip', 'Delete');

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
        type="button"
        variant="ghost"
        size="icon"
        title={tooltipLabel}
        aria-label={tooltipLabel}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={openModal}
      >
        <IconTrash className="h-4 w-4" stroke={1.5} />
      </Button>
    </>
  );
}
