import { CurrencyPicker } from "@/components/CurrencyPicker";
import { FlowScreen } from "@/components/Layout/FlowScreen";
import { useAccountMutations } from "@/features/accounts/useAccountMutations";
import { AccountTypeDto } from "@guallet/api-client";
import { Currency, Money } from "@guallet/money";
import {
  Column,
  Label,
  PrimaryButton,
  Spacing,
  TextInput,
} from "@guallet/ui-react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { ToastAndroid } from "react-native";

export default function AccountBalanceScreen() {
  const { createAccountMutation } = useAccountMutations();

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    Currency.fromISOCode("GBP")
  );

  const [balance, setBalance] = useState<string>("0");
  const money = new Money(+balance, selectedCurrency);

  async function onCreateAccount() {
    // TODO: validate the form data
    createAccountMutation.mutate(
      {
        request: {
          type: AccountTypeDto.CURRENT_ACCOUNT,
          name: "TODO: GET ACCOUNT NAME AND ACCOUNT TYPE FROM THE USER",
          currency: selectedCurrency.code,
          initial_balance: parseFloat(balance),
        },
      },
      {
        onSuccess: (data, variables, context) => {
          ToastAndroid.show("Account created!", ToastAndroid.SHORT);
          router.replace(`/(app)/accounts/${data.id}`);
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
    <FlowScreen
      isLoading={createAccountMutation.isPending}
      headerTitle="Account balance"
      onClose={() => {
        router.replace({
          pathname: "/(app)/accounts",
        });
      }}
    >
      <Column
        style={{
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <Column
          style={{
            gap: Spacing.small,
          }}
        >
          <Label>Select the account currency</Label>
          <CurrencyPicker
            currency={selectedCurrency}
            onCurrencyChanged={(item) => {
              setSelectedCurrency(item);
            }}
            showLabel={false}
          />
          <Label>Enter the initial balance of the account</Label>
          <TextInput
            keyboardType="number-pad"
            required
            onFocus={() => {
              if (balance === "0") {
                setBalance("");
              }
            }}
            value={balance}
            onChangeText={(text) => {
              setBalance(text);
            }}
            error={isNaN(+balance) ? "Please enter a valid number" : undefined}
          />
        </Column>
        <Column>
          {isNaN(+balance) === false && (
            <Label>{`Initial balance: ${money.format()}`}</Label>
          )}
          <PrimaryButton
            title="Save account"
            disabled={
              selectedCurrency === null || balance === "" || isNaN(+balance)
            }
            onClick={() => {
              onCreateAccount();
            }}
          />
        </Column>
      </Column>
    </FlowScreen>
  );
}
