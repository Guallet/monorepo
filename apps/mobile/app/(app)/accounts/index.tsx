import { StyleSheet, View, Text } from "react-native";

import { Stack, router } from "expo-router";
import { EmptyAccountsList } from "@/components/EmptyList/EmptyAccountsList";
import { useQuery } from "@tanstack/react-query";
import { gualletClient } from "@/api/gualletClient";

export default function AccountsScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      return await gualletClient.accounts.getAll();
    },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Accounts",
          headerTitleAlign: "center",
        }}
      />
      {isLoading && <Text>Loading...</Text>}
      {data?.length === 0 ? (
        <EmptyAccountsList
          onCreateAccount={() => {
            router.navigate("/accounts/create");
          }}
          onConnectToBank={() => {}}
        />
      ) : (
        <View>
          <Text>Accounts</Text>
          {data?.map((account) => (
            <Text key={account.id}>{account.name}</Text>
          ))}
        </View>
      )}
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
