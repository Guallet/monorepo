import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearQueryCacheOnUserChange } from './queryCache';

describe('authenticated query cache contracts', () => {
  let queryClient: QueryClient;

  afterEach(() => {
    queryClient?.clear();
  });

  it('removes cached user data when an account signs out or changes', () => {
    queryClient = new QueryClient();
    queryClient.setQueryData(['accounts'], [{ id: 'private-account' }]);

    clearQueryCacheOnUserChange(queryClient, 'user-a', 'user-b');

    expect(queryClient.getQueryData(['accounts'])).toBeUndefined();
  });

  it('keeps cache intact when the authenticated user is unchanged', () => {
    queryClient = new QueryClient();
    queryClient.setQueryData(['accounts'], [{ id: 'account-a' }]);
    const clearSpy = vi.spyOn(queryClient, 'clear');

    clearQueryCacheOnUserChange(queryClient, 'user-a', 'user-a');

    expect(clearSpy).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(['accounts'])).toEqual([
      { id: 'account-a' },
    ]);
  });
});
