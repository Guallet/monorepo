import { LunaSpacing, Spacing } from "./spacing";
import { useTheme } from "./useTheme";

export const getSpacingValue = (spacingKey: LunaSpacing): number => {
  const { spacing } = useTheme();
  if (typeof spacingKey === "number") {
    return spacingKey;
  }

  return spacing[spacingKey as keyof Spacing] ?? spacing.md;
};
