import {
  Stack,
  Button,
  Text,
  Alert,
  Box,
  PinInput,
  Anchor,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IconMail, IconAlertCircle } from '@tabler/icons-react';
import { AuthLayout } from '../components/AuthLayout';
import { useTheme } from '@guallet/ui-react';

interface ValidateOtpScreenProps {
  email: string;
  onValidateOtp: (code: string) => void;
  onResendCode?: () => void;
  error?: string | null;
  isLoading?: boolean;
}

const RESEND_COOLDOWN_IN_SECONDS = 30;

export function ValidateOtpScreen({
  email,
  onValidateOtp,
  onResendCode,
  error,
  isLoading,
}: Readonly<ValidateOtpScreenProps>) {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius } = useTheme();
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_IN_SECONDS);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const isCodeComplete = code.length === 6;

  const handleResend = () => {
    onResendCode?.();
    setResent(true);
    setCountdown(RESEND_COOLDOWN_IN_SECONDS);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <AuthLayout>
      {/* Icon header */}
      <Box
        style={{
          width: 52,
          height: 52,
          borderRadius: borderRadius.lg,
          background: `color-mix(in oklab, ${colors.primary} 12%, white)`,
          color: colors.primary,
          display: 'grid',
          placeItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        <IconMail size={26} />
      </Box>

      <Box mb={spacing.xl}>
        <Text
          component="h1"
          style={{
            margin: `0 0 ${spacing.xs}px`,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {t('screens.validateOtp.title', 'Check your email')}
        </Text>
        <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
          {t('screens.validateOtp.description', 'We sent a 6-digit code to')}{' '}
          <Text span fw={600} c="dark">
            {email}
          </Text>
        </Text>
      </Box>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t('screens.validateOtp.error.title', 'Error')}
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )}

      <Stack gap="sm">
        {/* 6-digit pin input */}
        <Box>
          <PinInput
            length={6}
            value={code}
            onChange={setCode}
            onComplete={(val) => {
              setCode(val);
            }}
            type="number"
            size="xl"
            styles={{
              root: { justifyContent: 'center' },
              input: { fontWeight: 700, fontSize: 22 },
            }}
          />
          <Text ta="center" size="xs" c="dimmed" mt={spacing.sm}>
            {t(
              'screens.validateOtp.digitCounter',
              '{{filled}}/6 digits entered',
              {
                filled: code.length,
              },
            )}
          </Text>
        </Box>

        <Button
          fullWidth
          onClick={() => onValidateOtp(code)}
          disabled={!isCodeComplete}
          loading={isLoading}
          mt={spacing.xs}
        >
          {t('screens.validateOtp.form.verifyButton.label', 'Verify code')}
        </Button>

        {/* Resend section */}
        <Text ta="center" size="sm" c="dimmed">
          {resent ? (
            <Text span c="green" fw={600}>
              {t('screens.validateOtp.resendCode.sent', 'Code resent!')}
            </Text>
          ) : countdown > 0 ? (
            <>
              {t('screens.validateOtp.resendCode.countdown', 'Resend code in')}{' '}
              <Text span fw={600} c="dark">
                {countdown}s
              </Text>
            </>
          ) : (
            <>
              {t(
                'screens.validateOtp.resendCode.question',
                "Didn't receive the code?",
              )}{' '}
              {onResendCode && (
                <Anchor
                  component="button"
                  fw={700}
                  size="sm"
                  onClick={handleResend}
                >
                  {t(
                    'screens.validateOtp.resendCode.resendButton',
                    'Resend code',
                  )}
                </Anchor>
              )}
            </>
          )}
        </Text>
      </Stack>
    </AuthLayout>
  );
}
