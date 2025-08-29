import { useLocale } from "@/i18n/useLocale";
import { BaseRow } from "./BaseRow/BaseRow";
import { IconEdit } from "@tabler/icons-react";

export function LanguageRow() {
  const { locale } = useLocale();
  return (
    <BaseRow
      label="Default Language"
      value={locale}
      onClick={() => {
        console.log("Default Language clicked");
      }}
      rightSection={<IconEdit />}
    />
  );
}
