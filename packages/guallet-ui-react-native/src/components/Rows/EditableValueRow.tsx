import { View } from "react-native";
import { BaseRow } from "./BaseRow";
import { Label } from "../Text";
import { Icon, Spacing } from "../../..";

interface EditableValueRowProps extends React.ComponentProps<typeof BaseRow> {
  title: string;
  value: string | number;
  onValueChange: (newValue: string) => void;
}

export function EditableValueRow({
  title,
  value,
  onValueChange,
  ...props
}: Readonly<EditableValueRowProps>) {
  return (
    <BaseRow
      {...props}
      rightIconName={"pen"}
      showDivider={false}
      onClick={() => {
        // Here you would typically show a modal or input to change the value
        // For simplicity, we will just log the new value
        console.log(`Change ${title} to new value`);
        onValueChange("New Value"); // Replace with actual value change logic
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingEnd: Spacing.small,
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
