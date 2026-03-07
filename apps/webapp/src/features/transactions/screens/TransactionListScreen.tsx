import {
  useCategory,
  useTransactionMutations,
  useTransactionsWithFilter,
} from '@guallet/api-react';
import { CategoryDto, TransactionDto } from '@guallet/api-client';
import { ResponsiveModal } from '@guallet/ui-react';
import { Button, Group, Pagination, Stack, Textarea } from '@mantine/core';
import { TransactionList } from '../components/TransactionList';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { TransactionScreenHeader } from '../components/TransactionScreenHeader';
import {
  FilterData,
  TransactionsFilterDataWrapper,
} from '../components/TransactionsFilter';
import { useEffect, useState } from 'react';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker/CategoryPicker';
import { z } from 'zod';
import { notifications } from '@/lib/notifications';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';

const quickEditTransactionSchema = z.object({
  notes: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
});
type QuickEditTransactionData = z.infer<typeof quickEditTransactionSchema>;

interface TransactionListScreenProps {
  page: number;
  pageSize: number;
  accounts: string[] | null;
  categories: string[] | null;
  dateRange: { startDate: Date; endDate: Date } | null;
  onPageChange: (page: number) => void;
  onAddTransaction: () => void;
  onEditTransaction: (transactionId: string) => void;
  onFiltersUpdated: (filters: FilterData) => void;
}

export function TransactionListScreen({
  page,
  pageSize,
  accounts: selectedAccounts,
  categories: selectedCategories,
  dateRange,
  onPageChange,
  onAddTransaction,
  onEditTransaction,
  onFiltersUpdated,
}: Readonly<TransactionListScreenProps>) {
  const { t } = useTranslation();
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null,
  );
  const quickEditForm = useForm<QuickEditTransactionData>({
    defaultValues: {
      notes: '',
      categoryId: null,
    },
    resolver: zodResolver(quickEditTransactionSchema),
  });
  const quickEditCategoryId =
    useWatch({ control: quickEditForm.control, name: 'categoryId' }) ?? null;
  const { category } = useCategory(quickEditCategoryId);
  const { updateTransactionNotesMutation, updateTransactionCategoryMutation } =
    useTransactionMutations();
  const { transactions, metadata, isLoading } = useTransactionsWithFilter({
    page: page,
    pageSize: pageSize,
    accounts: selectedAccounts,
    categories: null,
    startDate: null,
    endDate: null,
  });
  useEffect(() => {
    setSelectedCategory(category);
  }, [category]);

  async function onQuickEditSubmit(data: QuickEditTransactionData) {
    if (!selectedTransaction) {
      return;
    }

    try {
      await updateTransactionNotesMutation.mutateAsync({
        id: selectedTransaction.id,
        notes: data.notes ?? '',
      });

      if (
        data.categoryId &&
        selectedTransaction.categoryId !== data.categoryId
      ) {
        await updateTransactionCategoryMutation.mutateAsync({
          id: selectedTransaction.id,
          categoryId: data.categoryId,
        });
      }

      notifications.show({
        title: t(
          'screens.transactions.list.quickEdit.notifications.success.title',
          'Success',
        ),
        message: t(
          'screens.transactions.list.quickEdit.notifications.success.message',
          'Transaction updated successfully',
        ),
        color: 'green',
      });
      setSelectedTransaction(null);
    } catch {
      notifications.show({
        title: t(
          'screens.transactions.list.quickEdit.notifications.error.title',
          'Error',
        ),
        message: t(
          'screens.transactions.list.quickEdit.notifications.error.message',
          'Failed to update transaction',
        ),
        color: 'red',
      });
    }
  }

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack>
        <ResponsiveModal
          opened={!!selectedTransaction}
          onClose={() => {
            setSelectedTransaction(null);
          }}
          title={t(
            'screens.transactions.list.quickEdit.title',
            'Quick edit transaction',
          )}
          size="lg"
        >
          <form
            onSubmit={quickEditForm.handleSubmit((values) => {
              onQuickEditSubmit(values);
            })}
          >
            <Stack>
              <Controller
                name="notes"
                control={quickEditForm.control}
                render={({ field }) => (
                  <Textarea
                    resize="vertical"
                    label={t(
                      'screens.transactions.list.quickEdit.form.notes.label',
                      'Notes',
                    )}
                    placeholder={t(
                      'screens.transactions.list.quickEdit.form.notes.placeholder',
                      'Enter transaction notes',
                    )}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      field.onChange(event.currentTarget.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
              <Controller
                name="categoryId"
                control={quickEditForm.control}
                render={({ field }) => (
                  <CategoryPicker
                    label={t(
                      'screens.transactions.list.quickEdit.form.category.label',
                      'Category',
                    )}
                    placeholder={t(
                      'screens.transactions.list.quickEdit.form.category.placeholder',
                      'Select a category',
                    )}
                    selectedCategory={selectedCategory}
                    onCategorySelected={(selectedCategoryValue) => {
                      setSelectedCategory(selectedCategoryValue);
                      field.onChange(selectedCategoryValue.id || null);
                    }}
                  />
                )}
              />
              <Group justify="space-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (selectedTransaction) {
                      onEditTransaction(selectedTransaction.id);
                      setSelectedTransaction(null);
                    }
                  }}
                >
                  {t(
                    'screens.transactions.list.quickEdit.form.editFullButton.label',
                    'Edit full transaction',
                  )}
                </Button>
                <Group>
                  <Button
                    variant="subtle"
                    type="button"
                    onClick={() => {
                      setSelectedTransaction(null);
                    }}
                  >
                    {t(
                      'screens.transactions.list.quickEdit.form.cancelButton.label',
                      'Cancel',
                    )}
                  </Button>
                  <Button type="submit">
                    {t(
                      'screens.transactions.list.quickEdit.form.saveButton.label',
                      'Save',
                    )}
                  </Button>
                </Group>
              </Group>
            </Stack>
          </form>
        </ResponsiveModal>
        <TransactionScreenHeader onAddTransaction={onAddTransaction} />
        <TransactionsFilterDataWrapper
          selectedAccounts={selectedAccounts}
          selectedCategories={selectedCategories}
          dateRange={dateRange}
          onFiltersUpdate={(filters: FilterData) => {
            onFiltersUpdated(filters);
          }}
        />
        <TransactionList
          transactions={transactions}
          onTransactionClicked={(transaction) => {
            setSelectedTransaction(transaction);
            quickEditForm.reset({
              notes: transaction.notes ?? '',
              categoryId: transaction.categoryId ?? null,
            });
          }}
        />
        <Pagination
          style={{ alignSelf: 'center' }}
          withEdges
          total={metadata?.total ?? 0}
          siblings={1}
          value={page}
          onChange={(page) => {
            onPageChange(page);
          }}
        />
      </Stack>
    </BaseScreen>
  );
}
