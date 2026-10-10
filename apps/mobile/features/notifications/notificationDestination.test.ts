import { describe, expect, it } from 'vitest';
import { notificationDestination } from './notificationDestination';

const id = '550e8400-e29b-41d4-a716-446655440000';
describe('notification destinations', () => {
  it('maps web list URLs to the equivalent mobile tabs', () => {
    expect(notificationDestination('/accounts')).toEqual({
      pathname: '/(protected)/(tabs)/accounts',
    });
    expect(notificationDestination('/transactions')).toEqual({
      pathname: '/(protected)/(tabs)/transactions',
    });
    expect(notificationDestination('/budgets')).toEqual({
      pathname: '/(protected)/(tabs)/budgets',
    });
  });
  it.each(['accounts', 'transactions', 'budgets', 'saving-goals'])(
    'maps a %s resource without changing its ID',
    (domain) => {
      expect(notificationDestination(`/${domain}/${id}`)).toEqual({
        pathname: `/(protected)/${domain}/[id]`,
        params: { id },
      });
    },
  );
  it.each([
    null,
    '',
    '/transactions/inbox',
    '/accounts/new',
    '/reports',
    '/unknown',
    'https://example.com',
    '//example.com/accounts',
    '/accounts/../settings',
    '/accounts/%2e%2e',
    `/accounts/${id}?redirect=evil`,
    `/accounts/${id}#section`,
    '/accounts/not-a-uuid',
  ])('keeps unsupported action %s in the detail view', (action) => {
    expect(notificationDestination(action)).toBeNull();
  });
});
