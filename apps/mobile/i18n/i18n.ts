import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, toAppLanguage, type AppLanguage } from './resources';

const LANGUAGE_STORAGE_KEY = 'guallet.mobile.language';
let initialization: Promise<void> | undefined;

export function initializeMobileI18n(): Promise<void> {
  initialization ??= (async () => {
    let storedLanguage: string | null = null;

    try {
      storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch {
      // Use the device locale if local storage is unavailable.
    }

    const deviceLanguage = getLocales()[0]?.languageCode;
    const language = toAppLanguage(storedLanguage ?? deviceLanguage);

    await i18next.use(initReactI18next).init({
      compatibilityJSON: 'v4',
      debug: false,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      keySeparator: false,
      lng: language,
      resources,
      supportedLngs: ['en', 'es'],
    });
  })();

  return initialization;
}

export async function changeAppLanguage(language: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18next.changeLanguage(language);
}

export function getCurrentAppLanguage(): AppLanguage {
  return toAppLanguage(i18next.resolvedLanguage ?? i18next.language);
}

export function getCurrentAppLocale(languageTag?: string): string {
  const language = toAppLanguage(
    languageTag ?? i18next.resolvedLanguage ?? i18next.language,
  );
  const deviceLocale = getLocales()[0];
  if (deviceLocale?.languageCode === language) return deviceLocale.languageTag;
  return language;
}

export default i18next;
