import { gualletClient } from "@/api/gualletClient";
import { Label } from "@guallet/ui-react-native";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { View, StyleSheet } from "react-native";

export default function AccountDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: account, isLoading } = useQuery({
    queryKey: ["accounts", id],
    queryFn: async () => {
      return await gualletClient.accounts.get(id);
    },
  });

  if (isLoading) {
    return <Label>Loading...</Label>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: account?.name ?? "",
          headerTitleAlign: "center",
        }}
      />
      <Label>{JSON.stringify(account, null, 2)}</Label>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    backgroundColor: "white",
  },
});
