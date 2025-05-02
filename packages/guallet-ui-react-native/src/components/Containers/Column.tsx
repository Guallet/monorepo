import { View } from "react-native";

interface ColumnProps extends React.ComponentProps<typeof View> {}

export function Column({ style, children, ...props }: ColumnProps) {
  return (
    <View
      style={[
        {
          flexDirection: "column",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
