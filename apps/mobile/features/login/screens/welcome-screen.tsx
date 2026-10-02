import { AuthIntro, AuthScreen } from '@/features/login/components/AuthLayout';
import { Button, useTheme } from '@guallet/luna-mobile';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export function WelcomeScreen() {
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
        title="Welcome to Guallet"
        description="Keep track of your accounts, spending, and saving goals in one place."
      />
      <Button onClick={() => router.push('/login')}>Sign in</Button>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  logoContainer: { alignSelf: 'center', borderWidth: 1 },
  logo: { width: 96, height: 96 },
});
