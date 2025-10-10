import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <View>
          <Text>Welcome to Guallet</Text>
          <Text>Sign in to manage your finances securely</Text>
        </View>

        <View>
          {/* Email Input */}
          <View>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Divider */}
          <View>
            <View />
            <Text>or continue with</Text>
            <View />
          </View>

          {/* Social Auth Buttons */}
          <TouchableOpacity>
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View>
          <Text>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
