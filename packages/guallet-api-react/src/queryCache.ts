import type { QueryClient } from '@tanstack/react-query';

/** Drop cached user data whenever the authenticated identity changes. */
export function clearQueryCacheOnUserChange(
  queryClient: QueryClient,
  previousUserId: string | null,
  nextUserId: string | null,
): void {
  if (previousUserId !== nextUserId) {
    queryClient.clear();
  }
}
