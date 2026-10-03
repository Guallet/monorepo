import { describe, expect, it, vi } from 'vitest';
import {
  createAuthDestinationStore,
  createAuthNavigationCoordinator,
  DASHBOARD_ROUTE,
  getProtectedDestination,
} from './auth-destination';

const appRoot = 'guallet:///';

describe('protected deep-link destinations', () => {
  it.each([
    [
      'guallet://accounts/123/edit?currency=EUR',
      '/accounts/123/edit?currency=EUR',
    ],
    ['guallet:///transactions/123', '/transactions/123'],
    [
      '/(protected)/(tabs)/transactions?accountId=123',
      '/transactions?accountId=123',
    ],
    ['/(tabs)/accounts', '/accounts'],
    ['/budgets/123/edit', '/budgets/123/edit'],
    ['/budgets/new', '/budgets/new'],
    ['/export/', '/export'],
    ['/tools/loan', '/tools/loan'],
    ['/tools/mortgage', '/tools/mortgage'],
    [
      '/tools/mortgage/results?principal=100000',
      '/tools/mortgage/results?principal=100000',
    ],
    ['/tools/mortgage/schedule', '/tools/mortgage/schedule'],
    ['/tools/stamp-duty', '/tools/stamp-duty'],
    ['/tools/stamp-duty/bands', '/tools/stamp-duty/bands'],
    ['/importer/csv', '/importer/csv'],
    ['/importer/csv/accounts', '/importer/csv/accounts'],
    ['/importer/csv/categories', '/importer/csv/categories'],
    ['/importer/csv/properties', '/importer/csv/properties'],
    ['/importer/csv/preview', '/importer/csv/preview'],
    ['/importer/csv/results/job-123', '/importer/csv/results/job-123'],
    ['/settings', '/settings'],
  ])('normalizes %s without changing the destination', (url, expected) => {
    expect(getProtectedDestination(url, appRoot)).toBe(expected);
  });

  it('supports the current Expo Go server and same-origin web links', () => {
    expect(
      getProtectedDestination(
        'exp://localhost:8081/--/budgets/123?month=2026-10',
        'exp://localhost:8081/--/',
      ),
    ).toBe('/budgets/123?month=2026-10');
    expect(
      getProtectedDestination(
        'https://app.example.com/importer/csv/results/123',
        'https://app.example.com/',
      ),
    ).toBe('/importer/csv/results/123');
  });

  it.each([
    '/welcome',
    '/login',
    '/login/callback?token=secret',
    '/login/reset-password?token=secret',
    '/unknown',
    '/tools/unknown',
    '/accounts/123/unknown',
    '/transactions/123/edit',
    'https://foreign.example/accounts/123',
    '//foreign.example/accounts/123',
    'other-app://accounts/123',
    'guallet://user:password@accounts/123',
    '/unknown/../accounts/123',
    '/accounts/%2e%2e/settings',
    '/accounts/123%2fedit',
    '/accounts/123%252fedit',
    '/accounts/%zz',
    '/accounts/123\\edit',
  ])(
    'does not remember public, foreign, unknown or malformed links: %s',
    (url) => {
      expect(getProtectedDestination(url, appRoot)).toBeNull();
    },
  );
});

