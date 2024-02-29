import { Currency, ISO4217Currencies } from "@guallet/money";
import { SelectInput } from "./SelectInput";
import { CurrencyRow } from "./Rows/CurrencyRow";

interface CurrencyPickerProps {
  currency?: Currency | null;
  onCurrencyChanged: (newCurrency: Currency) => void;
}

const allCurrencies = Object.values(ISO4217Currencies)
  .sort()
  // Remove Antarctica
  .filter((currency) => currency.country !== "ANTARCTICA")
  .filter((currency) => currency.code !== "XXX")
  .map((currency) => {
    return Currency.fromISOCode(currency.code, "en-GB");
  });

export function CurrencyPicker({
  currency,
  onCurrencyChanged,
}: CurrencyPickerProps) {
  return (
    <SelectInput
      label="Currency"
      placeholder="Pick a currency"
      required
      searchable
      data={allCurrencies}
      value={currency?.name}
      itemTemplate={(item) => {
        return <CurrencyRow currency={item} />;
      }}
      onItemSelected={(item) => {
        onCurrencyChanged(item);
      }}
    />
  );
}
