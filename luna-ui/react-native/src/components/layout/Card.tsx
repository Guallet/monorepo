import React from "react";
import { View, StyleSheet } from "react-native";

interface CardProps extends React.ComponentProps<typeof View> {
  children: React.ReactNode;
  /** Inner padding (default: 16) */
  padding?: number;
  /** Border radius (default: 12) */
  radius?: number;
  /** Whether to show a shadow (default: true) */
  shadow?: boolean;
  /** Gap between children (default: 0) */
  gap?: number;
}

export function Card({
  children,
  padding = 16,
  radius = 12,
  shadow = true,
  gap,
  style,
  ...props
}: Readonly<CardProps>) {
  return (
    <View
      style={[
        styles.card,
        { padding, borderRadius: radius },
        gap != null && { gap },
        shadow && styles.shadow,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
