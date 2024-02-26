import { ScrollView, StyleSheet } from "react-native";

import React from "react";
import {
  DangerButton,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from "@guallet/ui-react-native";

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <TextInput
        placeholder="This is the placeholder"
        label="This is the label"
        description="This is the description"
        required
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
      />

      <TextInput
        label="This is the label"
        description="This is the description"
        placeholder="This is the placeholder for a disabled input"
        value="This is the value"
        disabled
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
      />

      <TextInput
        placeholder="This is the placeholder"
        label="This is the label"
        description="This is the description"
        required
        error="This is the error"
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
      />

      <PrimaryButton
        title="Add account"
        onClick={async () => {}}
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
      />
      <PrimaryButton
        title="Add account"
        onClick={async () => {}}
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
        leftIconName="money-check"
        rightIconName="chevron-right"
      />
      <PrimaryButton
        title="Add account"
        onClick={async () => {}}
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
        leftIconName="money-check"
      />
      <PrimaryButton
        title="Add account"
        onClick={async () => {}}
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
        rightIconName="chevron-right"
      />
      <SecondaryButton
        title="Search account"
        onClick={async () => {}}
        style={{
          marginTop: 16,
          marginStart: 24,
          marginEnd: 24,
        }}
        leftIconName="magnifying-glass"
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
});
