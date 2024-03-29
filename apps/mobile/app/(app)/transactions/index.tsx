import { AppScreen } from "@/components/Layout/AppScreen";
import { ModalSheet } from "@/components/ModalSheet/ModalSheet";
import { TransactionsList } from "@/components/Transactions/TransactionsList";
import { useInfiniteTransactions } from "@/features/transactions/useTransactions";
import {
  ActionIcon,
  Label,
  PrimaryButton,
  Row,
  Spacing,
} from "@guallet/ui-react-native";
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
    <AppScreen
      headerOptions={{
        title: "Transactions",
        headerTitleAlign: "center",
        headerRight: () => {
          return (
            <Row
              style={{
                gap: Spacing.medium,
              }}
            >
              <ActionIcon
                name="add"
                size={24}
                onClick={() => {
                  router.navigate({
                    pathname: "/transactions/create",
                  });
                }}
              />
              <ActionIcon
                name="sliders"
                size={24}
                onClick={() => {
                  setIsFilterModalOpen(true);
                }}
              />
            </Row>
          );
        },
      }}
    >
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
    </AppScreen>
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