describe('pending destination lifetime', () => {
  it('keeps the latest protected link through callbacks and password recovery', () => {
    const store = createAuthDestinationStore();
    store.capture('guallet://accounts/first', appRoot);
    store.capture('guallet://transactions/latest?accountId=123', appRoot);
    store.capture('guallet://login/callback?token=secret', appRoot);
    store.capture('guallet://login/reset-password?token=secret', appRoot);
    store.capture('guallet://unknown', appRoot);
    expect(store.getSnapshot()).toBe('/transactions/latest?accountId=123');
  });

  it('clears a consumed intent and starts a new app process without an intent', () => {
    const store = createAuthDestinationStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.capture('/export', appRoot);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(createAuthDestinationStore().getSnapshot()).toBeNull();
    store.clear();
    expect(store.getSnapshot()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    store.capture('/tools/loan', appRoot);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('does not treat opening the app root as a blocked deep link', () => {
    const store = createAuthDestinationStore();
    store.capture('guallet:///', appRoot);
    expect(store.getSnapshot()).toBeNull();
  });
});

const signedOut = {
  routeKey: 'welcome:/welcome',
  isAuthenticated: false,
  pendingDestination: null,
  isLoginRoute: false,
  isSignInRoute: false,
  isCallbackRoute: false,
  isWelcomeRoute: true,
};

const login = {
  ...signedOut,
  routeKey: 'login/password:/login/password',
  isLoginRoute: true,
  isSignInRoute: true,
  isWelcomeRoute: false,
};

describe('authentication navigation', () => {
  it('leaves a regular signed-out launch on welcome and login failures on login', () => {
    const coordinator = createAuthNavigationCoordinator();
    expect(coordinator.getAction(signedOut)).toBeNull();
    expect(coordinator.getAction(login)).toBeNull();
    expect(coordinator.getAction(login)).toBeNull();
  });

  it('opens login for a blocked link and resumes it exactly once after sign-in', () => {
    const coordinator = createAuthNavigationCoordinator();
    const pendingDestination = '/transactions/123?accountId=456';
    expect(coordinator.getAction({ ...signedOut, pendingDestination })).toEqual(
      { destination: '/login', clearPending: false },
    );
    // Moving through login and a failed attempt keeps the pending destination.
    expect(coordinator.getAction({ ...login, pendingDestination })).toBeNull();
    expect(coordinator.getAction({ ...login, pendingDestination })).toBeNull();
    expect(
      coordinator.getAction({
        ...login,
        isAuthenticated: true,
        pendingDestination,
      }),
    ).toEqual({ destination: pendingDestination, clearPending: true });
    // Clearing the intent may render before Expo applies router.replace.
    expect(
      coordinator.getAction({ ...login, isAuthenticated: true }),
    ).toBeNull();
    expect(
      coordinator.getAction({
        ...login,
        routeKey: '(protected)/transactions/[id]:/transactions/123',
        isAuthenticated: true,
        isLoginRoute: false,
        isSignInRoute: false,
      }),
    ).toBeNull();
  });

  it('uses the dashboard after sign-in without a blocked link', () => {
    const coordinator = createAuthNavigationCoordinator();
    coordinator.getAction(login);
    expect(coordinator.getAction({ ...login, isAuthenticated: true })).toEqual({
      destination: DASHBOARD_ROUTE,
      clearPending: false,
    });
  });

  it('clears pending navigation and returns to welcome when a session ends', () => {
    const coordinator = createAuthNavigationCoordinator();
    const screen = {
      ...signedOut,
      routeKey: '(protected)/tools/loan:/tools/loan',
      isWelcomeRoute: false,
    };
    coordinator.getAction({ ...screen, isAuthenticated: true });
    expect(
      coordinator.getAction({ ...screen, pendingDestination: '/export' }),
    ).toEqual({ destination: '/welcome', clearPending: true });
  });

  it('finishes OAuth using the saved link, and retries unsuccessful callbacks', () => {
    const coordinator = createAuthNavigationCoordinator();
    const callback = {
      ...login,
      routeKey: 'login/callback:/login/callback',
      isCallbackRoute: true,
    };
    expect(coordinator.getAction(callback)).toEqual({
      destination: '/login',
      clearPending: false,
    });
    expect(
      coordinator.getAction({
        ...callback,
        isAuthenticated: true,
        pendingDestination: '/importer/csv/results/123',
      }),
    ).toEqual({ destination: '/importer/csv/results/123', clearPending: true });
  });

  it('allows password recovery for an already authenticated user', () => {
    const coordinator = createAuthNavigationCoordinator();
    expect(
      coordinator.getAction({
        ...login,
        routeKey: 'login/reset-password:/login/reset-password',
        isAuthenticated: true,
        isSignInRoute: false,
      }),
    ).toBeNull();
  });

  it('does not replace an authenticated launch into a protected screen', () => {
    const coordinator = createAuthNavigationCoordinator();
    expect(
      coordinator.getAction({
        ...signedOut,
        routeKey: '(protected)/accounts/[id]:/accounts/123',
        isAuthenticated: true,
        isWelcomeRoute: false,
      }),
    ).toBeNull();
  });
});
