import { View } from "react-native";
import { BaseRow } from "./BaseRow";
import { Label } from "../Text";

interface ValueRowProps extends React.ComponentProps<typeof BaseRow> {
  title: string;
  value: string | number;
}

export function ValueRow({ title, value, ...props }: ValueRowProps) {
  return (
    <BaseRow {...props}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Label
          style={{
            fontWeight: "bold",
          }}
        >
          {title}
        </Label>
        <Label>{value}</Label>
      </View>
    </BaseRow>
  );
}
