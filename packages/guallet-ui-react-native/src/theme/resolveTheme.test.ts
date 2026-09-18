import { describe, expect, it } from 'vitest';
import { defaultColors, defaultDarkColors, mergeTheme } from '@guallet/theme';
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
    const lightTheme = {
      colors: {
        text: { primary: '#111827' },
      },
    };
    const darkTheme = {
      colors: {
        text: { primary: '#F9FAFB' },
      },
    };

    expect(
      resolveTheme({ mode: 'light', lightTheme }).colors.text.primary,
    ).toBe(lightTheme.colors.text.primary);
    expect(resolveTheme({ mode: 'dark', darkTheme }).colors.text.primary).toBe(
      darkTheme.colors.text.primary,
    );
    expect(
      resolveTheme({ mode: 'light', lightTheme }).colors.text.secondary,
    ).toBe(defaultColors.text.secondary);
    expect(
      resolveTheme({ mode: 'dark', darkTheme }).colors.text.secondary,
    ).toBe(defaultDarkColors.text.secondary);
  });

  it('merges nested shared overrides and appearance-specific overrides', () => {
    const sharedTheme = {
      colors: {
        text: { primary: '#111827', secondary: '#4B5563' },
        surface: { background: { page: '#F9FAFB' } },
      },
      typography: {
        sizes: { xl: 28 },
      },
    };
    const lightTheme = {
      colors: { text: { secondary: '#374151' } },
    };
    const darkTheme = {
      colors: { text: { secondary: '#D1D5DB' } },
    };

    const resolvedLight = resolveTheme({
      mode: 'light',
      theme: sharedTheme,
      lightTheme,
      darkTheme,
    });
    const resolvedDark = resolveTheme({
      mode: 'dark',
      theme: sharedTheme,
      lightTheme,
      darkTheme,
    });

    expect(resolvedLight.colors.text.primary).toBe('#111827');
    expect(resolvedLight.colors.text.secondary).toBe('#374151');
    expect(resolvedLight.colors.surface.background.page).toBe('#F9FAFB');
    expect(resolvedLight.colors.surface.background.primary).toBe(
      defaultColors.surface.background.primary,
    );
    expect(resolvedLight.typography.sizes.xl).toBe(28);
    expect(DefaultTheme.colors.surface.background.page).toBe(
      defaultColors.surface.background.page,
    );
    expect(resolvedDark.colors.text.primary).toBe('#111827');
    expect(resolvedDark.colors.text.secondary).toBe('#D1D5DB');
    expect(resolvedDark.colors.surface.background.primary).toBe(
      defaultDarkColors.surface.background.primary,
    );
  });

  it('returns the base theme unchanged when no override is supplied', () => {
    expect(mergeTheme(DefaultTheme)).toBe(DefaultTheme);
  });

  it('falls back to the mode defaults when no overrides are supplied', () => {
    expect(resolveTheme({ mode: 'light' })).toBe(DefaultTheme);
    expect(resolveTheme({ mode: 'dark' })).toBe(DarkTheme);
  });
});
