import type { NotificationDto } from '@guallet/api-client';
import { useNotificationMutations } from '@guallet/api-react';
import { useRouter } from 'expo-router';
import { useToast } from '@guallet/luna-mobile';
import { notificationDestination } from './notificationDestination';

export function useNotificationActions() {
  const mutations = useNotificationMutations();
  const router = useRouter();
  const toast = useToast();

  async function setRead(id: string, isRead: boolean, announce = true) {
    try {
      await mutations.markAsReadAsync(id, isRead);
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
      await mutations.markAllAsReadAsync();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Couldn’t update the notifications. Please try again.');
    }
  }

  /** Call only after the user confirms permanent deletion. */
  async function remove(id: string) {
    try {
      await mutations.deleteNotificationAsync(id);
      toast.success('Notification deleted');
      return true;
    } catch {
      toast.error('Couldn’t delete the notification. Please try again.');
      return false;
    }
  }

  function open(notification: NotificationDto) {
    const destination = notificationDestination(notification.action);
    if (!notification.isRead) void setRead(notification.id, true, false);

    if (!notification.action) return;
    if (!destination) {
      toast.error("This notification action isn't available in the app.");
      return;
    }

    try {
      router.push(destination);
    } catch {
      toast.error('Couldn’t open this page. Please try again.');
    }
  }

  return { ...mutations, setRead, markAllRead, remove, open };
}
