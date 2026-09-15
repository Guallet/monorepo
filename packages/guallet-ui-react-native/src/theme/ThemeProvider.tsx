import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { GualletTheme } from '@guallet/theme';
import { Platform, useColorScheme } from 'react-native';
import { DefaultTheme } from './DefaultTheme';
import { resolveTheme } from './resolveTheme';

export const ThemeContext = createContext<GualletTheme>(DefaultTheme);
export const ThemeModeContext = createContext<ThemeMode>('light');

export type ThemeMode = 'light' | 'dark';

export interface LunaProviderProps {
  /** A custom theme used for both appearances when no appearance override is supplied. */
  theme?: GualletTheme;
  /** Custom theme for the light system appearance. */
  lightTheme?: GualletTheme;
  /** Custom theme for the dark system appearance. */
  darkTheme?: GualletTheme;
  /** Override the system appearance. Useful for previews and tests. */
  colorScheme?: ThemeMode;
}

export function LunaProvider({
  children,
  theme,
  lightTheme,
  darkTheme,
  colorScheme,
}: PropsWithChildren<LunaProviderProps>) {
  const systemColorScheme = useColorScheme();
  const [isHydrated, setIsHydrated] = useState(Platform.OS !== 'web');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const mode =
    colorScheme ??
    (isHydrated && systemColorScheme === 'dark' ? 'dark' : 'light');
  const activeTheme = resolveTheme({
    mode,
    theme,
    lightTheme,
    darkTheme,
  });

  return (
    <ThemeModeContext.Provider value={mode}>
      <ThemeContext.Provider value={activeTheme}>
        {children}
      </ThemeContext.Provider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeMode {
  return useContext(ThemeModeContext);
}
