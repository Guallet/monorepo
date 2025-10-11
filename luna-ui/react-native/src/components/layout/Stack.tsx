import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

type AlignItems = "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
type JustifyContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";
type MantineSpacing = "xs" | "sm" | "md" | "lg" | "xl" | number;

interface StackProps {
  children: React.ReactNode;
  align?: AlignItems;
  gap?: MantineSpacing;
  justify?: JustifyContent;
  style?: ViewStyle;
}

//TODO: Use the theme spacing values
const spacingMap = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Stack: React.FC<StackProps> = ({
  children,
  align = "stretch",
  gap = "md",
  justify = "flex-start",
  style,
}) => {
  const gapValue = typeof gap === "string" ? spacingMap[gap] : gap;

  const stackStyle = StyleSheet.create({
    container: {
      flexDirection: "column",
      alignItems: align,
      justifyContent: justify,
      gap: gapValue,
      ...style,
    },
  });

  return <View style={stackStyle.container}>{children}</View>;
};
