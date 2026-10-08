import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';
import type { NotificationDto } from '@guallet/api-client';
import {
  cacheNotification,
  cacheDeletedNotification,
  cacheAllRead,
} from './notificationCache';
import {
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_NOTIFICATIONS_QUERY_KEY,
} from './useNotifications';

export function useNotificationMutations() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  async function cancelNotifications() {
    await Promise.all([
      queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] }),
      queryClient.cancelQueries({ queryKey: [UNREAD_NOTIFICATIONS_QUERY_KEY] }),
    ]);
  }

  async function refreshLists() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY],
        exact: true,
      }),
      queryClient.invalidateQueries({
        queryKey: [UNREAD_NOTIFICATIONS_QUERY_KEY],
      }),
    ]);
  }

  const markAsReadMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      return await gualletClient.notifications.update({
        id,
        dto: { isRead },
      });
    },
    onSuccess: async (notification) => {
      await cancelNotifications();
      cacheNotification(queryClient, notification);
      // Refresh separately: a confirmed write must not wait on an offline read.
      void refreshLists();
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await gualletClient.notifications.markAllAsRead();
    },
    onMutate: () => {
      const all =
        queryClient.getQueryData<NotificationDto[]>([
          NOTIFICATIONS_QUERY_KEY,
        ]) ?? [];
      const unread =
        queryClient.getQueryData<NotificationDto[]>([
          UNREAD_NOTIFICATIONS_QUERY_KEY,
        ]) ?? [];
      return [
        ...new Set(
          [...all, ...unread]
            .filter((item) => !item.isRead)
            .map((item) => item.id),
        ),
      ];
    },
    onSuccess: async (_data, _variables, ids) => {
      await cancelNotifications();
      cacheAllRead(queryClient, ids ?? []);
      // Refresh separately: a confirmed write must not wait on an offline read.
      void refreshLists();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await gualletClient.notifications.delete(id);
    },
    onSuccess: async (_data, id) => {
      await cancelNotifications();
      cacheDeletedNotification(queryClient, id);
      // Refresh separately: a confirmed write must not wait on an offline read.
      void refreshLists();
    },
  });

  return {
    markAsReadMutation,
    markAllAsReadMutation,
    deleteMutation,
    markAsRead: (id: string) => markAsReadMutation.mutate({ id, isRead: true }),
    markAsUnread: (id: string) =>
      markAsReadMutation.mutate({ id, isRead: false }),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    deleteNotification: (id: string) => deleteMutation.mutate(id),
    isUpdating: markAsReadMutation.isPending || markAllAsReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
