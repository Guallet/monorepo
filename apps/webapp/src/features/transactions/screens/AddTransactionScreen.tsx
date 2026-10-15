import { BaseScreen } from '@/components/Screens/BaseScreen';
import { useTransactionMutations } from '@guallet/api-react';
import { useTheme } from '@guallet/ui-react';
import { Box, Button, Card, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { CreateTransactionRequest } from '@guallet/api-client';
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

export function AddTransactionScreen() {
  const { t } = useTranslation();
  const { spacing } = useTheme();
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
          message: t(
            'screens.transactions.create.notifications.success.message',
            'Transaction created successfully.',
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
            'Failed to create transaction.',
          ),
          color: 'red',
        });
      },
    });
  }

  return (
    <BaseScreen
      title={t('screens.transactions.create.title', 'Add transaction')}
    >
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
                translationKeyPrefix="screens.transactions.create"
              />
            </Card>

            <Stack gap="xs" hiddenFrom="sm">
              <Button
                type="submit"
                fullWidth
                size="md"
                loading={createTransactionMutation.isPending}
              >
                {t(
                  'screens.transactions.create.form.submitButton.label',
                  'Add transaction',
                )}
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={() => navigate({ to: '/transactions' })}
              >
                {t(
                  'screens.transactions.create.form.cancelButton.label',
                  'Cancel',
                )}
              </Button>
            </Stack>
            <Group justify="flex-end" gap="xs" visibleFrom="sm">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/transactions' })}
              >
                {t(
                  'screens.transactions.create.form.cancelButton.label',
                  'Cancel',
                )}
              </Button>
              <Button
                type="submit"
                loading={createTransactionMutation.isPending}
              >
                {t(
                  'screens.transactions.create.form.submitButton.label',
                  'Add transaction',
                )}
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </BaseScreen>
  );
}
