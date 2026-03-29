import { PropsWithChildren } from 'react';
import { MantineProvider } from '@mantine/core';
import { DefaultTheme, GualletTheme } from '@guallet/theme';
import { GualletThemeContext } from './GualletThemeContext';
import { createMantineGualletTheme } from './createMantineTheme';

interface GualletThemeProviderProps {
  theme?: Partial<GualletTheme>;
}

export function GualletThemeProvider({
  children,
  theme,
}: PropsWithChildren<GualletThemeProviderProps>) {
  // No need to memoize this as we are using React Compiler which will optimize this for us.
  const resolvedTheme: GualletTheme = {
    ...DefaultTheme,
    ...theme,
    colors: { ...DefaultTheme.colors, ...theme?.colors },
    spacing: { ...DefaultTheme.spacing, ...theme?.spacing },
    typography: { ...DefaultTheme.typography, ...theme?.typography },
    borderRadius: { ...DefaultTheme.borderRadius, ...theme?.borderRadius },
    breakpoints: { ...DefaultTheme.breakpoints, ...theme?.breakpoints },
  };

  return (
    <GualletThemeContext.Provider value={resolvedTheme}>
      <MantineProvider theme={createMantineGualletTheme(theme)}>
        {children}
      </MantineProvider>
    </GualletThemeContext.Provider>
  );
}
