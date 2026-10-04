import { ApiError } from '@guallet/api-client';

export function categoryErrorMessage(
  error: unknown,
  action: 'save' | 'delete',
): string {
  const fallback =
    action === 'save'
      ? 'Couldn’t save category. Try again.'
      : 'Couldn’t delete category. Try again.';
  if (!(error instanceof ApiError)) return fallback;

  switch (error.status) {
    case 400:
      return action === 'save'
        ? 'Check the category name and parent, then try again.'
        : 'Couldn’t delete this category. Refresh categories and try again.';
    case 401:
      return 'Your session has expired. Sign in again.';
    case 403:
      return action === 'save'
        ? 'You don’t have permission to save this category.'
        : 'You don’t have permission to delete this category.';
    case 404:
      return action === 'save'
        ? 'This category or its parent no longer exists. Refresh categories and try again.'
        : 'This category no longer exists. Return to categories and refresh the list.';
    case 409:
      return action === 'save'
        ? 'Move this category’s subcategories before changing its parent.'
        : 'This category has subcategories or is used by budgets or categorisation rules. Move or remove those references before deleting it.';
    case 429:
      return 'Too many requests. Wait a moment and try again.';
    default:
      return fallback;
  }
}
