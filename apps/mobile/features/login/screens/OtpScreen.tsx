import { StyleSheet } from 'react-native-unistyles';
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
  useAlert,
  useTheme,
} from '@guallet/luna-mobile';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { openInbox } from 'react-native-email-link';
import { revalidateLogic, useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';

const RESEND_DELAY_SECONDS = 30;
const otpSchema = z.object({
  code: z.string().length(6, 'Enter the 6-digit code.'),
});

export function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? '';
  const { getOtpCode, verifyOtpCode } = useAuth();
  const showAlert = useAlert();
  const { colors, spacing } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    defaultValues: { code: '' },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: otpSchema },
    listeners: { onChange: () => setError(null) },
    onSubmit: async ({ value }) => {
      if (!email) return;
      setError(null);
      const result = await verifyOtpCode(email, otpSchema.parse(value).code);
      if (!result.success) {
        setError(result.error?.message ?? 'That code is not valid. Try again.');
      }
    },
  });
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
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

  const handleResendCode = async () => {
    if (!email || resendSeconds > 0) {
      return;
    }

    setError(null);
    setIsLoading(true);
    const result = await getOtpCode(email);
    setIsLoading(false);

    if (result.success) {
      form.reset();
      setResendAvailableAt(Date.now() + RESEND_DELAY_SECONDS * 1000);
      showAlert({
        title: 'New code sent',
        message: `Check ${email} for your new code.`,
      });
      return;
    }

    setError(result.error?.message ?? 'We could not resend the code.');
  };

  const handleOpenEmailApp = async () => {
    try {
      await openInbox();
    } catch {
      showAlert({
        title: 'Could not open your inbox',
        message: `Check ${email} for your code.`,
      });
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
    <AuthScreen headerTitle="Enter code" isLoading={isLoading || isSubmitting}>
      <AuthIntro
        align="center"
        description={`We sent a 6-digit code to ${email}`}
        icon="shield-checkmark-outline"
        title="Enter your code"
      />

      <Stack gap={spacing.sm}>
        <form.Field name="code">
          {(field) => (
            <OtpInput
              autoFocus
              hasError={Boolean(error || field.state.meta.errors.length)}
              length={6}
              onCodeChanged={field.handleChange}
              value={field.state.value}
            />
          )}
        </form.Field>
        {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}
      </Stack>

      <form.Subscribe
        selector={(state) =>
          [state.canSubmit, state.isSubmitting, state.values.code] as const
        }
      >
        {([canSubmit, isSubmitting, code]) => (
          <Button
            disabled={
              !canSubmit || code.length !== 6 || isSubmitting || isLoading
            }
            onClick={() => {
              if (!form.state.isSubmitting) void form.handleSubmit();
            }}
          >
            {isSubmitting || isLoading ? 'Verifying…' : 'Verify and sign in'}
          </Button>
        )}
      </form.Subscribe>

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
