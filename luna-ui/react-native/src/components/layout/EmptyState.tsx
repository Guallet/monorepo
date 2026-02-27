import React from "react";
import { View, StyleSheet } from "react-native";
import { Label } from "./../typography";
import { Title } from "./../typography";

interface EmptyStateProps extends React.ComponentProps<typeof View> {
  /** Main title text */
  title: string;
  /** Descriptive message below the title */
  message: string;
  /** Optional icon or illustration to display above the title */
  icon?: React.ReactNode;
  /** Optional action element (button) to display below the message */
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  message,
  icon,
  action,
  style,
  ...props
}: Readonly<EmptyStateProps>) {
  return (
    <View style={[styles.container, style]} {...props}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Title>{title}</Title>
      <Label center>{message}</Label>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  icon: {
    marginBottom: 8,
  },
  action: {
    marginTop: 16,
  },
});
