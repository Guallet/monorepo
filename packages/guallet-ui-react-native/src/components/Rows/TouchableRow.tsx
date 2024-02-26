import { TouchableOpacity } from "react-native";

interface TouchableRowProps
  extends React.ComponentProps<typeof TouchableOpacity> {
  children: React.ReactNode;
  onClick?: () => void;
}

export function TouchableRow({ children, onClick, style }: TouchableRowProps) {
  return (
    <TouchableOpacity
      disabled={!onClick}
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
