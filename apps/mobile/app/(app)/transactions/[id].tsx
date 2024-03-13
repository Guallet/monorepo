import { useTransaction } from "@/features/transactions/useTransactions";
import { Label } from "@guallet/ui-react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transaction } = useTransaction(id);

  return (
    <View>
      <Stack.Screen
        options={{
          title: "Transaction details",
          headerTitleAlign: "center",
        }}
      />
      <View>
        <Label>Transaction details</Label>
        <Label>{JSON.stringify(transaction, null, 2)}</Label>
      </View>
    </View>
  );
}
