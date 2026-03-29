import { generateColors } from '@mantine/colors-generator';
import { GualletTheme } from '@guallet/theme';
import { createTheme, type MantineThemeOverride } from '@mantine/core';

export function createMantineGualletTheme(
  theme: GualletTheme,
): MantineThemeOverride {
  return createTheme({
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
  });
}
