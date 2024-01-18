import { ISO4217Currencies } from "@guallet/money";
import { NativeSelect, NativeSelectProps } from "@mantine/core";

interface CurrencyPickerProps extends NativeSelectProps {
  value: string;
  onValueChanged: (value: string) => void;
}

const currencyCodes = Object.values(ISO4217Currencies)
  .map((currency) => {
    return currency.code;
  })
  .sort();
// Remove the first element (antartica)
currencyCodes.shift();

export function CurrencyPicker({
  value,
  onValueChanged,
  ...props
}: CurrencyPickerProps) {
  return (
    <NativeSelect
      label="Account currency"
      description="The currency of the account"
      data={currencyCodes}
      value={value}
      onChange={(event) => {
        const selectedValue = event.currentTarget.value;
        onValueChanged?.(selectedValue);
      }}
      {...props}
    />
  );
}
