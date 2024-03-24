import { ModalSheet } from "@/components/ModalSheet/ModalSheet";
import { TransactionsList } from "@/components/Transactions/TransactionsList";
import { useInfiniteTransactions } from "@/features/transactions/useTransactions";
import { Icon, Label, PrimaryButton, Spacing } from "@guallet/ui-react-native";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type FilterData = {
  accounts: string[];
  categories: string[];
};

export default function TransactionsScreen() {
  const { transactions, isFetching, fetchNextPage, status } =
    useInfiniteTransactions();

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

      {/* {status === "pending" && (
        <View>
          <ActivityIndicator />
        </View>
      )} */}

      <View
        style={{
          paddingHorizontal: Spacing.small,
          paddingTop: Spacing.small,
        }}
      >
        <TransactionsList
          transactions={transactions}
          onEndReached={() => {
            fetchNextPage();
            // if (metadata?.hasMore) {
            //   // Load next page
            //   console.log("Load next page", metadata.page + 1);
            //   fetchNextPage();
            // } else {
            //   console.log("No more pages. Last page: " + metadata?.page);
            // }
          }}
          onTransactionSelected={(transaction) => {
            router.navigate({
              pathname: `/transactions/${transaction.id}`,
            });
          }}
        />
      </View>

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
