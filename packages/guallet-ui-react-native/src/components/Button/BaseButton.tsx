import { TouchableOpacity } from "react-native";

export interface BaseButtonProps
  extends React.ComponentProps<typeof TouchableOpacity> {
  children?: React.ReactNode;
  onClick?: () => void;
}

export function BaseButton({ children, onClick, style }: BaseButtonProps) {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[
        {
          height: 48,
        },
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}
