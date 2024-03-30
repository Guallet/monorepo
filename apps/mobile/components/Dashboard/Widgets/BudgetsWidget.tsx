import { ActionIcon, Label, Spacing } from "@guallet/ui-react-native";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { WidgetCard } from "./WidgetCard";
import { useBudgets } from "@/features/budgets/useBudgets";
import { Money } from "@guallet/money";

interface BudgetsWidgetProps extends React.ComponentProps<typeof WidgetCard> {}
export function BudgetsWidget(props: BudgetsWidgetProps) {
  const { budgets, isLoading } = useBudgets();

  return (
    <WidgetCard title="Budgets">
      {isLoading ? (
        <ActivityIndicator />
      ) : budgets.length > 0 ? (
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignContent: "stretch",
            alignItems: "stretch",
            gap: Spacing.medium,
          }}
        >
          {budgets.map((budget) => {
            return (
              <BudgetRow
                key={budget.id}
                name={budget.name}
                amount={budget.amount}
                spent={Money.fromCurrencyCode({
                  amount: budget.spent,
                  currencyCode: "GBP",
                })}
              />
            );
          })}
        </View>
      ) : (
        <EmptyBudgetsView />
      )}
    </WidgetCard>
  );
}

function EmptyBudgetsView() {
  return (
    <View
      style={{
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: Spacing.medium,
        borderColor: "grey",
        borderWidth: 1,
        borderRadius: 16,
        padding: Spacing.medium,
        borderStyle: "dashed",
      }}
    >
      <Label>Create your first budget</Label>
      <ActionIcon name="plus" size={34} />
    </View>
  );
}

interface BudgetRowProps {
  name: string;
  amount: number;
  spent: Money;
}
function BudgetRow({ name, amount, spent }: BudgetRowProps) {
  const percentage = (spent.amount / amount) * 100;

  return (
    <View>
      <Label
        style={{
          fontWeight: "bold",
        }}
      >
        {name}
      </Label>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignContent: "center",
          alignItems: "center",
          gap: Spacing.medium,
        }}
      >
        <Label>{`${spent.format()} / ${Money.fromCurrencyCode({
          amount: amount,
          currencyCode: spent.currency.code,
        }).format()}`}</Label>
        <Label>{`${percentage.toFixed(0)}% spent`}</Label>
      </View>

      <ProgressBar progress={percentage} />
    </View>
  );
}

interface ProgressBarProps {
  progress: number;
}
function ProgressBar({ progress }: ProgressBarProps) {
  const color = progress >= 100 ? "red" : progress > 80 ? "orange" : "green";
  return (
    <View
      style={{
        backgroundColor: "grey",
        height: 20,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          backgroundColor: color,
          height: "100%",
          width: `${progress}%`,
        }}
      />
    </View>
  );
}
