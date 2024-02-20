import { useAuth } from "@/auth/useAuth";
import { View, Text, Button } from "react-native";

export default function LoginScreen() {
  const { signIn } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Sign In</Text>
      <Button
        title="Sign in"
        onPress={() => {
          await signIn();
        }}
      />
    </View>
  );
}
