import { useAccounts } from "@guallet/api-react";
import { WidgetCard } from "./WidgetCard";
import { Money } from "@guallet/money";
import { Loader, Stack, Text, Group, Box, useMantineTheme, Center } from "@mantine/core";
import { IconWallet, IconTrendingUp } from "@tabler/icons-react";

function getArraySum(array: number[]): number {
  let sum = 0;
  for (const element of array) {
    sum += Number(element);
  }
  return sum;
}

export function TotalWealthWidget() {
  const { accounts, isLoading } = useAccounts();
  const theme = useMantineTheme();

  const currencies = new Set(
    accounts.map((account) => account.balance.currency)
  );

  const balances = [...currencies].map((currency) => {
    const currencyAccounts = accounts
      .filter((x) => x.currency === currency)
      .map((account) => {
        return Number(account.balance.amount);
      });
    const balance = getArraySum(currencyAccounts);
    return Money.fromCurrencyCode({
      currencyCode: currency,
      amount: balance,
    });
  });

  return (
    <WidgetCard 
      title="Total Wealth" 
      icon={<IconWallet size={20} />}
    >
      {isLoading ? (
        <Center h={100}>
          <Loader size="md" />
        </Center>
      ) : (
        <Stack gap="md" align="center" justify="center" h="100%">
          {balances.map((balance) => {
            const isPositive = balance.amount >= 0;
            return (
              <Box key={balance.currency.code} style={{ textAlign: 'center', width: '100%' }}>
                <Group gap="xs" justify="center" mb="xs">
                  <IconTrendingUp 
                    size={24} 
                    style={{ 
                      color: isPositive ? theme.colors.teal[6] : theme.colors.red[6]
                    }} 
                  />
                </Group>
                <Text
                  size="xl"
                  fw={700}
                  c={isPositive ? "teal" : "red"}
                  style={{ fontSize: '2rem' }}
                >
                  {balance.format()}
                </Text>
                <Text size="xs" c="dimmed" mt="xs">
                  Across {accounts.filter(a => a.currency === balance.currency.code).length} accounts
                </Text>
              </Box>
            );
          })}
        </Stack>
      )}
    </WidgetCard>
  );
}
