import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SectionProps extends React.ComponentProps<typeof View> {
  /** Section title displayed above the content */
  title: string;
  children: React.ReactNode;
}

export function Section({
  title,
  children,
  style,
  ...props
}: Readonly<SectionProps>) {
  return (
    <View style={[styles.container, style]} {...props}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    textTransform: "uppercase",
    paddingHorizontal: 4,
  },
  content: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
});
