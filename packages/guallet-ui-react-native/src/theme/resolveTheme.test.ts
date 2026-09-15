import { describe, expect, it } from 'vitest';
import { defaultColors, defaultDarkColors } from '@guallet/theme';
import { DarkTheme, DefaultTheme } from './DefaultTheme';
import { resolveTheme } from './resolveTheme';

describe('resolveTheme', () => {
  it('uses semantic light navigation colors by default', () => {
    const theme = resolveTheme({ mode: 'light' });

    expect(theme).toBe(DefaultTheme);
    expect(theme.colors.tabBar).toEqual(defaultColors.tabBar);
    expect(theme.colors.tabBar.tint).toBe(defaultColors.accent.primary);
  });

  it('uses semantic dark navigation colors for dark appearance', () => {
    const theme = resolveTheme({ mode: 'dark' });

    expect(theme).toBe(DarkTheme);
    expect(theme.colors.tabBar).toEqual(defaultDarkColors.tabBar);
    expect(theme.colors.tabBar.background).toBe(
      defaultDarkColors.surface.background.primary,
    );
    expect(theme.colors.tabBar.border).toBe(
      defaultDarkColors.surface.border.primary,
    );
  });

  it('supports separate custom themes for each appearance', () => {
    const lightTheme = { ...DefaultTheme, colors: defaultColors };
    const darkTheme = { ...DarkTheme, colors: defaultDarkColors };

    expect(resolveTheme({ mode: 'light', lightTheme })).toBe(lightTheme);
    expect(resolveTheme({ mode: 'dark', darkTheme })).toBe(darkTheme);
  });
});
