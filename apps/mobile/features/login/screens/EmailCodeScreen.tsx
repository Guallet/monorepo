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
  Stack,
  TextInput,
  useTheme,
} from '@guallet/ui-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { getOtpCode } = useAuth();
  const { colors, spacing, typography } = useTheme();
  const [email, setEmail] = useState(params.email ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    const normalizedEmail = email.trim();

    if (!emailRegex.test(normalizedEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setEmailError(null);
    setRequestError(null);
    setIsLoading(true);
    const result = await getOtpCode(normalizedEmail);
    setIsLoading(false);

    if (result.success) {
      router.push({
        pathname: '/login/otp',
        params: { email: normalizedEmail },
      });
      return;
    }

    setRequestError(
      result.error?.message ?? 'We could not send a code. Please try again.',
    );
  };

  return (
    <AuthScreen headerTitle="Email code" isLoading={isLoading}>
      <AuthIntro
        description="We’ll email you a 6-digit code. It expires after 5 minutes."
        eyebrow="Password-free"
        icon="mail-unread-outline"
        title="Sign in with a code"
      />

      {requestError ? (
        <AuthNotice tone="error">{requestError}</AuthNotice>
      ) : null}

      <Stack gap={spacing.sm}>
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
          onSubmitEditing={handleSendCode}
          placeholder="you@example.com"
          returnKeyType="send"
          textContentType="emailAddress"
          value={email}
        />
        <Label
          color={colors.text.secondary}
          size="sm"
          style={{ lineHeight: typography.sizes.sm * 1.5 }}
        >
          You can also use the secure sign-in link included in the email.
        </Label>
      </Stack>

      <Button disabled={!email.trim()} onClick={handleSendCode}>
        Send my code
      </Button>

      <AuthLink
        onPress={() =>
          router.replace({
            pathname: '/login/password',
            params: { email: email.trim() },
          })
        }
      >
        Use password instead
      </AuthLink>
    </AuthScreen>
  );
}
