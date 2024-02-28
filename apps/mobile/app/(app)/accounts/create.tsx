import {
  Divider,
  PrimaryButton,
  Spacing,
  TextInput,
} from "@guallet/ui-react-native";
import { Stack } from "expo-router";
import { View, Text, ScrollView } from "react-native";

export default function CreateAccountScreen() {
  return (
    <View
      style={{
        flex: 1,
        margin: Spacing.medium,
      }}
    >
      <Stack.Screen
        options={{
          title: "Add new account",
          headerTitleAlign: "center",
        }}
      />
      <ScrollView style={{}}>
        <TextInput label="Account type" value="This is the test" required />
        <TextInput
          label="Account name"
          placeholder="Enter the account name"
          required
        />
        <TextInput label="Currency" placeholder="Pick a currency" required />
        <TextInput
          label="Initial balance"
          keyboardType="number-pad"
          value="0"
          required
        />

        <Divider
          style={{
            marginVertical: Spacing.medium,
          }}
        />
        <TextInput
          label="Interest rate"
          placeholder="Pick a currency"
          keyboardType="numeric"
        />
      </ScrollView>
      <View
        style={{
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "flex-end",
        }}
      >
        <PrimaryButton
          title="Create account"
          style={{ marginTop: Spacing.medium }}
        />
      </View>
    </View>
  );
}
