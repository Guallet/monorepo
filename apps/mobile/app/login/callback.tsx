import { AuthIntro, AuthScreen } from '@/features/login/components/AuthLayout';
import { useTheme } from '@guallet/luna-mobile';
import { ActivityIndicator } from 'react-native';

/** The shared navigator completes or retries sign-in after session resolution. */
export default function Screen() {
  const { colors } = useTheme();
  return (
    <AuthScreen isHeaderVisible={false}>
      <AuthIntro
        title="Signing in"
        description="Please wait while we confirm your session."
        align="center"
      />
      <ActivityIndicator
        accessibilityLabel="Signing in"
        color={colors.accent.primary}
      />
    </AuthScreen>
  );
}
