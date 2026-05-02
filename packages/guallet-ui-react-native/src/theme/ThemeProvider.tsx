import { createContext, PropsWithChildren } from 'react';
import { GualletTheme } from '@guallet/theme';
import { DefaultTheme } from './DefaultTheme';

export const ThemeContext = createContext<GualletTheme>(DefaultTheme);

export function LunaProvider({
  children,
  theme,
}: PropsWithChildren<{ theme?: GualletTheme }>) {
  return (
    <ThemeContext.Provider value={theme ?? DefaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
}
