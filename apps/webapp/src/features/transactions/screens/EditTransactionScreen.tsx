import { AppSection } from '@/components/Cards/AppSection';
import { CurrencyPicker } from '@/components/CurrencyPicker/CurrencyPicker';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { DeleteDialogConfirmation } from '@/components/Dialogs/DeleteDialogConfirmation';
import { AccountInput } from '@/features/accounts/components/AccountInput';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker/CategoryPicker';
import { CategoryDto, UpdateTransactionRequest } from '@guallet/api-client';
import {
  useCategory,
  useTransaction,
  useTransactionMutations,
  useAccount,
} from '@guallet/api-react';
import {
  Button,
  Group,
  NumberInput,
  SegmentedControl,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Currency } from '@guallet/money';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';

const formSchema = z.object({
  type: z.enum(['expense', 'income']),
  accountId: z.string().min(2, { error: 'Account ID is invalid' }),
  description: z
    .string()
    .min(2, { error: 'Description should have at least 2 letters' }),
  notes: z.string().optional().nullable(),
  amount: z.number().gt(0, { error: 'Amount must be positive' }),
  currency: z.string().nullable(),
  date: z.date(),
  categoryId: z.string().optional().nullable(),
});
type EditTransactionFormData = z.infer<typeof formSchema>;

interface EditTransactionScreenProps {
  transactionId: string;
}

export function EditTransactionScreen({
  transactionId,
}: Readonly<EditTransactionScreenProps>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { transaction, isLoading } = useTransaction(transactionId);
  const { account } = useAccount(transaction?.accountId);

  const { category } = useCategory(transaction?.categoryId ?? null);
  const { updateTransactionMutation, deleteTransactionMutation } =
    useTransactionMutations();
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null,
  );
  const syncedTransactionIdRef = useRef<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const form = useForm<EditTransactionFormData>({
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

  const defaultCurrency = useDefaultCurrency();
  const selectedCurrency = form.values.currency
    ? Currency.fromISOCode(form.values.currency)
    : Currency.fromISOCode(defaultCurrency);

  useEffect(() => {
    if (transaction && syncedTransactionIdRef.current !== transaction.id) {
      const accountCurrency = account?.currency ?? null;

      form.setValues({
        type: transaction.amount >= 0 ? 'income' : 'expense',
        accountId: transaction.accountId,
        description: transaction.description,
        notes: transaction.notes ?? '',
        amount: Math.abs(transaction.amount),
        currency: accountCurrency ?? transaction.currency ?? null,
        date: new Date(transaction.date),
        categoryId: transaction.categoryId ?? null,
      });
      syncedTransactionIdRef.current = transaction.id;
    }
  }, [account, form, transaction]);

  useEffect(() => {
    setSelectedCategory(category);
  }, [category]);

  useEffect(() => {
    console.log('Account changed, checking currency sync...');
    const selectedAccountCurrency = account?.currency ?? null;

    if (
      selectedAccountCurrency &&
      (form.values.currency === null || form.values.currency === undefined)
    ) {
      console.log(
        `Syncing currency to account's currency: ${selectedAccountCurrency}`,
      );
      form.setFieldValue('currency', selectedAccountCurrency);
      // setSelectedCurrency(Currency.fromISOCode(selectedAccountCurrency));
    }
  }, [account, form, form.values.accountId]);

  async function onFormSubmit(data: EditTransactionFormData) {
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
            <SegmentedControl
              value={form.values.type}
              onChange={(value) =>
                form.setFieldValue('type', value as 'expense' | 'income')
              }
              data={[
                {
                  value: 'expense',
                  label: t(
                    'screens.transactions.edit.form.type.expense',
                    'Expense',
                  ),
                },
                {
                  value: 'income',
                  label: t(
                    'screens.transactions.edit.form.type.income',
                    'Income',
                  ),
                },
              ]}
              fullWidth
              withItemsBorders
            />
            <TextInput
              required
              label={t(
                'screens.transactions.edit.form.description.label',
                'Description',
              )}
              placeholder={t(
                'screens.transactions.edit.form.description.placeholder',
                'Enter transaction description',
              )}
              {...form.getInputProps('description')}
            />
            <Textarea
              resize="vertical"
              label={t('screens.transactions.edit.form.notes.label', 'Notes')}
              placeholder={t(
                'screens.transactions.edit.form.notes.placeholder',
                'Enter transaction notes',
              )}
              {...form.getInputProps('notes')}
            />
            <AccountInput
              required
              label={t(
                'screens.transactions.edit.form.account.label',
                'Account',
              )}
              placeholder={t(
                'screens.transactions.edit.form.account.placeholder',
                'Select an account',
              )}
              {...form.getInputProps('accountId')}
            />
            <CurrencyPicker
              name="currency"
              required
              value={form.values.currency}
              label={t(
                'screens.transactions.edit.form.currency.label',
                'Currency',
              )}
              description={t(
                'screens.transactions.edit.form.currency.description',
                'The currency of the transaction',
              )}
              onValueChanged={(newValue) => {
                form.setFieldValue('currency', newValue);
              }}
            />
            <NumberInput
              required
              label={t('screens.transactions.edit.form.amount.label', 'Amount')}
              placeholder={t(
                'screens.transactions.edit.form.amount.placeholder',
                'Enter transaction amount',
              )}
              fixedDecimalScale
              leftSection={selectedCurrency.symbol}
              decimalScale={selectedCurrency.decimalPlaces}
              {...form.getInputProps('amount')}
            />

            <DateInput
              required
              label={t('screens.transactions.edit.form.date.label', 'Date')}
              placeholder={t(
                'screens.transactions.edit.form.date.placeholder',
                'Select transaction date',
              )}
              maxDate={new Date()}
              {...form.getInputProps('date')}
            />
            <CategoryPicker
              label={t(
                'screens.transactions.edit.form.category.label',
                'Category',
              )}
              placeholder={t(
                'screens.transactions.edit.form.category.placeholder',
                'Select a category',
              )}
              selectedCategory={selectedCategory}
              onCategorySelected={(category: CategoryDto) => {
                setSelectedCategory(category);
                form.setFieldValue('categoryId', category.id);
              }}
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
