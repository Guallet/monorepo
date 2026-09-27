import { AppScreen } from '@/components/layout/AppScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Label, Stack, Title, useTheme } from '@guallet/luna-mobile';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthScreenProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerTitle?: string;
  isHeaderVisible?: boolean;
  isLoading?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function AuthScreen({
  children,
  footer,
  headerTitle,
  isHeaderVisible = true,
  isLoading = false,
  contentStyle,
}: Readonly<AuthScreenProps>) {
  const { spacing } = useTheme();

  return (
    <AppScreen
      headerTitle={headerTitle}
      isHeaderVisible={isHeaderVisible}
      isLoading={isLoading}
    >
      <SafeAreaView
        edges={isHeaderVisible ? ['bottom'] : ['top', 'bottom']}
        style={styles.safeArea}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.safeArea}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { padding: spacing.lg },
            ]}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.content, contentStyle]}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppScreen>
  );
}

interface AuthIntroProps {
  eyebrow?: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

export function AuthIntro({
  eyebrow,
  title,
  description,
  align = 'left',
  icon,
}: Readonly<AuthIntroProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const isCentered = align === 'center';

  return (
    <Stack align={isCentered ? 'center' : 'flex-start'} gap={spacing.sm}>
      {icon ? (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colors.button.secondary.default,
              borderRadius: borderRadius.xl,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <Ionicons name={icon} size={28} color={colors.accent.primary} />
        </View>
      ) : null}
      {eyebrow ? (
        <Label
          color={colors.accent.primary}
          size="sm"
          style={{
            fontWeight: '700',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </Label>
      ) : null}
      <Title center={isCentered} size="xxl" style={styles.title}>
        {title}
      </Title>
      <Label
        center={isCentered}
        color={colors.text.secondary}
        style={{
          lineHeight: typography.sizes.md * typography.lineHeights.normal,
        }}
      >
        {description}
      </Label>
    </Stack>
  );
}

interface AuthLinkProps {
  children: React.ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export function AuthLink({
  children,
  onPress,
  accessibilityLabel,
  disabled = false,
}: Readonly<AuthLinkProps>) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.link,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Label
        color={disabled ? colors.text.disabled : colors.accent.primary}
        size="sm"
        style={{ fontWeight: '600' }}
      >
        {children}
      </Label>
    </Pressable>
  );
}

interface AuthNoticeProps {
  children: React.ReactNode;
  tone?: 'error' | 'info' | 'success';
}

export function AuthNotice({
  children,
  tone = 'info',
}: Readonly<AuthNoticeProps>) {
  const { borderRadius, colors, spacing, typography } = useTheme();
  const isError = tone === 'error';
  const isSuccess = tone === 'success';
  const color = isError
    ? colors.status.error
    : isSuccess
      ? colors.status.success
      : colors.accent.primary;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.notice,
        {
          backgroundColor: isError
            ? colors.surface.background.error
            : colors.surface.background.secondary,
          borderColor: color,
          borderRadius: borderRadius.md,
          padding: spacing.md,
        },
      ]}
    >
      <Ionicons
        name={
          isError
            ? 'alert-circle-outline'
            : isSuccess
              ? 'checkmark-circle-outline'
              : 'information-circle-outline'
        }
        size={20}
        color={color}
      />
      <Label
        color={isError ? colors.status.error : colors.text.primary}
        size="sm"
        style={{
          flex: 1,
          lineHeight: typography.sizes.sm * typography.lineHeights.normal,
        }}
      >
        {children}
      </Label>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    alignSelf: 'center',
    flex: 1,
    gap: 24,
    maxWidth: 480,
    width: '100%',
  },
  footer: {
    alignSelf: 'center',
    marginTop: 24,
    maxWidth: 480,
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  title: {
    lineHeight: 38,
  },
  link: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 8,
  },
  pressed: {
    opacity: 0.65,
  },
  disabled: {
    opacity: 0.6,
  },
  notice: {
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    flexDirection: 'row',
    gap: 10,
  },
});
