import { afterEach, describe, expect, it } from 'vitest';
import { QueryClient } from '@guallet/api-react';
import { NotificationType, type NotificationDto } from '@guallet/api-client';
import {
  cacheNotification,
  cacheDeletedNotification,
  cacheAllRead,
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_NOTIFICATIONS_QUERY_KEY,
} from '../../../../packages/guallet-api-react/src/notifications/notificationCache';
const clients: QueryClient[] = [];
function client() {
  const value = new QueryClient();
  clients.push(value);
  return value;
}
const first: NotificationDto = {
  id: 'first',
  message: 'Review imported transactions',
  icon: null,
  type: NotificationType.ACTION_REQUIRED,
  action: '/transactions/inbox',
  isRead: false,
  createdAt: '2026-10-08T09:00:00Z',
};
const second: NotificationDto = {
  ...first,
  id: 'second',
  isRead: true,
  createdAt: '2026-10-08T10:00:00Z',
};
afterEach(() => clients.splice(0).forEach((value) => value.clear()));
describe('shared notification caches', () => {
  it('updates full history, unread preview and detail together after a successful read change', () => {
    const cache = client();
    cache.setQueryData([NOTIFICATIONS_QUERY_KEY], [first, second]);
    cache.setQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY], [first]);
    cacheNotification(cache, { ...first, isRead: true });
    expect(cache.getQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY])).toEqual([]);
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY])).toEqual([
      { ...first, isRead: true },
      second,
    ]);
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY, first.id])).toEqual({
      ...first,
      isRead: true,
    });
  });
  it('restores an unread message in newest-first order without duplicates', () => {
    const cache = client();
    cache.setQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY], [first]);
    cacheNotification(cache, { ...second, isRead: false });
    cacheNotification(cache, { ...second, isRead: false });
    expect(cache.getQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY])).toEqual([
      { ...second, isRead: false },
      first,
    ]);
  });
  it('does not seed incomplete lists when only a detail was fetched', () => {
    const cache = client();
    cacheNotification(cache, first);
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY])).toBeUndefined();
    expect(
      cache.getQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY]),
    ).toBeUndefined();
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY, first.id])).toEqual(
      first,
    );
  });
  it('marks the bulk operation snapshot read while preserving a newly arrived message', () => {
    const cache = client();
    const incoming = { ...second, isRead: false };
    cache.setQueryData([NOTIFICATIONS_QUERY_KEY], [incoming, first]);
    cache.setQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY], [incoming, first]);
    cacheAllRead(cache, [first.id]);
    expect(cache.getQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY])).toEqual([
      incoming,
    ]);
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY, first.id])).toEqual({
      ...first,
      isRead: true,
    });
  });
  it('deletes from every known surface without discarding unrelated messages', () => {
    const cache = client();
    cache.setQueryData([NOTIFICATIONS_QUERY_KEY], [first, second]);
    cache.setQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY], [first]);
    cache.setQueryData([NOTIFICATIONS_QUERY_KEY, first.id], first);
    cacheDeletedNotification(cache, first.id);
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY])).toEqual([second]);
    expect(cache.getQueryData([UNREAD_NOTIFICATIONS_QUERY_KEY])).toEqual([]);
    expect(cache.getQueryData([NOTIFICATIONS_QUERY_KEY, first.id])).toBeNull();
  });
});
