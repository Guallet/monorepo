import AsyncStorage from '@react-native-async-storage/async-storage';
import { LunaProvider } from '@guallet/luna-mobile';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const storageKey = 'guallet.theme-preference';

interface ThemePreferenceContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
}

const ThemePreferenceContext =
  createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadPreference() {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (
          isActive &&
          (saved === 'system' || saved === 'light' || saved === 'dark')
        ) {
          setPreference(saved);
        }
      } catch {
        // Keep following the phone if local storage is unavailable.
      } finally {
        if (isActive) setIsLoaded(true);
      }
    }

    void loadPreference();
    return () => {
      isActive = false;
    };
  }, []);

  async function savePreference(nextPreference: ThemePreference) {
    await AsyncStorage.setItem(storageKey, nextPreference);
    setPreference(nextPreference);
  }

  // Restore the saved appearance before rendering navigation.
  if (!isLoaded) return null;

  let colorScheme: 'light' | 'dark' | undefined;
  if (preference !== 'system') colorScheme = preference;

  return (
    <ThemePreferenceContext.Provider
      value={{ preference, setPreference: savePreference }}
    >
      <LunaProvider colorScheme={colorScheme}>{children}</LunaProvider>
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error('useThemePreference requires ThemePreferenceProvider');
  }
  return context;
}
