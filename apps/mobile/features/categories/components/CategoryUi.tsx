import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, useTheme } from '@guallet/luna-mobile';
import { CategoryIcon } from '@guallet/luna-mobile/icons';

export function CategoryCard({ children }: Readonly<{ children: ReactNode }>) {
  const { colors, spacing, borderRadius } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.background.primary,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function CategoryState({
  title,
  body,
  action,
  onAction,
}: Readonly<{
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
}>) {
  const { colors, spacing } = useTheme();
  return (
    <CategoryCard>
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <CategoryIcon
          name="IconTags"
          color={colors.accent.primary}
          size={spacing.xl}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <CategoryText heading>{title}</CategoryText>
        {body && <CategoryText secondary>{body}</CategoryText>}
        {action && onAction && (
          <Button
            variant="outline"
            onClick={onAction}
            style={{ alignSelf: 'stretch' }}
          >
            {action}
          </Button>
        )}
      </View>
    </CategoryCard>
  );
}

export function CategoryText({
  children,
  heading = false,
  secondary = false,
  error = false,
}: Readonly<{
  children: ReactNode;
  heading?: boolean;
  secondary?: boolean;
  error?: boolean;
}>) {
  const { colors, typography } = useTheme();
  let color = colors.text.primary;
  let fontSize = typography.sizes.md;
  let weight: '400' | '600' = '400';
  let role: 'header' | 'alert' | undefined;
  if (secondary) {
    color = colors.text.secondary;
    fontSize = typography.sizes.sm;
  }
  if (heading) {
    weight = '600';
    fontSize = typography.sizes.lg;
    role = 'header';
  }
  if (error) {
    color = colors.status.error;
    role = 'alert';
  }
  return (
    <Text
      accessibilityRole={role}
      style={{ color, fontSize, fontWeight: weight }}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
