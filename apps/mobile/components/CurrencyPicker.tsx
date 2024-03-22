import { Currency, ISO4217Currencies } from "@guallet/money";
import { SelectInput } from "./SelectInput";
import { CurrencyRow } from "./Rows/CurrencyRow";

const allCurrencies = Object.values(ISO4217Currencies)
  .sort()
  .map((currency) => {
    return Currency.fromISOCode(currency.code, "en-GB");
  });

interface CurrencyPickerProps {
  currency?: Currency | null;
  onCurrencyChanged: (newCurrency: Currency) => void;
  showLabel?: boolean;
}

export function CurrencyPicker({
  currency,
  showLabel = true,
  onCurrencyChanged,
}: CurrencyPickerProps) {
  return (
    <SelectInput
      label={showLabel ? "Currency" : undefined}
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
