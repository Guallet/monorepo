import { View } from "react-native";
import { AppColors } from "../../..";

interface DividerProps extends React.ComponentProps<typeof View> {
  color?: string;
  width?: number;
}

export function Divider({
  color = AppColors.black,
  width = 1,
  style,
}: DividerProps) {
  return (
    <View
      style={[
        {
          borderBottomColor: color,
          borderBottomWidth: width,
        },
        style,
      ]}
    />
  );
}
