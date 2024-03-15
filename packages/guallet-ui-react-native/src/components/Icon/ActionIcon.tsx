import { TouchableOpacity } from "react-native";
import { Icon } from "./Icon";

interface ActionIconProps extends React.ComponentProps<typeof Icon> {
  onClick?: () => void;
  style?: React.ComponentProps<typeof TouchableOpacity>["style"];
}

export function ActionIcon({ onClick, style, ...props }: ActionIconProps) {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[
        {
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      <Icon {...props} />
    </TouchableOpacity>
  );
}
