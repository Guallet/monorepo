import { Colors } from './colors';
import { Spacing } from './spacing';
import { Typography } from './typography';
import { BorderRadius } from './borderRadius';
import { Breakpoints } from './breakpoints';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface GualletTheme {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
  borderRadius: BorderRadius;
  breakpoints: Breakpoints;
}

/** A nested set of design-token overrides for a Guallet theme. */
export type GualletThemeOverrides = DeepPartial<GualletTheme>;

type ThemeRecord = Record<string, unknown>;

function isThemeRecord(value: unknown): value is ThemeRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeThemeRecords(
  base: ThemeRecord,
  overrides: ThemeRecord,
): ThemeRecord {
  const merged = { ...base };

  for (const key of Object.keys(overrides)) {
    const override = overrides[key];
    if (override === undefined) {
      continue;
    }

    const baseValue = base[key];
    merged[key] =
      isThemeRecord(baseValue) && isThemeRecord(override)
        ? mergeThemeRecords(baseValue, override)
        : override;
  }

  return merged;
}

/**
 * Recursively merges theme overrides without mutating the base theme.
 *
 * When no overrides are provided, the original base theme is returned.
 */
export function mergeTheme(
  baseTheme: GualletTheme,
  overrides?: GualletThemeOverrides,
): GualletTheme {
  if (!overrides) {
    return baseTheme;
  }

  return mergeThemeRecords(
    baseTheme as unknown as ThemeRecord,
    overrides as ThemeRecord,
  ) as unknown as GualletTheme;
}
