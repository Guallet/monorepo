import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AvatarProps extends React.ComponentProps<typeof View> {
  /** Size of the avatar in pixels */
  size?: number;
  /** Background color */
  color?: string;
  /** Text to display (typically initials or an emoji) */
  label?: string;
  /** Optional child element (e.g., an icon component) */
  children?: React.ReactNode;
}

export function Avatar({
  size = 32,
  color = "#E5E7EB",
  label,
  children,
  style,
  ...props
}: Readonly<AvatarProps>) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
      {...props}
    >
      {children ?? (
        <Text
          style={[
            styles.label,
            {
              fontSize: size * 0.4,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "white",
    fontWeight: "600",
  },
});
