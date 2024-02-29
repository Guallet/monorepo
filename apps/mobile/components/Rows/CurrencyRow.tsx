import { Currency } from "@guallet/money";
import { Spacing } from "@guallet/ui-react-native";
import { Text, View } from "react-native";

interface CurrencyRowProps {
  currency: Currency;
}

export function CurrencyRow({ currency }: CurrencyRowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignContent: "stretch",
        alignItems: "center",
        flexGrow: 1,
      }}
    >
      <Text
        style={{
          width: 50,
          marginHorizontal: Spacing.small,
        }}
      >
        {currency.symbol}
      </Text>
      <Text
        style={{
          flexGrow: 1,
          marginHorizontal: Spacing.small,
        }}
        numberOfLines={1}
      >
        {currency.name}
      </Text>
      <Text
        style={{
          width: 50,
          marginHorizontal: Spacing.small,
        }}
      >
        {currency.code}
      </Text>
    </View>
  );
}
