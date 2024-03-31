import { supabase } from "@/auth/supabase";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import {
  Column,
  Divider,
  PrimaryButton,
  SecondaryButton,
  Spacing,
  TextInput,
} from "@guallet/ui-react-native";
import { BuildConfig } from "@/buildConfig";
import { AppScreen } from "@/components/Layout/AppScreen";

GoogleSignin.configure({
  webClientId: BuildConfig.Auth.GOOGLE_WEB_CLIENT_ID,
});

export default function SigninScreen() {
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"magic-link" | "email-password">(
    "email-password"
  );

  async function signInWithOtp(email: string) {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithOtp({
      email: email,
      //   password: password,
      options: {
        emailRedirectTo: "https://guallet.com",
        shouldCreateUser: false, // Only by invitation (for now)
      },
    });

    if (error) Alert.alert(error.message);
    setLoading(false);

    if (data) {
      router.push({
        pathname: "/login/validate",
        params: {
          email: email,
        },
      });
    }
  }

  async function signInWithEmailPassword(credentials: {
    email: string;
    password: string;
  }) {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.replace("/(app)/");
    }
    setLoading(false);
  }

  async function signUpWithGoogle() {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.idToken,
        });
        if (error) {
          Alert.alert("Error Google Signin", JSON.stringify(error));
        } else {
          // TODO: Check if the user is already registered, and then redirect to the app
          router.replace("/(app)/");
        }
      } else {
        Alert.alert("Error Google Signin", "No idToken");
      }
    } catch (error: any) {
      setLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  }

  return (
    <AppScreen headerTitle="Sign in" style={{ padding: Spacing.medium }}>
      <Column
        style={{
          gap: Spacing.small,
          display: "flex",
        }}
      >
        <SocialLoginSection
          isLoading={loading}
          onProviderClick={(provider) => {
            switch (provider) {
              case "google":
                signUpWithGoogle();
                break;
              case "apple":
                // signUpWithApple();
                break;
            }
          }}
        />
      </Column>

      <Divider
        label="or sign in with"
        style={{
          marginHorizontal: Spacing.small,
          marginVertical: 20,
        }}
      />
      {loginMode === "magic-link" ? (
        <MagicLinkLoginSection
          isLoading={loading}
          onLogin={signInWithOtp}
          onSwitchMode={() => {
            setLoginMode("email-password");
          }}
        />
      ) : (
        <EmailPasswordLoginSection
          isLoading={loading}
          onLogin={signInWithEmailPassword}
          onSwitchMode={() => {
            setLoginMode("magic-link");
          }}
        />
      )}
    </AppScreen>
  );
}

interface SocialLoginSectionProps {
  isLoading: boolean;
  onProviderClick: (provider: "google" | "apple") => void;
}
function SocialLoginSection({
  isLoading,
  onProviderClick,
}: SocialLoginSectionProps) {
  return (
    <Column>
      <PrimaryButton
        title="Sign in with Google"
        disabled={isLoading}
        onClick={() => onProviderClick("google")}
        leftIconName="google"
      />
    </Column>
  );
}

interface MagicLinkLoginSectionProps {
  isLoading: boolean;
  onLogin: (email: string) => void;
  onSwitchMode: () => void;
}
function MagicLinkLoginSection({
  isLoading,
  onLogin,
  onSwitchMode,
}: MagicLinkLoginSectionProps) {
  const [email, setEmail] = useState("");
  return (
    <Column>
      <TextInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
        }}
      />
      <PrimaryButton
        title="Send magic link"
        disabled={isLoading}
        onClick={() => onLogin(email)}
      />
      <SecondaryButton
        title="Sign in with email and password"
        disabled={isLoading}
        onClick={() => {
          onSwitchMode();
        }}
      />
    </Column>
  );
}

interface EmailPasswordLoginSectionProps {
  isLoading: boolean;
  onLogin: (credentials: { email: string; password: string }) => void;
  onSwitchMode: () => void;
}
function EmailPasswordLoginSection({
  isLoading,
  onLogin,
  onSwitchMode,
}: EmailPasswordLoginSectionProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Column>
      <TextInput
        label="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="Email"
        autoCapitalize={"none"}
      />
      <TextInput
        label="Password"
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry={true}
        placeholder="Password"
        autoCapitalize={"none"}
      />
      <PrimaryButton
        title="Sign in"
        disabled={isLoading}
        onClick={() =>
          onLogin({
            email: email,
            password: password,
          })
        }
      />
      <SecondaryButton
        title="Sign in with magic link"
        disabled={isLoading}
        onClick={() => {
          onSwitchMode();
        }}
      />
    </Column>
  );
}
