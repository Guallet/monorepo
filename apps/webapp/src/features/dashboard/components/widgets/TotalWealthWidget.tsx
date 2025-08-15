import { useAccounts } from "@guallet/api-react";
import { WidgetCard } from "./WidgetCard";
import { Money } from "@guallet/money";
import { Loader, Stack, Text } from "@mantine/core";

function getArraySum(array: number[]): number {
  let sum = 0;
  for (const element of array) {
    sum += Number(element);
  }
  return sum;
}

export function TotalWealthWidget() {
  const { accounts, isLoading } = useAccounts();

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
    <WidgetCard title="Total Wealth">
      {isLoading ? (
        <Loader />
      ) : (
        <Stack>
          {balances.map((balance) => {
            return (
              <Text
                key={balance.currency.code}
                style={{
                  fontWeight: "500",
                  fontSize: 20,
                  alignSelf: "center",
                  marginBottom: 10,
                }}
              >
                {balance.format()}
              </Text>
            );
          })}
        </Stack>
      )}
    </WidgetCard>
  );
}
