import { ScrollView } from "react-native";

import React from "react";
import { TransactionsInboxWidget } from "@/components/Dashboard/Widgets/TransactionInboxWidget";
import { router } from "expo-router";

export default function DashboardScreen() {
  return (
    <ScrollView
      style={{
        flex: 1,
      }}
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
  );
}
