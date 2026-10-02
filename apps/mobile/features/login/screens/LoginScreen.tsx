import { useAuth } from '@/auth/useAuth';
import { AuthIntro, AuthScreen } from '@/features/login/components/AuthLayout';
import { GoogleButton } from '@/features/login/components/GoogleButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Button,
  Divider,
  Group,
  Label,
  Stack,
  useTheme,
} from '@guallet/luna-mobile';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { loginWithProvider } = useAuth();
  const { borderRadius, colors, spacing, typography } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await loginWithProvider(
      'google',
      'guallet://login/callback',
    );
    setIsLoading(false);

    if (result.success) {
      return;
    }

    Alert.alert(
      t('Could not sign in'),
      result.error?.message ?? t('Please try again in a moment.'),
    );
  };

  return (
    <AuthScreen
      contentStyle={styles.content}
      footer={
        <Label
          center
          color={colors.text.secondary}
          size="xs"
          style={{ lineHeight: typography.sizes.xs * 1.5 }}
        >
          {t('copy_1ooxw1k')}
        </Label>
      }
      isHeaderVisible={false}
      isLoading={isLoading}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.hero,
          {
            backgroundColor: colors.button.secondary.default,
            borderColor: colors.surface.border.primary,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
          },
        ]}
      >
        <View
          style={[
            styles.orb,
            styles.orbTop,
            { backgroundColor: colors.accent.light },
          ]}
        />
        <View
          style={[
            styles.orb,
            styles.orbBottom,
            { backgroundColor: colors.support.light },
          ]}
        />
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: colors.surface.background.primary,
              borderRadius: borderRadius.xl,
            },
          ]}
        >
          <Image
            contentFit="contain"
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
          />
        </View>
        <View
          style={[
            styles.insightPill,
            {
              backgroundColor: colors.surface.background.primary,
              borderColor: colors.surface.border.primary,
              borderRadius: borderRadius.xl,
            },
          ]}
        >
          <Ionicons
            color={colors.status.success}
            name="trending-up"
            size={18}
          />
          <Label size="sm" style={{ fontWeight: '600' }}>
            {t('copy_mx8doj')}
          </Label>
        </View>
      </View>

      <AuthIntro
        align="center"
        description={t('copy_1hd0a1w')}
        eyebrow={t('copy_1u5qbd6')}
        title={t('copy_g6vm3y')}
      />

      <Stack gap={spacing.sm}>
        <Button onClick={() => router.push('/login/password')}>
          {t('copy_k5s3pg')}
        </Button>
        <Button
          onClick={() => router.push('/login/email-code')}
          variant="outline"
        >
          {t('copy_yy20z0')}
        </Button>
      </Stack>

      <Divider label={t('copy_puzibo')} />
      <GoogleButton disabled={isLoading} onPress={handleGoogleLogin} />

      <Group gap="xs" justify="center">
        <Ionicons
          color={colors.text.secondary}
          name="lock-closed-outline"
          size={14}
        />
        <Label color={colors.text.secondary} size="xs">
          {t('copy_so9ob')}
        </Label>
      </Group>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    borderWidth: 1,
    height: 226,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    height: 116,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    width: 116,
  },
  logo: {
    height: 82,
    width: 82,
  },
  orb: {
    borderRadius: 999,
    opacity: 0.22,
    position: 'absolute',
  },
  orbTop: {
    height: 180,
    right: -54,
    top: -92,
    width: 180,
  },
  orbBottom: {
    bottom: -80,
    height: 160,
    left: -40,
    width: 160,
  },
  insightPill: {
    alignItems: 'center',
    borderWidth: 1,
    bottom: 18,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    position: 'absolute',
    right: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
});
