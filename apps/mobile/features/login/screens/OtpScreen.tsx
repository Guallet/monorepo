import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AppScreen } from "@/components/layout/AppScreen";
import { useRouter } from "expo-router";
import { Button, Label, OtpInput, Title } from "@luna-ui/react-native";
import { openInbox } from "react-native-email-link";
import { defaultTheme } from "@luna-ui/react-native/src/theme/DefaultTheme";

export function OtpScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleResendCode = () => {
    // Implement resend code logic here
    console.log("Resending code...");
  };

  const handleOpenEmailApp = async () => {
    // Open default email app
    // Linking.openURL("mailto:");
    const result = await openInbox();
  };

  return (
    <AppScreen headerTitle="Enter code">
      {/* Content */}
      <View style={{ flex: 1 }}>
        <Title>Check your email</Title>
        <Label>
          We&apos;ve sent a 6-digit code to your email. Please enter it below to
          continue.
        </Label>

        {/* Code Input */}
        <OtpInput
          length={6}
          style={{
            marginHorizontal: 12,
          }}
          onCodeChanged={setCode}
        />

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn&apos;t receive the code?</Text>
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendButton}>Resend code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Button */}
      <View
        style={{
          padding: 24,
        }}
      >
        <Button onClick={handleOpenEmailApp}>Open email app</Button>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  content: {
    flex: 1,
    // paddingHorizontal: 24,
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    marginBottom: 40,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  resendContainer: {
    alignItems: "center",
    flex: 1,
  },
  resendText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  resendButton: {
    fontSize: 16,
    color: defaultTheme.colors.primary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
