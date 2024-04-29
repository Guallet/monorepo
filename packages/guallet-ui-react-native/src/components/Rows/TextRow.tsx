import { Text } from "react-native";
import { BaseRow } from "./BaseRow";

interface TextRowProps extends React.ComponentProps<typeof BaseRow> {
  label: string;
}

export function TextRow({ label, ...props }: TextRowProps) {
  return (
    <BaseRow {...props}>
      <Text>{label}</Text>
    </BaseRow>
  );
}
