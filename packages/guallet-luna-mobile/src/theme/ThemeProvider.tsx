import {
  createContext,
  PropsWithChildren,
  useContext,
  useSyncExternalStore,
} from 'react';
import { type GualletTheme, type GualletThemeOverrides } from '@guallet/theme';
import { Platform, useColorScheme } from 'react-native';
import { DefaultTheme } from './DefaultTheme';
import { resolveTheme } from './resolveTheme';

export const ThemeContext = createContext<GualletTheme>(DefaultTheme);
export const ThemeModeContext = createContext<ThemeMode>('light');

export type ThemeMode = 'light' | 'dark';

const subscribeToHydration = () => () => {};
const getClientHydration = () => true;
const getServerHydration = () => Platform.OS !== 'web';

export interface LunaProviderProps {
  /** Nested overrides applied to both appearances before appearance overrides. */
  theme?: GualletThemeOverrides;
  /** Nested overrides for the light system appearance. */
  lightTheme?: GualletThemeOverrides;
  /** Nested overrides for the dark system appearance. */
  darkTheme?: GualletThemeOverrides;
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
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydration,
    getServerHydration,
  );

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
