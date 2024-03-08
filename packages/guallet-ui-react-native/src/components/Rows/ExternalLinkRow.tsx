import { Text } from "react-native";
import { BaseRow } from "./BaseRow";
import * as Linking from "expo-linking";

interface ExternalLinkRowProps extends React.ComponentProps<typeof BaseRow> {
  label: string;
  url: string;
}

export function ExternalLinkRow({
  label,
  url,
  ...props
}: ExternalLinkRowProps) {
  return (
    <BaseRow
      rightIconName="arrow-up-right-from-square"
      {...props}
      onClick={() => {
        Linking.openURL(url);
      }}
    >
      <Text>{label}</Text>
    </BaseRow>
  );
}
