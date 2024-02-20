import { supabase } from "@/auth/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Alert, Button } from "react-native";

export default function ValidateCode() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const { email } = useLocalSearchParams<{ email: string }>();

  async function validateCode() {
    setLoading(true);
    const { error, data } = await supabase.auth.verifyOtp({
      email: email,
      token: code,
      type: "email",
    });

    if (error) Alert.alert(error.message);
    setLoading(false);

    if (data) {
      router.replace("/(app)");
    }
  }

  return (
    <View>
      <Text>Validate Code</Text>
      <Text>TODO: Open email app button</Text>
      <TextInput
        onChangeText={(value) => setCode(value)}
        value={code}
        placeholder="Enter 6 Digits code"
        autoCapitalize={"none"}
        keyboardType="number-pad"
      />
      <Button
        title="Validate"
        disabled={loading}
        onPress={async () => await validateCode()}
      />
    </View>
  );
}
