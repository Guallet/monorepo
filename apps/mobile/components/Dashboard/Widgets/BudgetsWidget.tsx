import {
  ActionIcon,
  Label,
  PrimaryButton,
  Spacing,
} from "@guallet/ui-react-native";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { WidgetCard } from "./WidgetCard";
import { FlatList } from "react-native-gesture-handler";

interface BudgetsWidgetProps extends React.ComponentProps<typeof WidgetCard> {}
export function BudgetsWidget(props: BudgetsWidgetProps) {
  //   const { budgets, isLoading } = useBudgets();
  const isLoading = false;
  const budgets = [
    {
      name: "Groceries",
      amount: 600,
      spent: 500,
    },
    {
      name: "Takeaway",
      amount: 100,
      spent: 50,
    },
  ];

  return (
    <WidgetCard title="Budgets">
      {isLoading ? (
        <ActivityIndicator />
      ) : budgets.length > 0 ? (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            gap: Spacing.medium,
          }}
        >
          <FlatList
            showsHorizontalScrollIndicator={false}
            data={budgets}
            ItemSeparatorComponent={() => (
              <View style={{ height: Spacing.small }} />
            )}
            renderItem={({ item }) => {
              return (
                <BudgetRow
                  name={item.name}
                  amount={item.amount}
                  spent={item.spent}
                />
              );
            }}
          />
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
  spent: number;
}
function BudgetRow({ name, amount, spent }: BudgetRowProps) {
  const percentage = (spent / amount) * 100;

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
        <Label>{`£${spent} / £${amount}`}</Label>
        <Label>{`${percentage}% spent`}</Label>
      </View>

      <ProgressBar progress={percentage} />
    </View>
  );
}

interface ProgressBarProps {
  progress: number;
}
function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View
      style={{
        backgroundColor: "grey",
        height: 20,
      }}
    >
      <View
        style={{
          backgroundColor: "green",
          height: "100%",
          width: `${progress}%`,
        }}
      />
    </View>
  );
}
