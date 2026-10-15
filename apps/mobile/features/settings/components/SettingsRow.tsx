import { useTheme } from '@guallet/luna-mobile';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export interface SettingsRowProps {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  destructive?: boolean;
  showChevron?: boolean;
  value?: string;
}

export function SettingsRow({
  icon,
  label,
  onPress,
  showChevron = false,
  disabled = false,
  isLoading = false,
  destructive = false,
  value,
}: Readonly<SettingsRowProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  let accessory: ReactNode = null;
  if (isLoading) {
    accessory = <ActivityIndicator color={colors.accent.primary} />;
  } else if (showChevron) {
    accessory = (
      <IconSymbol
        color={colors.text.secondary}
        name="chevron.right"
        size={20}
      />
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading, disabled }}
      accessibilityLabel={label}
      accessibilityValue={value !== undefined ? { text: value } : undefined}
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
      <View style={[styles.rowAccessory, { gap: spacing.xs }]}>
        {value !== undefined && (
          <Text
            numberOfLines={1}
            style={[
              styles.rowValue,
              {
                color: colors.text.secondary,
                fontSize: typography.sizes.sm,
              },
            ]}
          >
            {value}
          </Text>
        )}
        {accessory}
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
    flexShrink: 1,
    fontWeight: '600',
  },
  rowAccessory: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  rowValue: {
    maxWidth: 128,
    textAlign: 'right',
  },
  disabledRow: {
    opacity: 0.7,
  },
});
