import { View } from "react-native";
import { AppColors } from "../../theme/colors";
import { Row } from "../Containers";
import { Label } from "../Text";

interface DividerProps extends React.ComponentProps<typeof View> {
  color?: string;
  width?: number;
  label?: string;
}

export function Divider({
  color = AppColors.black,
  width = 1,
  label,
  style,
}: Readonly<DividerProps>) {
  if (!label) {
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

  return (
    <Row>
      <View
        style={[
          {
            flexGrow: 1,
            borderBottomColor: color,
            borderBottomWidth: width,
          },
          style,
        ]}
      />
      <Label>{label}</Label>
      <View
        style={[
          {
            flexGrow: 1,
            borderBottomColor: color,
            borderBottomWidth: width,
          },
          style,
        ]}
      />
    </Row>
  );
}
