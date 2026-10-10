import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useUnreadNotifications } from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { BellIcon } from '@guallet/luna-mobile/icons';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { useNotificationActions } from '../useNotificationActions';
import { NotificationRow } from './NotificationRow';
import {
  NotificationAction,
  NotificationRefreshError,
  NotificationCard,
  NotificationSkeleton,
  NotificationState,
  NotificationText,
} from './NotificationUi';

export function NotificationBell() {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const query = useUnreadNotifications();
  const router = useRouter();
  let label = 'Notifications';
  let count = String(query.unreadCount);
  if (query.unreadCount > 99) count = '99+';
  if (query.data !== undefined)
    label = `Notifications, ${query.unreadCount} unread`;
  if (query.isError) label = 'Notifications, unread count unavailable';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => router.push('/(protected)/notifications')}
      style={styles.bell}
    >
      <BellIcon
        size={spacing.lg}
        color={colors.accent.primary}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      {query.data !== undefined && query.unreadCount > 0 && (
        <View
          style={[
            styles.badge,
            {
              paddingHorizontal: spacing.xs,
              borderRadius: borderRadius.lg,
              backgroundColor: colors.accent.primary,
            },
          ]}
        >
          <Text
            style={{
              color: colors.text.inverse,
              fontSize: typography.sizes.xs,
              fontWeight: '600',
            }}
          >
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function DashboardNotifications() {
  const { spacing } = useTheme();
  const { languageTag } = useMobileUserPreferences();
  const query = useUnreadNotifications();
  const actions = useNotificationActions();
  const router = useRouter();
  let content = (
    <NotificationText secondary>You’re all caught up</NotificationText>
  );
  if (query.isPending) content = <NotificationSkeleton />;
  if (query.isError && query.data === undefined)
    content = (
      <NotificationState
        title="Couldn’t load notifications"
        action="Try again"
        onAction={() => void query.refetch()}
      />
    );
  if (query.data !== undefined && query.notifications.length > 0)
    content = (
      <View style={{ gap: spacing.sm }}>
        <NotificationText secondary>
          {query.unreadCount} unread
        </NotificationText>
        {query.notifications.slice(0, 3).map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            locale={languageTag}
            compact
            onOpen={() => actions.open(notification)}
            onMarkRead={() => void actions.setRead(notification.id, true)}
            pending={actions.isUpdating}
          />
        ))}
      </View>
    );
  return (
    <NotificationCard>
      <NotificationText heading>Notifications</NotificationText>
      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        {content}
        {query.isError && query.data !== undefined && (
          <NotificationRefreshError onRetry={() => void query.refetch()} />
        )}
        <NotificationAction
          label="View all notifications"
          onPress={() => router.push('/(protected)/notifications')}
        />
      </View>
    </NotificationCard>
  );
}
const styles = StyleSheet.create({
  bell: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 20,
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
