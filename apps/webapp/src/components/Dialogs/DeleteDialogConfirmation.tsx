import { ResponsiveModal } from '@guallet/ui-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

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
    : t('components.dialogs.delete.cancelButton.label', 'Cancel');
  const deleteButtonLabel = deleteLabel
    ? t(deleteLabel)
    : t('components.dialogs.delete.deleteButton.label', 'Delete');

  return (
    <ResponsiveModal opened={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <p>{message}</p>
        <p className="text-sm text-muted-foreground">
          {t(
            'components.dialogs.delete.subWarning.text',
            'This action cannot be undone.',
          )}
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {cancelButtonLabel}
          </Button>
          <Button
            type="button"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            {deleteButtonLabel}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
