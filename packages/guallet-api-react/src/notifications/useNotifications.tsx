import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';
import { NotificationDto } from '@guallet/api-client';

export const NOTIFICATIONS_QUERY_KEY = 'notifications';
export const UNREAD_NOTIFICATIONS_QUERY_KEY = 'notifications-unread';

export function useNotifications() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY],
    queryFn: async () => {
      const notifications = await gualletClient.notifications.getAll();

      // Prime the cache for each notification by ID
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

  const query = useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, id],
    queryFn: async () => {
      return await gualletClient.notifications.get(id);
    },
  });

  return { notification: query.data ?? null, ...query };
}
