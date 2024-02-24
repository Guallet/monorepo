import { Button, ScrollView, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { useAuth } from "@/auth/useAuth";

export default function AccountsScreen() {
  const { session, signOut } = useAuth();

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Accounts screen</Text>
        <Button
          title="Sign Out"
          onPress={async () => {
            await signOut();
          }}
        />
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />
        <Text>Session</Text>
        <Text>{JSON.stringify(session, null, 2)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    backgroundColor: "pink",
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
