import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGualletClient } from './../GualletClientProvider';
import {
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_NOTIFICATIONS_QUERY_KEY,
} from './useNotifications';

export function useNotificationMutations() {
  const gualletClient = useGualletClient();
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      return await gualletClient.notifications.update({
        id,
        dto: { isRead },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [UNREAD_NOTIFICATIONS_QUERY_KEY],
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await gualletClient.notifications.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [UNREAD_NOTIFICATIONS_QUERY_KEY],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await gualletClient.notifications.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [UNREAD_NOTIFICATIONS_QUERY_KEY],
      });
    },
  });

  return {
    markAsRead: (id: string) => markAsReadMutation.mutate({ id, isRead: true }),
    markAsUnread: (id: string) =>
      markAsReadMutation.mutate({ id, isRead: false }),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    deleteNotification: (id: string) => deleteMutation.mutate(id),
    isUpdating: markAsReadMutation.isPending || markAllAsReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
