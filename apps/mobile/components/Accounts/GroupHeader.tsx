import { Label, Spacing } from "@guallet/ui-react-native";
import { View, StyleSheet } from "react-native";

interface Props {
  title: string;
  rightContent: string | null;
}

export function GroupHeader({ title, rightContent }: Props) {
  return (
    <View
      style={{
        justifyContent: "space-between",
        flexDirection: "row",
        borderBottomWidth: 1,
        marginTop: Spacing.medium,
        height: 50,
        paddingTop: Spacing.medium,
        paddingHorizontal: Spacing.medium,
        backgroundColor: "white",
        borderTopStartRadius: Spacing.small,
        borderTopEndRadius: Spacing.small,
      }}
    >
      <Label style={styles.label}>{title}</Label>
      <Label style={styles.label}>{rightContent}</Label>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});
