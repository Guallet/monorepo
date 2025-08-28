import { useAccounts, useTransactionsWithFilter } from "@guallet/api-react";
import { Pagination, Stack } from "@mantine/core";
import { TransactionList } from "../components/TransactionList";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { TransactionScreenHeader } from "../components/TransactionScreenHeader";
import {
  FilterData,
  TransactionsFilter,
} from "../components/TransactionsFilter/TransactionsFilter";
import { TransactionsFilterDataWrapper } from "../components/TransactionsFilter";

interface TransactionListScreenProps {
  page: number;
  pageSize: number;
  accounts: string[];
  onPageChange: (page: number) => void;
  onAddTransaction: () => void;
}

export function TransactionListScreen({
  page,
  pageSize,
  accounts,
  onPageChange,
  onAddTransaction,
}: Readonly<TransactionListScreenProps>) {
  const { transactions, metadata, isLoading } = useTransactionsWithFilter({
    page: page,
    pageSize: pageSize,
    accounts: accounts,
    categories: null,
    startDate: null,
    endDate: null,
  });

  return (
    <BaseScreen isLoading={isLoading}>
      <Stack>
        <TransactionScreenHeader onAddTransaction={onAddTransaction} />
        <TransactionsFilterDataWrapper
          selectedAccounts={[]}
          selectedCategories={[]}
          onFiltersUpdate={(filters: FilterData) => {
            console.log("Filters updated:", filters);
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
