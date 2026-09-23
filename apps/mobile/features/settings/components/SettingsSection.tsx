import { useTheme } from '@guallet/luna-mobile';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({
  title,
  children,
}: Readonly<SettingsSectionProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();

  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
            marginBottom: spacing.xs,
          },
        ]}
      >
        {title.toUpperCase()}
      </Text>
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.surface.background.primary,
            borderColor: colors.surface.border.primary,
            borderRadius: borderRadius.lg,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
  sectionTitle: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sectionCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
