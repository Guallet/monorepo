/** Map server-owned web paths only to equivalent, implemented mobile screens. */
export function notificationDestination(action: string | null) {
  switch (action) {
    case '/':
    case '/dashboard':
      return { pathname: '/(protected)/(tabs)' } as const;
    case '/accounts':
      return { pathname: '/(protected)/(tabs)/accounts' } as const;
    case '/transactions':
      return { pathname: '/(protected)/(tabs)/transactions' } as const;
    case '/budgets':
      return { pathname: '/(protected)/(tabs)/budgets' } as const;
    case '/settings':
      return { pathname: '/(protected)/(tabs)/settings' } as const;
    case '/categories':
      return { pathname: '/(protected)/categories' } as const;
    case '/saving-goals':
      return { pathname: '/(protected)/saving-goals' } as const;
  }
  // Reject query strings, fragments, external URLs and arbitrary route segments.
  const match =
    /^\/(accounts|transactions|budgets|saving-goals)\/([\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})$/i.exec(
      action ?? '',
    );
  if (!match) return null;
  const params = { id: match[2] };
  switch (match[1]) {
    case 'accounts':
      return { pathname: '/(protected)/accounts/[id]', params } as const;
    case 'transactions':
      return { pathname: '/(protected)/transactions/[id]', params } as const;
    case 'budgets':
      return { pathname: '/(protected)/budgets/[id]', params } as const;
    case 'saving-goals':
      return { pathname: '/(protected)/saving-goals/[id]', params } as const;
    default:
      return null;
  }
}
