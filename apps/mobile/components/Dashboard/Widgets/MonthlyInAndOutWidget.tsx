import { ActivityIndicator, View } from "react-native";
import { WidgetCard } from "./WidgetCard";
import { Icon, Label, Spacing } from "@guallet/ui-react-native";
import { Money } from "@guallet/money";
import { useTransactions } from "@guallet/api-react";

interface MonthlyInAndOutWidgetProps
  extends React.ComponentProps<typeof WidgetCard> {}

export function MonthlyInAndOutWidget(props: MonthlyInAndOutWidgetProps) {
  const { transactions, isLoading } = useTransactions();

  const totalIn = getArraySum(
    transactions.map((x) => x.amount).filter((x) => x > 0)
  );
  const totalOut = getArraySum(
    transactions.map((x) => x.amount).filter((x) => x < 0)
  );

  return (
    <WidgetCard title="This month">
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignContent: "center",
            alignItems: "center",
            gap: Spacing.medium,
          }}
        >
          <MoneyCard type="in" amount={totalIn} currency="GBP" />
          <MoneyCard type="out" amount={totalOut} currency="GBP" />
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

interface MoneyCardProps {
  type: "in" | "out";
  amount: number;
  currency: string;
}
function MoneyCard({ type, amount, currency }: MoneyCardProps) {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          gap: Spacing.small,
          alignSelf: "center",
        }}
      >
        <Icon
          name={type === "in" ? "arrow-up" : "arrow-down"}
          color={type === "in" ? "green" : "red"}
        />
        <Label
          style={{
            fontWeight: "500",
            fontSize: 20,
            marginBottom: 10,
            color: type === "in" ? "green" : "red",
          }}
        >
          {type === "in" ? "In" : "Out"}
        </Label>
      </View>

      <Label style={{ fontSize: 15, alignSelf: "center", fontWeight: "700" }}>
        {Money.fromCurrencyCode({
          currencyCode: currency,
          amount: amount,
        }).format()}
      </Label>
    </View>
  );
}
