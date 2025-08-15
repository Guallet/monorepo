import { TransactionDto } from "@guallet/api-client";
import { WidgetCard } from "./WidgetCard";
import { useAccount, useTransactionInbox } from "@guallet/api-react";
import { Loader, Stack, Text, Group, Badge, Paper } from "@mantine/core";

function TransactionRow({
  transaction,
}: Readonly<{ transaction: TransactionDto }>) {
  const { account } = useAccount(transaction.accountId);
  return (
    <Paper withBorder radius="md" p="sm" mb="xs">
      <Group justify="space-between" align="flex-start">
        <div>
          <Badge color="blue" variant="light" mb={4}>
            {account?.name || "Unknown Account"}
          </Badge>
          <Text size="sm" fw={500}>
            {transaction.description}
          </Text>
        </div>
        <Text size="sm" fw={700}>
          {transaction.amount}
        </Text>
      </Group>
    </Paper>
  );
}

export function TransactionsInboxWidget({ onClick }: { onClick?: () => void }) {
  const { transactions, isLoading } = useTransactionInbox();

  return (
    <WidgetCard title="Transaction Inbox" onClick={onClick}>
      {isLoading ? (
        <Loader />
      ) : (
        <Stack>
          <Text size="sm" mb="xs">
            You have{" "}
            <Text span c="blue" fw={700}>
              {transactions.length}
            </Text>{" "}
            transactions to categorize
          </Text>
          {transactions.slice(0, 3).map((item: TransactionDto) => (
            <TransactionRow key={item.id} transaction={item} />
          ))}
        </Stack>
      )}
    </WidgetCard>
  );
}
