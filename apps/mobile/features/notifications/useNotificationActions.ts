import { useNotificationMutations } from '@guallet/api-react';
import { useToast } from '@guallet/luna-mobile';

export function useNotificationActions() {
  const mutations = useNotificationMutations();
  const toast = useToast();

  async function setRead(id: string, isRead: boolean, announce = true) {
    try {
      await mutations.markAsReadMutation.mutateAsync({ id, isRead });
      if (announce) {
        let message = 'Notification marked as unread';
        if (isRead) message = 'Notification marked as read';
        toast.success(message);
      }
      return true;
    } catch {
      toast.error('Couldn’t update the notification. Please try again.');
      return false;
    }
  }

  async function markAllRead() {
    try {
      await mutations.markAllAsReadMutation.mutateAsync();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Couldn’t update the notifications. Please try again.');
    }
  }

  /** Call only after the user confirms permanent deletion. */
  async function remove(id: string) {
    try {
      await mutations.deleteMutation.mutateAsync(id);
      toast.success('Notification deleted');
      return true;
    } catch {
      toast.error('Couldn’t delete the notification. Please try again.');
      return false;
    }
  }

  return { ...mutations, setRead, markAllRead, remove };
}
