import { getDefaultLocale, getCurrencySymbol } from './localeUtils';

describe('localeUtils', () => {
  describe('getDefaultLocale', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns default when navigator is undefined', () => {
      vi.stubGlobal('navigator', undefined);
      expect(getDefaultLocale()).toBe('en-US');
    });

    it('returns navigator.language when present', () => {
      vi.stubGlobal('navigator', {
        language: 'fr-FR',
      });
      expect(getDefaultLocale()).toBe('fr-FR');
    });
  });

  describe('getCurrencySymbol', () => {
    it('returns £ for GBP in en-US', () => {
      expect(getCurrencySymbol('GBP', 'en-US')).toBe('£');
    });

    it('returns € for EUR in de-DE', () => {
      expect(getCurrencySymbol('EUR', 'de-DE')).toBe('€');
    });

    it('returns £ for GBP in en-GB', () => {
      expect(getCurrencySymbol('GBP', 'en-GB')).toBe('£');
    });

    it('falls back to code and logs a warning for invalid currency', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(getCurrencySymbol('INVALID_CODE', 'en-US')).toBe('INVALID_CODE');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
