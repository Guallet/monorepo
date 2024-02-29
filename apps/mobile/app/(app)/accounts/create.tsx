import { CurrencyPicker } from "@/components/CurrencyPicker";
import { Currency } from "@guallet/money";
import {
  Divider,
  PrimaryButton,
  Spacing,
  TextInput,
} from "@guallet/ui-react-native";
import { Stack } from "expo-router";
import { useState } from "react";
import { View, ScrollView } from "react-native";

export default function CreateAccountScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );

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
        <CurrencyPicker
          currency={selectedCurrency}
          onCurrencyChanged={(item) => {
            setSelectedCurrency(item);
          }}
        />
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
