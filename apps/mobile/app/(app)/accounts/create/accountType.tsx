import { FlowScreen } from "@/components/Layout/FlowScreen";
import { AccountTypeRow } from "@/components/Rows/AccountTypeRow";
import { AccountTypeDto } from "@guallet/api-client";
import { Column, Label, PrimaryButton } from "@guallet/ui-react-native";
import { router } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { FlatList } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { createAccountAtom } from ".";

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
  const flowState = useAtomValue(createAccountAtom);
  const setFlowState = useSetAtom(createAccountAtom);

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
                    setFlowState((state) => ({
                      ...state,
                      accountType: item,
                    }));
                  }}
                >
                  <AccountTypeRow
                    type={item}
                    isSelected={item === flowState.accountType}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </Column>
        <PrimaryButton
          title="Continue"
          disabled={flowState.accountType === null}
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
