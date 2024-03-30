import { ScrollView, StyleSheet, View } from "react-native";

import { Stack, router } from "expo-router";
import { UserProfileRow } from "@/components/UserProfileRow";
import {
  SecondaryButton,
  Spacing,
  TextRow,
  ExternalLinkRow,
  Label,
} from "@guallet/ui-react-native";
import { useAuth } from "@/auth/useAuth";
import React from "react";

export default function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />
      <ScrollView>
        <View style={styles.container}>
          <SettingsGroup title="User">
            <UserProfileRow
              onClick={() => {
                router.push("/settings/user");
              }}
            />
            <TextRow
              label="Manage subscriptions"
              showDivider={false}
              onClick={() => {
                router.push("/settings/user");
              }}
              leftIconName="crown"
            />
            <SecondaryButton
              title="Sign Out"
              style={{
                marginTop: Spacing.small,
              }}
              onClick={async () => {
                await signOut();
              }}
            />
          </SettingsGroup>

          <SettingsGroup title="Accounts">
            <TextRow
              label="Manage Connections"
              onClick={() => {
                router.navigate("/(app)/connections");
              }}
              leftIconName="globe"
              showDivider={false}
            />
            <TextRow
              label="Categories"
              onClick={() => {
                router.navigate("/(app)/categories");
              }}
              leftIconName="list"
              showDivider={false}
            />
            <TextRow
              label="Budgets"
              onClick={() => {
                router.navigate("/(app)/categories");
              }}
              leftIconName="sack-dollar"
              showDivider={false}
            />
            <TextRow
              label="Currencies"
              onClick={() => {
                router.navigate("/(app)/connections");
              }}
              leftIconName="dollar"
              showDivider={false}
            />
            <TextRow
              label="Institutions"
              onClick={() => {
                router.navigate("/(app)/connections");
              }}
              leftIconName="building-columns"
              showDivider={false}
            />
            <TextRow
              label="Export data"
              onClick={() => {
                router.navigate("/(app)/connections");
              }}
              leftIconName="download"
              showDivider={false}
            />
          </SettingsGroup>

          <SettingsGroup title="App settings">
            <TextRow
              label="Notifications"
              onClick={() => {
                router.navigate("/(app)/connections");
              }}
              leftIconName="bell"
              showDivider={false}
            />
            <TextRow
              label="Language"
              onClick={() => {
                router.navigate("/(app)/connections");
              }}
              leftIconName="language"
              showDivider={false}
            />
            <TextRow
              label="Security"
              onClick={() => {
                router.navigate("/(app)/connections");
              }}
              leftIconName="fingerprint"
              showDivider={false}
            />
          </SettingsGroup>

          <SettingsGroup title="Help and support">
            <ExternalLinkRow
              label="Privacy policy"
              url="https://www.guallet.io/privacy"
              leftIconName="eye"
              showDivider={false}
            />
            <ExternalLinkRow
              label="Terms and conditions"
              url="https://www.guallet.io/terms_and_conditions"
              leftIconName="book-open"
              showDivider={false}
            />
            <ExternalLinkRow
              label="Contact support"
              url="https://github.com/Guallet/monorepo/issues/new"
              leftIconName="headset"
              showDivider={false}
            />
            <ExternalLinkRow
              label="Github"
              url="https://github.com/Guallet/monorepo/issues/new"
              leftIconName="github"
              showDivider={false}
            />
          </SettingsGroup>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    backgroundColor: "#EFEFEF",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});

interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
}
function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: Spacing.small,
        flexDirection: "column",
        padding: 10,
        margin: 10,
      }}
    >
      <Label
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        {title}
      </Label>
      {children}
    </View>
  );
}
