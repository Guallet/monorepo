import { TransactionRow } from "@/components/Rows/TransactionRow";
import { useTransactions } from "@/features/transactions/useTransactions";
import { Icon, Label } from "@guallet/ui-react-native";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

type FilterData = {
  accounts: string[];
  categories: string[];
};

export default function AccountsScreen() {
  const [filter, setFilter] = useState<FilterData | null>(null);

  const { transactions, metadata, isLoading } = useTransactions();

  return (
    <View>
      <Stack.Screen
        options={{
          title: "Transactions",
          headerTitleAlign: "center",
          headerRight: () => {
            return (
              <TouchableOpacity
                onPress={() => {
                  // router.push("/(app)/transactions/filters");
                }}
              >
                <Icon
                  name={filter === null ? "filter" : "filter-circle-xmark"}
                  size={24}
                />
              </TouchableOpacity>
            );
          },
        }}
      />

      {isLoading && (
        <View>
          <ActivityIndicator />
        </View>
      )}

      <TransactionsList />
    </View>
  );
}

function TransactionsList() {
  const { transactions, metadata, isLoading } = useTransactions();

  return (
    <FlatList
      data={transactions}
      renderItem={({ item }) => (
        <TransactionRow
          transaction={item}
          onClick={(transaction) => {
            console.log("Transaction clicked", transaction);
          }}
        />
      )}
    />
  );
}
