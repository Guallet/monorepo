import { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { AppScreen } from '@/components/layout/AppScreen';
import { useMobileUserPreferences } from '@/features/settings/useMobileUserPreferences';
import { useNotificationActions } from '../useNotificationActions';
import {
  NotificationAction,
  NotificationRefreshError,
  NotificationSkeleton,
  NotificationState,
  NotificationText,
} from '../components/NotificationUi';
import { NotificationRow } from '../components/NotificationRow';
import { NotificationOptionsSheet } from '../components/NotificationOptionsSheet';

export function NotificationsScreen() {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { languageTag } = useMobileUserPreferences();
  const query = useNotifications();
  const actions = useNotificationActions();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const unread = query.notifications.filter(
    (notification) => !notification.isRead,
  );
  let visible = query.notifications;
  if (unreadOnly) visible = unread;
  const selected = query.notifications.find(
    (notification) => notification.id === selectedId,
  );
  const hasData = query.data !== undefined;
  const pending = actions.isUpdating || actions.isDeleting;

  let empty = (
    <NotificationState
      empty
      title="No notifications yet"
      body="Your notifications will appear here."
    />
  );
  if (unreadOnly)
    empty = (
      <NotificationState
        empty
        title="You’re all caught up"
        body="You have no unread notifications."
        action="View all notifications"
        onAction={() => setUnreadOnly(false)}
      />
    );
  if (query.isPending) empty = <NotificationSkeleton />;
  if (query.isError && !hasData)
    empty = (
      <NotificationState
        title="Couldn’t load notifications"
        body="Check your connection and try again."
        action="Try again"
        onAction={() => void query.refetch()}
      />
    );

  return (
    <AppScreen
      headerTitle="Notifications"
      headerOptions={{
        headerBackVisible: false,
        headerLeft: () => (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/(protected)/(tabs)');
            }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </Pressable>
        ),
      }}
    >
      <FlatList
        data={visible}
        keyExtractor={(notification) => notification.id}
        contentContainerStyle={{
          padding: spacing.md,
          paddingLeft: insets.left + spacing.md,
          paddingRight: insets.right + spacing.md,
          gap: spacing.md,
          paddingBottom: insets.bottom + spacing.md,
        }}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
            tintColor={colors.accent.primary}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: spacing.sm }}>
            {hasData && (
              <View
                style={[
                  styles.tabs,
                  {
                    backgroundColor: colors.surface.background.secondary,
                    borderRadius: borderRadius.md,
                    padding: spacing.xs,
                  },
                ]}
              >
                <NotificationAction
                  grow
                  label="All"
                  selected={!unreadOnly}
                  onPress={() => setUnreadOnly(false)}
                />
                <NotificationAction
                  grow
                  label={`Unread (${unread.length})`}
                  selected={unreadOnly}
                  onPress={() => setUnreadOnly(true)}
                />
              </View>
            )}
            {hasData && unread.length > 0 && (
              <View style={[styles.summary, { gap: spacing.sm }]}>
                <NotificationText secondary>
                  {unread.length} unread
                </NotificationText>
                <NotificationAction
                  busy={actions.isUpdating}
                  label="Mark all as read"
                  disabled={pending}
                  onPress={() => void actions.markAllRead()}
                />
              </View>
            )}
            {hasData && query.isError && (
              <NotificationRefreshError onRetry={() => void query.refetch()} />
            )}
          </View>
        }
        ListEmptyComponent={empty}
        renderItem={({ item }) => (
          <NotificationRow
            notification={item}
            locale={languageTag}
            onOpen={() => actions.open(item)}
            onOptions={() => setSelectedId(item.id)}
          />
        )}
      />
      {selected && (
        <NotificationOptionsSheet
          key={selected.id}
          notification={selected}
          pending={pending}
          onClose={() => setSelectedId(null)}
          onSetRead={() => actions.setRead(selected.id, !selected.isRead)}
          onDelete={() => actions.remove(selected.id)}
        />
      )}
    </AppScreen>
  );
}
const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
