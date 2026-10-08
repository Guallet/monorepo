import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotification } from '@guallet/api-react';
import { ApiError } from '@guallet/api-client';
import { useTheme, useToast } from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { notificationDestination } from '../notificationDestination';
import { notificationDate } from '../notificationTime';
import { useNotificationActions } from '../useNotificationActions';
import {
  NotificationAction,
  NotificationRefreshError,
  NotificationCard,
  NotificationSkeleton,
  NotificationState,
  NotificationText,
  NotificationTypeLabel,
} from '../components/NotificationUi';
import { NotificationOptionsSheet } from '../components/NotificationOptionsSheet';

export function NotificationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { languageTag } = useMobileUserPreferences();
  const query = useNotification(id);
  const actions = useNotificationActions();
  const router = useRouter();
  const toast = useToast();
  const openedId = useRef<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const missing = query.error instanceof ApiError && query.error.status === 404;
  let notification = query.notification;
  if (missing) notification = null;
  const { setRead } = actions;

  useEffect(() => {
    if (!notification || openedId.current === notification.id) return;
    openedId.current = notification.id;
    if (!notification.isRead) void setRead(notification.id, true, false);
  }, [notification, setRead]);

  let content = (
    <NotificationState
      title="Notification unavailable"
      body="This notification may have been deleted."
    />
  );
  if (query.isPending) content = <NotificationSkeleton />;
  if (query.isError && !notification && !missing)
    content = (
      <NotificationState
        title="Couldn’t load the notification"
        action="Try again"
        onAction={() => void query.refetch()}
      />
    );
  if (notification) {
    const destination = notificationDestination(notification.action);
    let readLabel = 'Mark as read';
    if (notification.isRead) readLabel = 'Mark as unread';
    content = (
      <NotificationCard>
        <NotificationTypeLabel type={notification.type} />
        <NotificationText>{notification.message}</NotificationText>
        <NotificationText secondary>
          {notificationDate(notification.createdAt, languageTag)}
        </NotificationText>
        {destination && (
          <NotificationAction
            label="View details"
            filled
            onPress={() => {
              try {
                router.push(destination);
              } catch {
                toast.error('Couldn’t open this page. Please try again.');
              }
            }}
          />
        )}
        {notification.action && !destination && (
          <>
            <NotificationText bold>
              Page unavailable in the app
            </NotificationText>
            <NotificationText secondary>
              You can still read and manage this notification here.
            </NotificationText>
          </>
        )}
        <NotificationAction
          label={readLabel}
          disabled={actions.isUpdating || actions.isDeleting}
          onPress={() =>
            void actions.setRead(notification.id, !notification.isRead)
          }
        />
        <NotificationAction
          label="Delete notification"
          destructive
          disabled={actions.isUpdating || actions.isDeleting}
          onPress={() => setDeleteOpen(true)}
        />
      </NotificationCard>
    );
  }
  return (
    <AppScreen headerTitle="Notification">
      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingLeft: insets.left + spacing.md,
          paddingRight: insets.right + spacing.md,
          gap: spacing.md,
          paddingBottom: insets.bottom + spacing.md,
        }}
      >
        {query.isError && notification && (
          <NotificationRefreshError onRetry={() => void query.refetch()} />
        )}
        {content}
      </ScrollView>
      {deleteOpen && notification && (
        <NotificationOptionsSheet
          notification={notification}
          confirmDelete
          pending={actions.isUpdating || actions.isDeleting}
          onClose={() => setDeleteOpen(false)}
          onSetRead={() =>
            actions.setRead(notification.id, !notification.isRead)
          }
          onDelete={async () => {
            const deleted = await actions.remove(notification.id);
            if (deleted) {
              setDeleteOpen(false);
              router.back();
            }
            return deleted;
          }}
        />
      )}
    </AppScreen>
  );
}
