import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import React from "react";
import {
  DangerButton,
  PrimaryButton,
  SecondaryButton,
} from "@guallet/ui-react-native";

export default function AccountsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accounts</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      <PrimaryButton
        title="Add account"
        onClick={async () => {}}
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
        leftIconName="money"
      />
      <PrimaryButton
        title="Add account"
        onClick={async () => {}}
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
        rightIconName="chevron-circle-right"
      />
      <SecondaryButton
        title="Search account"
        onClick={async () => {}}
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
        leftIconName="search"
      />
      <SecondaryButton
        title="Remove account"
        onClick={async () => {}}
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
        rightIconName="plus"
      />
      <DangerButton
        title="Remove account"
        onClick={async () => {}}
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    // alignItems: "center",
    // justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
    color: "black",
  },
});
