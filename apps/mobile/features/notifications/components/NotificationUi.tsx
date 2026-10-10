import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@guallet/luna-mobile';
import { NotificationType } from '@guallet/api-client';
import {
  BellIcon,
  InfoIcon,
  WarningIcon,
  ImportantIcon,
  ActionRequiredIcon,
} from '@guallet/luna-mobile/icons';

export function NotificationCard({
  children,
  empty = false,
}: Readonly<{ children: ReactNode; empty?: boolean }>) {
  const { colors, spacing, borderRadius } = useTheme();
  return (
    <View
      style={[
        styles.card,
        empty && styles.empty,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          gap: spacing.md,
          shadowColor: colors.surface.shadow,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function NotificationText({
  children,
  secondary = false,
  heading = false,
  bold = false,
}: Readonly<{
  children: ReactNode;
  secondary?: boolean;
  heading?: boolean;
  bold?: boolean;
}>) {
  const { colors, typography } = useTheme();
  let fontSize = typography.sizes.md;
  let color = colors.text.primary;
  let fontWeight: '400' | '600' = '400';
  if (secondary) {
    fontSize = typography.sizes.sm;
    color = colors.text.secondary;
  }
  if (heading) {
    fontSize = typography.sizes.lg;
    fontWeight = '600';
  }
  if (bold) fontWeight = '600';
  let role: 'header' | undefined;
  if (heading) role = 'header';
  return (
    <Text accessibilityRole={role} style={{ color, fontSize, fontWeight }}>
      {children}
    </Text>
  );
}

export function NotificationTypeLabel({
  type,
  iconOnly = false,
}: Readonly<{ type: NotificationType; iconOnly?: boolean }>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  let Icon = InfoIcon;
  let label = 'Info';
  let color = colors.accent.primary;
  let backgroundColor = colors.surface.background.secondary;
  switch (type) {
    case NotificationType.WARNING:
      Icon = WarningIcon;
      label = 'Warning';
      color = colors.neutral.darkGrey;
      backgroundColor = colors.status.warning;
      break;
    case NotificationType.IMPORTANT:
      Icon = ImportantIcon;
      label = 'Important';
      color = colors.status.error;
      break;
    case NotificationType.ACTION_REQUIRED:
      Icon = ActionRequiredIcon;
      label = 'Action required';
      break;
  }
  return (
    <View style={[styles.type, { gap: spacing.sm }]}>
      <View
        style={{
          padding: spacing.xs,
          backgroundColor,
          borderRadius: borderRadius.md,
        }}
      >
        <Icon
          size={spacing.lg}
          color={color}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </View>
      {!iconOnly && (
        <Text
          style={{ color, fontSize: typography.sizes.sm, fontWeight: '600' }}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

/** Flexible-height controls that remain readable with larger system text. */
export function NotificationAction({
  label,
  onPress,
  disabled = false,
  selected,
  destructive = false,
  filled = false,
  grow = false,
  busy = false,
  icon,
}: Readonly<{
  label: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  destructive?: boolean;
  filled?: boolean;
  grow?: boolean;
  busy?: boolean;
  icon?: ReactNode;
}>) {
  const { colors, spacing, borderRadius, typography } = useTheme();
  let color = colors.accent.primary;
  let backgroundColor = 'transparent';
  if (selected === false) color = colors.text.secondary;
  if (selected === true) backgroundColor = colors.surface.background.primary;
  if (destructive) color = colors.status.error;
  if (filled) {
    backgroundColor = colors.button.primary.default;
    color = colors.button.onPrimary.default;
  }
  if (disabled) {
    color = colors.text.disabled;
    backgroundColor = colors.surface.background.disabled;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected, busy }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.action,
        grow && styles.grow,
        {
          padding: spacing.sm,
          gap: spacing.sm,
          borderRadius: borderRadius.md,
          backgroundColor,
        },
      ]}
    >
      {icon && (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {icon}
        </View>
      )}
      <Text
        style={[styles.actionLabel, { color, fontSize: typography.sizes.md }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function NotificationState({
  title,
  body,
  action,
  onAction,
  empty = false,
}: Readonly<{
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
  empty?: boolean;
}>) {
  const { colors, spacing } = useTheme();
  return (
    <NotificationCard empty={empty}>
      <View style={[styles.state, { gap: spacing.md }]}>
        <BellIcon
          size={spacing.xxl + spacing.sm}
          color={colors.text.secondary}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <NotificationText heading>{title}</NotificationText>
        {body && <NotificationText secondary>{body}</NotificationText>}
        {action && onAction && (
          <NotificationAction label={action} onPress={onAction} />
        )}
      </View>
    </NotificationCard>
  );
}

export function NotificationRefreshError({
  onRetry,
}: Readonly<{ onRetry: () => void }>) {
  return (
    <NotificationCard>
      <NotificationText secondary>
        Couldn’t refresh notifications
      </NotificationText>
      <NotificationAction label="Try again" onPress={onRetry} />
    </NotificationCard>
  );
}

export function NotificationSkeleton() {
  const { colors, spacing, borderRadius } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel="Loading notifications"
      accessibilityState={{ busy: true }}
      style={{ gap: spacing.md }}
    >
      {[0, 1, 2].map((id) => (
        <View
          key={id}
          style={{
            height: 96,
            borderRadius: borderRadius.lg,
            backgroundColor: colors.surface.background.secondary,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  empty: { borderStyle: 'dashed', borderWidth: 2 },
  type: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  action: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontWeight: '600', flexShrink: 1, textAlign: 'center' },
  grow: { flexGrow: 1, flexBasis: 0 },
  state: { alignItems: 'center' },
});
