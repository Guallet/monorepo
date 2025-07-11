import { useAuth } from "@/auth/useAuth";
import { Stack } from "expo-router";
import { Image, View, Text, Button } from "react-native";

export default function UserScreen() {
  const { session, signOut } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "stretch" }}>
      <Stack.Screen
        options={{
          title: "User settings",
        }}
      />
      <View>
        <Image
          source={{
            uri: session?.user.user_metadata.avatar_url,
          }}
          style={{
            alignSelf: "center",
            width: 150,
            height: 150,
            borderRadius: 150 / 2,
          }}
        />

        <Text style={{ color: "grey", fontSize: 12 }}>Name</Text>
        <Text>{session?.user.user_metadata.full_name}</Text>
        <Text style={{ color: "grey", fontSize: 12 }}>Email</Text>
        <Text>{session?.user.email}</Text>
      </View>

      <View style={{ flex: 1 }} />

      <View>
        <Button
          title="Sign Out"
          onPress={async () => {
            await signOut();
          }}
        />
        <Button title="Delete account" onPress={() => {}} />
      </View>
    </View>
  );
}
