import { getDefaultLocale, getCurrencySymbol } from './localeUtils';

describe('localeUtils', () => {
  describe('getDefaultLocale', () => {
    const originalNavigator = (
      globalThis as typeof globalThis & { navigator?: Navigator }
    ).navigator;

    afterEach(() => {
      (globalThis as typeof globalThis & { navigator?: Navigator }).navigator =
        originalNavigator;
    });

    it('returns default when navigator is undefined', () => {
      (
        globalThis as typeof globalThis & { navigator?: Partial<Navigator> }
      ).navigator = { language: undefined };
      expect(getDefaultLocale()).toBe('en-US');
    });

    it('returns navigator.language when present', () => {
      (
        globalThis as typeof globalThis & { navigator?: Partial<Navigator> }
      ).navigator = { language: 'fr-FR' };
      expect(getDefaultLocale()).toBe('fr-FR');
    });
  });

  describe('getCurrencySymbol', () => {
    it('returns $ for USD in en-US', () => {
      expect(getCurrencySymbol('USD', 'en-US')).toBe('$');
    });

    it('returns € for EUR in de-DE', () => {
      expect(getCurrencySymbol('EUR', 'de-DE')).toBe('€');
    });

    it('returns £ for GBP in en-GB', () => {
      expect(getCurrencySymbol('GBP', 'en-GB')).toBe('£');
    });

    it('falls back to code and logs a warning for invalid currency', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(getCurrencySymbol('INVALID_CODE', 'en-US')).toBe('INVALID_CODE');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
