import { TransactionDto } from "@guallet/api-client";
import { WidgetCard } from "./WidgetCard";
import { useAccount, useTransactionInbox } from "@guallet/api-react";
import { Loader, Stack, Text, Group, Badge, Box, Center, ScrollArea } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";
import { Money } from "@guallet/money";
import { useTheme } from "@guallet/ui-react";
import { useRouter } from "@tanstack/react-router";

function TransactionRow({
  transaction,
}: Readonly<{ transaction: TransactionDto }>) {
  const { account } = useAccount(transaction.accountId);
  const { colors } = useTheme();

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
        borderRadius: '8px',
        backgroundColor: colors.surface,
        border: `1px solid ${colors.paleGrey}`,
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
          style={{
            color: isIncome ? colors.support : colors.error,
            whiteSpace: 'nowrap',
            marginLeft: 8,
          }}
        >
          {isIncome ? '+' : '-'}{amount.format()}
        </Text>
      </Group>
    </Box>
  );
}

export function TransactionsInboxWidget() {
  const { transactions, metadata, isLoading } = useTransactionInbox({ pageSize: 10 });
  const { colors } = useTheme();
  const router = useRouter();

  const hasTransactions = transactions.length > 0;
  const totalPending = metadata?.total ?? 0;

  return (
    <WidgetCard
      title="Transaction Inbox"
      icon={<IconInbox size={20} />}
      footer={
        <Text
          component="a"
          size="sm"
          fw={500}
          style={{
            color: colors.primary,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'block',
            textAlign: 'center',
          }}
          onClick={() => router.navigate({ to: '/transactions' })}
        >
          View inbox →
        </Text>
      }
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
              borderRadius: '8px',
              backgroundColor: `${colors.primary}12`,
              border: `1px solid ${colors.primary}40`,
            }}
          >
            <Text size="sm" ta="center">
              You have{" "}
              <Text span c="blue" fw={700} size="lg">
                {totalPending}
              </Text>{" "}
              transaction{totalPending !== 1 ? 's' : ''} to categorize
            </Text>
          </Box>

          {hasTransactions ? (
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