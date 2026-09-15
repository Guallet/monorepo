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
