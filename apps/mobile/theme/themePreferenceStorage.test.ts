import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: vi.fn(), setItem: vi.fn() },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadThemePreference,
  persistThemePreference,
} from './themePreferenceStorage';
import {
  getThemeOverride,
  isThemePreference,
  themeLabels,
  themePreferences,
} from './themePreference';

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.useRealTimers());

describe('theme preferences', () => {
  it.each(themePreferences)('restores and labels %s', async (preference) => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(preference);
    expect(await loadThemePreference()).toBe(preference);
    expect(isThemePreference(preference)).toBe(true);
    expect(themeLabels[preference]).toBeTruthy();
  });

  it.each([null, '', 'unexpected'])(
    'defaults to System for %s',
    async (saved) => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(saved);
      expect(await loadThemePreference()).toBe('system');
      expect(isThemePreference(saved)).toBe(false);
    },
  );

  it('contains read failures and clears the startup timer', async () => {
    vi.useFakeTimers();
    vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error('Unavailable'));
    expect(await loadThemePreference()).toBe('system');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('falls back within 1.5 seconds when storage stalls', async () => {
    vi.useFakeTimers();
    vi.mocked(AsyncStorage.getItem).mockReturnValue(new Promise(() => {}));
    const loading = loadThemePreference();
    await vi.advanceTimersByTimeAsync(1500);
    expect(await loading).toBe('system');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('persists using the same key as restoration', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue('dark');
    await loadThemePreference();
    await persistThemePreference('light');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      vi.mocked(AsyncStorage.getItem).mock.calls[0][0],
      'light',
    );
  });

  it('propagates write errors to the caller', async () => {
    vi.mocked(AsyncStorage.setItem).mockRejectedValue(new Error('Disk full'));
    await expect(persistThemePreference('dark')).rejects.toThrow('Disk full');
  });

  it('only overrides explicit appearances', () => {
    expect(getThemeOverride('system')).toBeUndefined();
    expect(getThemeOverride('light')).toBe('light');
    expect(getThemeOverride('dark')).toBe('dark');
  });
});
