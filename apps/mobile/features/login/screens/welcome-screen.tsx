import { AuthIntro, AuthScreen } from '@/features/login/components/AuthLayout';
import { Button, useTheme } from '@guallet/luna-mobile';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { borderRadius, colors, spacing } = useTheme();

  return (
    <AuthScreen isHeaderVisible={false} contentStyle={styles.content}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.logoContainer,
          {
            backgroundColor: colors.surface.background.primary,
            borderColor: colors.surface.border.primary,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
          },
        ]}
      >
        <Image
          source={require('@/assets/images/icon.png')}
          contentFit="contain"
          style={styles.logo}
        />
      </View>
      <AuthIntro
        align="center"
        title={t('copy_1hgtj0q')}
        description={t('copy_yqz6bu')}
      />
      <Button onClick={() => router.push('/login')}>{t('copy_w9nig3')}</Button>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  logoContainer: { alignSelf: 'center', borderWidth: 1 },
  logo: { width: 96, height: 96 },
});
