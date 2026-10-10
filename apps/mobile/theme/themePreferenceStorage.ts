import AsyncStorage from '@react-native-async-storage/async-storage';
import { isThemePreference, type ThemePreference } from './themePreference';

const storageKey = 'guallet.theme-preference';
const startupReadTimeoutMs = 1500;

/** Fall back to System on missing, invalid, failed, or stalled storage reads. */
export async function loadThemePreference(): Promise<ThemePreference> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    // The losing read has no state callback and cannot override a later choice.
    const saved = await Promise.race([
      AsyncStorage.getItem(storageKey),
      new Promise<null>((resolve) => {
        timeout = setTimeout(() => resolve(null), startupReadTimeoutMs);
      }),
    ]);
    if (isThemePreference(saved)) return saved;
    return 'system';
  } catch {
    return 'system';
  } finally {
    clearTimeout(timeout);
  }
}

/** Reject failed writes so callers can keep the active theme and report errors. */
export async function persistThemePreference(preference: ThemePreference) {
  await AsyncStorage.setItem(storageKey, preference);
}
