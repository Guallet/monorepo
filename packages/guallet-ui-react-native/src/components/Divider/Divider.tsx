import { View } from "react-native";
import { AppColors } from "../../..";

interface DividerProps {
  color?: string;
  width?: number;
}

export function Divider({ color = AppColors.black, width = 1 }: DividerProps) {
  return (
    <View
      style={{
        borderBottomColor: color,
        borderBottomWidth: width,
      }}
    />
  );
}
