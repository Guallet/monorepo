/** Only registered, authenticated routes can be resumed after sign-in. */
const protectedPaths = new Set([
  '/',
  '/accounts',
  '/transactions',
  '/budgets',
  '/saving-goals',
  '/saving-goals/new',
  '/settings',
  '/export',
  '/tools/loan',
  '/tools/mortgage',
  '/tools/mortgage/results',
  '/tools/mortgage/schedule',
  '/tools/stamp-duty',
  '/tools/stamp-duty/bands',
  '/importer/csv',
  '/importer/csv/accounts',
  '/importer/csv/categories',
  '/importer/csv/properties',
  '/importer/csv/preview',
]);

const protectedDetailPath =
  /^\/(accounts|budgets|saving-goals)\/[^/]+(?:\/edit)?$|^\/transactions\/[^/]+$|^\/importer\/csv\/results\/[^/]+$/;

export const DASHBOARD_ROUTE = '/(protected)/(tabs)' as const;

function hasControlCharacters(value: string) {
  return [...value].some((character) => character.charCodeAt(0) < 32);
}

/** Normalize custom-scheme, Expo Go and same-origin web links. */
export function getProtectedDestination(
  input: string,
  appRootUrl: string,
): string | null {
  try {
    // Reject URL normalization that could turn a foreign or malformed link
    // into a valid app route (including traversal and encoded separators).
    const rawPath = input.split(/[?#]/)[0];
    if (
      input.startsWith('//') ||
      /[\\\s]/.test(input) ||
      hasControlCharacters(input) ||
      /(?:^|\/)\.{1,2}(?:\/|$)/.test(rawPath) ||
      /%(?:2f|5c|2e)/i.test(rawPath)
    ) {
      return null;
    }

    const base = new URL(appRootUrl);
    const url = new URL(input, base);
    if (url.username || url.password) return null;
    let pathname = url.pathname;

    if (url.protocol === 'guallet:') {
      // In guallet://accounts/id, "accounts" is the URL hostname.
      if (url.hostname) pathname = `/${url.hostname}${url.pathname}`;
    } else {
      if (url.protocol !== base.protocol || url.host !== base.host) {
        return null;
      }
      if (url.protocol === 'exp:' || url.protocol === 'exps:') {
        pathname = pathname.replace(/^\/--(?:\/|$)/, '/');
      }
    }

    pathname = decodeURIComponent(pathname)
      .replace(/^\/\(protected\)(?=\/|$)/, '')
      .replace(/^\/\(tabs\)(?=\/|$)/, '')
      .replace(/\/$/, '');
    if (pathname === '') pathname = '/';

    if (
      /[%\\?#\s]/.test(pathname) ||
      hasControlCharacters(pathname) ||
      (!protectedPaths.has(pathname) && !protectedDetailPath.test(pathname))
    ) {
      return null;
    }

    return `${pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/** In-memory intent survives route changes, but never an app restart. */
export function createAuthDestinationStore() {
  let destination: string | null = null;
  const listeners = new Set<() => void>();

  function update(next: string | null) {
    if (next === destination) return;
    destination = next;
    for (const listener of listeners) listener();
  }

  return {
    getSnapshot: () => destination,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    capture(url: string, appRootUrl: string) {
      const next = getProtectedDestination(url, appRootUrl);
      // Opening the app's root should show welcome, not skip straight to login.
      if (!next || next.split(/[?#]/)[0] === '/') return false;
      update(next);
      return true;
    },
    clear: () => update(null),
  };
}

interface AuthNavigationState {
  isAuthenticated: boolean;
  wasAuthenticated: boolean | null;
  pendingDestination: string | null;
  isLoginRoute: boolean;
  isSignInRoute: boolean;
  isCallbackRoute: boolean;
  isWelcomeRoute: boolean;
}

export function getAuthNavigationAction(state: AuthNavigationState) {
  if (!state.isAuthenticated) {
    if (state.wasAuthenticated) {
      return { destination: '/welcome', clearPending: true };
    }
    if (
      state.isCallbackRoute ||
      (state.pendingDestination && !state.isLoginRoute)
    ) {
      return { destination: '/login', clearPending: false };
    }
    return null;
  }

  if (state.pendingDestination) {
    return { destination: state.pendingDestination, clearPending: true };
  }
  if (
    state.wasAuthenticated === false ||
    state.isSignInRoute ||
    state.isWelcomeRoute
  ) {
    return { destination: DASHBOARD_ROUTE, clearPending: false };
  }
  return null;
}

/** Do not replace a resumed link with the dashboard while routing is queued. */
export function createAuthNavigationCoordinator() {
  let wasAuthenticated: boolean | null = null;
  let inFlight: {
    routeKey: string;
    isAuthenticated: boolean;
    destination: string;
  } | null = null;

  return {
    getAction(
      state: Omit<AuthNavigationState, 'wasAuthenticated'> & {
        routeKey: string;
      },
    ) {
      if (
        inFlight?.routeKey === state.routeKey &&
        inFlight.isAuthenticated === state.isAuthenticated &&
        (!state.pendingDestination ||
          state.pendingDestination === inFlight.destination)
      ) {
        return null;
      }

      const action = getAuthNavigationAction({ ...state, wasAuthenticated });
      wasAuthenticated = state.isAuthenticated;
      inFlight = null;
      if (action) {
        inFlight = {
          routeKey: state.routeKey,
          isAuthenticated: state.isAuthenticated,
          destination: action.destination,
        };
      }
      return action;
    },
  };
}
