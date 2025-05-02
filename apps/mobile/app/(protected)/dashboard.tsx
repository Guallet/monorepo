import { useRouter } from "expo-router";
import { View, Button, Text } from "react-native";

export default function Dashboard() {
  const router = useRouter();

  return (
    <View>
      <Text>This is the Dashboard</Text>
      <Button
        title="Logout"
        onPress={() => {
          router.replace("/(protected)/dashboard");
        }}
      />
    </View>
  );
}
