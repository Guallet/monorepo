import { AccountTypePicker } from "@/components/Accounts/AccounTypePicker";
import { CurrencyPicker } from "@/components/CurrencyPicker";
import { useAccountMutations } from "@/features/accounts/useAccountMutations";
import { AccountTypeDto } from "@guallet/api-client";
import { Currency } from "@guallet/money";
import {
  OverlayLoader,
  PrimaryButton,
  Spacing,
  TextInput,
} from "@guallet/ui-react-native";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";

export default function CreateAccountScreen() {
  const { createAccountMutation } = useAccountMutations();

  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );

  const [selectedAccountType, setSelectedAccountType] =
    useState<AccountTypeDto>(AccountTypeDto.CURRENT_ACCOUNT);

  const [balance, setBalance] = useState<string>("");
  const [name, setName] = useState<string>("");

  async function onCreateAccount() {
    // TODO: validate the form data
    createAccountMutation.mutate(
      {
        request: {
          type: selectedAccountType,
          name: name,
          currency: selectedCurrency?.code ?? "GBP",
          initial_balance: isNaN(parseFloat(balance)) ? 0 : parseFloat(balance),
        },
      },
      {
        onSuccess: (data, variables, context) => {
          router.navigate({
            pathname: "accounts",
          });
        },
        onError: (error, variables, context) => {
          // I will fire second!
        },
        onSettled: (data, error, variables, context) => {
          // I will fire second!
        },
      }
    );
  }

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
      <OverlayLoader
        isVisible={createAccountMutation.status === "pending"}
        loadingMessage="Creating account..."
      />
      <ScrollView>
        <View
          style={{
            gap: Spacing.small,
          }}
        >
          <AccountTypePicker
            accountType={selectedAccountType}
            onAccountTypeSelected={(accountType: AccountTypeDto) => {
              setSelectedAccountType(accountType);
            }}
          />
          <TextInput
            label="Account name"
            placeholder="Enter the account name"
            required
            value={name}
            onChangeText={(text) => {
              setName(text);
            }}
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
            required
            value={balance}
            onChangeText={(text) => {
              setBalance(text);
            }}
          />

          {/* <Divider
          style={{
            marginVertical: Spacing.medium,
          }}
        />
        <TextInput
          label="Interest rate"
          placeholder="Pick a currency"
          keyboardType="numeric"
        /> */}
        </View>
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
          onClick={() => {
            onCreateAccount();
          }}
        />
      </View>
    </View>
  );
}
