import { PropsWithChildren } from 'react';
import { MantineProvider } from '@mantine/core';
import {
  mergeTheme,
  type GualletTheme,
  type GualletThemeOverrides,
} from '@guallet/theme';
import { DefaultTheme } from './DefaultTheme';
import { GualletThemeContext } from './GualletThemeContext';
import { createMantineGualletTheme } from './createMantineTheme';

export interface GualletThemeProviderProps {
  /** Nested design-token overrides merged with the default theme. */
  theme?: GualletThemeOverrides;
}

export function GualletThemeProvider({
  children,
  theme,
}: PropsWithChildren<GualletThemeProviderProps>) {
  // No need to memoize this as we are using React Compiler which will optimize this for us.
  const resolvedTheme: GualletTheme = mergeTheme(DefaultTheme, theme);

  return (
    <GualletThemeContext.Provider value={resolvedTheme}>
      <MantineProvider theme={createMantineGualletTheme(resolvedTheme)}>
        {children}
      </MantineProvider>
    </GualletThemeContext.Provider>
  );
}
