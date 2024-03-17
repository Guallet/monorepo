import { ActivityIndicator, View } from "react-native";
import { WidgetCard } from "./WidgetCard";
import { Label } from "@guallet/ui-react-native";
import { FlatList } from "react-native-gesture-handler";
import { useAccounts } from "@/features/accounts/useAccounts";
import { Money } from "@guallet/money";

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
          <FlatList
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            data={balances}
            renderItem={({ item }) => (
              <Label
                style={{
                  fontWeight: "500",
                  fontSize: 20,
                  alignSelf: "center",
                  marginBottom: 10,
                }}
              >
                {item.format()}
              </Label>
            )}
          />
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
