import { TransactionRow } from "@/components/Rows/TransactionRow";
import { useTransactions } from "@/features/transactions/useTransactions";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Icon, Label, PrimaryButton, Spacing } from "@guallet/ui-react-native";
import { Stack } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

type FilterData = {
  accounts: string[];
  categories: string[];
};

export default function AccountsScreen() {
  const [filter, setFilter] = useState<FilterData | null>(null);

  const { transactions, metadata, isLoading } = useTransactions();

  // hooks
  const filtersBottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const closeFilters = useCallback(() => {
    filtersBottomSheetModalRef.current?.dismiss();
  }, []);
  const openFilters = useCallback(() => {
    filtersBottomSheetModalRef.current?.present();
  }, []);

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
                  openFilters();
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

      <BottomSheetModal
        ref={filtersBottomSheetModalRef}
        // enableDynamicSizing={true}
        snapPoints={["90%"]}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.modalContentContainer}
        >
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: Spacing.medium,
                marginTop: Spacing.small,
              }}
            >
              <Label
                style={{
                  flexGrow: 1,
                  marginHorizontal: Spacing.medium,
                  textAlign: "center",
                }}
              >
                Transactions filters
              </Label>
              <Icon
                name="xmark"
                size={24}
                onPress={() => {
                  closeFilters();
                }}
                style={{
                  marginHorizontal: Spacing.medium,
                }}
              />
            </View>
            <TransactionsFilter />
          </>
        </BottomSheetScrollView>
      </BottomSheetModal>
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
    <View
      style={{
        flex: 1,
      }}
    >
      <Label>Accounts</Label>
      <Label>Categories</Label>
      <Label>Date range</Label>
      <PrimaryButton title="Save filters" />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    flex: 1,
    alignItems: "stretch",
  },
});
