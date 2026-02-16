import { AppSection } from '@/components/Cards/AppSection';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { DeleteDialogConfirmation } from '@/components/Dialogs/DeleteDialogConfirmation';
import { UpdateTransactionRequest } from '@guallet/api-client';
import { useTransaction, useTransactionMutations } from '@guallet/api-react';
import { Button, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  TransactionFormData,
  TransactionFormFields,
} from '../components/TransactionFormFields';

const formSchema = z.object({
  type: z.enum(['expense', 'income']),
  accountId: z.string().min(2, { error: 'Account ID is invalid' }),
  description: z
    .string()
    .min(2, { error: 'Description should have at least 2 letters' }),
  notes: z.string().optional().nullable(),
  amount: z.number().gte(0, { error: 'Amount must be zero or greater' }),
  currency: z.string().nullable(),
  date: z.date(),
  categoryId: z.string().optional().nullable(),
});

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
  const form = useForm<TransactionFormData>({
    validate: zod4Resolver(formSchema),
    initialValues: {
      type: 'expense',
      accountId: '',
      description: '',
      notes: '',
      amount: 0,
      currency: null,
      date: new Date(),
      categoryId: null,
    },
  });

  useEffect(() => {
    if (transaction && syncedTransactionIdRef.current !== transaction.id) {
      form.setValues({
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
        <form onSubmit={form.onSubmit(onFormSubmit)}>
          <Stack>
            <TransactionFormFields
              form={form}
              translationKeyPrefix="screens.transactions.edit"
            />
            <Group>
              <Button type="submit">
                {t(
                  'screens.transactions.edit.form.submitButton.label',
                  'Update Transaction',
                )}
              </Button>
              <Button
                variant="outline"
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
                color="red"
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                }}
              >
                {t(
                  'screens.transactions.edit.form.deleteButton.label',
                  'Delete',
                )}
              </Button>
            </Group>
          </Stack>
        </form>
      </AppSection>
    </BaseScreen>
  );
}
