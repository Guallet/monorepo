import { ScrollView } from "react-native";

import React from "react";
import { TransactionsInboxWidget } from "@/components/Dashboard/Widgets/TransactionInboxWidget";
import { router } from "expo-router";
import { AppScreen } from "@/components/Layout/AppScreen";

export default function DashboardScreen() {
  return (
    <AppScreen>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <TransactionsInboxWidget
          onClick={() => {
            router.navigate({
              pathname: "/transactions/inbox",
            });
          }}
        />
      </ScrollView>
    </AppScreen>
  );
}
