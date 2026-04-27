import { useAccounts } from "@guallet/api-react";
import { WidgetCard } from "./WidgetCard";
import { Money } from "@guallet/money";
import { Loader, Stack, Text, Group, Box, Center } from "@mantine/core";
import { IconWallet, IconTrendingUp } from "@tabler/icons-react";
import { useTheme } from "@guallet/ui-react";

function getArraySum(array: number[]): number {
  let sum = 0;
  for (const element of array) {
    sum += Number(element);
  }
  return sum;
}

export function TotalWealthWidget() {
  const { accounts, isLoading } = useAccounts();
  const { colors, spacing } = useTheme();

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
        <Stack gap={spacing.md} align="center" justify="center" h="100%">
          {balances.map((balance) => {
            const isPositive = balance.amount >= 0;
            const moneyColor = isPositive ? colors.support : colors.error;
            return (
              <Box key={balance.currency.code} style={{ textAlign: 'center', width: '100%' }}>
                <Group gap="xs" justify="center">
                  <IconTrendingUp
                    size={24}
                    style={{ color: moneyColor }}
                  />
                </Group>
                <Text
                  size="xl"
                  fw={700}
                  style={{ fontSize: '2rem', color: moneyColor }}
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