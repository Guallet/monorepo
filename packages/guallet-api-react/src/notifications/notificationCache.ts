import type { QueryClient } from '@tanstack/react-query';
import type { NotificationDto } from '@guallet/api-client';

export const NOTIFICATIONS_QUERY_KEY = 'notifications';
export const UNREAD_NOTIFICATIONS_QUERY_KEY = 'notifications-unread';

/** Never seed a partially known list; only change lists that were fetched. */
export function cacheNotification(
  client: QueryClient,
  notification: NotificationDto,
) {
  client.setQueryData([NOTIFICATIONS_QUERY_KEY, notification.id], notification);
  client.setQueryData<NotificationDto[]>([NOTIFICATIONS_QUERY_KEY], (current) =>
    current?.map((item) => (item.id === notification.id ? notification : item)),
  );
  client.setQueryData<NotificationDto[]>(
    [UNREAD_NOTIFICATIONS_QUERY_KEY],
    (current) => {
      if (!current) return undefined;
      const remaining = current.filter((item) => item.id !== notification.id);
      if (notification.isRead) return remaining;
      return [...remaining, notification].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
    },
  );
}

export function cacheDeletedNotification(client: QueryClient, id: string) {
  for (const key of [NOTIFICATIONS_QUERY_KEY, UNREAD_NOTIFICATIONS_QUERY_KEY]) {
    client.setQueryData<NotificationDto[]>([key], (current) =>
      current?.filter((item) => item.id !== id),
    );
  }
  // Do not refetch a deleted detail endpoint during list invalidation.
  client.setQueryData([NOTIFICATIONS_QUERY_KEY, id], null);
}

/** Only change notifications known when the bulk operation started. */
export function cacheAllRead(client: QueryClient, ids: readonly string[]) {
  const selected = new Set(ids);
  const known = new Map<string, NotificationDto>();
  for (const key of [NOTIFICATIONS_QUERY_KEY, UNREAD_NOTIFICATIONS_QUERY_KEY]) {
    client.getQueryData<NotificationDto[]>([key])?.forEach((item) => {
      if (selected.has(item.id)) known.set(item.id, { ...item, isRead: true });
    });
  }
  client.setQueryData<NotificationDto[]>([NOTIFICATIONS_QUERY_KEY], (current) =>
    current?.map((item) => known.get(item.id) ?? item),
  );
  client.setQueryData<NotificationDto[]>(
    [UNREAD_NOTIFICATIONS_QUERY_KEY],
    (current) => current?.filter((item) => !selected.has(item.id)),
  );
  for (const notification of known.values()) {
    client.setQueryData(
      [NOTIFICATIONS_QUERY_KEY, notification.id],
      notification,
    );
  }
}
