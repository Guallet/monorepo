import { useEffect } from 'react';
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  useWindowDimensions,
  StyleSheet,
  Text,
  type TextStyle,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckIcon, CloseIcon, InfoIcon, WarningIcon } from '../icons';
import { useTheme } from '../theme';
import type { ToastMessage } from './ToastQueue';

interface ToastCardProps {
  message: ToastMessage;
  onDismiss: () => void;
  onAction: () => void;
}

/** Custom content only: Sonner supplies positioning, gestures and lifetime. */
export function ToastCard({
  message,
  onDismiss,
  onAction,
}: Readonly<ToastCardProps>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableHeight = Math.max(
    0,
    height - insets.top - insets.bottom - spacing.sm * 2,
  );
  const cardWidth = Math.max(
    0,
    width - insets.left - insets.right - spacing.md * 2,
  );
  const announcement = [message.title, message.description]
    .filter(Boolean)
    .join('. ');
  useEffect(() => {
    if (Platform.OS === 'ios')
      AccessibilityInfo.announceForAccessibility(announcement);
  }, [announcement]);

  const iconColors = {
    success: colors.status.success,
    error: colors.status.error,
    warning: colors.status.warning,
    info: colors.accent.primary,
  };
  const icons = {
    success: CheckIcon,
    error: CloseIcon,
    warning: WarningIcon,
    info: InfoIcon,
  };
  const Icon = icons[message.variant];
  const touchSize = spacing.xxl + spacing.xs;

  return (
    <View
      style={[
        styles.card,
        {
          padding: spacing.md,
          width: cardWidth,
          maxHeight: Math.min(availableHeight, height * 0.6),
          gap: spacing.sm,
          borderRadius: borderRadius.lg,
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          shadowColor: colors.surface.shadow,
        },
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Icon size={spacing.lg} color={iconColors[message.variant]} />
      </View>
      <View style={styles.content}>
        <ScrollView
          style={styles.message}
          disallowInterruption
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          <View
            accessible
            accessibilityRole="alert"
            accessibilityLabel={announcement}
            accessibilityLiveRegion="assertive"
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.md,
                fontWeight: typography.weights
                  .semibold as TextStyle['fontWeight'],
                lineHeight: typography.sizes.md * typography.lineHeights.normal,
              }}
            >
              {message.title}
            </Text>
            {message.description && (
              <Text
                style={{
                  color: colors.text.secondary,
                  marginTop: spacing.xs,
                  fontSize: typography.sizes.sm,
                  lineHeight:
                    typography.sizes.sm * typography.lineHeights.normal,
                }}
              >
                {message.description}
              </Text>
            )}
          </View>
        </ScrollView>
        {message.action && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={message.action.label}
            onPress={onAction}
            style={({ pressed }) => [
              styles.action,
              {
                minHeight: touchSize,
                minWidth: touchSize,
                marginTop: spacing.sm,
                paddingHorizontal: spacing.sm,
                borderRadius: borderRadius.md,
                backgroundColor: pressed
                  ? colors.button.secondary.pressed
                  : colors.button.secondary.default,
              },
            ]}
          >
            <Text
              style={{
                color: colors.accent.primary,
                fontSize: typography.sizes.sm,
              }}
            >
              {message.action.label}
            </Text>
          </Pressable>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
        onPress={onDismiss}
        style={({ pressed }) => [
          styles.close,
          {
            minWidth: touchSize,
            minHeight: touchSize,
            borderRadius: borderRadius.md,
            backgroundColor: pressed
              ? colors.surface.background.secondary
              : colors.surface.background.primary,
          },
        ]}
      >
        <CloseIcon
          size={spacing.lg}
          color={colors.text.secondary}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    maxWidth: 600,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  content: { flex: 1, minWidth: 0, minHeight: 0 },
  message: { flexGrow: 0, flexShrink: 1 },
  action: { alignSelf: 'flex-start', justifyContent: 'center' },
  close: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
