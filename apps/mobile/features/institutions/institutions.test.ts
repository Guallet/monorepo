import { describe, expect, it } from 'vitest';
import type { InstitutionDto } from '@guallet/api-client';
import {
  countryOptions,
  filterInstitutions,
  institutionInitials,
  institutionRequest,
  validateInstitutionForm,
} from './institutions';
const custom: InstitutionDto = {
  id: 'one',
  user_id: 'user',
  name: 'Workplace pension',
  countries: ['GB'],
};
const shared: InstitutionDto = {
  id: 'two',
  user_id: null,
  name: 'Bank',
  countries: ['IE'],
};
describe('Mobile institution management', () => {
  it('separates owned and shared institutions and searches by country name or code', () => {
    expect(filterInstitutions([custom, shared], '', false)).toEqual([custom]);
    expect(filterInstitutions([custom, shared], '  irelAND ', true)).toEqual([
      shared,
    ]);
    expect(filterInstitutions([custom, shared], 'GB', false)).toEqual([custom]);
    expect(
      filterInstitutions([custom, shared], 'united kingdom', false),
    ).toEqual([custom]);
    expect(filterInstitutions([custom, shared], 'no match', false)).toEqual([]);
  });
  it('does not split surrogate pairs when forming initials', () => {
    expect(institutionInitials('  𝒜lpha Bank ')).toBe('𝒜B');
    expect(institutionInitials('')).toBe('IN');
  });
  it('requires a trimmed name and permits only HTTP image URLs', () => {
    expect(
      validateInstitutionForm({ name: '  ', country: '', imageUrl: '' }),
    ).toHaveProperty('name');
    for (const imageUrl of [
      'file:///logo.png',
      'javascript:alert(1)',
      'not a URL',
    ])
      expect(
        validateInstitutionForm({ name: 'Bank', country: '', imageUrl }),
      ).toHaveProperty('imageUrl');
    expect(
      validateInstitutionForm({
        name: 'Bank',
        country: '',
        imageUrl: 'https://example.com/logo.png',
      }),
    ).toEqual({});
  });
  it('makes clearing a logo explicit and omits an unselected additional country', () => {
    expect(
      institutionRequest({ name: '  Pension ', country: '', imageUrl: '  ' }),
    ).toEqual({ name: 'Pension', image_src: null });
    expect(
      institutionRequest({
        name: 'Pension',
        country: 'IE',
        imageUrl: ' https://example.com/logo.png ',
      }),
    ).toEqual({
      name: 'Pension',
      country: 'IE',
      image_src: 'https://example.com/logo.png',
    });
  });
  it('provides unique ISO codes including the default GB country', () => {
    expect(countryOptions).toHaveLength(249);
    expect(new Set(countryOptions.map((item) => item.id)).size).toBe(249);
    expect(countryOptions.find((item) => item.id === 'GB')?.label).toBe(
      'United Kingdom',
    );
  });
});
