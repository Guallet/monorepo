import { useTheme } from '@guallet/luna-mobile';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export interface SettingsRowProps {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  destructive?: boolean;
}

export function SettingsRow({
  icon,
  label,
  onPress,
  disabled = false,
  isLoading = false,
  destructive = false,
}: Readonly<SettingsRowProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          minHeight: 64,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        },
        pressed &&
          !disabled && {
            backgroundColor: colors.surface.background.secondary,
          },
        disabled && styles.disabledRow,
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: colors.button.secondary.default,
            borderRadius: borderRadius.md,
          },
          destructive && {
            backgroundColor: colors.surface.background.error,
          },
        ]}
      >
        {icon}
      </View>
      <Text
        style={[
          styles.rowLabel,
          {
            color: colors.text.primary,
            fontSize: typography.sizes.md,
            marginLeft: spacing.md,
          },
          destructive && { color: colors.status.error },
        ]}
      >
        {label}
      </Text>
      <View style={styles.rowAccessory}>
        {isLoading && <ActivityIndicator color={colors.status.error} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  rowIcon: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  rowLabel: {
    fontWeight: '600',
  },
  rowAccessory: {
    marginLeft: 'auto',
  },
  disabledRow: {
    opacity: 0.7,
  },
});
