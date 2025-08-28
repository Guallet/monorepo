import { useTransactionsWithFilter } from "@guallet/api-react";
import { Pagination, Stack } from "@mantine/core";
import { TransactionList } from "../components/TransactionList";
import { BaseScreen } from "@/components/Screens/BaseScreen";
import { TransactionScreenHeader } from "../components/TransactionScreenHeader";

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
