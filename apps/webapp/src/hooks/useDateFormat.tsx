import { useUserSettings } from "@guallet/api-react";
import type { DateFormat } from "@guallet/api-client";

export function useDateFormat() {
  const { settings } = useUserSettings();
  const dateFormat = settings?.date_format as DateFormat | null;

  return {
    dateFormat,
  };
}
