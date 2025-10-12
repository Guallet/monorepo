import { AppScreen } from "@/components/layout/AppScreen";
import { GoogleButton } from "../components/GoogleButton";
import { useState } from "react";
import {
  Label,
  Button,
  Stack,
  Divider,
  useTheme,
  TextInput,
  Title,
} from "@luna-ui/react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/auth/useAuth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const IS_DEV = process.env.APP_VARIANT === "development";
const IS_DEV = true;

export function LoginScreen() {
  const { spacing } = useTheme();
  const { getOtpCode, loginWithProvider } = useAuth();

  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = emailRegex.test(email);

  const onLoginWithEmail = async () => {
    if (IS_DEV) {
      router.navigate("/login/otp");
    }

    if (!isValidEmail) {
      setEmailError(true);
      return;
    }

    setEmailError(false);

    setIsLoading(true);
    const isCodeSent = await getOtpCode(email);
    setIsLoading(false);

    if (isCodeSent) {
      router.navigate("/login/otp");
    } else {
      // TODO: Show some error to the user
      alert("Failed to send OTP code. Please try again.");
    }
  };

  const loginWithGoogle = async () => {
    const canLogin = await loginWithProvider("google");
    if (!canLogin) {
      alert("Failed to login with Google. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppScreen
        headerTitle="Login"
        isHeaderVisible={false}
        isLoading={isLoading}
      >
        <Stack style={{ flex: 1, padding: spacing.md }} gap={spacing.lg}>
          <Title center>Welcome back</Title>
          <Label>Sign in to your account</Label>
          <TextInput
            label="Email"
            onChangeText={(input) => {
              setEmail(input);
              setEmailError(false);
            }}
            value={email}
            placeholder="Email"
            keyboardType="email-address"
            error={emailError ? "Please enter a valid email" : null}
          />
          <Button
            onClick={onLoginWithEmail}
            //  disabled={!isValidEmail}
          >
            Login with email
          </Button>
          <Divider label="or continue with" />
          <GoogleButton onPress={() => {}} />
        </Stack>

        <Stack
          gap={spacing.sm}
          style={{ padding: spacing.md }}
          justify="center"
        >
          <Label center>Don&apos;t have an account?</Label>
          <Button>Sign Up</Button>
          <Label>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </Label>
        </Stack>
      </AppScreen>
    </SafeAreaView>
  );
}
