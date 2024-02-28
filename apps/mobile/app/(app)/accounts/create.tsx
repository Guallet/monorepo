import { SelectInput } from "@/components/SelectInput";
import {
  Divider,
  PrimaryButton,
  Spacing,
  TextInput,
} from "@guallet/ui-react-native";
import { Stack } from "expo-router";
import { useState } from "react";
import { View, Text, ScrollView, LogBox } from "react-native";

export default function CreateAccountScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

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
        <SelectInput
          label="Currency"
          placeholder="Pick a currency"
          required
          data={["Option 1", "Option 2", "Option 3"]}
          value={selectedCurrency}
          itemTemplate={(item) => {
            return <Text key={item}>{item}</Text>;
          }}
          onItemSelected={(item) => {
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
