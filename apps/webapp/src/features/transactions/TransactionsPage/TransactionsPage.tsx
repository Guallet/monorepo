import {
  LoaderFunction,
  useLoaderData,
  useNavigate,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { QueryMetadata, Transaction } from "../models/Transaction";
import { Stack, Text, Table, Pagination, Modal } from "@mantine/core";
import {
  TransactionQueryResultDto,
  loadTransactions,
  updateTransactionCategory as remoteUpdateTransactionCategory,
  updateTransactionNotes as remoteUpdateTransactionNotes,
  updateTransactionNotes,
} from "../api/transactions.api";
import { loadAccounts } from "../../accounts/api/accounts.api";
import { loadCategories } from "../../categories/api/categories.api";
import { SelectCategoryModal } from "./SelectCategoryModal";
import { Category } from "../../categories/models/Category";
import { useMediaQuery } from "@mantine/hooks";
import { EditNotesModal } from "./EditNotesModal";

const SELECTED_TRANSACTION_ID_QUERY = "id";
const EDIT_PARAM_ID_QUERY = "edit";
const EDIT_NOTES_QUERY_VALUE = "notes";
const EDIT_CATEGORY_QUERY_VALUE = "category";

interface ILoaderData {
  queryMeta: QueryMetadata;
  transactions: Transaction[];
  categories: Category[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page"));
  const pageSize = Number(url.searchParams.get("pageSize"));

  const sanitizedPage = page === 0 ? 1 : page;
  const sanitizedPageSize = pageSize === 0 ? 50 : pageSize;

  const accounts = await loadAccounts();
  const categories = await loadCategories();

  const result: TransactionQueryResultDto = await loadTransactions(
    sanitizedPage,
    sanitizedPageSize
  );

  const rehydratedTransactions = result.transactions.map((transaction) => {
    return {
      ...transaction,
      account: accounts.find((account) => account.id === transaction.accountId),
      category: categories.find(
        (category) => category.id === transaction.categoryId
      ),
    };
  });

  return {
    queryMeta: result.meta,
    transactions: rehydratedTransactions,
    categories: categories,
  };
};

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

export function TransactionsPage() {
  const { queryMeta, transactions, categories } =
    useLoaderData() as ILoaderData;
  console.log("Page data", { queryMeta, transactions, categories });
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const totalPages = Math.ceil(queryMeta.total / queryMeta.pageSize);

  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 50em)");

  const isSelectCategoryModalOpen =
    searchParams.get(EDIT_PARAM_ID_QUERY) === EDIT_CATEGORY_QUERY_VALUE;
  const isEditNotesModalOpen =
    searchParams.get(EDIT_PARAM_ID_QUERY) === EDIT_NOTES_QUERY_VALUE;

  const selectedTransactionId = searchParams.get(SELECTED_TRANSACTION_ID_QUERY);
  const selectedTransaction = transactions.find(
    (transaction) => transaction.id === selectedTransactionId
  );

  function hideModal(forceRefresh: boolean = false) {
    setSearchParams((params) => {
      params.delete(SELECTED_TRANSACTION_ID_QUERY);
      params.delete(EDIT_PARAM_ID_QUERY);
      return params;
    });

    if (forceRefresh) {
      revalidator.revalidate();
    }
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

  function showEditCategoryModal(transactionId: string) {
    setSearchParams((params) => {
      params.set(SELECTED_TRANSACTION_ID_QUERY, transactionId);
      params.set(EDIT_PARAM_ID_QUERY, EDIT_CATEGORY_QUERY_VALUE);
      return params;
    });
  }

  function showEditNotesModal(transactionId: string) {
    setSearchParams((params) => {
      params.set(SELECTED_TRANSACTION_ID_QUERY, transactionId);
      params.set(EDIT_PARAM_ID_QUERY, EDIT_NOTES_QUERY_VALUE);
      return params;
    });
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
              if (selectedTransactionId) {
                updateTransactionCategory(selectedTransactionId, category.id);
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
              if (selectedTransactionId) {
                await updateTransactionNotes(selectedTransactionId, x);
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
        <Text>Transactions list</Text>
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
            navigate(`/transactions?page=${page}`, { replace: true });
          }}
        />
        ;
      </Stack>
    </>
  );
}
