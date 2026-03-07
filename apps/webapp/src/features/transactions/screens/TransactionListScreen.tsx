import {
  useCategory,
  useTransactionMutations,
  useTransactionsWithFilter,
} from '@guallet/api-react';
import { CategoryDto, TransactionDto } from '@guallet/api-client';
import { ResponsiveModal } from '@guallet/ui-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TransactionList } from '../components/TransactionList';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { TransactionScreenHeader } from '../components/TransactionScreenHeader';
import {
  FilterData,
  TransactionsFilterDataWrapper,
} from '../components/TransactionsFilter';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker/CategoryPicker';
import { z } from 'zod';
import { notifications } from '@/lib/notifications';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';

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

function buildPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis-left' | 'ellipsis-right'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    items.push('ellipsis-left');
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push('ellipsis-right');
  }

  items.push(totalPages);

  return items;
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

  const totalPages = metadata?.total ?? 0;
  const paginationItems = useMemo(
    () => buildPaginationItems(page, totalPages),
    [page, totalPages],
  );

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
      <div className="flex flex-col gap-4">
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
            <div className="flex flex-col gap-4">
              <Controller
                name="notes"
                control={quickEditForm.control}
                render={({ field }) => (
                  <div className="grid gap-2">
                    <Label htmlFor="transaction-quick-edit-notes">
                      {t(
                        'screens.transactions.list.quickEdit.form.notes.label',
                        'Notes',
                      )}
                    </Label>
                    <textarea
                      id="transaction-quick-edit-notes"
                      className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder={t(
                        'screens.transactions.list.quickEdit.form.notes.placeholder',
                        'Enter transaction notes',
                      )}
                      value={field.value ?? ''}
                      onChange={(event) => {
                        field.onChange(event.target.value);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </div>
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
              <div className="flex flex-wrap items-center justify-between gap-2">
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
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
                </div>
              </div>
            </div>
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

        {totalPages > 0 ? (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                onPageChange(1);
              }}
            >
              First
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                onPageChange(Math.max(1, page - 1));
              }}
            >
              Prev
            </Button>

            {paginationItems.map((item) => {
              if (item === 'ellipsis-left' || item === 'ellipsis-right') {
                return (
                  <span
                    key={item}
                    className="px-2 text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                );
              }

              return (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={item === page ? 'default' : 'outline'}
                  onClick={() => {
                    onPageChange(item);
                  }}
                >
                  {item}
                </Button>
              );
            })}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                onPageChange(Math.min(totalPages, page + 1));
              }}
            >
              Next
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                onPageChange(totalPages);
              }}
            >
              Last
            </Button>
          </div>
        ) : null}
      </div>
    </BaseScreen>
  );
}
