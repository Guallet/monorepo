import { View } from "react-native";

interface RowProps extends React.ComponentProps<typeof View> {}
export function Row({ style, children, ...props }: RowProps) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
