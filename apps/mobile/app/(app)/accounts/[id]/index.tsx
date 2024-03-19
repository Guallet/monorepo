import { useAccount } from "@/features/accounts/useAccounts";
import { useInstitution } from "@/features/institutions/useInstitutions";
import {
  Avatar,
  DangerButton,
  Divider,
  Icon,
  Label,
  PrimaryButton,
  Spacing,
  TextRow,
  ValueRow,
} from "@guallet/ui-react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { AccountDto } from "@guallet/api-client";

export default function AccountDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { account, isLoading } = useAccount(id);

  if (isLoading) {
    return <Label>Loading...</Label>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: account?.name ?? "",
          headerTitleAlign: "center",
          headerRight: () => {
            return (
              <TouchableOpacity
                onPress={() => {
                  router.navigate({
                    pathname: `/accounts/${account?.id}/edit`,
                  });
                }}
              >
                <Icon name="edit" size={24} />
              </TouchableOpacity>
            );
          },
        }}
      />
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <AccountCharts />
        {account && <AccountDetails account={account} />}
        <AccountActions />
      </ScrollView>
    </View>
  );
}

function AccountDetails({ account }: { account: AccountDto }) {
  const { institution } = useInstitution(account?.institutionId);

  return (
    <View
      style={{
        flexDirection: "column",
        padding: Spacing.medium,
      }}
    >
      <Divider />
      <ValueRow title="Name" value={account.name} />
      <ValueRow title="Balance" value={account?.balance.amount ?? ""} />
      <ValueRow title="Institution" value={institution?.name ?? ""} />
    </View>
  );
}

function AccountCharts() {
  return (
    <View
      style={{
        flexDirection: "column",
        gap: Spacing.small,
        padding: Spacing.medium,
      }}
    >
      <Label>Income/Expenses</Label>
      <Image
        style={{
          height: 150,
          flex: 1,
          width: "100%",
          // backgroundColor: "#0553",
        }}
        contentFit="contain"
        source={{
          uri: "https://scottmurray.org/content/03-tutorials/01-d3/130-making-a-bar-chart/1.png",
        }}
        transition={1000}
      />
    </View>
  );
}

interface AccountActionsProps {
  account: AccountDto;
}
function AccountActions({ account }: AccountActionsProps) {
  return (
    <View
      style={{
        flexDirection: "column",
        gap: Spacing.small,
        padding: Spacing.medium,
      }}
    >
      <PrimaryButton title="View transactions" onPress={() => {}} />
      {account?.source === "synced" && (
        <>
          <PrimaryButton title="Manage connection" onPress={() => {}} />
          <PrimaryButton title="Refresh connection" onPress={() => {}} />
        </>
      )}
      <DangerButton title="Delete account" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    backgroundColor: "white",
  },
});
