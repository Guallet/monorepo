import { StyleSheet, View, Text, FlatList } from "react-native";

import { Stack, router } from "expo-router";
import { EmptyAccountsList } from "@/components/EmptyList/EmptyAccountsList";
import { PrimaryButton, Spacing } from "@guallet/ui-react-native";
import { AccountsList } from "@/components/Accounts/AccountsList";
import { useAccounts } from "@/features/accounts/useAccounts";

export default function AccountsScreen() {
  const { accounts, isLoading } = useAccounts();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Accounts",
          headerTitleAlign: "center",
        }}
      />
      {isLoading && <Text>Loading...</Text>}
      {accounts?.length === 0 ? (
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
            {accounts && (
              <AccountsList
                accounts={accounts}
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
