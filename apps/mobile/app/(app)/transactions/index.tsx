import { ModalSheet } from "@/components/ModalSheet/ModalSheet";
import { TransactionsList } from "@/components/Transactions/TransactionsList";
import { useTransactions } from "@/features/transactions/useTransactions";
import { Icon, Label, PrimaryButton } from "@guallet/ui-react-native";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type FilterData = {
  accounts: string[];
  categories: string[];
};

export default function TransactionsScreen() {
  const { isLoading } = useTransactions();

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

      <TransactionsList
        onTransactionSelected={(transaction) => {
          router.navigate({
            pathname: `/transactions/${transaction.id}`,
          });
        }}
      />

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
