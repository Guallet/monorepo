import { ActivityIndicator, View } from "react-native";
import { WidgetCard } from "./WidgetCard";
import { Label } from "@guallet/ui-react-native";
import { Money } from "@guallet/money";
import { useAccounts } from "@guallet/api-react";

interface TotalWealthWidgetProps
  extends React.ComponentProps<typeof WidgetCard> {}

export function TotalWealthWidget(props: TotalWealthWidgetProps) {
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
        <ActivityIndicator />
      ) : (
        <View>
          {balances.map((balance) => {
            return (
              <Label
                key={balance.currency.code}
                style={{
                  fontWeight: "500",
                  fontSize: 20,
                  alignSelf: "center",
                  marginBottom: 10,
                }}
              >
                {balance.format()}
              </Label>
            );
          })}
        </View>
      )}
    </WidgetCard>
  );
}

function getArraySum(array: number[]): number {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += Number(array[i]);
  }
  return sum;
}
