import { Spacing } from "@guallet/theme";
import { LunaSpacing } from "./spacing";

export const getSpacingValue = (
  spacing: Spacing,
  spacingKey: LunaSpacing,
): number => {
  if (typeof spacingKey === "number") {
    return spacingKey;
  }

  return spacing[spacingKey as keyof Spacing] ?? spacing.md;
};
