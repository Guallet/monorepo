import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";

interface LabelProps extends React.ComponentProps<typeof Text> {
  variant?: "body" | "title" | "header" | "bold";
}

export function Label({ variant, style, children, ...props }: LabelProps) {
  let variantStyle: TextStyle = {};
  switch (variant) {
    case "bold": {
      variantStyle = {
        fontWeight: "bold",
      };
      break;
    }
  }
  return (
    <Text style={[styles.label, variantStyle, style]} {...props}>
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
