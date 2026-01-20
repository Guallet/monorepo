import { TransactionDto } from "@guallet/api-client";
import { WidgetCard } from "./WidgetCard";
import { useAccount, useTransactionInbox } from "@guallet/api-react";
import { Loader, Stack, Text, Group, Badge, Box, useMantineTheme, Center, ScrollArea } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";
import { Money } from "@guallet/money";

function TransactionRow({
  transaction,
}: Readonly<{ transaction: TransactionDto }>) {
  const { account } = useAccount(transaction.accountId);
  const theme = useMantineTheme();
  
  const amount = Money.fromCurrencyCode({
    currencyCode: transaction.currency,
    amount: Math.abs(transaction.amount),
  });

  const isIncome = transaction.amount > 0;

  return (
    <Box 
      p="sm" 
      mb="xs"
      style={{
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.gray[0],
        border: `1px solid ${theme.colors.gray[2]}`,
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
          <Text 
            size="sm" 
            fw={600}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {transaction.description}
          </Text>
          <Badge size="xs" color="blue" variant="light">
            {account?.name || "Unknown Account"}
          </Badge>
        </Stack>
        <Text 
          size="sm" 
          fw={700}
          c={isIncome ? "teal" : "red"}
          style={{ whiteSpace: 'nowrap', marginLeft: 8 }}
        >
          {isIncome ? '+' : '-'}{amount.format()}
        </Text>
      </Group>
    </Box>
  );
}

export function TransactionsInboxWidget({ onClick }: { onClick?: () => void }) {
  const { transactions, metadata, isLoading } = useTransactionInbox({ pageSize: 10 });
  const theme = useMantineTheme();

  return (
    <WidgetCard 
      title="Transaction Inbox" 
      icon={<IconInbox size={20} />}
      onClick={onClick}
    >
      {isLoading ? (
        <Center h={200}>
          <Loader size="md" />
        </Center>
      ) : (
        <Stack gap="sm">
          <Box
            p="sm"
            style={{
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.blue[0],
              border: `1px solid ${theme.colors.blue[2]}`,
            }}
          >
            <Text size="sm" ta="center">
              You have{" "}
              <Text span c="blue" fw={700} size="lg">
                {metadata?.total ?? 0}
              </Text>{" "}
              transactions to categorize
            </Text>
          </Box>
          
          {transactions.length > 0 ? (
            <ScrollArea h={200} type="auto">
              <Stack gap="xs">
                {transactions.slice(0, 5).map((item: TransactionDto) => (
                  <TransactionRow key={item.id} transaction={item} />
                ))}
              </Stack>
            </ScrollArea>
          ) : (
            <Center h={100}>
              <Text size="sm" c="dimmed">
                No pending transactions.
              </Text>
            </Center>
          )}
        </Stack>
      )}
    </WidgetCard>
  );
}
