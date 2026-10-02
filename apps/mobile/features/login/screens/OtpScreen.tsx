import { useAuth } from '@/auth/useAuth';
import {
  AuthIntro,
  AuthLink,
  AuthNotice,
  AuthScreen,
} from '@/features/login/components/AuthLayout';
import { Button, Label, OtpInput, Stack, useTheme } from '@guallet/luna-mobile';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, AppState, StyleSheet, View } from 'react-native';
import { openInbox } from 'react-native-email-link';
import { useTranslation } from 'react-i18next';

const RESEND_DELAY_SECONDS = 30;

export function OtpScreen() {
  const { t } = useTranslation();
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
      return;
    }

    setError(result.error?.message ?? t('That code is not valid. Try again.'));
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
      Alert.alert(
        t('New code sent'),
        t('Check {{email}} for your new code.', { email }),
      );
      return;
    }

    setError(result.error?.message ?? t('We could not resend the code.'));
  };

  const handleOpenEmailApp = async () => {
    try {
      await openInbox();
    } catch {
      Alert.alert(
        t('Could not open your inbox'),
        t('Check {{email}} for your code.', { email }),
      );
    }
  };

  if (!email) {
    return (
      <AuthScreen headerTitle={t('copy_14a0od2')}>
        <AuthIntro
          description={t('copy_13up95')}
          icon="alert-circle-outline"
          title={t('copy_1pen2az')}
        />
        <Button onClick={() => router.replace('/login/email-code')}>
          {t('copy_1go9kkd')}
        </Button>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen headerTitle={t('copy_14a0od2')} isLoading={isLoading}>
      <AuthIntro
        align="center"
        description={t('We sent a 6-digit code to {{email}}', { email })}
        icon="shield-checkmark-outline"
        title={t('copy_xtxzmx')}
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
        {t('copy_s5j1zt')}
      </Button>

      <View style={styles.resendRow}>
        <Label color={colors.text.secondary} size="sm">
          {t('copy_1pthcag')}
        </Label>
        <AuthLink disabled={resendSeconds > 0} onPress={handleResendCode}>
          {resendSeconds > 0
            ? `Resend in 0:${String(resendSeconds).padStart(2, '0')}`
            : 'Resend code'}
        </AuthLink>
      </View>

      <Button onClick={handleOpenEmailApp} variant="outline">
        {t('copy_tbmk0e')}
      </Button>

      <AuthLink
        onPress={() =>
          router.replace({
            pathname: '/login/email-code',
            params: { email },
          })
        }
      >
        {t('copy_pqvoqa')}
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
