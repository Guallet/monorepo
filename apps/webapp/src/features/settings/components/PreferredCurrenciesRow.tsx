import { useUserSettings } from "@guallet/api-react";
import { BaseRow } from "./BaseRow/BaseRow";

export function PreferredCurrenciesRow() {
  const { settings } = useUserSettings();
  return (
    <BaseRow
      label={"Preferred Currencies"}
      value={` ${settings?.currencies.preferred_currencies.length ?? 0} selected`}
      onClick={() => {
        console.log("Preferred Currencies clicked");
      }}
    />
  );
}
