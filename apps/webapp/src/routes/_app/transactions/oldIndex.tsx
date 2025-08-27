import { loadAccounts } from "@/features/accounts/api/accounts.api";
import { Account } from "@/features/accounts/models/Account";
import { loadCategories } from "@/features/categories/api/categories.api";
import { EditNotesModal } from "@/features/transactions/TransactionsPage/EditNotesModal";
import { SelectCategoryModal } from "@/features/transactions/TransactionsPage/SelectCategoryModal";
import {
  TransactionQueryResultDto,
  loadTransactions,
  updateTransactionCategory as remoteUpdateTransactionCategory,
  updateTransactionNotes as remoteUpdateTransactionNotes,
} from "@/features/transactions/api/transactions.api";
import {
  FilterData,
  TransactionsFilter,
} from "@/features/transactions/components/TransactionsFilter";
import { Transaction } from "@/features/transactions/models/Transaction";

import { Stack, Table, Modal, Pagination, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

const transactionsSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(50),
  transactionId: z.string().optional(),
  editProperty: z.enum(["notes", "category"]).optional(),
  accounts: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
type SearchParams = z.infer<typeof transactionsSearchSchema>;

export const Route = createFileRoute("/_app/transactions/oldIndex")({
  component: TransactionsPage,
  validateSearch: transactionsSearchSchema,
  loaderDeps: ({
    search: { page, pageSize, accounts, categories, startDate, endDate },
  }) => ({
    page,
    pageSize,
    accounts,
    categories,
    startDate,
    endDate,
  }),
  loader: ({
    deps: { page, pageSize, accounts, categories, startDate, endDate },
  }) => loader({ page, pageSize, accounts, categories, startDate, endDate }),
  // errorComponent: (error) => (
  //   <Stack>
  //     <Text>Error loading transactions</Text>
  //     <Text>{JSON.stringify(error)}</Text>
  //   </Stack>
  // ),
});

async function loader(args: SearchParams) {
  const { page, pageSize, accounts, categories, startDate, endDate } = args;

  const allAccounts = await loadAccounts();
  const allCategories = await loadCategories();

  const result: TransactionQueryResultDto = await loadTransactions({
    page: page,
    pageSize: pageSize,
    // If all accounts selected, there is no need to filter by accounts
    accounts:
      (accounts?.length !== allAccounts.length ? accounts : null) ?? null,
    categories: categories && categories.length > 0 ? categories : null,
    startDate: startDate ?? null,
    endDate: endDate ?? null,
  });

  const rehydratedTransactions = result.transactions.map((transaction) => {
    return {
      ...transaction,
      account: allAccounts.find(
        (account) => account.id === transaction.accountId
      ),
      category: allCategories.find(
        (category) => category.id === transaction.categoryId
      ),
    };
  });

  return {
    queryMeta: result.meta,
    transactions: rehydratedTransactions as Transaction[],
    accounts: allAccounts,
    categories: allCategories,
  };
}

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  if (date.toDateString() === today.toDateString()) {
    return "today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "yesterday";
  } else if (date > twoWeeksAgo) {
    const daysAgo = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 3600 * 24)
    );
    return `${daysAgo} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function TransactionsPage() {
  const { queryMeta, transactions, accounts, categories } =
    Route.useLoaderData();

  const navigate = useNavigate({ from: Route.fullPath });
  const totalPages = Math.ceil(queryMeta.total / queryMeta.pageSize);

  const isMobile = useMediaQuery("(max-width: 50em)");
  const { transactionId, editProperty } = Route.useSearch();
  let { accounts: selectedAccountsIds } = Route.useSearch();

  const isSelectCategoryModalOpen = editProperty === "category";
  const isEditNotesModalOpen = editProperty === "notes";

  if (
    selectedAccountsIds === undefined ||
    selectedAccountsIds === null ||
    selectedAccountsIds.length === 0
  ) {
    // Map all the accounts to the selected accounts
    selectedAccountsIds = accounts.map((account) => account.id);
  }

  const selectedAccounts =
    selectedAccountsIds
      ?.map((id) => accounts.find((account) => account.id === id))
      .filter((item): item is Account => !!item) ?? [];

  const selectedTransaction = transactions.find(
    (transaction) => transaction.id === transactionId
  ) as Transaction | null;

  function hideModal(forceRefresh: boolean = false) {
    navigate({
      search: (prev) => ({
        ...prev,
        transactionId: undefined,
        editProperty: undefined,
      }),
    });

    if (forceRefresh) {
      Route.router?.invalidate();
    }
  }

  function showEditCategoryModal(transactionId: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        transactionId: transactionId,
        editProperty: "category",
      }),
    });
  }

  function showEditNotesModal(transactionId: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        transactionId: transactionId,
        editProperty: "notes",
      }),
    });
  }

  async function updateTransactionCategory(
    transactionId: string,
    categoryId: string
  ) {
    await remoteUpdateTransactionCategory({
      transactionId: transactionId,
      categoryId: categoryId,
    });
    hideModal(true);
  }

  async function updateTransactionNotes(transactionId: string, notes: string) {
    await remoteUpdateTransactionNotes({
      transactionId: transactionId,
      notes: notes,
    });
    hideModal(true);
  }

  function updateFiltersQuery(filters: FilterData) {
    console.log("Filters updated", filters);
    const isAllAccountsSelected =
      filters.selectedAccounts.length === accounts.length;
    navigate({
      search: (prev) => ({
        ...prev,
        accounts: isAllAccountsSelected
          ? undefined //If all accounts are selected, there is no need to filter by accounts
          : filters.selectedAccounts.map((account) => account.id),
        categories:
          filters.selectedCategories.length > 0
            ? filters.selectedCategories.map((category) => category.id)
            : undefined,
        startDate: filters.dateRange?.startDate,
        endDate: filters.dateRange?.endDate,
      }),
    });
  }

  return (
    <>
      <Modal
        title="Select category"
        opened={isSelectCategoryModalOpen || isEditNotesModalOpen}
        fullScreen={isMobile}
        onClose={() => {
          hideModal();
        }}
      >
        {isSelectCategoryModalOpen && (
          <SelectCategoryModal
            categories={categories}
            onSelectCategory={(category) => {
              if (transactionId) {
                updateTransactionCategory(transactionId, category.id);
              } else {
                console.error("No transaction selected");
                hideModal();
              }
            }}
          />
        )}
        {isEditNotesModalOpen && (
          <EditNotesModal
            notes={selectedTransaction?.notes ?? ""}
            onSave={async (x) => {
              if (transactionId) {
                await updateTransactionNotes(transactionId, x);
              } else {
                console.error("No transaction selected");
                hideModal();
              }
            }}
            onCancel={() => {
              hideModal();
            }}
          />
        )}
      </Modal>
      <Stack>
        <TransactionsFilter
          accounts={accounts}
          selectedAccounts={selectedAccounts}
          categories={categories}
          selectedCategories={[]}
          onFiltersUpdate={(filters) => {
            updateFiltersQuery(filters);
          }}
        />
        {transactions.length == 0 && <NoTransactionsFound />}
        {transactions.length > 0 && (
          <TransactionsTable
            transactions={transactions}
            onEditCategory={(transaction) => {
              showEditCategoryModal(transaction.id);
            }}
            onEditNotes={(transaction) => {
              showEditNotesModal(transaction.id);
            }}
          />
        )}
        {totalPages > 1 && (
          <Pagination
            total={totalPages}
            siblings={1}
            value={queryMeta.page}
            onChange={(page) => {
              navigate({
                search: (prev) => ({
                  ...prev,
                  page: page,
                }),
              });
            }}
          />
        )}
      </Stack>
    </>
  );
}

function NoTransactionsFound() {
  return (
    <Stack>
      <Text>There are no transactions matching the filter criteria</Text>
    </Stack>
  );
}

interface TransactionsTableProps {
  transactions: Transaction[];
  onEditCategory: (transaction: Transaction) => void;
  onEditNotes: (transaction: Transaction) => void;
}
function TransactionsTable({
  transactions,
  onEditCategory,
  onEditNotes,
}: TransactionsTableProps) {
  const rows = transactions.map((transaction) => (
    <Table.Tr key={transaction.id}>
      <Table.Td>{formatDate(new Date(transaction.date))}</Table.Td>
      <Table.Td>{transaction.account?.name}</Table.Td>
      <Table.Td
        onClick={() => {
          onEditNotes(transaction);
        }}
      >
        <Stack>
          <Text>{transaction.description}</Text>
          {transaction.notes && <Text size="xs">{transaction.notes}</Text>}
        </Stack>
      </Table.Td>
      <Table.Td>{transaction.amount}</Table.Td>
      <Table.Td
        onClick={() => {
          onEditCategory(transaction);
        }}
      >
        {transaction.category?.name}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={500}>
      <Table
        striped
        highlightOnHover
        withColumnBorders
        stickyHeader
        // stickyHeaderOffset={60}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Account</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Category</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
