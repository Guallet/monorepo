import { loadAccounts } from "@/features/accounts/api/accounts.api";
import { loadCategories } from "@/features/categories/api/categories.api";
import { EditNotesModal } from "@/features/transactions/TransactionsPage/EditNotesModal";
import { SelectCategoryModal } from "@/features/transactions/TransactionsPage/SelectCategoryModal";
import {
  TransactionQueryResultDto,
  loadTransactions,
  updateTransactionCategory as remoteUpdateTransactionCategory,
  updateTransactionNotes as remoteUpdateTransactionNotes,
} from "@/features/transactions/api/transactions.api";
import { TransactionsFilter } from "@/features/transactions/components/TransactionsFilter";

import { Stack, Table, Modal, Pagination, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { FileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

const transactionsSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(50),
  transactionId: z.string().optional(),
  accounts: z.array(z.string()).nullable().catch(null),
  editProperty: z.enum(["notes", "category"]).optional(),
});
type SearchParams = z.infer<typeof transactionsSearchSchema>;

export const Route = new FileRoute("/_app/transactions/").createRoute({
  component: TransactionsPage,
  validateSearch: transactionsSearchSchema,
  loaderDeps: ({ search: { page, pageSize, accounts } }) => ({
    page,
    pageSize,
    accounts,
  }),
  loader: ({ deps: { page, pageSize, accounts } }) =>
    loader({ page, pageSize, accounts }),
});

async function loader(args: SearchParams) {
  const { page, pageSize, accounts } = args;

  const allAccounts = await loadAccounts();
  const categories = await loadCategories();

  const result: TransactionQueryResultDto = await loadTransactions(
    page,
    pageSize,
    accounts
  );

  const rehydratedTransactions = result.transactions.map((transaction) => {
    return {
      ...transaction,
      account: allAccounts.find(
        (account) => account.id === transaction.accountId
      ),
      category: categories.find(
        (category) => category.id === transaction.categoryId
      ),
    };
  });

  return {
    queryMeta: result.meta,
    transactions: rehydratedTransactions,
    accounts: allAccounts,
    categories: categories,
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
  // const revalidator = useRevalidator();
  const totalPages = Math.ceil(queryMeta.total / queryMeta.pageSize);

  const isMobile = useMediaQuery("(max-width: 50em)");

  const { transactionId, editProperty } = Route.useSearch();

  const isSelectCategoryModalOpen = editProperty === "category";
  const isEditNotesModalOpen = editProperty === "notes";

  const selectedTransaction = transactions.find(
    (transaction) => transaction.id === transactionId
  );

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

  if (transactions.length == 0) {
    return (
      <Stack>
        <Text>You don't have any transactions yet</Text>
      </Stack>
    );
  }

  const rows = transactions.map((transaction) => (
    <Table.Tr key={transaction.id}>
      <Table.Td>{formatDate(new Date(transaction.date))}</Table.Td>
      <Table.Td>{transaction.account?.name}</Table.Td>
      <Table.Td
        onClick={() => {
          showEditNotesModal(transaction.id);
        }}
      >
        <Stack>
          <Text> {transaction.description}</Text>
          {transaction.notes && <Text size="xs">{transaction.notes}</Text>}
        </Stack>
      </Table.Td>
      <Table.Td>{transaction.amount}</Table.Td>
      <Table.Td
        onClick={() => {
          showEditCategoryModal(transaction.id);
        }}
      >
        {transaction.category?.name}
      </Table.Td>
    </Table.Tr>
  ));

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
          selectedAccounts={[]}
          categories={categories}
          selectedCategories={[]}
          onFiltersUpdate={(filters) => {
            console.log("Filters updated", filters);
          }}
        />
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
        ;
      </Stack>
    </>
  );
}
