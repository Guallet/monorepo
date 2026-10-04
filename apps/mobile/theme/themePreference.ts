export const themePreferences = ['system', 'light', 'dark'] as const;
export type ThemePreference = (typeof themePreferences)[number];

export const themeLabels: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

/** Validate values read from storage or an untyped selection control. */
export function isThemePreference(value: unknown): value is ThemePreference {
  const validPreferences: readonly unknown[] = themePreferences;
  return validPreferences.includes(value);
}

/** An absent override lets Luna and native appearance follow the phone. */
export function getThemeOverride(preference: ThemePreference) {
  if (preference === 'system') return undefined;
  return preference;
}
