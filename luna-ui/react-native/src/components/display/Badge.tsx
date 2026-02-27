import React from "react";
import { View, Text, StyleSheet } from "react-native";

type BadgeVariant = "filled" | "light" | "outline";

interface BadgeProps extends React.ComponentProps<typeof View> {
  /** Text content of the badge */
  children: React.ReactNode;
  /** Color theme for the badge */
  color?: string;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
  md: { paddingHorizontal: 8, paddingVertical: 3, fontSize: 12 },
  lg: { paddingHorizontal: 10, paddingVertical: 4, fontSize: 14 },
};

export function Badge({
  children,
  color = "#007AFF",
  variant = "light",
  size = "md",
  style,
  ...props
}: Readonly<BadgeProps>) {
  const sizing = sizeStyles[size];

  const getContainerStyle = () => {
    switch (variant) {
      case "filled":
        return { backgroundColor: color };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: color,
        };
      case "light":
      default:
        return { backgroundColor: color + "1A" };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "filled":
        return "white";
      case "outline":
      case "light":
      default:
        return color;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        getContainerStyle(),
        {
          paddingHorizontal: sizing.paddingHorizontal,
          paddingVertical: sizing.paddingVertical,
        },
        style,
      ]}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          style={[
            styles.text,
            { color: getTextColor(), fontSize: sizing.fontSize },
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
});
