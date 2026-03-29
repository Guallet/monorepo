import { useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useNotifications } from '@guallet/api-react';
import { NotificationDto, NotificationType } from '@guallet/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, EmptyState, ListRow } from '@luna-ui/react-native';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getTypeColor(type: NotificationType): string {
  switch (type) {
    case NotificationType.IMPORTANT:
      return '#EF4444';
    case NotificationType.WARNING:
      return '#F59E0B';
    case NotificationType.ACTION_REQUIRED:
      return '#3B82F6';
    case NotificationType.INFO:
    default:
      return '#6B7280';
  }
}

function NotificationRow({
  notification,
}: {
  notification: NotificationDto;
}) {
  const typeColor = getTypeColor(notification.type);

  return (
    <ListRow
      title={notification.message}
      subtitle={formatDate(notification.createdAt)}
      left={
        <Badge color={typeColor} size="sm" variant="filled">
          {notification.type}
        </Badge>
      }
      style={notification.isRead ? styles.readRow : undefined}
    />
  );
}

export function NotificationsScreen() {
  const { notifications, isLoading, refetch } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AppScreen
        headerTitle="Notifications"
        isLoading={isLoading && !refreshing}
      >
        {notifications.length === 0 && !isLoading ? (
          <EmptyState
            title="No notifications"
            message="You're all caught up! Notifications will appear here."
          />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NotificationRow notification={item} />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </AppScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  readRow: {
    opacity: 0.6,
  },
});
