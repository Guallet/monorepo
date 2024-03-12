import { ModalSheet } from "@/components/ModalSheet/ModalSheet";
import { TransactionRow } from "@/components/Rows/TransactionRow";
import { useTransactions } from "@/features/transactions/useTransactions";
import { Icon, Label, PrimaryButton, Spacing } from "@guallet/ui-react-native";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type FilterData = {
  accounts: string[];
  categories: string[];
};

export default function AccountsScreen() {
  const { transactions, metadata, isLoading } = useTransactions();

  const [filter, setFilter] = useState<FilterData | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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
                  setIsFilterModalOpen(true);
                }}
              >
                <Icon name="sliders" size={24} />
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

      <ModalSheet
        title="Transactions filters"
        snapPoints={["80%"]}
        isOpen={isFilterModalOpen}
        onClose={() => {
          setIsFilterModalOpen(false);
        }}
      >
        <TransactionsFilter />
      </ModalSheet>
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

export function TransactionsFilter() {
  return (
    <ScrollView
      style={
        {
          // flex: 1,
        }
      }
    >
      <Label>Accounts</Label>
      <Label>Categories</Label>
      <Label>Date range</Label>
      <PrimaryButton title="Save filters" />
    </ScrollView>
  );
}
