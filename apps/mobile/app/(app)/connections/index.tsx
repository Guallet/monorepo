import { Stack, router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function ConnectionsScreen() {
  return (
    <View>
      <Stack.Screen
        options={{
          title: "Connections",
          headerTitleAlign: "center",
        }}
      />
      <Text>Connections</Text>
      <Button
        title="Add new connection"
        onPress={() => {
          router.navigate("connections/connect/country");
        }}
      />
    </View>
  );
}
