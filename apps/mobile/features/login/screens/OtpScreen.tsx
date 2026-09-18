import { useAuth } from '@/auth/useAuth';
import {
  AuthIntro,
  AuthLink,
  AuthNotice,
  AuthScreen,
} from '@/features/login/components/AuthLayout';
import {
  Button,
  Label,
  OtpInput,
  Stack,
  useTheme,
} from '@guallet/ui-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, AppState, StyleSheet, View } from 'react-native';
import { openInbox } from 'react-native-email-link';

const RESEND_DELAY_SECONDS = 30;

export function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? '';
  const { getOtpCode, verifyOtpCode } = useAuth();
  const { colors, spacing } = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState(
    () => Date.now() + RESEND_DELAY_SECONDS * 1000,
  );
  const [resendSeconds, setResendSeconds] = useState(RESEND_DELAY_SECONDS);

  useEffect(() => {
    const updateRemainingTime = () => {
      const remainingSeconds = Math.max(
        0,
        Math.ceil((resendAvailableAt - Date.now()) / 1000),
      );
      setResendSeconds(remainingSeconds);
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        updateRemainingTime();
      }
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [resendAvailableAt]);

  const handleVerifyCode = async () => {
    if (code.length !== 6 || !email) {
      return;
    }

    setError(null);
    setIsLoading(true);
    const result = await verifyOtpCode(email, code);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
      return;
    }

    setError(result.error?.message ?? 'That code is not valid. Try again.');
  };

  const handleResendCode = async () => {
    if (!email || resendSeconds > 0) {
      return;
    }

    setError(null);
    setIsLoading(true);
    const result = await getOtpCode(email);
    setIsLoading(false);

    if (result.success) {
      setCode('');
      setResendAvailableAt(Date.now() + RESEND_DELAY_SECONDS * 1000);
      Alert.alert('New code sent', `Check ${email} for your new code.`);
      return;
    }

    setError(result.error?.message ?? 'We could not resend the code.');
  };

  const handleOpenEmailApp = async () => {
    try {
      await openInbox();
    } catch {
      Alert.alert('Could not open your inbox', `Check ${email} for your code.`);
    }
  };

  if (!email) {
    return (
      <AuthScreen headerTitle="Enter code">
        <AuthIntro
          description="Return to the previous step so we know where to send your code."
          icon="alert-circle-outline"
          title="Email address missing"
        />
        <Button onClick={() => router.replace('/login/email-code')}>
          Enter email address
        </Button>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen headerTitle="Enter code" isLoading={isLoading}>
      <AuthIntro
        align="center"
        description={`We sent a 6-digit code to ${email}`}
        icon="shield-checkmark-outline"
        title="Enter your code"
      />

      <Stack gap={spacing.sm}>
        <OtpInput
          autoFocus
          hasError={Boolean(error)}
          length={6}
          onCodeChanged={(value) => {
            setCode(value);
            setError(null);
          }}
          value={code}
        />
        {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}
      </Stack>

      <Button disabled={code.length !== 6} onClick={handleVerifyCode}>
        Verify and sign in
      </Button>

      <View style={styles.resendRow}>
        <Label color={colors.text.secondary} size="sm">
          Didn&apos;t receive it?
        </Label>
        <AuthLink disabled={resendSeconds > 0} onPress={handleResendCode}>
          {resendSeconds > 0
            ? `Resend in 0:${String(resendSeconds).padStart(2, '0')}`
            : 'Resend code'}
        </AuthLink>
      </View>

      <Button onClick={handleOpenEmailApp} variant="outline">
        Open email app
      </Button>

      <AuthLink
        onPress={() =>
          router.replace({
            pathname: '/login/email-code',
            params: { email },
          })
        }
      >
        Use a different email
      </AuthLink>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  resendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
