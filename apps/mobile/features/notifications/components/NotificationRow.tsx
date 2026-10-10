import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NotificationDto } from '@guallet/api-client';
import { useTheme } from '@guallet/luna-mobile';
import { CheckIcon, MoreIcon } from '@guallet/luna-mobile/icons';
import { notificationTime } from '../notificationTime';
import {
  NotificationCard,
  NotificationText,
  NotificationTypeLabel,
} from './NotificationUi';

export function NotificationRow({
  notification,
  locale,
  onOpen,
  onOptions,
  onMarkRead,
  pending = false,
  compact = false,
}: Readonly<{
  notification: NotificationDto;
  locale: string;
  onOpen: () => void;
  onOptions?: () => void;
  onMarkRead?: () => void;
  pending?: boolean;
  compact?: boolean;
}>) {
  const { colors, spacing, typography } = useTheme();
  let status = 'Read';
  let fontWeight: '400' | '600' = '400';
  if (!notification.isRead) {
    status = 'Unread';
    fontWeight = '600';
  }
  let numberOfLines: number | undefined;
  if (compact) numberOfLines = 2;
  const content = (
    <View style={[styles.row, { gap: spacing.sm }]}>
      {compact && <NotificationTypeLabel type={notification.type} iconOnly />}
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${notification.type.replaceAll('_', ' ')}, ${status}, ${notification.message}, ${notificationTime(notification.createdAt, locale)}`}
        accessibilityHint="Open the notification destination"
        style={[styles.content, { gap: spacing.sm }]}
      >
        {!compact && <NotificationTypeLabel type={notification.type} />}
        {!compact && !notification.isRead && (
          <Text
            style={{
              color: colors.accent.primary,
              fontSize: typography.sizes.xs,
            }}
          >
            Unread
          </Text>
        )}
        <Text
          numberOfLines={numberOfLines}
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.md,
            fontWeight,
          }}
        >
          {notification.message}
        </Text>
        <NotificationText secondary>
          {notificationTime(notification.createdAt, locale)}
        </NotificationText>
      </Pressable>
      {onOptions && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Options for ${notification.message}`}
          onPress={onOptions}
          style={styles.iconButton}
        >
          <MoreIcon
            size={spacing.lg}
            color={colors.text.secondary}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </Pressable>
      )}
      {onMarkRead && !notification.isRead && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Mark as read: ${notification.message}`}
          accessibilityState={{ disabled: pending, busy: pending }}
          disabled={pending}
          onPress={onMarkRead}
          style={styles.iconButton}
        >
          <CheckIcon
            size={spacing.lg}
            color={colors.accent.primary}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </Pressable>
      )}
    </View>
  );
  if (compact) return content;
  return <NotificationCard>{content}</NotificationCard>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  content: { flex: 1, minHeight: 44 },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
