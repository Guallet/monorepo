import { NotificationDto } from '@guallet/api-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';

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
      query.data?.filter(
        (dto): dto is NotificationDto => dto !== undefined,
      ) ?? [],
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
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    notifications:
      query.data?.filter(
        (dto): dto is NotificationDto => dto !== undefined,
      ) ?? [],
    unreadCount: query.data?.length ?? 0,
    ...query,
  };
}

export function useNotification(id: string | null) {
  const gualletClient = useGualletClient();

  const query = useQuery({
    enabled: !!id,
    queryKey: [NOTIFICATIONS_QUERY_KEY, id],
    queryFn: async () => {
      if (id) {
        return await gualletClient.notifications.get(id);
      } else {
        throw Error('Notification ID is null');
      }
    },
  });

  return { notification: query.data ?? null, ...query };
}
