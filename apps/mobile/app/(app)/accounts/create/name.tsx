import { FlowScreen } from "@/components/Layout/FlowScreen";
import {
  Column,
  Label,
  PrimaryButton,
  TextInput,
} from "@guallet/ui-react-native";
import { router } from "expo-router";
import { useState } from "react";

export default function AccountNameScreen() {
  const [name, setName] = useState<string>("");

  return (
    <FlowScreen
      headerTitle="Create account"
      canGoBack={false}
      showCloseConfirmation={false}
      onClose={() => {
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
            value={name}
            onChangeText={(text) => {
              setName(text);
            }}
          />
        </Column>
        <PrimaryButton
          title="Continue"
          disabled={name === ""}
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
