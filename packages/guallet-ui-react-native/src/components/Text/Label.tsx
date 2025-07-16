import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";

export type LabelProps = TextProps & {
  variant?: "body" | "bold" | "header" | "title" | "subtitle";
};

export function Label({
  style,
  variant = "body",
  ...rest
}: Readonly<LabelProps>) {
  return (
    <Text
      style={[
        variant === "body" ? styles.body : undefined,
        variant === "bold" ? styles.bodyBold : undefined,
        variant === "header" ? styles.header : undefined,
        variant === "title" ? styles.title : undefined,
        variant === "subtitle" ? styles.subtitle : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  header: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
