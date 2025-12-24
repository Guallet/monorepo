import React from "react";
import { View, StyleSheet } from "react-native";
import { getSpacingValue, LunaSpacing } from "@/theme";

type AlignItems = "flex-start" | "center" | "flex-end" | "stretch";
type JustifyContent =
  | "flex-start"
  | "center"
  | "flex-end"
  | "space-between"
  | "space-around"
  | "space-evenly";
type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";

interface GroupProps extends React.ComponentProps<typeof View> {
  align?: AlignItems;
  gap?: LunaSpacing;
  grow?: boolean;
  justify?: JustifyContent;
  preventGrowOverflow?: boolean;
  wrap?: FlexWrap;
}

const Group: React.FC<GroupProps> = ({
  align = "center",
  gap = "md",
  grow = false,
  justify = "flex-start",
  preventGrowOverflow = true,
  wrap = "wrap",
  children,
  ...props
}) => {
  const styles = StyleSheet.create({
    container: {
      display: "flex",
      flexDirection: "row",
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap,
      gap: getSpacingValue(gap),
      flexGrow: grow ? 1 : 0,
      maxWidth: preventGrowOverflow ? "100%" : undefined,
    },
  });

  return <View style={[styles.container, props.style]}>{children}</View>;
};

export default Group;
