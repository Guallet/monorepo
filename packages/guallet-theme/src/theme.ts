import { Colors, defaultColors } from './colors';
import { Spacing, defaultSpacing } from './spacing';
import { Typography, defaultTypography } from './typography';
import { BorderRadius, defaultBorderRadius } from './borderRadius';
import { Breakpoints, defaultBreakpoints } from './breakpoints';

export interface GualletTheme {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
  borderRadius: BorderRadius;
  breakpoints: Breakpoints;
}

export const DefaultTheme: GualletTheme = {
  colors: defaultColors,
  spacing: defaultSpacing,
  typography: defaultTypography,
  borderRadius: defaultBorderRadius,
  breakpoints: defaultBreakpoints,
};
