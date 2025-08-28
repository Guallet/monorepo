import { useTransactionsWithFilter } from "@guallet/api-react";
import { Pagination, Stack } from "@mantine/core";
import { TransactionList } from "../components/TransactionList";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { TransactionScreenHeader } from "../components/TransactionScreenHeader";
import {
  FilterData,
  TransactionsFilterDataWrapper,
} from "../components/TransactionsFilter";

interface TransactionListScreenProps {
  page: number;
  pageSize: number;
  accounts: string[] | null;
  categories: string[] | null;
  dateRange: { startDate: Date; endDate: Date } | null;
  onPageChange: (page: number) => void;
  onAddTransaction: () => void;
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
  onFiltersUpdated,
}: Readonly<TransactionListScreenProps>) {
  const { transactions, metadata, isLoading } = useTransactionsWithFilter({
    page: page,
    pageSize: pageSize,
    accounts: selectedAccounts,
    categories: null,
    startDate: null,
    endDate: null,
  });

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack>
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
          onTransactionClicked={(transaction) =>
            console.log("Transaction clicked:", transaction.id)
          }
        />
        <Pagination
          style={{ alignSelf: "center" }}
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
