import { generateColors } from '@mantine/colors-generator';
import { DefaultTheme, GualletTheme } from '@guallet/theme';
import type { MantineThemeOverride } from '@mantine/core';

export function createMantineGualletTheme(
  overrides?: Partial<GualletTheme>,
): MantineThemeOverride {
  const theme: GualletTheme = {
    ...DefaultTheme,
    ...overrides,
    colors: { ...DefaultTheme.colors, ...overrides?.colors },
    spacing: { ...DefaultTheme.spacing, ...overrides?.spacing },
    typography: { ...DefaultTheme.typography, ...overrides?.typography },
    borderRadius: { ...DefaultTheme.borderRadius, ...overrides?.borderRadius },
    breakpoints: { ...DefaultTheme.breakpoints, ...overrides?.breakpoints },
  };

  return {
    primaryColor: 'primary',
    colors: {
      primary: generateColors(theme.colors.primary),
      secondary: generateColors(theme.colors.secondary),
      error: generateColors(theme.colors.error),
      success: generateColors(theme.colors.success),
      warning: generateColors(theme.colors.warning),
      darkAccent: generateColors(theme.colors.darkAccent),
    },
    fontFamily: theme.typography.fontFamily,
    fontFamilyMonospace: theme.typography.fontFamilyMono,
    breakpoints: theme.breakpoints,
    radius: {
      xs: `${theme.borderRadius.xs}px`,
      sm: `${theme.borderRadius.sm}px`,
      md: `${theme.borderRadius.md}px`,
      lg: `${theme.borderRadius.lg}px`,
      xl: `${theme.borderRadius.xl}px`,
    },
    spacing: {
      xs: `${theme.spacing.xs}px`,
      sm: `${theme.spacing.sm}px`,
      md: `${theme.spacing.md}px`,
      lg: `${theme.spacing.lg}px`,
      xl: `${theme.spacing.xl}px`,
    },
    other: {
      colors: theme.colors,
    },
  };
}
