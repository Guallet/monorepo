import { LunaSize } from "@/theme/typography";
import React from "react";
import { Text } from "react-native";

interface LabelProps extends React.ComponentProps<typeof Text> {
  color?: string;
  gradient?: { from: string; to: string; deg?: number };
  inherit?: boolean;
  inline?: boolean;
  lineClamp?: number;
  size?: LunaSize;
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
  return <Text {...props}>{children}</Text>;
}
