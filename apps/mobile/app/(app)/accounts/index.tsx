import { StyleSheet, View, Text, FlatList } from "react-native";

import { Stack, router } from "expo-router";
import { EmptyAccountsList } from "@/components/EmptyList/EmptyAccountsList";
import { useQuery } from "@tanstack/react-query";
import { gualletClient } from "@/api/gualletClient";
import { PrimaryButton, Spacing } from "@guallet/ui-react-native";
import { AccountsList } from "@/components/Accounts/AccountsList";

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
        <View style={styles.container}>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: Spacing.small,
              flexDirection: "column",
              padding: Spacing.medium,
              margin: Spacing.medium,
              flex: 1,
            }}
          >
            {data && (
              <AccountsList
                accounts={data}
                onAccountSelected={(account) => {
                  // router.push(`/accounts/${account.id}`);
                  router.navigate({
                    pathname: "/accounts/[id]",
                    params: { id: account.id },
                  });
                }}
              />
            )}
          </View>
          <View
            style={{
              justifyContent: "flex-end",
            }}
          >
            <PrimaryButton
              title="Add new account"
              onPress={() => {}}
              style={{
                marginHorizontal: Spacing.medium,
                marginBottom: Spacing.medium,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    backgroundColor: "#EFEFEF",
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
