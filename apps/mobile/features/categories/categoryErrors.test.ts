import { describe, expect, it } from 'vitest';
import { ApiError } from '@guallet/api-client';
import { categoryErrorMessage } from './categoryErrors';

describe('category screen HTTP error messages', () => {
  it('explains different conflict remedies for saving and deleting', () => {
    const error = new ApiError('Conflict', 409);
    expect(categoryErrorMessage(error, 'save')).toBe(
      'Move this category’s subcategories before changing its parent.',
    );
    expect(categoryErrorMessage(error, 'delete')).toBe(
      'This category has subcategories or is used by budgets or categorisation rules. Move or remove those references before deleting it.',
    );
  });

  it('distinguishes a missing parent from a deleted category', () => {
    const error = new ApiError('', 404);
    expect(categoryErrorMessage(error, 'save')).toContain('or its parent');
    expect(categoryErrorMessage(error, 'delete')).toContain(
      'Return to categories',
    );
  });

  it('directs invalid saves to the form fields', () => {
    expect(categoryErrorMessage(new ApiError('', 400), 'save')).toBe(
      'Check the category name and parent, then try again.',
    );
  });

  it.each([401, 403, 429])(
    'provides guidance for HTTP %i without using the client message',
    (status) => {
      const message = categoryErrorMessage(
        new ApiError('Server text', status),
        'delete',
      );
      expect(message).not.toContain('Server text');
      expect(message).not.toBe('Couldn’t delete category. Try again.');
      expect(message).not.toBe('');
    },
  );

  it.each([new ApiError('Server text', 503), new Error('Network details')])(
    'uses operation-specific fallbacks for server and network errors',
    (error) => {
      expect(categoryErrorMessage(error, 'save')).toBe(
        'Couldn’t save category. Try again.',
      );
      expect(categoryErrorMessage(error, 'delete')).toBe(
        'Couldn’t delete category. Try again.',
      );
    },
  );
});
