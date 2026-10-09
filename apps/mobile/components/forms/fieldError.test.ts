import { describe, expect, it } from 'vitest';
import { fieldError } from './fieldError';

describe('field error presentation', () => {
  it('supports function validators and Standard Schema issues', () => {
    expect(fieldError(['Enter a name.'])).toBe('Enter a name.');
    expect(fieldError([{ message: 'Invalid email', path: ['email'] }])).toBe(
      'Invalid email',
    );
  });

  it('skips empty and unsupported errors without rendering object text', () => {
    expect(
      fieldError([undefined, null, '', {}, { message: 1 }, 'Useful error']),
    ).toBe('Useful error');
    expect(fieldError([])).toBeUndefined();
  });
});
