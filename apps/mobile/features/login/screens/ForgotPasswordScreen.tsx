import { useAuth } from '@/auth/useAuth';
import {
  AuthIntro,
  AuthLink,
  AuthNotice,
  AuthScreen,
} from '@/features/login/components/AuthLayout';
import { Button, TextInput } from '@guallet/ui-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(params.email ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    const normalizedEmail = email.trim();

    if (!emailRegex.test(normalizedEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setEmailError(null);
    setRequestError(null);
    setIsLoading(true);
    const result = await resetPassword(
      normalizedEmail,
      'guallet://login/reset-password',
    );
    setIsLoading(false);

    if (result.success) {
      router.push({
        pathname: '/login/reset-password-sent',
        params: { email: normalizedEmail },
      });
      return;
    }

    setRequestError(
      result.error?.message ??
        'We could not send the reset email. Please try again.',
    );
  };

  return (
    <AuthScreen headerTitle="Password help" isLoading={isLoading}>
      <AuthIntro
        description="Enter your account email and we’ll send you a secure link to choose a new password."
        eyebrow="Account recovery"
        icon="key-outline"
        title="Reset your password"
      />

      {requestError ? (
        <AuthNotice tone="error">{requestError}</AuthNotice>
      ) : null}

      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        error={emailError}
        keyboardType="email-address"
        label="Email address"
        onChangeText={(value) => {
          setEmail(value);
          setEmailError(null);
          setRequestError(null);
        }}
        onSubmitEditing={handleResetPassword}
        placeholder="you@example.com"
        returnKeyType="send"
        textContentType="emailAddress"
        value={email}
      />

      <Button disabled={!email.trim()} onClick={handleResetPassword}>
        Send reset link
      </Button>

      <AuthLink
        onPress={() =>
          router.replace({
            pathname: '/login/password',
            params: { email: email.trim() },
          })
        }
      >
        Back to sign in
      </AuthLink>
    </AuthScreen>
  );
}
