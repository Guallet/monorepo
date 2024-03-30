import { Divider, Label } from "@guallet/ui-react-native";
import { StyleSheet, View } from "react-native";

export default function insightsScreen() {
  return (
    <View style={styles.container}>
      <Label style={styles.title}>Insights screen</Label>
      <Divider />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
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
