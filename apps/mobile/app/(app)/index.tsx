import { ScrollView } from "react-native";

import React from "react";
import { TransactionsInboxWidget } from "@/components/Dashboard/Widgets/TransactionInboxWidget";
import { router } from "expo-router";
import { AppScreen } from "@/components/layout/AppScreen";
import { TotalWealthWidget } from "@/components/Dashboard/Widgets/TotalWealthWidget";
import { Spacing } from "@guallet/ui-react-native";
import { MonthlyInAndOutWidget } from "@/components/Dashboard/Widgets/MonthlyInAndOutWidget";
import { BudgetsWidget } from "@/components/Dashboard/Widgets/BudgetsWidget";

export default function DashboardScreen() {
  return (
    <AppScreen
      style={{
        paddingHorizontal: Spacing.medium,
        paddingBottom: Spacing.medium,
      }}
    >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <TotalWealthWidget />
        <MonthlyInAndOutWidget />
        <TransactionsInboxWidget
          onClick={() => {
            router.navigate({
              pathname: "/transactions/inbox",
            });
          }}
        />
        <BudgetsWidget />
      </ScrollView>
    </AppScreen>
  );
}
