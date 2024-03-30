import { AccountPicker } from "@/components/Accounts/AccountPicker";
import { CategoryPicker } from "@/components/Categories/CategoryPicker";
import { CurrencyPicker } from "@/components/CurrencyPicker";
import { AppScreen } from "@/components/Layout/AppScreen";
import { AppCategory } from "@/features/categories/useCategories";
import { AccountDto } from "@guallet/api-client";
import { Currency } from "@guallet/money";
import {
  Column,
  Label,
  PrimaryButton,
  SecondaryButton,
  Spacing,
  TextInput,
} from "@guallet/ui-react-native";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";

export default function CreateTransactionCreateScreen() {
  const [selectedAccount, setSelectedAccount] = useState<AccountDto | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | null>(
    null
  );

  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );

  return (
    <AppScreen
      headerTitle="Create Transaction"
      style={{
        paddingHorizontal: Spacing.medium,
        paddingBottom: Spacing.medium,
        paddingTop: Spacing.small,
      }}
    >
      <Column
        style={{
          flexGrow: 1,
          alignContent: "space-between",
        }}
      >
        <ScrollView
          style={{
            gap: Spacing.small,
            flexGrow: 1,
            marginBottom: Spacing.small,
          }}
        >
          <Label>Account</Label>

          <AccountPicker
            account={selectedAccount}
            onAccountSelected={(account) => {
              setSelectedAccount(account);
            }}
          />

          <Label>Select Currency</Label>
          <CurrencyPicker
            currency={selectedCurrency}
            onCurrencyChanged={(newCurrency) => {
              setSelectedCurrency(newCurrency);
            }}
          />
          <TextInput
            label="Enter transaction amount"
            keyboardType="numeric"
            placeholder="0.00"
            required
          />
          <TextInput
            label="Enter transaction description"
            placeholder="What is this transaction for?"
            required
          />
          <Label>Pick a Category</Label>
          <CategoryPicker
            category={selectedCategory}
            onCategorySelected={(category) => {
              setSelectedCategory(category);
            }}
          />
          <TextInput
            label="Enter transaction notes"
            multiline={true}
            textAlignVertical="top"
            maxLength={256}
            style={{
              height: 150,
            }}
          />
        </ScrollView>

        <Column
          style={{
            gap: Spacing.small,
          }}
        >
          <PrimaryButton title="Save transaction" />
          <SecondaryButton
            title="Cancel"
            onClick={() => {
              router.back();
            }}
          />
        </Column>
      </Column>
    </AppScreen>
  );
}
