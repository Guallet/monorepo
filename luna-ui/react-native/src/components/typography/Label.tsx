import React from "react";
import { Text } from "react-native";

interface LabelProps extends React.ComponentProps<typeof Text> {
  color?: string;
  gradient?: { from: string; to: string; deg?: number };
  inherit?: boolean;
  inline?: boolean;
  lineClamp?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  span?: boolean;
  truncate?: "start" | "end" | "both";
  children: React.ReactNode;
}

export function Label({
  color,
  gradient,
  inherit = false,
  inline = false,
  lineClamp,
  size = "md",
  span = false,
  truncate,
  children,
  ...props
}: Readonly<LabelProps>) {
  const textProps = {
    color,
    gradient,
    inherit,
    inline,
    size,
    style: lineClamp
      ? {
          overflow: "hidden",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: lineClamp,
        }
      : {},
    ...props,
  };

  return (
    <Text
      // component={Component}
      //   truncate={truncate}
      {...props}
    >
      {children}
    </Text>
  );
}
