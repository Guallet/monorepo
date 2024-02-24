import { ScrollView, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { Stack, router } from "expo-router";
import { UserProfileRow } from "@/components/UserProfileRow";
import { Divider } from "@guallet/ui-react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          // https://reactnavigation.org/docs/headers#setting-the-header-title
          title: "My settings",
          // https://reactnavigation.org/docs/headers#adjusting-header-styles
          headerStyle: { backgroundColor: "#f4511e" },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          // https://reactnavigation.org/docs/headers#replacing-the-title-with-a-custom-component
          //   headerTitle: (props) => <LogoTitle {...props} />,
        }}
      />
      <ScrollView>
        <View>
          <Text>User</Text>
          <UserProfileRow
            onClick={() => {
              router.push("/settings/user");
            }}
          />
          <Divider />
          <Text>Settings</Text>
          <Divider />
          <Text>Settings</Text>
          <Divider />
          <Text>Settings</Text>
          <Divider />
          <Text>Settings</Text>
          <Divider />
          <Text>Settings</Text>
          <Divider />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
