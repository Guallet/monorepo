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
import { StackActions } from "@react-navigation/native";
import { router, useNavigation, useRouter } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useState } from "react";
import { ToastAndroid } from "react-native";
import { createAccountAtom } from ".";

export default function AccountBalanceScreen() {
  const { createAccountMutation } = useAccountMutations();

  const flowState = useAtomValue(createAccountAtom);
  const setFlowState = useSetAtom(createAccountAtom);
  // Used only for input validation
  const [balance, setBalance] = useState<string>(flowState.balance.toString());

  const navigation = useNavigation();

  const money = new Money(flowState.balance, flowState.currency);

  async function onCreateAccount() {
    // TODO: validate the form data
    createAccountMutation.mutate(
      {
        request: {
          type: flowState.accountType,
          name: flowState.accountName,
          currency: flowState.currency.code,
          initial_balance: flowState.balance,
        },
      },
      {
        onSuccess: (data, variables, context) => {
          ToastAndroid.show("Account created!", ToastAndroid.SHORT);
          setFlowState({
            accountName: "",
            accountType: AccountTypeDto.CURRENT_ACCOUNT,
            currency: Currency.fromISOCode("GBP"),
            balance: 0,
          });
          navigation.dispatch(StackActions.popToTop());
          router.navigate(`/(app)/accounts/${data.id}`);
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
            currency={flowState.currency}
            onCurrencyChanged={(item) => {
              setFlowState((state) => ({
                ...state,
                currency: item,
              }));
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
              if (isNaN(+text) === false) {
                setFlowState((state) => ({
                  ...state,
                  balance: +text,
                }));
              }
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
              flowState.currency === null || balance === "" || isNaN(+balance)
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
