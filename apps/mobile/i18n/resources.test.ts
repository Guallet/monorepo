import { describe, expect, it } from 'vitest';
import { toAppLanguage } from './resources';

describe('toAppLanguage', () => {
  it('matches Spanish device locales with region variants', () => {
    expect(toAppLanguage('es-419')).toBe('es');
  });

  it('uses English for English and unsupported locales', () => {
    expect(toAppLanguage('en-GB')).toBe('en');
    expect(toAppLanguage('fr-FR')).toBe('en');
    expect(toAppLanguage(null)).toBe('en');
  });
});
