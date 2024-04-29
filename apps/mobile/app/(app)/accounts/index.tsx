import { StyleSheet, View, ActivityIndicator } from "react-native";
import { router, useNavigation } from "expo-router";
import { EmptyAccountsList } from "@/components/EmptyList/EmptyAccountsList";
import { PrimaryButton, Spacing } from "@guallet/ui-react-native";
import { AccountsList } from "@/components/Accounts/AccountsList";
import React from "react";
import { useAccounts } from "@guallet/api-react";

export default function AccountsScreen() {
  const { accounts, isLoading } = useAccounts();

  // Set the title of the screen
  const navigation = useNavigation();
  navigation.setOptions({
    title: "Accounts",
    headerTitleAlign: "center",
  });

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {accounts.length === 0 ? (
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
              flex: 1,
              paddingTop: Spacing.small,
              paddingHorizontal: Spacing.medium,
              paddingBottom: Spacing.medium,
            }}
          >
            {accounts && (
              <AccountsList
                accounts={accounts}
                onAccountSelected={(account) => {
                  // router.navigate(`/accounts/${account.id}`);
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
              onClick={() => {
                router.navigate({
                  pathname: "/accounts/create",
                });
              }}
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
