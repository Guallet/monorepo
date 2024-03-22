import { FlowScreen } from "@/components/Layout/FlowScreen";
import { AccountTypeRow } from "@/components/Rows/AccountTypeRow";
import { AccountTypeDto } from "@guallet/api-client";
import { Column, Label, PrimaryButton } from "@guallet/ui-react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

const availableAccountTypes = [
  AccountTypeDto.CURRENT_ACCOUNT,
  AccountTypeDto.CREDIT_CARD,
  AccountTypeDto.SAVINGS,
  AccountTypeDto.INVESTMENT,
  AccountTypeDto.MORTGAGE,
  AccountTypeDto.LOAN,
  AccountTypeDto.PENSION,
];

export default function AccountTypeScreen() {
  const [selectedType, setSelectedType] = useState<AccountTypeDto | null>(null);

  return (
    <FlowScreen
      headerTitle="Account type"
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
        <Column>
          <Label>Select the account type</Label>
          <FlatList
            data={availableAccountTypes}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedType(item);
                  }}
                >
                  <AccountTypeRow
                    type={item}
                    isSelected={item === selectedType}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </Column>
        <PrimaryButton
          title="Continue"
          disabled={selectedType === null}
          onClick={() => {
            router.navigate({
              pathname: "/(app)/accounts/create/balance",
            });
          }}
        />
      </Column>
    </FlowScreen>
  );
}
