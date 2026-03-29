import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "./../../theme";

interface ListRowProps extends React.ComponentProps<typeof View> {
  /** Primary text displayed on the left */
  title: string;
  /** Optional secondary/description text below the title */
  subtitle?: string;
  /** Optional value/content displayed on the right */
  value?: string;
  /** Optional React node displayed on the left before the title */
  left?: React.ReactNode;
  /** Optional React node displayed on the right after the value */
  right?: React.ReactNode;
  /** Callback for when the row is pressed */
  onPress?: () => void;
}

export function ListRow({
  title,
  subtitle,
  value,
  left,
  right,
  onPress,
  style,
  ...props
}: Readonly<ListRowProps>) {
  const { colors } = useTheme();

  const content = (
    <View style={[styles.row, style]} {...props}>
      {left && <View style={styles.left}>{left}</View>}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {value && <Text style={styles.value}>{value}</Text>}
      {right && <View style={styles.right}>{right}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  left: {
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  value: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
  right: {
    marginLeft: 8,
  },
});
