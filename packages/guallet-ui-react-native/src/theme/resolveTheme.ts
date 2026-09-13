import type { GualletTheme } from '@guallet/theme';
import { DarkTheme, DefaultTheme } from './DefaultTheme';
import type { ThemeMode } from './ThemeProvider';

export interface ThemeSelection {
  mode: ThemeMode;
  theme?: GualletTheme;
  lightTheme?: GualletTheme;
  darkTheme?: GualletTheme;
}

export function resolveTheme({
  mode,
  theme,
  lightTheme,
  darkTheme,
}: ThemeSelection): GualletTheme {
  if (mode === 'dark') {
    return darkTheme ?? theme ?? DarkTheme;
  }

  return lightTheme ?? theme ?? DefaultTheme;
}
