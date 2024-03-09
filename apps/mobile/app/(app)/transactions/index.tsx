import { useTransactions } from "@/features/transactions/useTransactions";
import { Icon, Label } from "@guallet/ui-react-native";
import { Stack } from "expo-router";
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

  const { transactions, isLoading } = useTransactions();

  return (
    <View>
      <Stack.Screen
        options={{
          title: "Transactions",
          headerTitleAlign: "center",
          headerRight: () => {
            return (
              <TouchableOpacity>
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

      <Label>Transactions</Label>
      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <View>
            <Label>{item.description}</Label>
          </View>
        )}
      />
    </View>
  );
}
