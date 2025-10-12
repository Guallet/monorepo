import { AppScreen } from "@/components/layout/AppScreen";
import { TextInput } from "react-native";
import { GoogleButton } from "../components/GoogleButton";
import { useState } from "react";
import { Label, Button, Stack } from "@luna-ui/react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  const onLoginWithEmail = () => {
    router.navigate("/login/otp");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppScreen headerTitle="Login" isHeaderVisible={false}>
        <Stack>
          <Label>Welcome back</Label>
          <Label>Sign in to your account</Label>
          <TextInput
            onChangeText={setEmail}
            value={email}
            placeholder="Email"
            keyboardType="email-address"
          />
          <Button onClick={onLoginWithEmail}>Login with email</Button>
          <Label>or continue with</Label>
          <GoogleButton onPress={() => {}} />
          {/* <Label>Don&apos;t have an account? Sign up</Label>
        <Button>Sign Up</Button> */}
        </Stack>
      </AppScreen>
    </SafeAreaView>
  );
}
