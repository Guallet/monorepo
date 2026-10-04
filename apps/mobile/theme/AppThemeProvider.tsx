import { Appearance, Platform } from 'react-native';
import {
  loadThemePreference,
  persistThemePreference,
} from './themePreferenceStorage';
import { type ThemePreference, getThemeOverride } from './themePreference';
import { LunaProvider } from '@guallet/luna-mobile';
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

interface ThemePreferenceContextValue {
  preference: ThemePreference;
  savePreference: (preference: ThemePreference) => Promise<void>;
}

const ThemePreferenceContext =
  createContext<ThemePreferenceContextValue | null>(null);

/** Restore the device preference and coordinate Luna and native appearance. */
export function AppThemeProvider({ children }: Readonly<PropsWithChildren>) {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;

    /** Ignore restoration after unmount; storage failures already have a fallback. */
    async function loadPreference() {
      const saved = await loadThemePreference();
      if (!isActive) return;
      setPreference(saved);
      setIsLoaded(true);
    }

    void loadPreference();
    return () => {
      isActive = false;
    };
  }, []);

  /** Persist before applying so failed writes leave the current theme intact. */
  const savePreference = useCallback(
    async (nextPreference: ThemePreference) => {
      await persistThemePreference(nextPreference);
      setPreference(nextPreference);
    },
    [],
  );

  useEffect(() => {
    // React Native Web has no appearance override; Luna still applies its tokens.
    if (Platform.OS !== 'web' && isLoaded) {
      Appearance.setColorScheme(getThemeOverride(preference) ?? 'unspecified');
    }
  }, [preference, isLoaded]);

  useEffect(() => {
    return () => {
      if (Platform.OS !== 'web') Appearance.setColorScheme('unspecified');
    };
  }, []);

  const contextValue = useMemo(
    () => ({ preference, savePreference }),
    [preference, savePreference],
  );

  // AuthNavigator retains the native splash until navigation and auth are ready.
  // Wait for the bounded storage read to avoid rendering the wrong saved theme.
  if (!isLoaded) return null;

  const colorScheme = getThemeOverride(preference);

  return (
    <ThemePreferenceContext.Provider value={contextValue}>
      <LunaProvider colorScheme={colorScheme}>{children}</LunaProvider>
    </ThemePreferenceContext.Provider>
  );
}

/** Access the saved preference and its asynchronous persistence action. */
export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error('useThemePreference requires AppThemeProvider');
  }
  return context;
}
