import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppScreen } from '@/components/layout/AppScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Button,
  Label,
  OtpInput,
  Title,
  useTheme,
} from '@guallet/ui-react-native';
import { openInbox } from 'react-native-email-link';
import { useAuth } from '@/auth/useAuth';

export function OtpScreen() {
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();
  const { verifyOtpCode, getOtpCode } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? '';

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCodeComplete = code.length === 6;

  const handleVerifyCode = async () => {
    if (!isCodeComplete || !email) {
      return;
    }

    setError(null);
    setIsLoading(true);

    const result = await verifyOtpCode(email, code);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setError(result.error?.message ?? 'Invalid code. Please try again.');
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      return;
    }

    setIsLoading(true);
    const result = await getOtpCode(email);
    setIsLoading(false);

    if (result.success) {
      setError(null);
      alert('A new code has been sent to your email.');
    } else {
      setError('Failed to resend code. Please try again.');
    }
  };

  const handleOpenEmailApp = async () => {
    await openInbox();
  };

  return (
    <AppScreen headerTitle="Enter code" isLoading={isLoading}>
      {/* Content */}
      <View style={{ flex: 1, padding: spacing.md }}>
        <Title>Check your email</Title>
        <Label>
          We&apos;ve sent a 6-digit code to{' '}
          {email ? (
            <Label style={{ fontWeight: 'bold' }}>{email}</Label>
          ) : (
            'your email'
          )}
          . Enter the code below to sign in.
        </Label>
        <Label style={{ marginTop: spacing.sm }}>
          The email also contains a magic link you can click to sign in
          automatically.
        </Label>
        <Label style={{ marginTop: spacing.sm }}>
          This code expires in 5 minutes.
        </Label>

        {/* Code Input */}
        <OtpInput
          length={6}
          style={{
            marginVertical: spacing.lg,
          }}
          onCodeChanged={(newCode) => {
            setCode(newCode);
            setError(null);
          }}
        />

        {error && (
          <Text
            style={[
              styles.errorText,
              {
                color: colors.error,
                fontSize: typography.sizes.sm,
                marginBottom: spacing.md,
              },
            ]}
          >
            {error}
          </Text>
        )}

        <Button onClick={handleVerifyCode} disabled={!isCodeComplete}>
          Verify code
        </Button>

        {/* Resend Code */}
        <View style={[styles.resendContainer, { marginTop: spacing.lg }]}>
          <Text
            style={[
              styles.resendText,
              {
                color: colors.textSecondary,
                fontSize: typography.sizes.md,
                marginBottom: spacing.sm,
              },
            ]}
          >
            Didn&apos;t receive the code?
          </Text>
          <TouchableOpacity onPress={handleResendCode}>
            <Text
              style={[
                styles.resendButton,
                { color: colors.primary, fontSize: typography.sizes.md },
              ]}
            >
              Resend code
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={{ padding: spacing.lg }}>
        <Button variant="outline" onClick={handleOpenEmailApp}>
          Open email app
        </Button>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {},
  resendButton: {
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  errorText: {
    textAlign: 'center',
  },
});
