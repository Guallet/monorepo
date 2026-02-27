import React from "react";
import { View, StyleSheet } from "react-native";

interface ProgressBarProps extends React.ComponentProps<typeof View> {
  /** Progress value between 0 and 100 */
  value: number;
  /** Color of the filled portion */
  color?: string;
  /** Color of the unfilled background */
  backgroundColor?: string;
  /** Height of the progress bar */
  height?: number;
  /** Border radius */
  radius?: number;
}

export function ProgressBar({
  value,
  color = "#007AFF",
  backgroundColor = "#E5E7EB",
  height = 8,
  radius = 4,
  style,
  ...props
}: Readonly<ProgressBarProps>) {
  const clampedValue = Math.max(0, Math.min(value, 100));

  return (
    <View
      style={[
        styles.background,
        { backgroundColor, height, borderRadius: radius },
        style,
      ]}
      {...props}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedValue}%`,
            backgroundColor: color,
            borderRadius: radius,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
