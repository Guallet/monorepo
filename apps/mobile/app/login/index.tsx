import { supabase } from "@/auth/supabase";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, TextInput, View } from "react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId:
    "218442007864-a1cu28dbsvqkjm3f6t1snh84f9hpj7ir.apps.googleusercontent.com",
});

export default function Auth() {
  const [email, setEmail] = useState("cjgaliana@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithOtp() {
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
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          //   label="Email"
          //   leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
        />
      </View>
      {/* <View style={styles.verticallySpaced}>
        <TextInput
          //   label="Password"
          //   leftIcon={{ type: "font-awesome", name: "lock" }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={"none"}
        />
      </View> */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={() => signInWithOtp()}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign in with google"
          disabled={loading}
          onPress={() => signUpWithGoogle()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
