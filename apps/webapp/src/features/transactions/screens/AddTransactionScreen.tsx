import { AppSection } from '@/components/Cards/AppSection';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useForm } from '@mantine/form';
import { useTransactionMutations } from '@guallet/api-react';
import { Button, Stack } from '@mantine/core';
import { CreateTransactionRequest } from '@guallet/api-client';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
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
  amount: z.number().gte(0, { error: 'Amount must be positive' }),
  currency: z.string().nullable(),
  date: z.date(),
  categoryId: z.string().optional().nullable(),
});

export function AddTransactionScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { createTransactionMutation } = useTransactionMutations();

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

  async function onFormSubmit(data: TransactionFormData): Promise<void> {
    console.log('Form submitted:', data);

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
      onSuccess: (data) => {
        console.log('Transaction created successfully:', data);
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
        <form onSubmit={form.onSubmit(onFormSubmit)}>
          <Stack>
            <TransactionFormFields
              form={form}
              translationKeyPrefix="screens.transactions.create"
              isCategoryRequired
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
