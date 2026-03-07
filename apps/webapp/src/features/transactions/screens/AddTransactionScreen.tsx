import { AppSection } from '@/components/Cards/AppSection';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useTranslation } from 'react-i18next';
import { useTransactionMutations } from '@guallet/api-react';
import { Button, Stack } from '@mantine/core';
import { CreateTransactionRequest } from '@guallet/api-client';
import { notifications } from '@/lib/notifications';
import { useNavigate } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { TransactionFormFields } from '../components/TransactionFormFields';
import {
  getTransactionFormDefaultValues,
  transactionFormSchema,
  type TransactionFormData,
} from '../models/TransactionForm';

export function AddTransactionScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { createTransactionMutation } = useTransactionMutations();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: getTransactionFormDefaultValues(),
  });

  async function onFormSubmit(data: TransactionFormData): Promise<void> {
    const request = {
      accountId: data.accountId,
      description: data.description,
      notes: data.notes,
      amount: data.type === 'income' ? data.amount : -data.amount,
      currency: data.currency,
      date: data.date,
      categoryId: data.categoryId,
    } as CreateTransactionRequest;

    await createTransactionMutation.mutateAsync(request, {
      onSuccess: () => {
        notifications.show({
          title: t(
            'screens.transactions.create.notifications.success.title',
            'Success',
          ),
          message: t(
            'screens.transactions.create.notifications.success.message',
            'Transaction created successfully',
          ),
          color: 'green',
        });
        navigate({ to: '/transactions' });
      },
      onError: (error) => {
        console.error('Error creating transaction:', error);
        notifications.show({
          title: t(
            'screens.transactions.create.notifications.error.title',
            'Error',
          ),
          message: t(
            'screens.transactions.create.notifications.error.message',
            'Failed to create transaction',
          ),
          color: 'red',
        });
      },
    });
  }

  return (
    <BaseScreen>
      <AppSection
        title={t('screens.transactions.create.title', 'Add Transaction')}
      >
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
          <Stack>
            <TransactionFormFields
              form={form}
              translationKeyPrefix="screens.transactions.create"
            />

            <Button type="submit">
              {t(
                'screens.transactions.create.form.submitButton.label',
                'Add Transaction',
              )}
            </Button>
          </Stack>
        </form>
      </AppSection>
    </BaseScreen>
  );
}
