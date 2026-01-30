import { useNordigenKeys } from "@guallet/api-react";
import { IconChevronRight } from "@tabler/icons-react";
import { BaseRow } from "@guallet/ui-react";
import { useTranslation } from "react-i18next";

interface NoridgenCredentialsRowProps {
  onClick: () => void;
}

export function NordigenCredentialsRow({ onClick }: NoridgenCredentialsRowProps) {
  const { t } = useTranslation();
  const { keys, isLoading } = useNordigenKeys();

  const getDisplayValue = () => {
    if (isLoading) return t("screens.nordigenKeys.row.loading");
    if (keys.length > 0) {
      return t("screens.nordigenKeys.row.configured", { count: keys.length });
    }
    return t("screens.nordigenKeys.row.notConfigured");
  };

  return (
    <BaseRow
      label={t("screens.nordigenKeys.row.label")}
      value={getDisplayValue()}
      rightSection={<IconChevronRight />}
      onClick={onClick}
    />
  );
}
