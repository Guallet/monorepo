import { FlowScreen } from "@/components/layout/FlowScreen";
import {
  Column,
  Label,
  PrimaryButton,
  TextInput,
} from "@guallet/ui-react-native";
import { router } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { createAccountAtom, initialCreateAccountFlowState } from ".";

export default function AccountNameScreen() {
  const flowState = useAtomValue(createAccountAtom);
  const setFlowState = useSetAtom(createAccountAtom);

  return (
    <FlowScreen
      headerTitle="Create account"
      canGoBack={false}
      showCloseConfirmation={false}
      onClose={() => {
        // Reset the flow state
        setFlowState(initialCreateAccountFlowState);
        router.back();
      }}
    >
      <Column
        style={{
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <Column>
          <Label>Account name</Label>
          <TextInput
            placeholder="Enter the account name"
            required
            value={flowState.accountName}
            onChangeText={(text) => {
              setFlowState((state) => ({
                ...state,
                accountName: text,
              }));
            }}
          />
        </Column>
        <PrimaryButton
          title="Continue"
          disabled={flowState.accountName === ""}
          onClick={() => {
            router.navigate({
              pathname: "/(app)/accounts/create/accountType",
            });
          }}
        />
      </Column>
    </FlowScreen>
  );
}
