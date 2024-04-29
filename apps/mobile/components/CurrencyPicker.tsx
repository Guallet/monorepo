import { Currency, ISO4217Currencies } from "@guallet/money";
import { CurrencyRow } from "./Rows/CurrencyRow";
import { BasePicker } from "./BasePicker";
import { View } from "react-native";
import { BaseRow, Label } from "@guallet/ui-react-native";

const allCurrencies = Object.values(ISO4217Currencies)
  .sort()
  .map((currency) => {
    return Currency.fromISOCode(currency.code, "en-GB");
  });

interface CurrencyPickerProps {
  currency: Currency | null;
  onCurrencyChanged: (newCurrency: Currency | null) => void;
}

export function CurrencyPicker({
  currency,
  onCurrencyChanged,
}: CurrencyPickerProps) {
  return (
    <BasePicker
      items={allCurrencies}
      selectedItem={currency}
      placeholder="Select currency"
      modalTitle="Select currency"
      renderItem={(item) => {
        return <CurrencyRow currency={item} />;
      }}
      onItemSelected={(item) => {
        onCurrencyChanged(item);
      }}
      renderButton={(item) => {
        return (
          <BaseRow showDivider={false}>
            <View
              style={{
                height: 50,
                justifyContent: "center",
              }}
            >
              <Label>{item.name}</Label>
            </View>
          </BaseRow>
        );
      }}
    />
  );
}
