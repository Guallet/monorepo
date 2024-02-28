import { View, Text } from "react-native";
import { Image } from "expo-image";
import { PrimaryButton, Spacing } from "@guallet/ui-react-native";

interface EmptyAccountsListProps {
  onCreateAccount: () => void;
  onConnectToBank: () => void;
}

export function EmptyAccountsList({
  onCreateAccount,
  onConnectToBank,
}: EmptyAccountsListProps) {
  return (
    <View
      style={{
        flexGrow: 1,
        marginHorizontal: Spacing.medium,
      }}
    >
      <Image
        source={require("@/assets/images/illustrations/add_account.svg")}
        style={{
          width: "auto",
          height: 200,
          marginTop: Spacing.extraLarge,
        }}
        contentFit="fill"
        contentPosition="center"
      />
      <Text>It looks you don't have any account yet</Text>
      <Text>Create a new manual account or connect with your bank</Text>
      <View
        style={{
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "flex-end",
        }}
      >
        <PrimaryButton
          title="Create account"
          style={{ marginBottom: Spacing.small }}
          onClick={onCreateAccount}
        />
        <PrimaryButton
          title="Connect to Bank"
          style={{ marginBottom: Spacing.small }}
          onClick={onConnectToBank}
        />
      </View>
    </View>
  );
}
