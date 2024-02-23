import { View } from "react-native";

interface DividerProps {
  color?: string;
  width?: number;
}

export function Divider({ color, width }: DividerProps) {
  return (
    <View
      style={{
        borderBottomColor: color ?? "black",
        borderBottomWidth: width ?? 1,
      }}
    />
  );
}
