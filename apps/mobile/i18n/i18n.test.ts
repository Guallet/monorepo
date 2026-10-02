import { beforeEach, describe, expect, it, vi } from 'vitest';

const localizationMocks = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  getLocales: vi.fn(),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: localizationMocks.getItem,
    setItem: localizationMocks.setItem,
  },
}));

vi.mock('expo-localization', () => ({
  getLocales: localizationMocks.getLocales,
}));

import {
  changeAppLanguage,
  getCurrentAppLocale,
  getCurrentAppLanguage,
  initializeMobileI18n,
  default as i18n,
} from './i18n';
import { copyEnglish } from './mobile-copy';

describe('mobile i18n', () => {
  beforeEach(() => {
    localizationMocks.getItem.mockResolvedValue('es');
    localizationMocks.setItem.mockResolvedValue(undefined);
    localizationMocks.getLocales.mockReturnValue([
      { languageCode: 'en', languageTag: 'en-GB' },
    ]);
  });

  it('prefers the persisted device language and saves later changes locally', async () => {
    await initializeMobileI18n();

    expect(getCurrentAppLanguage()).toBe('es');
    expect(getCurrentAppLocale()).toBe('es');
    const noAccountsKey = Object.entries(copyEnglish).find(
      ([, value]) => value === 'No accounts yet',
    )?.[0];
    expect(noAccountsKey).toBeDefined();
    expect(i18n.t(noAccountsKey!)).toBe('Aún no hay cuentas');
    expect(i18n.t('settings.currency', { count: 2 })).toBe('2 monedas');

    await changeAppLanguage('en');

    expect(localizationMocks.setItem).toHaveBeenCalledWith(
      'guallet.mobile.language',
      'en',
    );
    expect(getCurrentAppLanguage()).toBe('en');
    expect(getCurrentAppLocale()).toBe('en-GB');
  });
});
