import { BaseScreen } from '@/components/Screens/BaseScreen';
import { DeleteDialogConfirmation } from '@/components/Dialogs/DeleteDialogConfirmation';
import { UpdateTransactionRequest } from '@guallet/api-client';
import { useTransaction, useTransactionMutations } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Box, Button, Card, Group, Stack } from '@mantine/core';
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
  const { spacing } = useTheme();
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
        message: t(
          'screens.transactions.edit.notifications.update.success.message',
          'Transaction updated successfully.',
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
          'Failed to update transaction.',
        ),
        color: 'red',
      });
    }
  }

  async function onDeleteTransaction() {
    try {
      await deleteTransactionMutation.mutateAsync({ id: transactionId });
      notifications.show({
        message: t(
          'screens.transactions.edit.notifications.delete.success.message',
          'Transaction deleted successfully.',
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
          'Failed to delete transaction.',
        ),
        color: 'red',
      });
    }
  }

  return (
    <BaseScreen
      isLoading={isLoading}
      title={t('screens.transactions.edit.title', 'Edit transaction')}
    >
      <DeleteDialogConfirmation
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={onDeleteTransaction}
        title={t(
          'screens.transactions.edit.deleteDialog.title',
          'Delete transaction',
        )}
        message={t(
          'screens.transactions.edit.deleteDialog.message',
          'Are you sure you want to delete this transaction?',
        )}
      />

      <Box maw={560} mx="auto">
        <form onSubmit={form.onSubmit(onFormSubmit)}>
          <Stack gap={spacing.md}>
            <Card
              withBorder
              shadow="sm"
              radius="lg"
              padding={{ base: 'md', sm: 'lg' }}
            >
              <TransactionFormFields
                form={form}
                translationKeyPrefix="screens.transactions.edit"
              />
            </Card>

            {/* Mobile: stack all actions */}
            <Stack gap="xs" hiddenFrom="sm">
              <Button
                type="submit"
                fullWidth
                size="md"
                loading={updateTransactionMutation.isPending}
              >
                {t(
                  'screens.transactions.edit.form.submitButton.label',
                  'Save changes',
                )}
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={() => navigate({ to: '/transactions' })}
              >
                {t(
                  'screens.transactions.edit.form.cancelButton.label',
                  'Cancel',
                )}
              </Button>
              <Button
                variant="outline"
                color="red"
                fullWidth
                size="md"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                {t(
                  'screens.transactions.edit.form.deleteButton.label',
                  'Delete',
                )}
              </Button>
            </Stack>

            {/* Desktop: delete left, cancel + save right */}
            <Group justify="space-between" visibleFrom="sm">
              <Button
                variant="outline"
                color="red"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                {t(
                  'screens.transactions.edit.form.deleteButton.label',
                  'Delete',
                )}
              </Button>
              <Group gap="xs">
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: '/transactions' })}
                >
                  {t(
                    'screens.transactions.edit.form.cancelButton.label',
                    'Cancel',
                  )}
                </Button>
                <Button
                  type="submit"
                  loading={updateTransactionMutation.isPending}
                >
                  {t(
                    'screens.transactions.edit.form.submitButton.label',
                    'Save changes',
                  )}
                </Button>
              </Group>
            </Group>
          </Stack>
        </form>
      </Box>
    </BaseScreen>
  );
}
