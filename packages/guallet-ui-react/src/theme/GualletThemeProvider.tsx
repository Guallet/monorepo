import { PropsWithChildren } from 'react';
import { MantineProvider } from '@mantine/core';
import type { Colors, DeepPartial, GualletTheme } from '@guallet/theme';
import { DefaultTheme } from './DefaultTheme';
import { GualletThemeContext } from './GualletThemeContext';
import { createMantineGualletTheme } from './createMantineTheme';

type GualletThemeOverrides = Omit<Partial<GualletTheme>, 'colors'> & {
  colors?: DeepPartial<Colors>;
};

interface GualletThemeProviderProps {
  theme?: GualletThemeOverrides;
}

function mergeColors(overrides?: DeepPartial<Colors>): Colors {
  const base = DefaultTheme.colors;

  return {
    ...base,
    ...overrides,
    text: { ...base.text, ...overrides?.text },
    surface: {
      ...base.surface,
      ...overrides?.surface,
      background: {
        ...base.surface.background,
        ...overrides?.surface?.background,
      },
      border: {
        ...base.surface.border,
        ...overrides?.surface?.border,
      },
    },
    button: { ...base.button, ...overrides?.button },
    accent: { ...base.accent, ...overrides?.accent },
    support: { ...base.support, ...overrides?.support },
    neutral: { ...base.neutral, ...overrides?.neutral },
    status: { ...base.status, ...overrides?.status },
    tabBar: { ...base.tabBar, ...overrides?.tabBar },
  };
}

export function GualletThemeProvider({
  children,
  theme,
}: PropsWithChildren<GualletThemeProviderProps>) {
  // No need to memoize this as we are using React Compiler which will optimize this for us.
  const resolvedTheme: GualletTheme = {
    ...DefaultTheme,
    ...theme,
    colors: mergeColors(theme?.colors),
    spacing: { ...DefaultTheme.spacing, ...theme?.spacing },
    typography: { ...DefaultTheme.typography, ...theme?.typography },
    borderRadius: { ...DefaultTheme.borderRadius, ...theme?.borderRadius },
    breakpoints: { ...DefaultTheme.breakpoints, ...theme?.breakpoints },
  };

  return (
    <GualletThemeContext.Provider value={resolvedTheme}>
      <MantineProvider theme={createMantineGualletTheme(resolvedTheme)}>
        {children}
      </MantineProvider>
    </GualletThemeContext.Provider>
  );
}
