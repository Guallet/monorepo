import { useTransactionsWithFilter } from "@guallet/api-react";
import { Pagination, Stack } from "@mantine/core";
import { TransactionList } from "../components/TransactionList";

interface TransactionListScreenProps {
  page: number;
  pageSize: number;
  accounts: string[];
  onPageChange: (page: number) => void;
}

export function TransactionListScreen({
  page,
  pageSize,
  accounts,
  onPageChange,
}: Readonly<TransactionListScreenProps>) {
  const { transactions, metadata } = useTransactionsWithFilter({
    page: page,
    pageSize: pageSize,
    accounts: accounts,
    categories: null,
    startDate: null,
    endDate: null,
  });

  return (
    <Stack>
      <TransactionList
        transactions={transactions}
        onTransactionClicked={(transaction) =>
          console.log("Transaction clicked:", transaction.id)
        }
      />
      <Pagination
        withEdges
        total={metadata?.total ?? 0}
        siblings={1}
        value={page}
        onChange={(page) => {
          onPageChange(page);
        }}
      />
    </Stack>
  );
}
