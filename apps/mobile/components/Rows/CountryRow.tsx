import { Spacing } from "@guallet/ui-react-native";
import { BaseRow } from "@guallet/ui-react-native/src/components/Rows/BaseRow";
import { Text, View } from "react-native";

interface CountryRowProps {
  code: string;
  name: string;
  onClick?: (countryCode: string) => void;
}

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function CountryRow({ code, name, onClick }: CountryRowProps) {
  return (
    <BaseRow
      onClick={() => {
        onClick?.(code);
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            marginHorizontal: Spacing.small,
            fontSize: 24,
          }}
        >
          {getFlagEmoji(code)}
        </Text>
        <Text
          style={{
            marginHorizontal: Spacing.small,
          }}
        >
          {name}
        </Text>
      </View>
    </BaseRow>
  );
}
