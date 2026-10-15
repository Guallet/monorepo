import { generateColors } from '@mantine/colors-generator';
import { GualletTheme } from '@guallet/theme';
import { createTheme, type MantineThemeOverride } from '@mantine/core';

export function createMantineGualletTheme(
  theme: GualletTheme,
): MantineThemeOverride {
  return createTheme({
    primaryColor: 'primary',
    primaryShade: 6,
    colors: {
      primary: generateColors(theme.colors.accent.primary),
      secondary: generateColors(theme.colors.accent.secondary),
      error: generateColors(theme.colors.status.error),
      success: generateColors(theme.colors.status.success),
      warning: generateColors(theme.colors.status.warning),
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
