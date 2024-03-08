import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";

interface LabelProps extends React.ComponentProps<typeof Text> {
  variant?: "body" | "title" | "header";
}

export function Label({ variant, style, children, ...props }: LabelProps) {
  //   switch (variant) {
  //     case "body":
  //       return <Text style={[styles.label, styles.body, style]}>{children}</Text>;
  //     case "title":
  //       return (
  //         <Text style={[styles.label, styles.title, style]}>{children}</Text>
  //       );
  //     case "header":
  //       return (
  //         <Text style={[styles.label, styles.header, style]}>{children}</Text>
  //       );
  //   }
  return (
    <Text style={[styles.label, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    // fontSize: 16,
    // fontWeight: "bold",
    // color: "black",
  },
});
