import {
  mergeTheme,
  type GualletTheme,
  type GualletThemeOverrides,
} from '@guallet/theme';
import { DarkTheme, DefaultTheme } from './DefaultTheme';
import type { ThemeMode } from './ThemeProvider';

export interface ThemeSelection {
  mode: ThemeMode;
  theme?: GualletThemeOverrides;
  lightTheme?: GualletThemeOverrides;
  darkTheme?: GualletThemeOverrides;
}

export function resolveTheme({
  mode,
  theme,
  lightTheme,
  darkTheme,
}: ThemeSelection): GualletTheme {
  const baseTheme = mode === 'dark' ? DarkTheme : DefaultTheme;
  const sharedTheme = mergeTheme(baseTheme, theme);
  const appearanceTheme = mode === 'dark' ? darkTheme : lightTheme;

  return mergeTheme(sharedTheme, appearanceTheme);
}
