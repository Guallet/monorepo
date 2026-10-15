import type { ReactNode } from 'react';
import { useState } from 'react';
import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button, type ButtonProps, useTheme } from '@guallet/luna-mobile';
import { BuildingBankIcon } from '@guallet/luna-mobile/icons';
import { institutionInitials } from '../institutions';

export function InstitutionButton({ style, ...props }: Readonly<ButtonProps>) {
  const { spacing } = useTheme();
  return (
    <Button
      {...props}
      style={{
        height: undefined,
        minHeight: 44,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        ...style,
      }}
    />
  );
}

export function InstitutionText({
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
  let fontWeight: '400' | '600' = '400';
  let role: 'header' | 'alert' | undefined;
  if (secondary) {
    color = colors.text.secondary;
    fontSize = typography.sizes.sm;
  }
  if (heading) {
    fontWeight = '600';
    fontSize = typography.sizes.lg;
    role = 'header';
  }
  if (error) {
    color = colors.status.error;
    role = 'alert';
  }
  return (
    <Text accessibilityRole={role} style={{ color, fontSize, fontWeight }}>
      {children}
    </Text>
  );
}
export function InstitutionCard({
  children,
}: Readonly<{ children: ReactNode }>) {
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
          gap: spacing.md,
        },
      ]}
    >
      {children}
    </View>
  );
}
export function InstitutionLogo({
  name,
  imageUrl,
}: Readonly<{ name: string; imageUrl?: string | null }>) {
  const { colors, borderRadius, typography } = useTheme();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(imageUrl) && imageUrl !== failedUrl;
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.logo,
        {
          backgroundColor: colors.button.secondary.default,
          borderColor: colors.surface.border.primary,
          borderRadius: borderRadius.lg,
        },
      ]}
    >
      {showImage && (
        <Image
          accessible={false}
          source={{ uri: imageUrl ?? undefined }}
          contentFit="contain"
          onError={() => setFailedUrl(imageUrl ?? null)}
          style={styles.image}
        />
      )}
      {!showImage && (
        <Text
          style={{
            color: colors.accent.primary,
            fontSize: typography.sizes.lg,
            fontWeight: '600',
          }}
        >
          {institutionInitials(name)}
        </Text>
      )}
    </View>
  );
}
export function InstitutionState({
  title,
  body,
  action,
  onAction,
  loading = false,
}: Readonly<{
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
  loading?: boolean;
}>) {
  const { colors, spacing } = useTheme();
  return (
    <InstitutionCard>
      <View style={[styles.state, { gap: spacing.md }]}>
        {loading && (
          <ActivityIndicator
            color={colors.accent.primary}
            accessibilityLabel={title}
          />
        )}
        {!loading && (
          <BuildingBankIcon
            size={48}
            color={colors.text.secondary}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        )}
        <InstitutionText heading>{title}</InstitutionText>
        {body && <InstitutionText secondary>{body}</InstitutionText>}
        {action && onAction && (
          <InstitutionButton variant="outline" onClick={onAction}>
            {action}
          </InstitutionButton>
        )}
      </View>
    </InstitutionCard>
  );
}
export const institutionStyles = StyleSheet.create({
  content: { flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  copy: { flex: 1, minWidth: 0 },
  target: { minHeight: 44, justifyContent: 'center' },
});
const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  logo: {
    width: 56,
    height: 56,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '80%', height: '80%' },
  state: { alignItems: 'center' },
});
