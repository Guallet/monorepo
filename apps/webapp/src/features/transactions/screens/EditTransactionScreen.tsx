import { AppSection } from '@/components/Cards/AppSection';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { Button } from '@/components/ui/button';
import { DeleteDialogConfirmation } from '@/components/Dialogs/DeleteDialogConfirmation';
import { UpdateTransactionRequest } from '@guallet/api-client';
import { useTransaction, useTransactionMutations } from '@guallet/api-react';
import { notifications } from '@/lib/notifications';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { TransactionFormFields } from '../components/TransactionFormFields';
import {
  getTransactionFormDefaultValues,
  transactionFormSchema,
  type TransactionFormData,
} from '../models/TransactionForm';

interface EditTransactionScreenProps {
  transactionId: string;
}

export function EditTransactionScreen({
  transactionId,
}: Readonly<EditTransactionScreenProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { transaction, isLoading } = useTransaction(transactionId);
  const { updateTransactionMutation, deleteTransactionMutation } =
    useTransactionMutations();
  const syncedTransactionIdRef = useRef<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isSubmitting =
    updateTransactionMutation.isPending || deleteTransactionMutation.isPending;

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: getTransactionFormDefaultValues(),
  });

  useEffect(() => {
    if (transaction && syncedTransactionIdRef.current !== transaction.id) {
      form.reset({
        type: transaction.amount >= 0 ? 'income' : 'expense',
        accountId: transaction.accountId,
        description: transaction.description,
        notes: transaction.notes ?? '',
        amount: Math.abs(transaction.amount),
        currency: transaction.currency ?? null,
        date: new Date(transaction.date),
        categoryId: transaction.categoryId ?? null,
      });
      syncedTransactionIdRef.current = transaction.id;
    }
  }, [form, transaction]);

  async function onFormSubmit(data: TransactionFormData) {
    try {
      const request: UpdateTransactionRequest = {
        description: data.description,
        notes: data.notes ?? '',
        amount: data.type === 'income' ? data.amount : -data.amount,
        currency: data.currency,
        date: data.date,
        categoryId: data.categoryId ?? null,
      };

      await updateTransactionMutation.mutateAsync({
        id: transactionId,
        request,
      });

      notifications.show({
        title: t(
          'screens.transactions.edit.notifications.update.success.title',
          'Success',
        ),
        message: t(
          'screens.transactions.edit.notifications.update.success.message',
          'Transaction updated successfully',
        ),
        color: 'green',
      });
      navigate({ to: '/transactions' });
    } catch {
      notifications.show({
        title: t(
          'screens.transactions.edit.notifications.update.error.title',
          'Error',
        ),
        message: t(
          'screens.transactions.edit.notifications.update.error.message',
          'Failed to update transaction',
        ),
        color: 'red',
      });
    }
  }

  async function onDeleteTransaction() {
    try {
      await deleteTransactionMutation.mutateAsync({ id: transactionId });
      notifications.show({
        title: t(
          'screens.transactions.edit.notifications.delete.success.title',
          'Success',
        ),
        message: t(
          'screens.transactions.edit.notifications.delete.success.message',
          'Transaction deleted successfully',
        ),
        color: 'green',
      });
      navigate({ to: '/transactions' });
    } catch {
      notifications.show({
        title: t(
          'screens.transactions.edit.notifications.delete.error.title',
          'Error',
        ),
        message: t(
          'screens.transactions.edit.notifications.delete.error.message',
          'Failed to delete transaction',
        ),
        color: 'red',
      });
    }
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <DeleteDialogConfirmation
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
        }}
        onConfirm={() => {
          onDeleteTransaction();
        }}
        title={t(
          'screens.transactions.edit.deleteDialog.title',
          'Delete transaction',
        )}
        message={t(
          'screens.transactions.edit.deleteDialog.message',
          'Are you sure you want to delete this transaction?',
        )}
      />
      <AppSection
        title={t('screens.transactions.edit.title', 'Edit Transaction')}
      >
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
          <div className="flex flex-col gap-4">
            <TransactionFormFields
              form={form}
              translationKeyPrefix="screens.transactions.edit"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {t(
                  'screens.transactions.edit.form.submitButton.label',
                  'Update Transaction',
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  navigate({ to: '/transactions' });
                }}
              >
                {t(
                  'screens.transactions.edit.form.cancelButton.label',
                  'Cancel',
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                }}
              >
                {t(
                  'screens.transactions.edit.form.deleteButton.label',
                  'Delete',
                )}
              </Button>
            </div>
          </div>
        </form>
      </AppSection>
    </BaseScreen>
  );
}
