import {
  useCategory,
  useTransactionMutations,
  useTransactionsWithFilter,
} from "@guallet/api-react";
import { CategoryDto, TransactionDto } from "@guallet/api-client";
import { ResponsiveModal } from "@guallet/ui-react";
import { Button, Group, Pagination, Stack, Textarea } from "@mantine/core";
import { TransactionList } from '../components/TransactionList';
import { BaseScreen } from '@/components/Screens/BaseScreen';
import { TransactionScreenHeader } from '../components/TransactionScreenHeader';
import {
  FilterData,
  TransactionsFilterDataWrapper,
} from '../components/TransactionsFilter';
import { useEffect, useState } from "react";
import { CategoryPicker } from "@/features/categories/components/CategoryPicker/CategoryPicker";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { notifications } from "@mantine/notifications";

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
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null
  );
  const { category } = useCategory(selectedTransaction?.categoryId ?? null);
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
  const quickEditForm = useForm<QuickEditTransactionData>({
    initialValues: {
      notes: "",
      categoryId: null,
    },
    validate: zod4Resolver(quickEditTransactionSchema),
  });

  useEffect(() => {
    if (selectedTransaction) {
      quickEditForm.setValues({
        notes: selectedTransaction.notes ?? "",
        categoryId: selectedTransaction.categoryId ?? null,
      });
    }
  }, [quickEditForm, selectedTransaction]);

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
        notes: data.notes ?? "",
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
        title: "Success",
        message: "Transaction updated successfully",
        color: "green",
      });
      setSelectedTransaction(null);
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to update transaction",
        color: "red",
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
          title="Quick edit transaction"
          size="lg"
        >
          <form
            onSubmit={quickEditForm.onSubmit((values) => {
              onQuickEditSubmit(values);
            })}
          >
            <Stack>
              <Textarea
                resize="vertical"
                label="Notes"
                placeholder="Enter transaction notes"
                {...quickEditForm.getInputProps("notes")}
              />
              <CategoryPicker
                label="Category"
                placeholder="Select a category"
                selectedCategory={selectedCategory}
                onCategorySelected={(selectedCategory) => {
                  setSelectedCategory(selectedCategory);
                  quickEditForm.setFieldValue("categoryId", selectedCategory.id);
                }}
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
                  Edit full transaction
                </Button>
                <Group>
                  <Button
                    variant="subtle"
                    type="button"
                    onClick={() => {
                      setSelectedTransaction(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
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
          onTransactionClicked={(transaction) => setSelectedTransaction(transaction)}
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
