import { WidgetCard } from "./WidgetCard";
import { useTransactions, useAccounts, useCategories } from "@guallet/api-react";
import { Loader, Stack, Text, Group, Box, Center, Badge, ScrollArea } from "@mantine/core";
import { IconReceipt, IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import { Money } from "@guallet/money";
import { useTheme } from "@guallet/ui-react";
import { useRouter } from "@tanstack/react-router";

const MAX_ITEMS = 8;

export function LastTransactionsWidget() {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { colors } = useTheme();
  const router = useRouter();

  const isLoading = transactionsLoading || accountsLoading || categoriesLoading;

  const lastTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MAX_ITEMS);

  const totalCount = transactions.length;

  return (
    <WidgetCard
      title="Recent Transactions"
      icon={<IconReceipt size={20} />}
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
          View all transactions →
        </Text>
      }
    >
      {isLoading ? (
        <Center h={280}>
          <Loader size="md" />
        </Center>
      ) : lastTransactions.length > 0 ? (
        <ScrollArea.Autosize mah={320}>
          <Stack gap="xs">
            {lastTransactions.map((transaction) => {
              const account = accounts.find(a => a.id === transaction.accountId);
              const category = categories.find(c => c.id === transaction.categoryId);
              const isIncome = transaction.amount > 0;

              const amount = Money.fromCurrencyCode({
                currencyCode: transaction.currency,
                amount: Math.abs(transaction.amount),
              });

              return (
                <Box
                  key={transaction.id}
                  p="sm"
                  style={{
                    borderRadius: '8px',
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.paleGrey}`,
                  }}
                >
                  <Group justify="space-between">
                    <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                      {isIncome ? (
                        <IconArrowUp size={14} style={{ color: colors.support, flexShrink: 0 }} />
                      ) : (
                        <IconArrowDown size={14} style={{ color: colors.error, flexShrink: 0 }} />
                      )}
                      <Text
                        fw={600}
                        size="sm"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {transaction.description}
                      </Text>
                    </Group>
                    <Text
                      fw={700}
                      size="sm"
                      style={{
                        color: isIncome ? colors.support : colors.error,
                        whiteSpace: 'nowrap',
                        marginLeft: 8,
                      }}
                    >
                      {isIncome ? '+' : '-'}{amount.format()}
                    </Text>
                  </Group>

                  <Group justify="space-between" mt="xs">
                    <Group gap="xs">
                      {account && (
                        <Badge size="xs" color="blue" variant="light">
                          {account.name}
                        </Badge>
                      )}
                      {category && (
                        <Badge
                          size="xs"
                          variant="light"
                          style={{
                            backgroundColor: category.colour || colors.paleGrey,
                            color: colors.white,
                          }}
                        >
                          {category.name}
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">
                      {new Date(transaction.date).toLocaleDateString()}
                    </Text>
                  </Group>
                </Box>
              );
            })}
            {totalCount > MAX_ITEMS && (
              <Text size="xs" c="dimmed" ta="center">
                +{totalCount - MAX_ITEMS} more transaction{totalCount - MAX_ITEMS !== 1 ? 's' : ''}
              </Text>
            )}
          </Stack>
        </ScrollArea.Autosize>
      ) : (
        <Center h={280}>
          <Stack gap="xs" align="center">
            <IconReceipt size={48} style={{ color: colors.paleGrey }} />
            <Text size="sm" c="dimmed" ta="center">
              No transactions found.
            </Text>
          </Stack>
        </Center>
      )}
    </WidgetCard>
  );
}