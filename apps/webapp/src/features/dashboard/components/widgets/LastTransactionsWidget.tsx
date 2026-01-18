import { WidgetCard } from "./WidgetCard";
import { useTransactions, useAccounts, useCategories } from "@guallet/api-react";
import { Loader, Stack, Text, Group, Box, useMantineTheme, Center, Badge, ScrollArea } from "@mantine/core";
import { IconReceipt, IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import { Money } from "@guallet/money";

export function LastTransactionsWidget() {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const theme = useMantineTheme();

  const isLoading = transactionsLoading || accountsLoading || categoriesLoading;

  // Get last 10 transactions sorted by date
  const lastTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <WidgetCard 
      title="Recent Transactions" 
      icon={<IconReceipt size={20} />}
    >
      {isLoading ? (
        <Center h={300}>
          <Loader size="md" />
        </Center>
      ) : lastTransactions.length > 0 ? (
        <ScrollArea h={300} type="auto">
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
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.gray[0],
                    border: `1px solid ${theme.colors.gray[2]}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                      {isIncome ? (
                        <IconArrowUp size={16} color={theme.colors.teal[6]} />
                      ) : (
                        <IconArrowDown size={16} color={theme.colors.red[6]} />
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
                      c={isIncome ? "teal" : "red"}
                      style={{ whiteSpace: 'nowrap' }}
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
                            backgroundColor: category.colour || theme.colors.gray[2],
                            color: theme.white,
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
          </Stack>
        </ScrollArea>
      ) : (
        <Center h={300}>
          <Stack gap="xs" align="center">
            <IconReceipt size={48} color={theme.colors.gray[4]} />
            <Text size="sm" c="dimmed" ta="center">
              No transactions found.
            </Text>
          </Stack>
        </Center>
      )}
    </WidgetCard>
  );
}
