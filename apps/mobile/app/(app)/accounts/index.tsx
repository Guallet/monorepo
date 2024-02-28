import { StyleSheet } from "react-native";

import { View } from "@/components/Themed";
import { Stack, router } from "expo-router";
import { EmptyAccountsList } from "@/components/EmptyList/EmptyAccountsList";

export default function AccountsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Accounts",
          headerTitleAlign: "center",
        }}
      />
      <EmptyAccountsList
        onCreateAccount={() => {
          router.navigate("/accounts/create");
        }}
        onConnectToBank={() => {}}
      />
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
