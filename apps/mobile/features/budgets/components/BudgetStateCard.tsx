import { Button, useTheme } from '@guallet/luna-mobile';
import { ChartBarIcon } from '@guallet/luna-mobile/icons';
import { StyleSheet, Text, View } from 'react-native';

export function BudgetStateCard({
  actionLabel,
  body,
  onAction,
  title,
  variant = 'empty',
}: Readonly<{
  actionLabel?: string;
  body: string;
  onAction?: () => void;
  title: string;
  variant?: 'empty' | 'error';
}>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          borderStyle: variant === 'empty' ? 'dashed' : 'solid',
          borderWidth: variant === 'empty' ? 2 : 1,
          padding: spacing.lg,
        },
      ]}
    >
      <View
        accessible={false}
        style={[
          styles.icon,
          {
            backgroundColor: colors.surface.background.secondary,
            borderRadius: borderRadius.lg,
            marginBottom: spacing.md,
          },
        ]}
      >
        <ChartBarIcon
          color={
            variant === 'error' ? colors.status.error : colors.text.secondary
          }
          size={32}
        />
      </View>
      <Text
        accessibilityRole="header"
        style={{
          color: colors.text.primary,
          fontSize: typography.sizes.lg,
          fontWeight: '700',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.sizes.sm,
          marginTop: spacing.sm,
          textAlign: 'center',
        }}
      >
        {body}
      </Text>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          style={{ alignSelf: 'stretch', marginTop: spacing.md }}
          variant={variant === 'error' ? 'outline' : 'filled'}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center' },
  icon: {
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
});
