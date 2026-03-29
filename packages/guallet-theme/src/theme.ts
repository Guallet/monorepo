import { Colors } from './colors';
import { Spacing } from './spacing';
import { Typography } from './typography';
import { BorderRadius } from './borderRadius';
import { Breakpoints } from './breakpoints';

export interface GualletTheme {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
  borderRadius: BorderRadius;
  breakpoints: Breakpoints;
}
