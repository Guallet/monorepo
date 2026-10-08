import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';
import { NotificationDto } from '@guallet/api-client';

import {
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_NOTIFICATIONS_QUERY_KEY,
} from './notificationCache';
export {
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_NOTIFICATIONS_QUERY_KEY,
} from './notificationCache';

export function useNotifications() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY],
    queryFn: async ({ signal }) => {
      const notifications = await gualletClient.notifications.getAll();

      // Prime the cache for each notification by ID
      if (!signal.aborted)
        notifications?.forEach((notification) => {
          queryClient.setQueryData(
            [NOTIFICATIONS_QUERY_KEY, notification.id],
            notification,
          );
        });

      return notifications;
    },
  });

  return {
    notifications:
      query.data?.filter((dto): dto is NotificationDto => dto !== undefined) ??
      [],
    ...query,
  };
}

export function useUnreadNotifications() {
  const gualletClient = useGualletClient();

  const query = useQuery({
    queryKey: [UNREAD_NOTIFICATIONS_QUERY_KEY],
    queryFn: async () => {
      return await gualletClient.notifications.getUnread();
    },
    // Refetch more frequently for notifications
    refetchInterval: 300000, // Refetch every 5 minutes
    refetchIntervalInBackground: false, // Do not refetch in background
  });

  return {
    notifications:
      query.data?.filter((dto): dto is NotificationDto => dto !== undefined) ??
      [],
    unreadCount: query.data?.length ?? 0,
    ...query,
  };
}

export function useNotification(id: string) {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, id],
    // A dashboard preview remains readable even when its detail fetch is offline.
    initialData: () =>
      queryClient
        .getQueryData<NotificationDto[]>([NOTIFICATIONS_QUERY_KEY])
        ?.find((item) => item.id === id) ??
      queryClient
        .getQueryData<NotificationDto[]>([UNREAD_NOTIFICATIONS_QUERY_KEY])
        ?.find((item) => item.id === id),
    initialDataUpdatedAt: () => {
      for (const key of [
        NOTIFICATIONS_QUERY_KEY,
        UNREAD_NOTIFICATIONS_QUERY_KEY,
      ]) {
        const state = queryClient.getQueryState<NotificationDto[]>([key]);
        if (state?.data?.some((item) => item.id === id)) {
          return state.dataUpdatedAt;
        }
      }
      return undefined;
    },
    queryFn: async () => {
      return await gualletClient.notifications.get(id);
    },
  });

  return { notification: query.data ?? null, ...query };
}
