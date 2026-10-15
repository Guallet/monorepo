import { ApiError } from '@guallet/api-client';
export function institutionError(error: unknown, action: 'save' | 'delete') {
  if (error instanceof ApiError) {
    if (error.status === 409)
      return 'Move accounts to another institution before deleting this one.';
    if (error.status === 403) return 'Shared institutions cannot be changed.';
    if (error.status === 404)
      return 'This institution is no longer available. Return to the list and try again.';
    if (error.status === 400)
      return 'Check the institution details and try again.';
  }
  return `Couldn’t ${action} this institution. Check your connection and try again.`;
}
